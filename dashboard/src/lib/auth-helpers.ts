/**
 * Auth Helper Functions
 * 
 * MIGRATING: These functions provide auth utilities during the migration
 * from Supabase Auth to Better Auth.
 * 
 * These functions return placeholder values that will be replaced
 * when Better Auth is integrated.
 * 
 * TODO: Replace all these functions with Better Auth equivalents in Step 2.
 */

import { supabaseClient } from './supabase-db'

// Placeholder user type that matches the structure expected by components
export interface AuthUser {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  accessLevel?: string
  role?: string
  status?: string
  auth_id?: string
}

// Placeholder session type
export interface AuthSession {
  user: AuthUser
  expiresAt?: Date
  accessToken?: string
}

/**
 * Get current session (placeholder).
 * TODO: Replace with Better Auth getSession()
 * 
 * During migration, this returns null which will require users to log in again
 * once Better Auth is set up.
 */
export async function getSession(): Promise<{ session: AuthSession | null }> {
  // TODO: Replace with Better Auth
  // const session = await auth.api.getSession({ headers: headers() })
  // return { session }
  
  return { session: null }
}

/**
 * Get current user (placeholder).
 * TODO: Replace with Better Auth getUser()
 */
export async function getUser(): Promise<{ user: AuthUser | null }> {
  // TODO: Replace with Better Auth
  // const session = await getSession()
  // return { user: session.session?.user || null }
  
  return { user: null }
}

/**
 * Check if user is authenticated (placeholder).
 * TODO: Replace with Better Auth check
 */
export async function isAuthenticated(): Promise<boolean> {
  const { session } = await getSession()
  return !!session
}

/**
 * Get user by auth_id from the database.
 * This is still useful for looking up user details.
 */
export async function getUserByAuthId(authId: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      firstName: data.first_name,
      lastName: data.last_name,
      accessLevel: data.access_level,
      role: data.role,
      status: data.status,
      auth_id: data.auth_id,
    }
  } catch (error) {
    console.error('Error getting user by auth_id:', error)
    return null
  }
}

/**
 * Get user by ID from the database.
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      firstName: data.first_name,
      lastName: data.last_name,
      accessLevel: data.access_level,
      role: data.role,
      status: data.status,
      auth_id: data.auth_id,
    }
  } catch (error) {
    console.error('Error getting user by id:', error)
    return null
  }
}

/**
 * Check if user has admin access.
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.accessLevel?.toLowerCase() === 'admin'
}

/**
 * Check if user has editor access (or higher).
 */
export function isEditor(user: AuthUser | null): boolean {
  const level = user?.accessLevel?.toLowerCase()
  return level === 'admin' || level === 'editor'
}
