import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured')
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const inventoryOnly = searchParams.get('inventoryOnly') === 'true'

    if (inventoryOnly) {
      // Get only brands that have vehicles with status 'In Sale'
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(`
          brand_id,
          vehicle_brands (
            id,
            name,
            logo_url
          )
        `)
        .eq('status', 'In Sale')

      if (vehiclesError) {
        console.error('Error fetching inventory brands:', vehiclesError)
        return NextResponse.json(
          { error: 'Failed to fetch brands' },
          { status: 500 }
        )
      }

      // Extract unique brands
      const uniqueBrands = new Map()
      vehicles?.forEach((vehicle: any) => {
        if (vehicle.vehicle_brands && !uniqueBrands.has(vehicle.brand_id)) {
          uniqueBrands.set(vehicle.brand_id, vehicle.vehicle_brands)
        }
      })

      const brands = Array.from(uniqueBrands.values()).sort((a: any, b: any) => 
        a.name.localeCompare(b.name)
      )

      return NextResponse.json(brands || [], {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      })
    } else {
      // Return all brands
      const { data: brands, error } = await supabase
        .from('vehicle_brands')
        .select(`
          id,
          name,
          logo_url,
          vehicle_models (
            id,
            name
          )
        `)
        .order('name')

      if (error) {
        console.error('Error fetching brands:', error)
        return NextResponse.json(
          { error: 'Failed to fetch brands' },
          { status: 500 }
        )
      }

      return NextResponse.json(brands || [], {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      })
    }

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}