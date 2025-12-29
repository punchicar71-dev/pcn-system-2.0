#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('Please ensure these are set in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkAndCreateTable() {
  try {
    console.log('Checking if phone_verification_otps table exists...')

    // Try to query the table
    const { data, error } = await supabase
      .from('phone_verification_otps')
      .select('*', { count: 'exact', head: true })

    if (error && error.code === 'PGRST116') {
      console.log('❌ Table does not exist. Creating it now...')
      
      // Create the table
      const { error: createError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS phone_verification_otps (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mobile_number TEXT NOT NULL,
            user_id UUID,
            otp_code TEXT NOT NULL,
            verified BOOLEAN DEFAULT FALSE,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            verified_at TIMESTAMPTZ
          );
          
          ALTER TABLE phone_verification_otps ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Service role has full access to phone_verification_otps" ON phone_verification_otps;
          CREATE POLICY "Service role has full access to phone_verification_otps"
            ON phone_verification_otps
            USING (auth.role() = 'service_role');
        `
      })

      if (createError) {
        console.error('Error creating table:', createError)
        return false
      }

      console.log('✅ Table created successfully')
      return true
    } else if (error) {
      console.error('Error checking table:', error)
      return false
    } else {
      console.log('✅ Table already exists')
      return true
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}

checkAndCreateTable().then(success => {
  process.exit(success ? 0 : 1)
})
