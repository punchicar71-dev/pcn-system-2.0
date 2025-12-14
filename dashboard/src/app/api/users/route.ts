import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendSMS, formatPhoneNumber, isValidSriLankanPhone, smsTemplates } from '@/lib/sms-service'

// GET all users
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Use service role client to access auth data
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Enrich users with auth status (online/offline based on active session)
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        try {
          // Get current session info from Supabase Auth
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.auth_id)
          
          if (authError) {
            console.error('Error fetching auth data for user:', user.id, authError)
            return {
              ...user,
              last_sign_in_at: null,
              is_online: false
            }
          }
          
          const lastSignIn = authData?.user?.last_sign_in_at
          
          // Consider user online if they signed in within last 30 minutes
          // This is more realistic for active browsing sessions
          const isOnline = lastSignIn 
            ? (new Date().getTime() - new Date(lastSignIn).getTime()) < 30 * 60 * 1000
            : false
          
          return {
            ...user,
            last_sign_in_at: lastSignIn,
            is_online: isOnline
          }
        } catch (error) {
          console.error('Error fetching status for user:', user.id, error)
          return {
            ...user,
            last_sign_in_at: null,
            is_online: false
          }
        }
      })
    )

    return NextResponse.json({ users: usersWithStatus }, { status: 200 })
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
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
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
      sendEmail,
      sendSMS: shouldSendSMS
    } = body

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password || !accessLevel || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const { data: existingUsername } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists. Please choose a different username.' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists. Please use a different email address.' },
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

    // Step 4: Send SMS notification if requested and mobile number provided
    if (shouldSendSMS && mobileNumber) {
      try {
        // Validate phone number
        if (isValidSriLankanPhone(mobileNumber)) {
          const formattedPhone = formatPhoneNumber(mobileNumber)
          const smsMessage = smsTemplates.welcome(firstName, username, email, password)
          
          console.log('Sending welcome SMS to:', formattedPhone)
          
          const smsResult = await sendSMS({
            to: formattedPhone,
            message: smsMessage
          })
          
          if (smsResult.status === 'success') {
            console.log('Welcome SMS sent successfully to:', formattedPhone)
          } else {
            console.error('Failed to send SMS:', smsResult.message)
          }
        } else {
          console.error('Invalid phone number format:', mobileNumber)
        }
      } catch (smsError) {
        console.error('Error sending SMS:', smsError)
        // Don't fail the whole operation if SMS fails
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
