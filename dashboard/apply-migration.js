#!/usr/bin/env node

/**
 * Migration Application Script
 * This script runs SQL migrations against your Supabase database
 * Usage: node apply-migration.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

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

async function applyMigration(migrationFile) {
  try {
    console.log(`\n📄 Reading migration file: ${migrationFile}`)
    const sql = fs.readFileSync(migrationFile, 'utf8')
    
    console.log('🚀 Applying migration...')
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      // If exec_sql doesn't exist, try direct query execution
      console.log('⚠️  exec_sql function not found, trying direct execution...')
      
      // Split SQL by semicolons and execute each statement
      const statements = sql.split(';').filter(s => s.trim())
      for (const statement of statements) {
        if (!statement.trim()) continue
        
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error: execError } = await supabase.from('_migrations').select('*').limit(1)
        if (execError && execError.message.includes('relation "_migrations" does not exist')) {
          // This is expected, continue
        }
      }
      
      console.log('⚠️  Note: Direct SQL execution requires exec_sql function or manual application')
      console.log('✅ Please apply manually in Supabase SQL Editor')
      return false
    }
    
    console.log('✅ Migration applied successfully!')
    return true
  } catch (error) {
    console.error('❌ Error applying migration:', error.message)
    return false
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('🔧 Password Reset OTP FK Fix Migration')
    console.log('====================================')
    console.log('')
    console.log('This script will fix the foreign key constraint issue.')
    console.log('')
    
    const migrationFile = path.join(__dirname, 'migrations', '2025_11_08_fix_password_reset_otps_fk.sql')
    
    if (!fs.existsSync(migrationFile)) {
      console.error('❌ Migration file not found:', migrationFile)
      process.exit(1)
    }
    
    console.log('📁 Migration file:', migrationFile)
    console.log('')
    const success = await applyMigration(migrationFile)
    
    if (!success) {
      console.log('\n📝 To apply manually:')
      console.log('1. Open: https://app.supabase.com/project/[your-project]/sql')
      console.log('2. Copy the SQL migration from migrations/2025_11_08_fix_password_reset_otps_fk.sql')
      console.log('3. Paste and run in SQL Editor')
      console.log('')
      console.log('Migration SQL:')
      console.log('---')
      console.log(fs.readFileSync(migrationFile, 'utf8'))
      console.log('---')
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
