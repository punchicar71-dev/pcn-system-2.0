/**
 * Users API Routes
 * 
 * MIGRATING: Supabase Auth has been removed.
 * User creation now only creates a record in the users table.
 * Password hashing will be handled by Better Auth in Step 2.
 */

import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { sendSMS, formatPhoneNumber, isValidSriLankanPhone, smsTemplates } from '@/lib/sms-service'
import * as crypto from 'crypto'

// Simple password hashing (temporary until Better Auth is integrated)
// TODO: Replace with Better Auth password hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// GET all users
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Return users without auth-specific status (will be updated with Better Auth)
    const usersWithStatus = users.map((user) => ({
      ...user,
      last_sign_in_at: user.last_sign_in_at || null,
      is_online: false // Will be implemented with Better Auth sessions
    }))

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
    const supabaseAdmin = await createAdminClient()

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

    // Generate a unique ID for the user (will be auth_id placeholder)
    const uniqueId = crypto.randomUUID()

    // Create user record in users table
    // NOTE: Password is hashed temporarily. Better Auth will handle this properly.
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          auth_id: uniqueId, // Placeholder - will be replaced by Better Auth user ID
          first_name: firstName,
          last_name: lastName,
          username: username,
          email: email,
          mobile_number: mobileNumber || null,
          access_level: accessLevel,
          role: role,
          profile_picture_url: profilePicture || null,
          status: 'Active',
          // Store hashed password temporarily (Better Auth will migrate this)
          password_hash: hashPassword(password)
        }
      ])
      .select()
      .single()

    if (userError) {
      console.error('Error creating user record:', userError)
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
