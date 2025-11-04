const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLeasingCompanies() {
  console.log('\n--- Testing Leasing Companies Table ---\n')
  
  try {
    // Test 1: Check if table exists by querying it
    console.log('Test 1: Fetching leasing companies...')
    const { data, error } = await supabase
      .from('leasing_companies')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error:', error.message)
      console.error('Error Code:', error.code)
      console.error('Error Details:', error.details)
      console.error('Error Hint:', error.hint)
      return
    }
    
    console.log('✅ Success! Found', data?.length || 0, 'leasing companies')
    if (data && data.length > 0) {
      console.log('\nData:')
      console.table(data)
    }
    
    // Test 2: Check table structure
    console.log('\n\nTest 2: Checking table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('leasing_companies')
      .select('*')
      .limit(1)
    
    if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Table columns:', Object.keys(tableInfo[0]))
    } else {
      console.log('⚠️  Table is empty')
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

testLeasingCompanies()
