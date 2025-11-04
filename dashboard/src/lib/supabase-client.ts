'use client'

import { createBrowserClient } from '@supabase/ssr'

// Get environment variables with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Create a single supabase browser client for the entire application
export const supabase = createBrowserClient(supabaseUrl as string, supabaseAnonKey as string)

// Export a function to create a new client if needed
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  return createBrowserClient(supabaseUrl as string, supabaseAnonKey as string)
}

