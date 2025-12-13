/**
 * Role-Based Access Control Types
 * Centralized type definitions for the RBAC system
 */

// User roles enum
export type UserRole = 'admin' | 'editor'

// Route permission type
export type RoutePermission = {
  path: string
  allowedRoles: UserRole[]
  name: string
}

// Navigation item with role restrictions
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  allowedRoles?: UserRole[] // If undefined, all roles can access
}

// User access level from database (matches existing schema)
export type AccessLevel = 'Admin' | 'Editor'

// Helper to convert database access level to role
export function accessLevelToRole(accessLevel: string | null | undefined): UserRole {
  if (!accessLevel) return 'editor'
  
  switch (accessLevel.toLowerCase()) {
    case 'admin':
      return 'admin'
    case 'editor':
    default:
      return 'editor'
  }
}

// Check if role has permission
export function hasPermission(userRole: UserRole, allowedRoles?: UserRole[]): boolean {
  // Admin always has access
  if (userRole === 'admin') return true
  
  // If no restrictions, everyone can access
  if (!allowedRoles || allowedRoles.length === 0) return true
  
  // Check if user's role is in allowed roles
  return allowedRoles.includes(userRole)
}
