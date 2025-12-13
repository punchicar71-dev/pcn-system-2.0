/**
 * Apply Database Migrations for Multiple Sold-Out Records Feature
 * 
 * This script applies the necessary database migrations to enable
 * multiple sold-out records for the same vehicle.
 * 
 * Run with: node apply-migrations.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}`);
  
  const filePath = path.join(__dirname, 'migrations', filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Migration failed: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Migration completed successfully`);
    return true;
  } catch (err) {
    console.error(`❌ Error running migration: ${err.message}`);
    return false;
  }
}

async function applyMigrations() {
  console.log('🚀 Starting database migrations...\n');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('');
  
  // Migration 1: Add snapshot columns
  const migration1Success = await runMigration('2025_12_13_add_vehicle_snapshot_to_pending_sales.sql');
  
  if (!migration1Success) {
    console.error('\n❌ Failed to apply first migration. Aborting.');
    process.exit(1);
  }
  
  // Migration 2: Allow multiple sold-out records
  const migration2Success = await runMigration('2025_12_13_allow_multiple_soldout_records.sql');
  
  if (!migration2Success) {
    console.error('\n❌ Failed to apply second migration. Aborting.');
    process.exit(1);
  }
  
  console.log('\n🎉 All migrations applied successfully!');
  console.log('\n✅ Next steps:');
  console.log('   1. Refresh your browser');
  console.log('   2. Try marking a vehicle as sold out');
  console.log('   3. The error should be resolved!');
}

applyMigrations().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
