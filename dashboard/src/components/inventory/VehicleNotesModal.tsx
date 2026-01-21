'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { User, CreditCard, Calendar, Clock } from 'lucide-react'

interface VehicleNotesModalProps {
  vehicleId: string | null
  vehicleInfo: {
    brand: string
    model: string
    year: number
    vehicleNumber: string
  } | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface NotesData {
  tag_notes: string
  special_note_print: string
  taken_out_person_name: string | null
  taken_out_person_nic: string | null
  taken_out_at: string | null
  status: string
}

export default function VehicleNotesModal({ 
  vehicleId, 
  vehicleInfo,
  isOpen, 
  onClose, 
  onSuccess 
}: VehicleNotesModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notesData, setNotesData] = useState<NotesData>({
    tag_notes: '',
    special_note_print: '',
    taken_out_person_name: null,
    taken_out_person_nic: null,
    taken_out_at: null,
    status: ''
  })

  // Fetch notes when modal opens
  useEffect(() => {
    if (isOpen && vehicleId) {
      fetchNotes()
    }
  }, [isOpen, vehicleId])

  const fetchNotes = async () => {
    if (!vehicleId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vehicles')
        .select('tag_notes, special_note_print, taken_out_person_name, taken_out_person_nic, taken_out_at, status')
        .eq('id', vehicleId)
        .single()

      if (error) {
        console.error('Error fetching notes:', error)
        return
      }

      setNotesData({
        tag_notes: data?.tag_notes || '',
        special_note_print: data?.special_note_print || '',
        taken_out_person_name: data?.taken_out_person_name || null,
        taken_out_person_nic: data?.taken_out_person_nic || null,
        taken_out_at: data?.taken_out_at || null,
        status: data?.status || ''
      })
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!vehicleId) return

    try {
      setSaving(true)

      const { error } = await supabase
        .from('vehicles')
        .update({
          tag_notes: notesData.tag_notes.trim() || null,
          special_note_print: notesData.special_note_print.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)

      if (error) {
        console.error('Error saving notes:', error)
        alert('Failed to save notes. Please try again.')
        return
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('An error occurred while saving notes.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setNotesData({ 
      tag_notes: '', 
      special_note_print: '',
      taken_out_person_name: null,
      taken_out_person_nic: null,
      taken_out_at: null,
      status: ''
    })
    onClose()
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl z-[1008] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Vehicle Notes</DialogTitle>
          {vehicleInfo && (
            <p className="text-sm text-gray-600 mt-1">
              {vehicleInfo.brand} {vehicleInfo.model} {vehicleInfo.year} - {vehicleInfo.vehicleNumber}
            </p>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Taken Out Info Section - Only show if vehicle is taken out */}
            {notesData.status === 'Taken Out' && notesData.taken_out_person_name && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Taken Out Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-600">Person Name:</span>
                    <span className="font-medium text-gray-900">{notesData.taken_out_person_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-600">NIC Number:</span>
                    <span className="font-medium text-gray-900">{notesData.taken_out_person_nic}</span>
                  </div>
                  {notesData.taken_out_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium text-gray-900">{formatDateTime(notesData.taken_out_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tag Notes */}
            <div>
              <Label htmlFor="tagNotes" className="text-sm font-medium">
                Tag Notes
              </Label>
              <p className="text-xs text-gray-500 mb-2">
                Internal notes (not visible to customers)
              </p>
              <textarea
                id="tagNotes"
                value={notesData.tag_notes}
                onChange={(e) => setNotesData({ ...notesData, tag_notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                placeholder="Add internal notes about this vehicle..."
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {notesData.tag_notes.length} characters
              </p>
            </div>

            {/* Special Notes for Print */}
            <div>
              <Label htmlFor="specialNotePrint" className="text-sm font-medium">
                Special Notes for Print (Price Tag)
              </Label>
              <p className="text-xs text-gray-500 mb-2">
                Notes to be printed on the Price Tag
              </p>
              <textarea
                id="specialNotePrint"
                value={notesData.special_note_print}
                onChange={(e) => setNotesData({ ...notesData, special_note_print: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                placeholder="Add notes that will appear on printed documents..."
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {notesData.special_note_print.length} characters
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSave}
            disabled={loading || saving}
            className="flex-1 bg-black text-white hover:bg-gray-800"
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </Button>
          <Button
            onClick={handleClose}
            disabled={saving}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
