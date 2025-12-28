'use client'

/**
 * Supabase Client (Browser-side)
 * 
 * This module provides a Supabase client for DATABASE OPERATIONS ONLY.
 * Authentication is handled separately by Better Auth.
 * 
 * Note: This file is kept for backward compatibility.
 * For new code, prefer importing from '@/lib/supabase-db'.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Get environment variables with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Database operations will fail.')
}

/**
 * Single supabase browser client for the entire application.
 * Used for database operations only - auth is handled by Better Auth.
 */
export const supabase = createSupabaseClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
)

/**
 * Create a new Supabase client instance.
 * Used for database operations only - auth is handled by Better Auth.
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase environment variables')
  }
  return createSupabaseClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}

