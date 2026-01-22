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
import { Input } from '@/components/ui/input'
import { Calendar, Clock, User, CreditCard } from 'lucide-react'

interface TakenOutModalProps {
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

export default function TakenOutModal({ 
  vehicleId, 
  vehicleInfo,
  isOpen, 
  onClose, 
  onSuccess 
}: TakenOutModalProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [personName, setPersonName] = useState('')
  const [personNic, setPersonNic] = useState('')
  const [currentDateTime, setCurrentDateTime] = useState('')

  // Update current date/time when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      setCurrentDateTime(now.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }))
      // Reset form
      setPersonName('')
      setPersonNic('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!vehicleId) return

    if (!personName.trim()) {
      alert('Please enter the person name')
      return
    }

    if (!personNic.trim()) {
      alert('Please enter the NIC number')
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase
        .from('vehicles')
        .update({
          status: 'Taken Out',
          taken_out_person_name: personName.trim(),
          taken_out_person_nic: personNic.trim(),
          taken_out_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)

      if (error) {
        console.error('Error updating vehicle:', error)
        alert('Failed to update vehicle status. Please try again.')
        return
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating vehicle:', error)
      alert('An error occurred while updating vehicle status.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setPersonName('')
    setPersonNic('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Move to Taken Out</DialogTitle>
          {vehicleInfo && (
            <p className="text-sm text-gray-600 mt-1">
              {vehicleInfo.brand} {vehicleInfo.model} {vehicleInfo.year} - {vehicleInfo.vehicleNumber}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Person Name */}
          <div>
            <Label htmlFor="personName" className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Taken Out Person Name
            </Label>
            <Input
              id="personName"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Enter person name"
              className="mt-2"
            />
          </div>

          {/* NIC Number */}
          <div>
            <Label htmlFor="personNic" className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Taken Out Person NIC Number
            </Label>
            <Input
              id="personNic"
              value={personNic}
              onChange={(e) => setPersonNic(e.target.value)}
              placeholder="Enter NIC number"
              className="mt-2"
            />
          </div>

          {/* Date and Time (Auto) */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date & Time
            </Label>
            <div className="mt-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              {currentDateTime}
              <span className="text-xs text-gray-500 ml-auto">(Auto-filled)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
          >
            {saving ? 'Moving...' : 'Move to Taken Out'}
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
