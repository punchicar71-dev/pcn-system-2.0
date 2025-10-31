import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { VehicleWithDetails, VehicleCardData } from '@/lib/types'

// Helper function to transform database vehicle to display format
function transformToVehicleCard(vehicle: any): VehicleCardData {
  const brandName = vehicle.vehicle_brands?.name || 'Unknown Brand'
  const modelName = vehicle.vehicle_models?.name || vehicle.model_number_other || 'Unknown Model'
  
  // Get primary image or first image
  const primaryImage = vehicle.vehicle_images?.find((img: any) => img.is_primary) || vehicle.vehicle_images?.[0]
  
  // Calculate days since creation
  const createdDate = new Date(vehicle.created_at)
  const now = new Date()
  const daysAgo = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

  return {
    id: vehicle.id,
    name: `${brandName} ${modelName}`,
    brand: brandName,
    model: modelName,
    year: vehicle.manufacture_year,
    price: vehicle.selling_amount,
    fuelType: vehicle.fuel_type,
    transmission: vehicle.transmission === 'Auto' ? 'Automatic' : vehicle.transmission,
    mileage: vehicle.mileage,
    imageUrl: primaryImage?.image_url,
    daysAgo: daysAgo > 0 ? daysAgo : 1
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '12'
    const offset = searchParams.get('offset') || '0'
    const search = searchParams.get('search')
    const brandId = searchParams.get('brand')
    const fuelType = searchParams.get('fuel')
    const transmission = searchParams.get('transmission')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    let query = supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_brands (
          id,
          name,
          logo_url
        ),
        vehicle_models (
          id,
          name
        ),
        countries (
          id,
          name
        ),
        vehicle_images (
          id,
          image_url,
          is_primary,
          display_order
        )
      `)
      .eq('status', 'In Sale')
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`vehicle_brands.name.ilike.%${search}%,vehicle_models.name.ilike.%${search}%`)
    }

    if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    if (fuelType) {
      query = query.eq('fuel_type', fuelType)
    }

    if (transmission) {
      query = query.eq('transmission', transmission)
    }

    if (minPrice) {
      query = query.gte('selling_amount', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('selling_amount', parseFloat(maxPrice))
    }

    // Apply pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    const { data: vehicles, error, count } = await query

    if (error) {
      console.error('Error fetching vehicles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      )
    }

    // Transform to card format
    const vehicleCards = vehicles?.map(transformToVehicleCard) || []

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'In Sale')

    return NextResponse.json({
      vehicles: vehicleCards,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}