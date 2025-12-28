/**
 * RBAC Module Index
 * Export all role-based access control utilities
 */

export * from './types'
export * from './config'

// Re-export specific utilities for convenience
export { 
  canPerformAction, 
  isPageHiddenForRole,
  USER_ACTION_PERMISSIONS,
  HIDDEN_PAGES 
} from './types'
