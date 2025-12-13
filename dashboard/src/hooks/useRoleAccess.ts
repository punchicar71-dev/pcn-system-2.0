'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase-client'
import { 
  UserRole, 
  accessLevelToRole, 
  hasPermission,
  isRouteRestricted,
  NAVIGATION_RESTRICTIONS 
} from '@/lib/rbac'

interface UserData {
  id: string
  auth_id: string
  first_name: string
  last_name: string
  email: string
  access_level: string
  role: string
  status: string
  profile_picture_url?: string
}

interface UseRoleAccessReturn {
  // Current user data
  user: UserData | null
  // User's role
  userRole: UserRole
  // Loading state
  isLoading: boolean
  // Check if user is admin
  isAdmin: boolean
  // Check if user is editor
  isEditor: boolean
  // Check if user can access a specific route
  canAccessRoute: (path: string) => boolean
  // Check if user has permission for a set of allowed roles
  hasPermissionFor: (allowedRoles?: UserRole[]) => boolean
  // Check if a navigation item should be shown
  shouldShowNavItem: (href: string) => boolean
}

/**
 * Custom hook for role-based access control
 * Provides centralized role checking across the application
 */
export function useRoleAccess(): UseRoleAccessReturn {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()
          
          if (userData && !error) {
            setUser(userData)
          } else if (error) {
            console.error('Error fetching user data for RBAC:', error)
          }
        }
      } catch (error) {
        console.error('Error in useRoleAccess:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single()
        
        if (userData && !error) {
          setUser(userData)
        }
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Derive role from access_level
  const userRole = useMemo(() => {
    return accessLevelToRole(user?.access_level)
  }, [user?.access_level])

  // Check if user is admin
  const isAdmin = userRole === 'admin'

  // Check if user is editor
  const isEditor = userRole === 'editor'

  // Check if user can access a specific route
  const canAccessRoute = (path: string): boolean => {
    // If still loading, allow (will be handled by middleware)
    if (isLoading) return true
    // If no user, deny (will be handled by auth middleware)
    if (!user) return false
    // Check route restrictions
    return !isRouteRestricted(path, userRole)
  }

  // Check if user has permission for a set of allowed roles
  const hasPermissionFor = (allowedRoles?: UserRole[]): boolean => {
    return hasPermission(userRole, allowedRoles)
  }

  // Check if a navigation item should be shown
  const shouldShowNavItem = (href: string): boolean => {
    const allowedRoles = NAVIGATION_RESTRICTIONS[href]
    return hasPermission(userRole, allowedRoles)
  }

  return {
    user,
    userRole,
    isLoading,
    isAdmin,
    isEditor,
    canAccessRoute,
    hasPermissionFor,
    shouldShowNavItem,
  }
}
