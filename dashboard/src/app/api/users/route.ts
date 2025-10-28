import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET all users
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching users' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: Request) {
  try {
    // Use service role client for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const body = await request.json()
    const {
      firstName,
      lastName,
      username,
      email,
      mobileNumber,
      accessLevel,
      role,
      password,
      profilePicture,
      sendEmail
    } = body

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password || !accessLevel || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Step 1: Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        username: username
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 400 }
      )
    }

    // Step 2: Create user record in users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          auth_id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          username: username,
          email: email,
          mobile_number: mobileNumber || null,
          access_level: accessLevel,
          role: role,
          profile_picture_url: profilePicture || null,
          status: 'Active'
        }
      ])
      .select()
      .single()

    if (userError) {
      console.error('Error creating user record:', userError)
      // Rollback: Delete the auth user if user record creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `Failed to create user record: ${userError.message}` },
        { status: 400 }
      )
    }

    // Step 3: Send email notification if requested
    if (sendEmail) {
      try {
        // Call email service to send credentials
        await fetch(`${request.url.replace('/api/users', '/api/users/send-credentials')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            firstName,
            lastName,
            username,
            password,
            accessLevel,
            role
          })
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the whole operation if email fails
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        user: userData,
        message: 'User created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create user API error:', error)
    return NextResponse.json(
      { error: 'An error occurred creating user' },
      { status: 500 }
    )
  }
}
