'use client'

/**
 * Role Access Hook
 * 
 * MIGRATING: Supabase Auth session checks have been removed.
 * This hook will be updated to work with Better Auth in Step 2.
 * 
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabaseClient } from '@/lib/supabase-db'
import { 
  UserRole, 
  UserAction,
  accessLevelToRole, 
  hasPermission,
  isRouteRestricted,
  canPerformAction,
  isPageHiddenForRole,
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
  // Check if user can perform a specific action
  canPerformUserAction: (action: UserAction) => boolean
  // Check if page should be hidden for current user
  isPageHidden: (pathname: string) => boolean
  // Specific permission checks
  canAddUsers: boolean
  canDeleteUsers: boolean
  canEditUsers: boolean
  canViewUserManagement: boolean
  canViewReports: boolean
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
        // TODO: Replace with Better Auth session check
        // const session = await auth.getSession()
        
        // Temporary: Get user from localStorage during migration
        const storedUser = localStorage.getItem('pcn-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          
          // Fetch full user data from database
          const { data: fullUserData, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', userData.id)
            .single()
          
          if (fullUserData && !error) {
            setUser(fullUserData)
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

    // Listen for storage changes (for cross-tab logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pcn-user') {
        if (e.newValue) {
          const userData = JSON.parse(e.newValue)
          setUser(userData)
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
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
  const canAccessRoute = useCallback((path: string): boolean => {
    // If still loading, allow (will be handled by middleware)
    if (isLoading) return true
    // If no user, deny (will be handled by auth middleware)
    if (!user) return false
    // Check route restrictions
    return !isRouteRestricted(path, userRole)
  }, [isLoading, user, userRole])

  // Check if user has permission for a set of allowed roles
  const hasPermissionFor = useCallback((allowedRoles?: UserRole[]): boolean => {
    return hasPermission(userRole, allowedRoles)
  }, [userRole])

  // Check if a navigation item should be shown
  const shouldShowNavItem = useCallback((href: string): boolean => {
    // Check if page is hidden for user's role
    if (isPageHiddenForRole(href, userRole)) return false
    const allowedRoles = NAVIGATION_RESTRICTIONS[href]
    return hasPermission(userRole, allowedRoles)
  }, [userRole])

  // Check if user can perform a specific action
  const canPerformUserAction = useCallback((action: UserAction): boolean => {
    return canPerformAction(userRole, action)
  }, [userRole])

  // Check if page should be hidden for current user
  const isPageHidden = useCallback((pathname: string): boolean => {
    return isPageHiddenForRole(pathname, userRole)
  }, [userRole])

  // Specific permission checks for user management
  const canAddUsers = useMemo(() => canPerformAction(userRole, 'addUser'), [userRole])
  const canDeleteUsers = useMemo(() => canPerformAction(userRole, 'deleteUser'), [userRole])
  const canEditUsers = useMemo(() => canPerformAction(userRole, 'editUser'), [userRole])
  const canViewUserManagement = useMemo(() => !isPageHiddenForRole('/user-management', userRole), [userRole])
  const canViewReports = useMemo(() => !isPageHiddenForRole('/reports', userRole), [userRole])

  return {
    user,
    userRole,
    isLoading,
    isAdmin,
    isEditor,
    canAccessRoute,
    hasPermissionFor,
    shouldShowNavItem,
    canPerformUserAction,
    isPageHidden,
    canAddUsers,
    canDeleteUsers,
    canEditUsers,
    canViewUserManagement,
    canViewReports,
  }
}
