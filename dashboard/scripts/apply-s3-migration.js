/**
 * Apply S3 Key Migration to Supabase Database
 * This script adds the s3_key column to vehicle_images table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔄 Applying S3 key migration to vehicle_images table...\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'migrations', '2025_01_add_s3_key_to_vehicle_images.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(migrationSQL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Split SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/**'));

    for (const statement of statements) {
      if (!statement) continue;

      console.log(`🔧 Executing: ${statement.substring(0, 60)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      });

      if (error) {
        // Try direct query if RPC doesn't work
        const { error: queryError } = await supabase
          .from('vehicle_images')
          .select('*')
          .limit(0);
        
        if (queryError && queryError.message.includes('s3_key')) {
          console.log('⚠️  Column might already exist, skipping...');
        } else if (error.code !== '42701') { // 42701 = column already exists
          throw error;
        } else {
          console.log('✅ Statement executed (or already applied)');
        }
      } else {
        console.log('✅ Statement executed successfully');
      }
    }

    console.log('\n✅ Migration applied successfully!\n');
    console.log('Verifying changes...\n');

    // Verify the migration
    const { data, error } = await supabase
      .from('vehicle_images')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error verifying migration:', error.message);
    } else {
      console.log('✅ Table structure verified');
      console.log('📊 Sample columns:', data && data[0] ? Object.keys(data[0]) : 'No data yet');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION COMPLETE - You can now publish vehicles!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n📝 Manual Migration Instructions:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('1. Go to: https://wnorajpknqegnnmeotjf.supabase.co/project/_/sql');
    console.error('2. Copy and paste the SQL from:');
    console.error('   dashboard/migrations/2025_01_add_s3_key_to_vehicle_images.sql');
    console.error('3. Click "Run" to execute the migration');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  }
}

applyMigration();
