/**
 * Create Root Admin User Script
 * 
 * This script creates the root admin user in Supabase auth and users table
 * Run this with: node scripts/create-root-admin.js
 * 
 * Requirements:
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const ROOT_ADMIN = {
  email: 'punchicar71@gmail.com',
  password: 'punchcarrootadmin2025',
  username: 'punchcarrootadmin2025',
  fullName: 'Root Administrator',
  role: 'admin'
}

async function createRootAdmin() {
  console.log('🚀 Creating Root Admin User...\n')

  try {
    // Step 1: Create auth user
    console.log('📝 Step 1: Creating authentication user...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ROOT_ADMIN.email,
      password: ROOT_ADMIN.password,
      email_confirm: true, // Auto-confirm email (no verification needed)
      user_metadata: {
        username: ROOT_ADMIN.username,
        full_name: ROOT_ADMIN.fullName,
        role: ROOT_ADMIN.role
      }
    })

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already been registered')) {
        console.log('⚠️  Auth user already exists, fetching existing user...')
        
        // Get existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        
        if (listError) throw listError
        
        const existingUser = users.find(u => u.email === ROOT_ADMIN.email)
        
        if (existingUser) {
          console.log('✅ Found existing auth user')
          
          // Update password
          console.log('🔄 Updating password...')
          await supabase.auth.admin.updateUserById(existingUser.id, {
            password: ROOT_ADMIN.password,
            email_confirm: true
          })
          console.log('✅ Password updated')
          
          authData.user = existingUser
        } else {
          throw new Error('User exists but could not be found')
        }
      } else {
        throw authError
      }
    } else {
      console.log('✅ Authentication user created successfully')
    }

    const userId = authData.user.id

    // Step 2: Ensure users table exists
    console.log('\n📝 Step 2: Setting up users table...')
    
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          full_name TEXT,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })

    // If RPC doesn't exist, we'll skip table creation (should be done via migration)
    if (tableError && !tableError.message.includes('function') && !tableError.message.includes('does not exist')) {
      console.log('⚠️  Note: Run the CREATE_ROOT_ADMIN.sql file to ensure table exists')
    }

    // Step 3: Insert/Update user in users table
    console.log('\n📝 Step 3: Creating user profile...')
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: ROOT_ADMIN.email,
        username: ROOT_ADMIN.username,
        full_name: ROOT_ADMIN.fullName,
        role: ROOT_ADMIN.role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (userError) {
      console.log('⚠️  Could not create user profile:', userError.message)
      console.log('   Run CREATE_ROOT_ADMIN.sql to set up the users table first')
    } else {
      console.log('✅ User profile created successfully')
    }

    // Success!
    console.log('\n✨ ROOT ADMIN USER CREATED SUCCESSFULLY!\n')
    console.log('📧 Email:', ROOT_ADMIN.email)
    console.log('👤 Username:', ROOT_ADMIN.username)
    console.log('🔑 Password:', ROOT_ADMIN.password)
    console.log('🆔 User ID:', userId)
    console.log('\n✅ Email verification: DISABLED (user is auto-confirmed)')
    console.log('\n🎉 You can now login to the dashboard!\n')

  } catch (error) {
    console.error('\n❌ Error creating root admin:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the script
createRootAdmin()
