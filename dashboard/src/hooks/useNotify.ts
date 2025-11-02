'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { notifyVehicleAction } from '@/lib/notificationService'
import { useToast } from '@/hooks/use-toast'
import type { NotificationType } from '@/types/notification'

/**
 * Hook for easily creating notifications with toast feedback
 */
export function useNotify() {
  const { toast } = useToast()

  const notify = useCallback(async (
    action: NotificationType,
    vehicleNumber: string,
    vehicleBrand: string,
    vehicleModel: string
  ) => {
    try {
      // Get current user
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('No session found')
        return
      }

      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('auth_id', session.user.id)
        .single()

      if (!userData) {
        console.error('User data not found')
        return
      }

      const userName = `${userData.first_name} ${userData.last_name}`
      
      // Create notification in database
      await notifyVehicleAction(
        userData.id,
        userName,
        action,
        vehicleNumber,
        vehicleBrand,
        vehicleModel
      )

      // Show success toast
      const vehicleInfo = `${vehicleBrand} ${vehicleModel} (${vehicleNumber})`
      let toastTitle = ''
      let toastDescription = ''

      switch (action) {
        case 'added':
          toastTitle = '✅ Vehicle Added'
          toastDescription = `${vehicleInfo} has been added to inventory`
          break
        case 'updated':
          toastTitle = '✏️ Vehicle Updated'
          toastDescription = `${vehicleInfo} details have been updated`
          break
        case 'deleted':
          toastTitle = '🗑️ Vehicle Deleted'
          toastDescription = `${vehicleInfo} has been removed from inventory`
          break
        case 'moved_to_sales':
          toastTitle = '💰 Moved to Sales'
          toastDescription = `${vehicleInfo} is now in sales transactions`
          break
        case 'sold':
          toastTitle = '🎉 Vehicle Sold'
          toastDescription = `${vehicleInfo} has been sold successfully`
          break
      }

      toast({
        title: toastTitle,
        description: toastDescription,
      })
    } catch (error) {
      console.error('Error creating notification:', error)
      toast({
        title: 'Error',
        description: 'Failed to create notification',
        variant: 'destructive',
      })
    }
  }, [toast])

  return { notify }
}
