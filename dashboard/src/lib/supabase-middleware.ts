/**
 * Supabase Middleware Utilities
 * 
 * DEPRECATED: This file contained Supabase Auth session handling.
 * Authentication is now handled by Better Auth.
 * 
 * This file is kept for backward compatibility during migration.
 * The functions now return placeholder values.
 * 
 * TODO: Remove this file after Better Auth migration is complete.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// Type for user role
type UserRole = 'admin' | 'editor'

/**
 * DEPRECATED: Session update is now handled by Better Auth.
 * This function is kept for backward compatibility during migration.
 * Returns a response without any auth session management.
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )

  // Return null user - Better Auth will handle authentication
  // This is a placeholder during migration
  return { supabaseResponse, user: null, supabase }
}

/**
 * Get user role from the users table.
 * This function is still useful for role-based access control.
 * 
 * @param supabase - Supabase client instance
 * @param userId - The user ID from the users table (NOT auth_id)
 * @returns The user's role ('admin' or 'editor')
 */
export async function getUserRole(supabase: SupabaseClient, userId: string): Promise<UserRole> {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('access_level')
      .eq('id', userId)
      .single()

    if (error || !userData) {
      console.error('Error fetching user role:', error)
      return 'editor' // Default to most restrictive role
    }

    // Convert access_level to role
    const accessLevel = userData.access_level?.toLowerCase()
    return accessLevel === 'admin' ? 'admin' : 'editor'
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return 'editor' // Default to most restrictive role on error
  }
}

/**
 * Get user role by auth_id (for backward compatibility).
 * DEPRECATED: Use getUserRole with user ID instead.
 * 
 * @param supabase - Supabase client instance
 * @param authId - The auth user ID
 * @returns The user's role ('admin' or 'editor')
 */
export async function getUserRoleByAuthId(supabase: SupabaseClient, authId: string): Promise<UserRole> {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('access_level')
      .eq('auth_id', authId)
      .single()

    if (error || !userData) {
      console.error('Error fetching user role by auth_id:', error)
      return 'editor' // Default to most restrictive role
    }

    // Convert access_level to role
    const accessLevel = userData.access_level?.toLowerCase()
    return accessLevel === 'admin' ? 'admin' : 'editor'
  } catch (error) {
    console.error('Error in getUserRoleByAuthId:', error)
    return 'editor' // Default to most restrictive role on error
  }
}
