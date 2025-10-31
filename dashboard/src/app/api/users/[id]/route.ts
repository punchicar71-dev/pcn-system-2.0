import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET - Get single user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check if current user is authenticated
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      )
    }

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

    // Check if current user is authenticated and is an admin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      )
    }

    // Get current user's role
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('access_level')
      .eq('auth_id', authUser.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'Failed to verify user permissions' },
        { status: 403 }
      )
    }

    // Only allow admins to update users
    if (currentUser.access_level?.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Only administrators can update users' },
        { status: 403 }
      )
    }

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
    const supabase = await createClient()

    // Check if current user is authenticated and is an admin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      )
    }

    // Get current user's role and ID
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('access_level, id, auth_id')
      .eq('auth_id', authUser.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'Failed to verify user permissions' },
        { status: 403 }
      )
    }

    // Only allow admins to delete users
    if (currentUser.access_level?.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Only administrators can delete users' },
        { status: 403 }
      )
    }

    // Prevent self-deletion (compare user IDs, not auth IDs)
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Use service role client for admin operations
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

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

    // Step 1: Delete user from users table first
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

    // Step 2: Try to delete user from Supabase Auth (if auth_id is valid)
    // Only attempt if auth_id exists and looks like a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    if (userToDelete.auth_id && uuidRegex.test(userToDelete.auth_id)) {
      try {
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
          userToDelete.auth_id
        )

        if (deleteAuthError) {
          console.error('Error deleting auth user:', deleteAuthError)
          // User record is already deleted, so we consider this a success with a warning
          return NextResponse.json(
            { 
              success: true,
              warning: 'User deleted but authentication cleanup had issues',
              message: `User ${userToDelete.first_name} ${userToDelete.last_name} has been deleted`,
              deletedUser: {
                id: params.id,
                name: `${userToDelete.first_name} ${userToDelete.last_name}`,
                email: userToDelete.email
              }
            },
            { status: 200 }
          )
        }
      } catch (authError) {
        console.error('Auth deletion error:', authError)
        // Continue anyway since the main user record is deleted
      }
    } else {
      console.log('Skipping auth deletion - invalid or missing auth_id:', userToDelete.auth_id)
    }

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
