import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured')
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 503 }
      )
    }

    const vehicleId = params.id

    // Fetch vehicle with all related data - only show vehicles with "In Sale" status
    const { data: vehicle, error } = await supabase
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
          vehicle_id,
          image_url,
          image_type,
          is_primary,
          display_order
        ),
        vehicle_options (
          id,
          option_type,
          is_enabled,
          vehicle_options_master (
            id,
            option_name,
            option_type
          )
        ),
        vehicle_custom_options (
          id,
          option_name
        ),
        sellers (
          id,
          first_name,
          last_name,
          full_name,
          address,
          city,
          mobile_number,
          land_phone_number,
          email_address
        )
      `)
      .eq('id', vehicleId)
      .eq('status', 'In Sale')
      .single()

    if (error) {
      console.error('Error fetching vehicle:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vehicle not found or no longer available' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch vehicle' },
        { status: 500 }
      )
    }

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or no longer available' },
        { status: 404 }
      )
    }

    // Transform the data for frontend use
    const transformedVehicle = {
      id: vehicle.id,
      vehicle_number: vehicle.vehicle_number,
      brand: vehicle.vehicle_brands,
      model: vehicle.vehicle_models,
      model_number_other: vehicle.model_number_other,
      manufacture_year: vehicle.manufacture_year,
      country: vehicle.countries,
      body_type: vehicle.body_type,
      fuel_type: vehicle.fuel_type,
      transmission: vehicle.transmission,
      engine_capacity: vehicle.engine_capacity,
      exterior_color: vehicle.exterior_color,
      registered_year: vehicle.registered_year,
      selling_amount: vehicle.selling_amount,
      mileage: vehicle.mileage,
      entry_type: vehicle.entry_type,
      entry_date: vehicle.entry_date,
      status: vehicle.status,
      tag_notes: vehicle.tag_notes,
      special_note_print: vehicle.special_note_print,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at,
      
      // Sort images by display order and primary status - Gallery images only
      images: vehicle.vehicle_images
        ?.filter((img: any) => img.image_type === 'gallery')
        ?.sort((a: any, b: any) => {
          if (a.is_primary && !b.is_primary) return -1
          if (!a.is_primary && b.is_primary) return 1
          return a.display_order - b.display_order
        }) || [],
      
      // 360 degree images - sorted by display order
      image_360: vehicle.vehicle_images
        ?.filter((img: any) => img.image_type === 'image_360')
        ?.sort((a: any, b: any) => a.display_order - b.display_order)
        ?.map((img: any) => ({
          id: img.id,
          image_url: img.image_url,
          image_type: img.image_type,
          display_order: img.display_order
        })) || [],
      
      // Group options by type
      options: vehicle.vehicle_options
        ?.filter((option: any) => option.is_enabled)
        ?.map((option: any) => ({
          id: option.id,
          name: option.vehicle_options_master?.option_name,
          type: option.option_type
        })) || [],
      
      custom_options: vehicle.vehicle_custom_options || [],
      
      seller: vehicle.sellers?.[0] || null
    }

    return NextResponse.json(transformedVehicle, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}