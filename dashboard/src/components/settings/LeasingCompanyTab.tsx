'use client'

import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { LeasingCompany } from '@/lib/database.types'

export default function LeasingCompanyTab() {
  const [companies, setCompanies] = useState<LeasingCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<LeasingCompany | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      console.log('Fetching leasing companies from Supabase...')
      const { data, error } = await supabase
        .from('leasing_companies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('Successfully fetched leasing companies:', data)
      setCompanies(data || [])
    } catch (error: any) {
      console.error('Error fetching leasing companies:', error)
      alert(`Failed to load leasing companies: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const generateCompanyId = () => {
    // Generate a 5-digit random number for company ID
    return String(Math.floor(10000 + Math.random() * 90000))
  }

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) {
      alert('Please enter a company name')
      return
    }

    setIsSaving(true)
    try {
      const companyId = generateCompanyId()
      
      const { data, error } = await supabase
        .from('leasing_companies')
        .insert([
          {
            company_id: companyId,
            name: newCompanyName.trim(),
            is_active: true,
          },
        ])
        .select()
        .single()

      if (error) throw error

      if (data) {
        setCompanies((prev) => [data, ...prev])
      }

      setNewCompanyName('')
      setIsAddCompanyOpen(false)
    } catch (error: any) {
      console.error('Error adding company:', error)
      if (error.code === '23505') {
        alert('Company ID already exists. Please try again.')
      } else {
        alert('Failed to add leasing company')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleAvailability = async (company: LeasingCompany) => {
    try {
      const { error } = await supabase
        .from('leasing_companies')
        .update({ is_active: !company.is_active })
        .eq('id', company.id)

      if (error) throw error

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id ? { ...c, is_active: !c.is_active } : c
        )
      )
    } catch (error) {
      console.error('Error updating company:', error)
      alert('Failed to update company availability')
    }
  }

  const handleDelete = async (company: LeasingCompany) => {
    setCompanyToDelete(company)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!companyToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('leasing_companies')
        .delete()
        .eq('id', companyToDelete.id)

      if (error) throw error

      setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id))
      setIsDeleteDialogOpen(false)
      setCompanyToDelete(null)
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Failed to delete leasing company')
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setCompanyToDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Leasing Companies</h3>
          <p className="text-sm text-gray-500">
            Manage finance and leasing company partners
          </p>
        </div>
        <Button onClick={() => setIsAddCompanyOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="border bg-white rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company ID</TableHead>
              <TableHead>Finance Company Name</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  No leasing companies found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-mono">{company.company_id}</TableCell>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    <Switch
                      checked={company.is_active}
                      onCheckedChange={() => handleToggleAvailability(company)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(company)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Company Dialog */}
      <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Leasing Company</DialogTitle>
            <DialogDescription>
              Add a new finance or leasing company partner to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                placeholder="Enter company name"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSaving) {
                    handleAddCompany()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddCompanyOpen(false)
                setNewCompanyName('')
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCompany} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Leasing Company</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you certain you want to delete this Leasing Company? This action cannot be undone.
            </p>
            {companyToDelete && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Company Name:</p>
                <p className="font-semibold">{companyToDelete.name}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
