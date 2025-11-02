// Notification service for managing notifications in Supabase
import { createClient } from '@/lib/supabase-client'
import type { Notification, CreateNotificationInput, NotificationType } from '@/types/notification'

/**
 * Create a new notification
 */
export async function createNotification(input: CreateNotificationInput): Promise<Notification | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        message: input.message,
        vehicle_number: input.vehicle_number,
        vehicle_brand: input.vehicle_brand,
        vehicle_model: input.vehicle_model,
        is_read: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const supabase = createClient()
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error getting unread count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error marking all as read:', error)
    return false
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error('Error deleting notification:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting notification:', error)
    return false
  }
}

/**
 * Clear all notifications for a user
 */
export async function clearAllNotifications(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error clearing notifications:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error clearing notifications:', error)
    return false
  }
}

/**
 * Helper function to create vehicle-specific notifications
 */
export async function notifyVehicleAction(
  userId: string,
  userName: string,
  action: NotificationType,
  vehicleNumber: string,
  vehicleBrand: string,
  vehicleModel: string
): Promise<Notification | null> {
  const vehicleInfo = `${vehicleBrand} ${vehicleModel} (${vehicleNumber})`
  
  let title = ''
  let message = ''

  switch (action) {
    case 'added':
      title = 'Vehicle Added'
      message = `${userName} added ${vehicleInfo} to the Inventory.`
      break
    case 'updated':
      title = 'Vehicle Updated'
      message = `${userName} updated details of ${vehicleInfo} in the Inventory.`
      break
    case 'deleted':
      title = 'Vehicle Deleted'
      message = `${userName} deleted ${vehicleInfo} from the Inventory.`
      break
    case 'moved_to_sales':
      title = 'Moved to Sales'
      message = `${userName} moved ${vehicleInfo} to the Selling Process — now listed in Sales Transactions (Pending).`
      break
    case 'sold':
      title = 'Vehicle Sold'
      message = `${userName} completed the sale of ${vehicleInfo} — vehicle moved to Sold Out.`
      break
    default:
      return null
  }

  return createNotification({
    user_id: userId,
    type: action,
    title,
    message,
    vehicle_number: vehicleNumber,
    vehicle_brand: vehicleBrand,
    vehicle_model: vehicleModel
  })
}

/**
 * Subscribe to real-time notification changes
 */
export function subscribeToNotifications(
  userId: string, 
  callback: (payload: any) => void
) {
  const supabase = createClient()
  
  const channel = supabase
    .channel('notifications-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()

  return channel
}
