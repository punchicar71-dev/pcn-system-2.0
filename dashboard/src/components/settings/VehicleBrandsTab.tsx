'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase-client'
import { VehicleBrand, VehicleModel } from '@/lib/database.types'
import { DataTable } from '@/components/ui/data-table'
import { createColumns, BrandWithModels } from './vehicle-brands-columns'

export default function VehicleBrandsTab() {
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [models, setModels] = useState<Record<string, VehicleModel[]>>({})
  const [loading, setLoading] = useState(true)
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false)
  const [isSyncModelOpen, setIsSyncModelOpen] = useState(false)
  const [isViewModelsOpen, setIsViewModelsOpen] = useState(false)
  const [isEditBrandOpen, setIsEditBrandOpen] = useState(false)
  const [isDeleteBrandOpen, setIsDeleteBrandOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)
  const [editingBrand, setEditingBrand] = useState<VehicleBrand | null>(null)
  const [newBrandName, setNewBrandName] = useState('')
  const [newModelName, setNewModelName] = useState('')
  const [selectedBrandForModel, setSelectedBrandForModel] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBrands()
  }, [])

  // Memoize brands with models for the data table
  const brandsWithModels = useMemo((): BrandWithModels[] => {
    return brands.map(brand => ({
      ...brand,
      models: models[brand.id] || []
    }))
  }, [brands, models])

  // Filter brands based on search query
  const filteredBrands = useMemo(() => {
    if (!searchQuery) return brandsWithModels
    
    return brandsWithModels.filter(brand => 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.models.some(model => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }, [searchQuery, brandsWithModels])

  const fetchBrands = async () => {
    try {
      // Fetch all brands and models in parallel for better performance
      const [brandsResult, modelsResult] = await Promise.all([
        supabase
          .from('vehicle_brands')
          .select('*')
          .order('name'),
        supabase
          .from('vehicle_models')
          .select('*')
          .order('name')
      ])

      if (brandsResult.error) throw brandsResult.error
      if (modelsResult.error) throw modelsResult.error

      const brandsData = brandsResult.data || []
      const allModels = modelsResult.data || []

      // Group models by brand_id for faster lookup
      const modelsData: Record<string, VehicleModel[]> = {}
      allModels.forEach((model) => {
        if (!modelsData[model.brand_id]) {
          modelsData[model.brand_id] = []
        }
        modelsData[model.brand_id].push(model)
      })

      setBrands(brandsData)
      setModels(modelsData)
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return

    try {
      const { data, error } = await supabase
        .from('vehicle_brands')
        .insert([{ name: newBrandName }])
        .select()
        .single()

      if (error) throw error

      // Optimistically update the UI without full refetch
      if (data) {
        setBrands(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        setModels(prev => ({ ...prev, [data.id]: [] }))
      }

      setNewBrandName('')
      setIsAddBrandOpen(false)
    } catch (error) {
      console.error('Error adding brand:', error)
      alert('Error adding brand. Please try again.')
    }
  }

  const handleEditBrand = async () => {
    if (!editingBrand || !editingBrand.name.trim()) return

    try {
      const { error } = await supabase
        .from('vehicle_brands')
        .update({ name: editingBrand.name })
        .eq('id', editingBrand.id)

      if (error) throw error

      // Optimistically update the UI
      setBrands(prev => 
        prev.map(b => b.id === editingBrand.id ? editingBrand : b)
          .sort((a, b) => a.name.localeCompare(b.name))
      )

      setEditingBrand(null)
      setIsEditBrandOpen(false)
    } catch (error) {
      console.error('Error updating brand:', error)
      alert('Error updating brand. Please try again.')
    }
  }

  const handleDeleteBrand = async (id: string) => {
    setBrandToDelete(id)
    setIsDeleteBrandOpen(true)
  }

  const confirmDeleteBrand = async () => {
    if (!brandToDelete) return

    try {
      const { error } = await supabase
        .from('vehicle_brands')
        .delete()
        .eq('id', brandToDelete)

      if (error) throw error

      // Optimistically update the UI
      setBrands(prev => prev.filter(b => b.id !== brandToDelete))
      setModels(prev => {
        const newModels = { ...prev }
        delete newModels[brandToDelete]
        return newModels
      })
    } catch (error) {
      console.error('Error deleting brand:', error)
      alert('Error deleting brand. Please try again.')
    } finally {
      setIsDeleteBrandOpen(false)
      setBrandToDelete(null)
    }
  }

  const handleAddModel = async () => {
    if (!newModelName.trim() || !selectedBrandForModel) return

    try {
      const { data, error } = await supabase
        .from('vehicle_models')
        .insert([{ brand_id: selectedBrandForModel, name: newModelName }])
        .select()
        .single()

      if (error) throw error

      // Optimistically update the UI
      if (data) {
        setModels(prev => ({
          ...prev,
          [selectedBrandForModel]: [
            ...(prev[selectedBrandForModel] || []),
            data
          ].sort((a, b) => a.name.localeCompare(b.name))
        }))
      }

      setNewModelName('')
      setSelectedBrandForModel('')
      setIsSyncModelOpen(false)
    } catch (error) {
      console.error('Error adding model:', error)
      alert('Error adding model. Please try again.')
    }
  }

  const handleViewModels = (brandId: string) => {
    setSelectedBrandId(brandId)
    setIsViewModelsOpen(true)
  }

  const openEditDialog = (brand: VehicleBrand) => {
    setEditingBrand({ ...brand })
    setIsEditBrandOpen(true)
  }

  const selectedBrand = brands.find(b => b.id === selectedBrandId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Available Vehicle Brands</h2>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSyncModelOpen} onOpenChange={setIsSyncModelOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Sync Models</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sync Models</DialogTitle>
                <DialogDescription>
                  Add a new model to a brand
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="brand-select">Select Brand</Label>
                  <Select value={selectedBrandForModel} onValueChange={setSelectedBrandForModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model-name">Model Name</Label>
                  <Input
                    id="model-name"
                    placeholder="e.g., Aqua"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddModel()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsSyncModelOpen(false)
                    setNewModelName('')
                    setSelectedBrandForModel('')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddModel}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddBrandOpen} onOpenChange={setIsAddBrandOpen}>
            <DialogTrigger asChild>
              <Button>Add Brand</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Brand</DialogTitle>
                <DialogDescription>
                  Add a new vehicle brand to the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <Input
                    id="brand-name"
                    placeholder="e.g., Toyota"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddBrandOpen(false)
                    setNewBrandName('')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddBrand}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative w-[400px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search brand or model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 "
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          Loading...
        </div>
      ) : (
        <DataTable 
          columns={createColumns(
            openEditDialog,
            handleDeleteBrand,
            handleViewModels
          )} 
          data={filteredBrands} 
        />
      )}

      <Dialog open={isEditBrandOpen} onOpenChange={setIsEditBrandOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Update the brand name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-brand-name">Brand Name</Label>
              <Input
                id="edit-brand-name"
                placeholder="e.g., Toyota"
                value={editingBrand?.name || ''}
                onChange={(e) => setEditingBrand(prev => prev ? { ...prev, name: e.target.value } : null)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditBrand()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditBrandOpen(false)
                setEditingBrand(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditBrand}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModelsOpen} onOpenChange={setIsViewModelsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBrand?.name} Models</DialogTitle>
            <DialogDescription>
              All models for {selectedBrand?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {selectedBrandId && models[selectedBrandId]?.length > 0 ? (
                models[selectedBrandId].map((model) => (
                  <div
                    key={model.id}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    {model.name}
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  No models found for this brand
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Brand Confirmation Dialog */}
      <Dialog open={isDeleteBrandOpen} onOpenChange={setIsDeleteBrandOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Delete Brand</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700">
                Are you sure? This will also delete all associated models.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteBrandOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteBrand}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
