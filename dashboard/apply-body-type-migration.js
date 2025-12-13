#!/usr/bin/env node

/**
 * Apply body_type column migration to pending_vehicle_sales
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('🚀 Applying body_type column migration...\n')
    
    // Step 1: Add the column
    console.log('📝 Step 1: Adding body_type column...')
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.pending_vehicle_sales 
        ADD COLUMN IF NOT EXISTS body_type VARCHAR(50);
      `
    })
    
    if (addColumnError) {
      console.error('❌ Error adding column:', addColumnError.message)
      console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:')
      console.log('---')
      console.log('ALTER TABLE public.pending_vehicle_sales ADD COLUMN IF NOT EXISTS body_type VARCHAR(50);')
      console.log('---\n')
    } else {
      console.log('✅ Column added successfully')
    }
    
    // Step 2: Backfill data
    console.log('\n📝 Step 2: Backfilling existing records...')
    const { error: backfillError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.pending_vehicle_sales pvs
        SET body_type = v.body_type
        FROM public.vehicles v
        WHERE pvs.vehicle_id = v.id
        AND pvs.body_type IS NULL;
      `
    })
    
    if (backfillError) {
      console.error('❌ Error backfilling data:', backfillError.message)
      console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:')
      console.log('---')
      console.log('UPDATE public.pending_vehicle_sales pvs')
      console.log('SET body_type = v.body_type')
      console.log('FROM public.vehicles v')
      console.log('WHERE pvs.vehicle_id = v.id')
      console.log('AND pvs.body_type IS NULL;')
      console.log('---\n')
    } else {
      console.log('✅ Data backfilled successfully')
    }
    
    // Step 3: Create index
    console.log('\n📝 Step 3: Creating index...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_body_type 
        ON public.pending_vehicle_sales(body_type);
      `
    })
    
    if (indexError) {
      console.error('❌ Error creating index:', indexError.message)
      console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:')
      console.log('---')
      console.log('CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_body_type ON public.pending_vehicle_sales(body_type);')
      console.log('---\n')
    } else {
      console.log('✅ Index created successfully')
    }
    
    console.log('\n🎉 Migration process completed!')
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    console.log('\n📋 Please run the full migration manually in Supabase SQL Editor:')
    const migrationPath = path.join(__dirname, 'migrations', '2025_12_13_add_body_type_to_snapshot.sql')
    if (fs.existsSync(migrationPath)) {
      console.log('---')
      console.log(fs.readFileSync(migrationPath, 'utf8'))
      console.log('---')
    }
  }
}

applyMigration()
