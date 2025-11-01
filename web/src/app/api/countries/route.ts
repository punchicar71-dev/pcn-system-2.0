import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inventoryOnly = searchParams.get('inventoryOnly') === 'true'

    if (inventoryOnly) {
      // Get only countries that have vehicles with status 'In Sale'
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(`
          country_id,
          countries (
            id,
            name
          )
        `)
        .eq('status', 'In Sale')
        .not('country_id', 'is', null)

      if (vehiclesError) {
        console.error('Error fetching inventory countries:', vehiclesError)
        return NextResponse.json(
          { error: 'Failed to fetch countries' },
          { status: 500 }
        )
      }

      // Extract unique countries
      const uniqueCountries = new Map()
      vehicles?.forEach((vehicle: any) => {
        if (vehicle.countries && !uniqueCountries.has(vehicle.country_id)) {
          uniqueCountries.set(vehicle.country_id, vehicle.countries)
        }
      })

      const countries = Array.from(uniqueCountries.values()).sort((a: any, b: any) => 
        a.name.localeCompare(b.name)
      )

      return NextResponse.json(countries || [])
    } else {
      // Return all countries
      const { data: countries, error } = await supabase
        .from('countries')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Error fetching countries:', error)
        return NextResponse.json(
          { error: 'Failed to fetch countries' },
          { status: 500 }
        )
      }

      return NextResponse.json(countries || [])
    }

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
