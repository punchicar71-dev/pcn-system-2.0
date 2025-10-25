'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase-client'
import { PriceCategory } from '@/lib/database.types'

export default function PriceCategoryTab() {
  const [categories, setCategories] = useState<PriceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<PriceCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    min_price: '',
    max_price: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('price_categories')
        .select('*')
        .order('min_price')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!formData.name.trim() || !formData.min_price || !formData.max_price) return

    try {
      const { error } = await supabase
        .from('price_categories')
        .insert([{
          name: formData.name,
          min_price: parseFloat(formData.min_price),
          max_price: parseFloat(formData.max_price),
          is_active: true,
        }])

      if (error) throw error

      setFormData({ name: '', min_price: '', max_price: '' })
      setIsAddDialogOpen(false)
      fetchCategories()
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim() || !formData.min_price || !formData.max_price) return

    try {
      const { error } = await supabase
        .from('price_categories')
        .update({
          name: formData.name,
          min_price: parseFloat(formData.min_price),
          max_price: parseFloat(formData.max_price),
        })
        .eq('id', editingCategory.id)

      if (error) throw error

      setFormData({ name: '', min_price: '', max_price: '' })
      setEditingCategory(null)
      setIsEditDialogOpen(false)
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('price_categories')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price category?')) return

    try {
      const { error } = await supabase
        .from('price_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const openEditDialog = (category: PriceCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      min_price: category.min_price.toString(),
      max_price: category.max_price.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Available Price Category</h2>
          <p className="text-sm text-gray-500">Manage vehicle price ranges</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Price Category</DialogTitle>
              <DialogDescription>
                Create a new price range category
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g., Low Level"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-price">Minimum Price</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="0"
                    value={formData.min_price}
                    onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-price">Maximum Price</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="2500000"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No price categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {formatPrice(category.min_price)} - {formatPrice(category.max_price)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={category.is_active}
                      onCheckedChange={() => handleToggleActive(category.id, category.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Price Category</DialogTitle>
            <DialogDescription>
              Update the price range category
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Category Name</Label>
              <Input
                id="edit-category-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-min-price">Minimum Price</Label>
                <Input
                  id="edit-min-price"
                  type="number"
                  value={formData.min_price}
                  onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-max-price">Maximum Price</Label>
                <Input
                  id="edit-max-price"
                  type="number"
                  value={formData.max_price}
                  onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
