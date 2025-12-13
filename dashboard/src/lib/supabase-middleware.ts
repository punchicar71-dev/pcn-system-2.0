import { createServerClient, SupabaseClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Type for user role
type UserRole = 'admin' | 'editor'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user, supabase }
}

/**
 * Get user role from the users table
 * @param supabase - Supabase client instance
 * @param authId - The auth user ID from Supabase Auth
 * @returns The user's role ('admin' or 'editor')
 */
export async function getUserRole(supabase: SupabaseClient, authId: string): Promise<UserRole> {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('access_level')
      .eq('auth_id', authId)
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
