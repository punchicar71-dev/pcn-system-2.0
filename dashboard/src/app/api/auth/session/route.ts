import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ user: null, session: null }, { status: 200 })
    }

    const { data: { session } } = await supabase.auth.getSession()

    return NextResponse.json({ user, session }, { status: 200 })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { error: 'An error occurred getting session' },
      { status: 500 }
    )
  }
}

// This POST endpoint is no longer needed with the new SSR setup
// but keeping it for backwards compatibility
export async function POST() {
  return NextResponse.json(
    { message: 'Session management is now handled automatically by Supabase SSR' },
    { status: 200 }
  )
}
