'use client'

import { createBrowserClient } from '@supabase/ssr'

// Get environment variables with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only throw errors in the browser, not during SSR/build
function validateEnvVars() {
  if (typeof window === 'undefined') {
    // During SSR or build, just warn
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase environment variables not set. Client will not work properly.')
    }
    return false
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env.local file.')
    return false
  }
  
  return true
}

// Create a single supabase browser client for the entire application
// Use fallback empty strings to prevent crashes, validation happens at runtime
export const supabase = createBrowserClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Export a function to create a new client if needed
export function createClient() {
  validateEnvVars()
  return createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  )
}

