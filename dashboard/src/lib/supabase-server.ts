/**
 * Supabase Server Client
 * 
 * This module provides a Supabase client for SERVER-SIDE DATABASE OPERATIONS ONLY.
 * Authentication is handled separately by Better Auth.
 * 
 * Note: This file is kept for backward compatibility with existing API routes.
 * For new code, prefer importing from '@/lib/supabase-db'.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Create a server-side Supabase client for database operations.
 * Uses the anon key by default (respects RLS).
 * For admin operations, use createAdminClient instead.
 */
export async function createClient() {
  return createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}

/**
 * Create a server-side Supabase admin client.
 * Uses the service role key - BYPASSES RLS policies.
 * Only use for admin operations.
 */
export async function createAdminClient() {
  if (!supabaseServiceKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set, using anon key')
  }
  return createSupabaseClient(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
