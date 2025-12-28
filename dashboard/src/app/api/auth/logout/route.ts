/**
 * Logout API Route
 * 
 * MIGRATING: Supabase Auth has been removed.
 * This is a placeholder that clears cookies.
 * Better Auth will handle proper session invalidation.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Clear any session cookies
    // These cookie names will be updated when Better Auth is integrated
    const sessionCookies = [
      'pcn-dashboard.session_token',
      'pcn-dashboard.session',
      'sb-access-token',
      'sb-refresh-token',
    ]
    
    for (const cookieName of sessionCookies) {
      cookieStore.delete(cookieName)
    }

    console.log('User logged out - session cookies cleared')
    
    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
