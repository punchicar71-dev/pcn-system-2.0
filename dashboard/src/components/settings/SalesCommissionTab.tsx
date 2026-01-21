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
import { SalesCommission } from '@/lib/database.types'

export default function SalesCommissionTab() {
  const [commissions, setCommissions] = useState<SalesCommission[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [commissionToDelete, setCommissionToDelete] = useState<string | null>(null)
  const [editingCommission, setEditingCommission] = useState<SalesCommission | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    min_price: '',
    max_price: '',
    commission_amount: '',
  })

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_commissions')
        .select('*')
        .order('min_price')

      if (error) throw error
      setCommissions(data || [])
    } catch (error) {
      console.error('Error fetching sales commissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCommission = async () => {
    if (!formData.name.trim() || !formData.min_price || !formData.max_price || !formData.commission_amount) return

    try {
      const { error } = await supabase
        .from('sales_commissions')
        .insert([{
          name: formData.name,
          min_price: parseFloat(formData.min_price),
          max_price: parseFloat(formData.max_price),
          commission_amount: parseFloat(formData.commission_amount),
          is_active: true,
        }])

      if (error) {
        console.error('Error adding sales commission:', error)
        alert(`Error: ${error.message}`)
        throw error
      }

      setFormData({ name: '', min_price: '', max_price: '', commission_amount: '' })
      setIsAddDialogOpen(false)
      fetchCommissions()
    } catch (error) {
      console.error('Error adding sales commission:', error)
    }
  }

  const handleEditCommission = async () => {
    if (!editingCommission || !formData.name.trim() || !formData.min_price || !formData.max_price || !formData.commission_amount) return

    try {
      const { error } = await supabase
        .from('sales_commissions')
        .update({
          name: formData.name,
          min_price: parseFloat(formData.min_price),
          max_price: parseFloat(formData.max_price),
          commission_amount: parseFloat(formData.commission_amount),
        })
        .eq('id', editingCommission.id)

      if (error) {
        console.error('Error updating sales commission:', error)
        alert(`Error: ${error.message}`)
        throw error
      }

      setFormData({ name: '', min_price: '', max_price: '', commission_amount: '' })
      setEditingCommission(null)
      setIsEditDialogOpen(false)
      fetchCommissions()
    } catch (error) {
      console.error('Error updating sales commission:', error)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sales_commissions')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchCommissions()
    } catch (error) {
      console.error('Error updating sales commission:', error)
    }
  }

  const handleDelete = async (id: string) => {
    setCommissionToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!commissionToDelete) return

    try {
      const { error } = await supabase
        .from('sales_commissions')
        .delete()
        .eq('id', commissionToDelete)

      if (error) throw error
      fetchCommissions()
    } catch (error) {
      console.error('Error deleting sales commission:', error)
    } finally {
      setIsDeleteDialogOpen(false)
      setCommissionToDelete(null)
    }
  }

  const openEditDialog = (commission: SalesCommission) => {
    setEditingCommission(commission)
    setFormData({
      name: commission.name,
      min_price: commission.min_price.toString(),
      max_price: commission.max_price.toString(),
      commission_amount: commission.commission_amount.toString(),
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
          <h2 className="text-xl font-semibold">Sales Commission</h2>
          <p className="text-sm text-gray-500">Manage sales commission based on vehicle price ranges</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Commission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Sales Commission</DialogTitle>
              <DialogDescription>
                Create a new sales commission based on price range
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="commission-name">Commission Name</Label>
                <Input
                  id="commission-name"
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
              <div className="space-y-2">
                <Label htmlFor="commission-amount">Commission Amount</Label>
                <Input
                  id="commission-amount"
                  type="number"
                  placeholder="e.g., 25000"
                  value={formData.commission_amount}
                  onChange={(e) => setFormData({ ...formData, commission_amount: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCommission}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commission Name</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Commission Amount</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : commissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No sales commissions found
                </TableCell>
              </TableRow>
            ) : (
              commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">{commission.name}</TableCell>
                  <TableCell>
                    {formatPrice(commission.min_price)} - {formatPrice(commission.max_price)}
                  </TableCell>
                  <TableCell>{formatPrice(commission.commission_amount)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={commission.is_active}
                      onCheckedChange={() => handleToggleActive(commission.id, commission.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(commission)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(commission.id)}
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
            <DialogTitle>Edit Sales Commission</DialogTitle>
            <DialogDescription>
              Update the sales commission details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-commission-name">Commission Name</Label>
              <Input
                id="edit-commission-name"
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
            <div className="space-y-2">
              <Label htmlFor="edit-commission-amount">Commission Amount</Label>
              <Input
                id="edit-commission-amount"
                type="number"
                value={formData.commission_amount}
                onChange={(e) => setFormData({ ...formData, commission_amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCommission}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Delete Sales Commission</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700">
                Are you sure you want to delete this sales commission?
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
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
