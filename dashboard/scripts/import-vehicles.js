const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function importVehicleData() {
  try {
    // Read the CSV file from Downloads folder
    const csvPath = '/Users/asankaherath/Downloads/vehicle brand & models.csv'
    
    if (!fs.existsSync(csvPath)) {
      console.error(`Error: CSV file not found at ${csvPath}`)
      process.exit(1)
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse CSV (skip header)
    const lines = csvContent.split('\n').slice(1)
    const vehicleData = []
    
    lines.forEach(line => {
      if (line.trim()) {
        const [brand, model] = line.split(',')
        if (brand && model) {
          vehicleData.push({ 
            brand: brand.trim(), 
            model: model.trim() 
          })
        }
      }
    })

    // Group by brand
    const brandMap = new Map()
    vehicleData.forEach(({ brand, model }) => {
      if (!brandMap.has(brand)) {
        brandMap.set(brand, [])
      }
      brandMap.get(brand).push(model)
    })

    console.log(`\nFound ${brandMap.size} unique brands`)
    console.log(`Total models: ${vehicleData.length}\n`)

    let successfulBrands = 0
    let successfulModels = 0
    let skippedBrands = 0

    // Convert Map to array for iteration
    const brands = Array.from(brandMap.entries())

    // Insert brands and models
    for (let i = 0; i < brands.length; i++) {
      const [brandName, models] = brands[i]
      
      try {
        // Check if brand exists
        const { data: existingBrand } = await supabase
          .from('vehicle_brands')
          .select('id')
          .eq('name', brandName)
          .single()

        let brandId

        if (existingBrand) {
          brandId = existingBrand.id
          skippedBrands++
          console.log(`[${i + 1}/${brands.length}] Brand "${brandName}" already exists, adding models...`)
        } else {
          // Insert brand
          const { data: brandData, error: brandError } = await supabase
            .from('vehicle_brands')
            .insert([{ name: brandName }])
            .select()
            .single()

          if (brandError) {
            console.error(`✗ Error inserting brand "${brandName}":`, brandError.message)
            continue
          }

          brandId = brandData.id
          successfulBrands++
          console.log(`[${i + 1}/${brands.length}] ✓ Inserted brand: ${brandName}`)
        }

        // Insert models for this brand in batches
        const batchSize = 50
        let brandModelsInserted = 0

        for (let j = 0; j < models.length; j += batchSize) {
          const batch = models.slice(j, j + batchSize)
          const modelInserts = batch.map(model => ({
            brand_id: brandId,
            name: model
          }))

          const { data, error: modelError } = await supabase
            .from('vehicle_models')
            .upsert(modelInserts, { 
              onConflict: 'brand_id,name',
              ignoreDuplicates: true 
            })
            .select()

          if (modelError) {
            console.error(`  ✗ Error inserting models for "${brandName}":`, modelError.message)
          } else {
            const inserted = data ? data.length : batch.length
            brandModelsInserted += inserted
            successfulModels += inserted
          }
        }

        console.log(`  ✓ Inserted ${brandModelsInserted} models for ${brandName}`)

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))

      } catch (error) {
        console.error(`✗ Error processing brand "${brandName}":`, error.message)
      }
    }

    console.log('\n' + '='.repeat(40))
    console.log('IMPORT SUMMARY')
    console.log('='.repeat(40))
    console.log(`New brands inserted: ${successfulBrands}`)
    console.log(`Existing brands skipped: ${skippedBrands}`)
    console.log(`Total models inserted: ${successfulModels}`)
    console.log('='.repeat(40) + '\n')

  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run the import
console.log('Starting vehicle data import...\n')
importVehicleData()
  .then(() => {
    console.log('Import completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })
