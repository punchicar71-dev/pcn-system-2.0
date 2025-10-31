'use client'

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase browser client for the entire application
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Export a function to create a new client if needed
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

