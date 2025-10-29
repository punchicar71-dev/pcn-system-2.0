'use client'

import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { createUserSession, updateSessionActivity, endUserSession } from '@/lib/sessionManager'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Custom hook to manage user session heartbeat
 * Tracks user activity and updates session status in real-time
 */
export function useSessionHeartbeat() {
  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout | null = null
    let activityTimeout: NodeJS.Timeout | null = null
    let isInitialized = false

    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session && !isInitialized) {
          isInitialized = true
          
          // Get user data to get the user_id
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', session.user.id)
            .single()

          if (userData) {
            // Create initial session
            await createUserSession(userData.id, session.user.id, session.access_token)

            // Set up heartbeat to update activity every 2 minutes
            heartbeatInterval = setInterval(async () => {
              const { data: { session: currentSession } } = await supabase.auth.getSession()
              if (currentSession) {
                await updateSessionActivity(currentSession.user.id)
              }
            }, 2 * 60 * 1000) // 2 minutes

            // Track user activity (mouse move, keyboard, clicks)
            const updateActivity = () => {
              if (activityTimeout) {
                clearTimeout(activityTimeout)
              }
              
              activityTimeout = setTimeout(async () => {
                const { data: { session: currentSession } } = await supabase.auth.getSession()
                if (currentSession) {
                  await updateSessionActivity(currentSession.user.id)
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
              const { data: { session: currentSession } } = await supabase.auth.getSession()
              if (currentSession) {
                if (document.hidden) {
                  // Page is hidden, user might be inactive
                  console.log('Page hidden, session will continue but no updates')
                } else {
                  // Page is visible again, update activity
                  await updateSessionActivity(currentSession.user.id)
                }
              }
            }

            document.addEventListener('visibilitychange', handleVisibilityChange)

            // Handle page unload (user leaving the page)
            const handleBeforeUnload = async () => {
              const { data: { session: currentSession } } = await supabase.auth.getSession()
              if (currentSession) {
                // Mark session as inactive
                await endUserSession(currentSession.user.id)
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
