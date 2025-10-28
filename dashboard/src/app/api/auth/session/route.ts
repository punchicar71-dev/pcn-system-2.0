import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken } = await request.json()
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Set the session using the tokens from the client
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) {
      console.error('Session set error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Session set successfully on server')
    return NextResponse.json({ success: true, session: data.session }, { status: 200 })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { error: 'An error occurred setting session' },
      { status: 500 }
    )
  }
}
