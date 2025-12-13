/**
 * Role-Based Access Control Configuration
 * Central configuration for route permissions and navigation access
 */

import { UserRole, RoutePermission } from './types'

// Routes that require specific roles
// Admin has access to all routes by default
// Routes not listed here are accessible to all authenticated users
export const RESTRICTED_ROUTES: RoutePermission[] = [
  {
    path: '/reports',
    allowedRoles: ['admin'],
    name: 'Reports & Analytics',
  },
  {
    path: '/user-management',
    allowedRoles: ['admin'],
    name: 'User Management',
  },
]

// Get restricted route paths as an array (for middleware)
export const ADMIN_ONLY_ROUTES = RESTRICTED_ROUTES
  .filter(route => route.allowedRoles.includes('admin') && route.allowedRoles.length === 1)
  .map(route => route.path)

// Navigation items that should be hidden for specific roles
export const NAVIGATION_RESTRICTIONS: Record<string, UserRole[]> = {
  '/reports': ['admin'],
  '/user-management': ['admin'],
}

// Check if a route is restricted for a given role
export function isRouteRestricted(pathname: string, userRole: UserRole): boolean {
  // Admin has access to everything
  if (userRole === 'admin') return false

  // Check if the pathname starts with any restricted route
  const restrictedRoute = RESTRICTED_ROUTES.find(route => 
    pathname === route.path || pathname.startsWith(`${route.path}/`)
  )

  if (!restrictedRoute) return false

  // Check if user's role is allowed
  return !restrictedRoute.allowedRoles.includes(userRole)
}

// Get list of routes user can access
export function getAccessibleRoutes(userRole: UserRole): string[] {
  if (userRole === 'admin') {
    // Admin can access everything
    return RESTRICTED_ROUTES.map(r => r.path)
  }

  // Filter routes based on role
  return RESTRICTED_ROUTES
    .filter(route => route.allowedRoles.includes(userRole))
    .map(route => route.path)
}
