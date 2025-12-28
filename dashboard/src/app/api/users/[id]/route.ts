/**
 * User API Routes (Single User)
 * 
 * MIGRATING: Supabase Auth has been removed.
 * Session validation will be handled by Better Auth in Step 2.
 * 
 * TODO: Add Better Auth session validation to these endpoints.
 */

import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET - Get single user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // TODO: Replace with Better Auth session validation
    // For now, we skip auth check - will be added with Better Auth
    // const session = await auth.api.getSession({ headers: request.headers })
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Get user details
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching user' },
      { status: 500 }
    )
  }
}

// PUT - Update user details
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // TODO: Replace with Better Auth session validation and admin check
    // For now, we check the user making the request via a header or cookie
    // const session = await auth.api.getSession({ headers: request.headers })
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    // if (session.user.accessLevel !== 'Admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    console.log(`[UPDATE USER] Updating user ${params.id}`)

    const body = await request.json()
    const {
      first_name,
      last_name,
      username,
      email,
      mobile_number,
      access_level,
      role,
      profile_picture_url
    } = body

    // Check if username is being changed and if it already exists (excluding current user)
    if (username) {
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .neq('id', params.id)
        .single()

      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already exists. Please choose a different username.' },
          { status: 400 }
        )
      }
    }

    // Check if email is being changed and if it already exists (excluding current user)
    if (email) {
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .neq('id', params.id)
        .single()

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists. Please use a different email address.' },
          { status: 400 }
        )
      }
    }

    // Update user in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        username,
        email,
        mobile_number,
        access_level,
        role,
        profile_picture_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: `Failed to update user: ${updateError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'User updated successfully',
        user: updatedUser
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update user API error:', error)
    return NextResponse.json(
      { error: 'An error occurred updating user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user permanently
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = await createAdminClient()

    // TODO: Replace with Better Auth session validation and admin check
    // const session = await auth.api.getSession({ headers: request.headers })
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    // if (session.user.accessLevel !== 'Admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }
    // Prevent self-deletion
    // if (session.user.id === params.id) {
    //   return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    // }

    // Get the user to be deleted
    const { data: userToDelete, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('auth_id, first_name, last_name, email, id')
      .eq('id', params.id)
      .single()

    if (fetchError || !userToDelete) {
      console.error('Error fetching user to delete:', fetchError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('Deleting user:', userToDelete)

    // Delete user from users table
    const { error: deleteUserError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', params.id)

    if (deleteUserError) {
      console.error('Error deleting user from users table:', deleteUserError)
      return NextResponse.json(
        { error: `Failed to delete user: ${deleteUserError.message}` },
        { status: 400 }
      )
    }

    // NOTE: No need to delete from Supabase Auth anymore
    // Better Auth will handle session cleanup automatically

    return NextResponse.json(
      { 
        success: true,
        message: `User ${userToDelete.first_name} ${userToDelete.last_name} has been permanently deleted`,
        deletedUser: {
          id: params.id,
          name: `${userToDelete.first_name} ${userToDelete.last_name}`,
          email: userToDelete.email
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete user API error:', error)
    return NextResponse.json(
      { error: 'An error occurred deleting user' },
      { status: 500 }
    )
  }
}
