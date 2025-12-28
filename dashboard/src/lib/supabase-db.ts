/**
 * Supabase Database-Only Client
 * 
 * This module provides Supabase clients for DATABASE OPERATIONS ONLY.
 * Authentication is handled separately by Better Auth.
 * 
 * - supabaseClient: For client-side database operations (browser)
 * - supabaseAdmin: For server-side database operations (bypasses RLS)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL not set')
}

if (!supabaseAnonKey) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY not set')
}

/**
 * Client-side Supabase client for browser database operations.
 * Uses anon key - respects RLS policies.
 * Auth is disabled since Better Auth handles authentication.
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

/**
 * Server-side admin Supabase client.
 * Uses service role key - BYPASSES RLS policies.
 * Only use on server-side (API routes, server components).
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

/**
 * Helper function to get the appropriate Supabase client.
 * @param useAdmin - If true, returns admin client (server-side only)
 * @returns Supabase client instance
 */
export function getSupabaseClient(useAdmin = false) {
  return useAdmin ? supabaseAdmin : supabaseClient
}

/**
 * Create a new database client instance (for compatibility).
 * @returns Supabase client instance
 */
export function createDbClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

/**
 * Create a new admin database client instance (server-side only).
 * @returns Supabase admin client instance
 */
export function createAdminClient() {
  if (!supabaseServiceKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set, using anon key')
  }
  return createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
