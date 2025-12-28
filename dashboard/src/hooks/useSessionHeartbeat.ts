'use client'

/**
 * Session Heartbeat Hook
 * 
 * MIGRATING: Supabase Auth session tracking has been removed.
 * This hook will be updated to work with Better Auth sessions in Step 2.
 * 
 * Currently disabled during migration.
 * TODO: Re-enable with Better Auth session tracking.
 */

import { useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase-db'
import { createUserSession, updateSessionActivity, endUserSession } from '@/lib/sessionManager'

/**
 * Custom hook to manage user session heartbeat
 * Tracks user activity and updates session status in real-time
 * 
 * TEMPORARILY DISABLED during auth migration.
 */
export function useSessionHeartbeat() {
  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout | null = null
    let activityTimeout: NodeJS.Timeout | null = null
    let isInitialized = false

    const initializeSession = async () => {
      try {
        // TODO: Replace with Better Auth session check
        // const session = await auth.getSession()
        
        // Temporary: Get user from localStorage during migration
        const storedUser = localStorage.getItem('pcn-user')
        if (!storedUser) return
        
        const user = JSON.parse(storedUser)
        
        if (user && !isInitialized) {
          isInitialized = true

          // Create initial session
          await createUserSession(user.id, user.id, 'migration-token')

          // Set up heartbeat to update activity every 2 minutes
          heartbeatInterval = setInterval(async () => {
            const currentUser = localStorage.getItem('pcn-user')
            if (currentUser) {
              const userData = JSON.parse(currentUser)
              await updateSessionActivity(userData.id)
            }
          }, 2 * 60 * 1000) // 2 minutes

          // Track user activity (mouse move, keyboard, clicks)
          const updateActivity = () => {
            if (activityTimeout) {
              clearTimeout(activityTimeout)
            }
            
            activityTimeout = setTimeout(async () => {
              const currentUser = localStorage.getItem('pcn-user')
              if (currentUser) {
                const userData = JSON.parse(currentUser)
                await updateSessionActivity(userData.id)
              }
            }, 1000) // Debounce for 1 second
          }

          // Add event listeners for user activity
          window.addEventListener('mousemove', updateActivity)
          window.addEventListener('keydown', updateActivity)
          window.addEventListener('click', updateActivity)
          window.addEventListener('scroll', updateActivity)

          // Handle page visibility change
          const handleVisibilityChange = async () => {
            const currentUser = localStorage.getItem('pcn-user')
            if (currentUser) {
              const userData = JSON.parse(currentUser)
              if (document.hidden) {
                console.log('Page hidden, session will continue but no updates')
              } else {
                await updateSessionActivity(userData.id)
              }
            }
          }

          document.addEventListener('visibilitychange', handleVisibilityChange)

          // Handle page unload (user leaving the page)
          const handleBeforeUnload = async () => {
            const currentUser = localStorage.getItem('pcn-user')
            if (currentUser) {
              const userData = JSON.parse(currentUser)
              await endUserSession(userData.id)
            }
          }

          window.addEventListener('beforeunload', handleBeforeUnload)

          // Cleanup function
          return () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval)
            if (activityTimeout) clearTimeout(activityTimeout)
            
            window.removeEventListener('mousemove', updateActivity)
            window.removeEventListener('keydown', updateActivity)
            window.removeEventListener('click', updateActivity)
            window.removeEventListener('scroll', updateActivity)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('beforeunload', handleBeforeUnload)
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error)
      }
    }

    initializeSession()

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval)
      if (activityTimeout) clearTimeout(activityTimeout)
    }
  }, [])
}
