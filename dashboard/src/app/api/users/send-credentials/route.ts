/**
 * MIGRATING: Supabase Auth has been removed.
 * This file will be updated to work with Better Auth in Step 2.
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Using Supabase's built-in email functionality (SMTP)
// Supabase automatically handles email sending when:
// 1. User is created via auth.admin.createUser()
// 2. Email templates are configured in Supabase Dashboard
// 3. SMTP is enabled (default on all Supabase projects)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      firstName,
      lastName,
      username,
      password,
      accessLevel,
      role
    } = body

    // Get Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.warn('Supabase configuration missing - email not sent')
      return NextResponse.json(
        { warning: 'Email service not configured' },
        { status: 200 }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Prepare email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; }
            .credentials { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 4px; }
            .credentials p { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .value { background: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to PCN Vehicle Management System</h1>
            </div>
            <div class="content">
              <p>Dear ${firstName} ${lastName},</p>
              <p>Your user account has been successfully created in the PCN Vehicle Management System. Here are your login credentials:</p>
              
              <div class="credentials">
                <p><span class="label">Username/Email:</span></p>
                <div class="value">${username}</div>
                
                <p><span class="label">Email:</span></p>
                <div class="value">${email}</div>
                
                <p><span class="label">Password:</span></p>
                <div class="value">${password}</div>
                
                <p><span class="label">Access Level:</span></p>
                <div class="value">${accessLevel}</div>
                
                <p><span class="label">Role:</span></p>
                <div class="value">${role}</div>
              </div>

              <p><strong>⚠️ IMPORTANT SECURITY INFORMATION:</strong></p>
              <ul>
                <li>Keep your password confidential and never share it with anyone</li>
                <li>We recommend changing your password on first login</li>
                <li>If you did not request this account, please contact the administrator immediately</li>
              </ul>

              <p>To access the system, click the button below and enter your credentials.</p>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/login" class="button">Login Now</a>
              </center>

              <div class="footer">
                <p>&copy; 2025 PCN Vehicle Management System. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using Supabase Functions API
    // This uses Supabase's built-in SMTP service
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        to: email,
        subject: 'Your PCN Management System Account Created',
        html: emailHtml
      })
    })

    // If Supabase function doesn't exist, use alternative method
    if (!response.ok) {
      console.log('Supabase function not available, using alternative method')
      
      // TODO: MIGRATION - Supabase Auth admin.inviteUserByEmail has been commented out
      // This will be reimplemented with Better Auth in Step 2
      // For now, the user account is created but no invite email is sent
      /*
      // Alternative: Send a password reset email with custom text
      // This is a workaround using Supabase's built-in email system
      try {
        // We'll use Supabase's built-in invite email instead
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username,
            access_level: accessLevel,
            role: role,
            temporary_password: password
          }
        })

        if (inviteError) {
          console.error('Supabase invite email error:', inviteError)
          return NextResponse.json(
            { warning: 'Email could not be sent, but user account was created' },
            { status: 200 }
          )
        }

        console.log('Invite email sent successfully via Supabase')
        return NextResponse.json(
          { success: true, message: 'Email sent successfully via Supabase' },
          { status: 200 }
        )
      } catch (inviteError) {
        console.error('Error sending invite:', inviteError)
        return NextResponse.json(
          { warning: 'Email service error, but user account was created' },
          { status: 200 }
        )
      }
      */
      
      // MIGRATION: Return success without sending invite email
      return NextResponse.json(
        { warning: 'Email service temporarily unavailable during auth migration' },
        { status: 200 }
      )
    }

    const data = await response.json()
    console.log('Email sent successfully via Supabase:', data)

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send credentials email error:', error)
    // Don't fail - email is optional
    return NextResponse.json(
      { warning: 'Email service error, but user account was created' },
      { status: 200 }
    )
  }
}
