/**
 * EXAMPLE: How to Add Notifications to Add Vehicle Page
 * 
 * This example shows exactly how to integrate notifications
 * into your vehicle operations.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useNotify } from '@/hooks/useNotify'
import { useToast } from '@/hooks/use-toast'

export default function AddVehiclePageExample() {
  const router = useRouter()
  const { notify } = useNotify() // 👈 Add this hook
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const supabase = createClient()

      // Your existing vehicle creation logic
      const vehicleData = {
        vehicle_number: formData.get('vehicle_number') as string,
        brand_name: formData.get('brand') as string,
        model_name: formData.get('model') as string,
        // ... other fields
      }

      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single()

      if (error) throw error

      // 🎉 ADD NOTIFICATION HERE - Just one line!
      await notify(
        'added',
        vehicle.vehicle_number,
        vehicle.brand_name,
        vehicle.model_name
      )

      // Your existing success handling
      toast({
        title: 'Success',
        description: 'Vehicle added successfully',
      })

      router.push('/inventory')
    } catch (error) {
      console.error('Error adding vehicle:', error)
      toast({
        title: 'Error',
        description: 'Failed to add vehicle',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your existing form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Vehicle'}
      </button>
    </form>
  )
}

/**
 * EXAMPLE: How to Add Notifications to Inventory Update/Delete
 */

export function InventoryPageExample() {
  const { notify } = useNotify() // 👈 Add this hook
  const { toast } = useToast()

  const handleUpdateVehicle = async (vehicleId: string, updates: any) => {
    try {
      const supabase = createClient()

      // Get vehicle info first (for notification)
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('vehicle_number, brand_name, model_name')
        .eq('id', vehicleId)
        .single()

      // Update the vehicle
      const { error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId)

      if (error) throw error

      // 🎉 ADD NOTIFICATION HERE
      if (vehicle) {
        await notify(
          'updated',
          vehicle.vehicle_number,
          vehicle.brand_name,
          vehicle.model_name
        )
      }

      toast({
        title: 'Success',
        description: 'Vehicle updated successfully',
      })
    } catch (error) {
      console.error('Error updating vehicle:', error)
      toast({
        title: 'Error',
        description: 'Failed to update vehicle',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteVehicle = async (vehicle: any) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicle.id)

      if (error) throw error

      // 🎉 ADD NOTIFICATION HERE
      await notify(
        'deleted',
        vehicle.vehicle_number,
        vehicle.brand_name,
        vehicle.model_name
      )

      toast({
        title: 'Success',
        description: 'Vehicle deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      {/* Your inventory UI */}
    </div>
  )
}

/**
 * EXAMPLE: How to Add Notifications to Sell Vehicle
 */

export function SellVehiclePageExample() {
  const { notify } = useNotify() // 👈 Add this hook
  const { toast } = useToast()
  const router = useRouter()

  const handleSellVehicle = async (vehicleId: string, saleData: any) => {
    try {
      const supabase = createClient()

      // Get vehicle info
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('vehicle_number, brand_name, model_name')
        .eq('id', vehicleId)
        .single()

      // Create pending sale
      const { error } = await supabase
        .from('pending_vehicle_sales')
        .insert({
          vehicle_id: vehicleId,
          ...saleData
        })

      if (error) throw error

      // 🎉 ADD NOTIFICATION HERE
      if (vehicle) {
        await notify(
          'moved_to_sales',
          vehicle.vehicle_number,
          vehicle.brand_name,
          vehicle.model_name
        )
      }

      toast({
        title: 'Success',
        description: 'Vehicle moved to sales',
      })

      router.push('/sales-transactions')
    } catch (error) {
      console.error('Error moving to sales:', error)
      toast({
        title: 'Error',
        description: 'Failed to move vehicle to sales',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      {/* Your sell vehicle form */}
    </div>
  )
}

/**
 * EXAMPLE: How to Add Notifications to Complete Sale
 */

export function SalesTransactionsPageExample() {
  const { notify } = useNotify() // 👈 Add this hook
  const { toast } = useToast()

  const handleCompleteSale = async (saleId: string) => {
    try {
      const supabase = createClient()

      // Get sale info with vehicle details
      const { data: sale } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicle:vehicles(
            vehicle_number,
            brand_name,
            model_name
          )
        `)
        .eq('id', saleId)
        .single()

      // Update sale status
      const { error } = await supabase
        .from('pending_vehicle_sales')
        .update({ status: 'completed' })
        .eq('id', saleId)

      if (error) throw error

      // Move to completed sales table
      await supabase
        .from('sales')
        .insert({
          // sale data
        })

      // 🎉 ADD NOTIFICATION HERE
      if (sale?.vehicle) {
        await notify(
          'sold',
          sale.vehicle.vehicle_number,
          sale.vehicle.brand_name,
          sale.vehicle.model_name
        )
      }

      toast({
        title: 'Success',
        description: 'Sale completed successfully',
      })
    } catch (error) {
      console.error('Error completing sale:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete sale',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      {/* Your sales transactions UI */}
    </div>
  )
}

/**
 * SUMMARY OF CHANGES NEEDED:
 * 
 * 1. Add this line at the top of your component:
 *    const { notify } = useNotify()
 * 
 * 2. After your successful database operation, add:
 *    await notify(type, vehicleNumber, brand, model)
 * 
 * 3. That's it! The notification system handles everything else:
 *    - Creates database record
 *    - Shows toast notification
 *    - Updates bell dropdown
 *    - Syncs across tabs
 *    - Sends real-time updates
 * 
 * Types: 'added', 'updated', 'deleted', 'moved_to_sales', 'sold'
 */
