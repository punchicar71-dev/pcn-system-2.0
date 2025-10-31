import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { VehicleWithDetails, VehicleCardData } from '@/lib/types'

// Helper function to transform database vehicle to display format
function transformToVehicleCard(vehicle: any): VehicleCardData {
  const brandName = vehicle.vehicle_brands?.name || 'Unknown Brand'
  const modelName = vehicle.vehicle_models?.name || vehicle.model_number_other || 'Unknown Model'
  
  // Get all gallery images sorted by display order
  const galleryImages = vehicle.vehicle_images
    ?.filter((img: any) => img.image_type === 'gallery')
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((img: any) => ({
      id: img.id,
      image_url: img.image_url,
      display_order: img.display_order
    })) || []
  
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
    images: galleryImages,
    daysAgo: daysAgo > 0 ? daysAgo : 1
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const brandId = searchParams.get('brand')
    const fuelType = searchParams.get('fuel')
    const transmission = searchParams.get('transmission')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    // Build base query
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
          image_type,
          is_primary,
          display_order
        )
      `, { count: 'exact' })
      .eq('status', 'In Sale')

    // Apply filters
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

    // Apply ordering
    query = query.order('created_at', { ascending: false })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: vehicles, error, count } = await query

    if (error) {
      console.error('Error fetching vehicles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles', details: error.message },
        { status: 500 }
      )
    }

    // Transform to card format
    let vehicleCards = vehicles?.map(transformToVehicleCard) || []

    // Apply client-side search filter if provided
    // This is more reliable than complex Supabase filters
    if (search) {
      const searchLower = search.toLowerCase()
      vehicleCards = vehicleCards.filter(v => 
        v.brand.toLowerCase().includes(searchLower) ||
        v.model.toLowerCase().includes(searchLower) ||
        v.name.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      vehicles: vehicleCards,
      total: count,
      limit: limit,
      offset: offset
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}