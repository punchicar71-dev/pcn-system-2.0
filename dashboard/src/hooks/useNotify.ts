'use client'

/**
 * Notification Hook
 * 
 * MIGRATING: Supabase Auth session checks have been removed.
 * This hook will be updated to work with Better Auth in Step 2.
 * 
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */

import { useCallback } from 'react'
import { supabaseClient } from '@/lib/supabase-db'
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
      // TODO: Replace with Better Auth session check
      // const session = await auth.getSession()
      
      // Temporary: Get user from localStorage during migration
      const storedUser = localStorage.getItem('pcn-user')
      if (!storedUser) {
        console.error('No user found in localStorage')
        return
      }
      
      const userData = JSON.parse(storedUser)

      // Handle both camelCase (login/page.tsx) and snake_case ((auth)/page.tsx) formats
      const firstName = userData.firstName || userData.first_name || ''
      const lastName = userData.lastName || userData.last_name || ''
      const userName = `${firstName} ${lastName}`.trim() || 'Unknown User'
      
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
