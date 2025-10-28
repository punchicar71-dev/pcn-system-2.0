import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Supabase signOut error:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    // Explicitly clear all auth cookies
    response.cookies.set('sb-access-token', '', { 
      maxAge: 0, 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    response.cookies.set('sb-refresh-token', '', { 
      maxAge: 0, 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
