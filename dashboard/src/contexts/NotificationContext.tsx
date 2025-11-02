'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/hooks/use-toast'
import type { Notification } from '@/types/notification'
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  subscribeToNotifications
} from '@/lib/notificationService'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  refreshNotifications: () => Promise<void>
  markNotificationAsRead: (id: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { toast } = useToast()

  // Get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', session.user.id)
            .single()
          
          if (userData) {
            setCurrentUserId(userData.id)
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error)
      }
    }

    fetchCurrentUser()
  }, [])

  // Load notifications
  const refreshNotifications = useCallback(async () => {
    if (!currentUserId) return

    try {
      setLoading(true)
      const [notifs, count] = await Promise.all([
        getUserNotifications(currentUserId),
        getUnreadCount(currentUserId)
      ])
      
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  // Initial load
  useEffect(() => {
    if (currentUserId) {
      refreshNotifications()
    }
  }, [currentUserId, refreshNotifications])

  // Real-time subscription
  useEffect(() => {
    if (!currentUserId) return

    const channel = subscribeToNotifications(currentUserId, (payload) => {
      console.log('Notification change:', payload)
      
      if (payload.eventType === 'INSERT') {
        const newNotification = payload.new as Notification
        
        // Add to notifications list
        setNotifications(prev => [newNotification, ...prev])
        setUnreadCount(prev => prev + 1)
        
        // Show toast notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
          variant: getToastVariant(newNotification.type),
        })
      } else if (payload.eventType === 'UPDATE') {
        const updatedNotification = payload.new as Notification
        setNotifications(prev => 
          prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
        )
        refreshNotifications() // Refresh to update unread count
      } else if (payload.eventType === 'DELETE') {
        const deletedId = payload.old.id
        setNotifications(prev => prev.filter(n => n.id !== deletedId))
        refreshNotifications() // Refresh to update unread count
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [currentUserId, toast, refreshNotifications])

  // Mark notification as read
  const markNotificationAsRead = async (id: string) => {
    const success = await markAsRead(id)
    if (success) {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  // Mark all as read
  const markAllNotificationsAsRead = async () => {
    if (!currentUserId) return
    
    const success = await markAllAsRead(currentUserId)
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast({
        title: 'All notifications marked as read',
        description: 'Your notifications have been updated.',
      })
    }
  }

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    const success = await deleteNotification(id)
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id))
      await refreshNotifications() // Refresh to update unread count
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed.',
      })
    }
  }

  // Clear all notifications
  const clearAll = async () => {
    if (!currentUserId) return
    
    const success = await clearAllNotifications(currentUserId)
    if (success) {
      setNotifications([])
      setUnreadCount(0)
      toast({
        title: 'All notifications cleared',
        description: 'Your notification list is now empty.',
      })
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification: handleDeleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Helper function to determine toast variant based on notification type
function getToastVariant(type: string): 'default' | 'destructive' {
  switch (type) {
    case 'deleted':
      return 'destructive'
    case 'added':
    case 'sold':
      return 'default'
    default:
      return 'default'
  }
}
