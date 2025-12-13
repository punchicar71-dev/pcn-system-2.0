'use client'

import { ReactNode } from 'react'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import { UserRole } from '@/lib/rbac'

interface RoleGuardProps {
  /** Child components to render if user has permission */
  children: ReactNode
  /** Roles that are allowed to see this content */
  allowedRoles: UserRole[]
  /** Optional fallback content to show if user doesn't have permission */
  fallback?: ReactNode
  /** If true, shows a loading state while checking permissions */
  showLoading?: boolean
}

/**
 * Component wrapper that conditionally renders children based on user role
 * Useful for hiding specific UI elements from restricted users
 * 
 * @example
 * ```tsx
 * <RoleGuard allowedRoles={['admin']}>
 *   <AdminOnlyButton />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null,
  showLoading = false 
}: RoleGuardProps) {
  const { hasPermissionFor, isLoading } = useRoleAccess()

  // Show loading state if requested
  if (isLoading && showLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-4 w-20"></div>
  }

  // Check if user has permission
  if (!hasPermissionFor(allowedRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Higher-order component version of RoleGuard
 * Use when you need to wrap entire components
 * 
 * @example
 * ```tsx
 * const AdminComponent = withRoleGuard(['admin'])(MyComponent)
 * ```
 */
export function withRoleGuard<P extends object>(allowedRoles: UserRole[]) {
  return function WithRoleGuardWrapper(WrappedComponent: React.ComponentType<P>) {
    return function WithRoleGuard(props: P) {
      return (
        <RoleGuard allowedRoles={allowedRoles}>
          <WrappedComponent {...props} />
        </RoleGuard>
      )
    }
  }
}
