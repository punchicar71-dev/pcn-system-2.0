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

// User action permissions
export type UserAction = 'addUser' | 'deleteUser' | 'editUser' | 'viewUsers'

// Permission map for user actions
export const USER_ACTION_PERMISSIONS: Record<UserAction, UserRole[]> = {
  addUser: ['admin'],      // Only admin can add users
  deleteUser: ['admin'],   // Only admin can delete users
  editUser: ['admin'],     // Only admin can edit users
  viewUsers: ['admin'],    // Only admin can view user management
}

// Pages hidden from specific roles
export const HIDDEN_PAGES: Record<UserRole, string[]> = {
  admin: [],  // Admin can see all pages
  editor: ['/reports', '/user-management'],  // Editor cannot see Reports & User Management
}

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

// Check if user can perform a specific action
export function canPerformAction(userRole: UserRole, action: UserAction): boolean {
  // Admin always has access
  if (userRole === 'admin') return true
  
  // Check if user's role is allowed for this action
  return USER_ACTION_PERMISSIONS[action].includes(userRole)
}

// Check if a page should be hidden for a role
export function isPageHiddenForRole(pathname: string, userRole: UserRole): boolean {
  const hiddenPages = HIDDEN_PAGES[userRole] || []
  return hiddenPages.some(page => 
    pathname === page || pathname.startsWith(`${page}/`)
  )
}
