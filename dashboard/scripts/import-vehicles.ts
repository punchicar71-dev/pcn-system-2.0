import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface VehicleData {
  brand: string
  model: string
}

async function importVehicleData() {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), '..', '..', 'Downloads', 'vehicle brand & models.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse CSV (skip header)
    const lines = csvContent.split('\n').slice(1)
    const vehicleData: VehicleData[] = lines
      .filter(line => line.trim())
      .map(line => {
        const [brand, model] = line.split(',')
        return { brand: brand.trim(), model: model.trim() }
      })

    // Group by brand
    const brandMap = new Map<string, string[]>()
    vehicleData.forEach(({ brand, model }) => {
      if (!brandMap.has(brand)) {
        brandMap.set(brand, [])
      }
      brandMap.get(brand)!.push(model)
    })

    console.log(`Found ${brandMap.size} unique brands`)
    console.log(`Total models: ${vehicleData.length}`)

    let successfulBrands = 0
    let successfulModels = 0
    let errors = 0

    // Insert brands and models
    for (const [brandName, models] of brandMap.entries()) {
      try {
        // Insert brand
        const { data: brandData, error: brandError } = await supabase
          .from('vehicle_brands')
          .insert([{ name: brandName }])
          .select()
          .single()

        if (brandError) {
          if (brandError.code === '23505') {
            // Brand already exists, fetch it
            const { data: existingBrand } = await supabase
              .from('vehicle_brands')
              .select('id')
              .eq('name', brandName)
              .single()

            if (existingBrand) {
              console.log(`Brand "${brandName}" already exists, adding models...`)
              
              // Insert models for existing brand
              const modelInserts = models.map(model => ({
                brand_id: existingBrand.id,
                name: model
              }))

              const { data: modelData, error: modelError } = await supabase
                .from('vehicle_models')
                .upsert(modelInserts, { 
                  onConflict: 'brand_id,name',
                  ignoreDuplicates: true 
                })

              if (!modelError) {
                successfulModels += models.length
              }
            }
          } else {
            console.error(`Error inserting brand "${brandName}":`, brandError.message)
            errors++
          }
          continue
        }

        successfulBrands++
        console.log(`✓ Inserted brand: ${brandName}`)

        // Insert models for this brand
        if (brandData && brandData.id) {
          const modelInserts = models.map(model => ({
            brand_id: brandData.id,
            name: model
          }))

          // Insert in batches of 100
          const batchSize = 100
          for (let i = 0; i < modelInserts.length; i += batchSize) {
            const batch = modelInserts.slice(i, i + batchSize)
            const { error: modelError } = await supabase
              .from('vehicle_models')
              .insert(batch)

            if (modelError) {
              console.error(`Error inserting models for "${brandName}":`, modelError.message)
              errors++
            } else {
              successfulModels += batch.length
              console.log(`  ✓ Inserted ${batch.length} models for ${brandName}`)
            }
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Error processing brand "${brandName}":`, error)
        errors++
      }
    }

    console.log('\n=== Import Summary ===')
    console.log(`Brands inserted: ${successfulBrands}`)
    console.log(`Models inserted: ${successfulModels}`)
    console.log(`Errors: ${errors}`)
    console.log('=====================\n')

  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run the import
importVehicleData()
  .then(() => {
    console.log('Import completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })
