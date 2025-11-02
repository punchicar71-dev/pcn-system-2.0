// Notification types for the PCN System

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  vehicle_number?: string
  vehicle_brand?: string
  vehicle_model?: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export type NotificationType = 
  | 'added' 
  | 'updated' 
  | 'deleted' 
  | 'moved_to_sales' 
  | 'sold'

export interface CreateNotificationInput {
  user_id: string
  type: NotificationType
  title: string
  message: string
  vehicle_number?: string
  vehicle_brand?: string
  vehicle_model?: string
}

export interface NotificationStats {
  total: number
  unread: number
}
