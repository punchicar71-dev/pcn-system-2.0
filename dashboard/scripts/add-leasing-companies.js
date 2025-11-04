const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Checking Supabase credentials...')
console.log('   Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
console.log('   Supabase Key:', supabaseKey ? '✅ Found' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing Supabase credentials!')
  console.error('Please ensure .env.local file exists in the dashboard directory with:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('✅ Credentials loaded successfully!\n')

const supabase = createClient(supabaseUrl, supabaseKey)

const leasingCompanies = [
  'Abans Finance PLC',
  'Alliance Finance Co. PLC',
  'AMW Capital Leasing and Finance PLC',
  'Asia Asset Finance PLC',
  'Assetline Finance Ltd.',
  'Associated Motor Finance Co. PLC',
  'CBC Finance Ltd',
  'Central Finance Co PLC',
  'Citizens Development Business Finance PLC',
  'Commercial Credit & Finance PLC',
  'Dialog Finance PLC',
  'ETI Finance Ltd',
  'Fintrex Finance Ltd.',
  'HNB Finance PLC',
  'Lanka Credit and Business Finance PLC',
  'L B Finance PLC',
  'LOLC Finance PLC',
  'Mahindra Ideal Finance Ltd.',
  'Mercantile Investments & Finance PLC',
  'Merchant Bank of Sri Lanka & Finance PLC',
  'Nation Lanka Finance PLC',
  'Janashakthi Finance PLC',
  'People\'s Leasing & Finance PLC',
  'PMF Finance PLC',
  'Richard Pieris Finance Ltd.',
  'Sarvodaya Development Finance PLC',
  'Senkadagala Finance PLC',
  'Singer Finance (Lanka) PLC',
  'Siyapatha Finance PLC',
  'SMB Finance PLC',
  'Softlogic Finance PLC',
  'UB Finance PLC',
  'Vallibel Finance PLC'
]

const generateCompanyId = () => {
  return String(Math.floor(10000 + Math.random() * 90000))
}

async function addLeasingCompanies() {
  console.log('🚀 Starting to add leasing companies to Supabase...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (const companyName of leasingCompanies) {
    try {
      const companyId = generateCompanyId()
      
      const { data, error } = await supabase
        .from('leasing_companies')
        .insert([
          {
            company_id: companyId,
            name: companyName,
            is_active: true,
          },
        ])
        .select()
        .single()

      if (error) {
        // If duplicate company_id, try again with a new ID
        if (error.code === '23505') {
          console.log(`⚠️  Duplicate ID for "${companyName}", retrying...`)
          const newCompanyId = generateCompanyId()
          
          const { data: retryData, error: retryError } = await supabase
            .from('leasing_companies')
            .insert([
              {
                company_id: newCompanyId,
                name: companyName,
                is_active: true,
              },
            ])
            .select()
            .single()

          if (retryError) throw retryError
          console.log(`✅ Added: ${companyName} (ID: ${newCompanyId})`)
          successCount++
        } else {
          throw error
        }
      } else {
        console.log(`✅ Added: ${companyName} (ID: ${companyId})`)
        successCount++
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`❌ Failed to add "${companyName}":`, error.message)
      errorCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log(`   ✅ Successfully added: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)
  console.log(`   📝 Total companies: ${leasingCompanies.length}`)
  console.log('='.repeat(60))
  
  // Verify the data
  console.log('\n🔍 Verifying data in database...')
  const { data: allCompanies, error: fetchError } = await supabase
    .from('leasing_companies')
    .select('*')
    .order('name')

  if (fetchError) {
    console.error('Error fetching companies:', fetchError)
  } else {
    console.log(`\n✅ Total companies in database: ${allCompanies.length}`)
    console.log('\nCompanies in database:')
    allCompanies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (${company.company_id}) - ${company.is_active ? 'Active' : 'Inactive'}`)
    })
  }
}

addLeasingCompanies()
  .then(() => {
    console.log('\n✨ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
