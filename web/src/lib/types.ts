// Database types for vehicle data from Supabase

export interface VehicleBrand {
  id: string
  name: string
  logo_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VehicleModel {
  id: string
  brand_id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Country {
  id: string
  name: string
  code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  vehicle_number: string
  brand_id: string
  model_id: string
  model_number_other?: string
  manufacture_year: number
  country_id: string
  body_type: 'SUV' | 'Sedan' | 'Hatchback' | 'Wagon' | 'Coupe' | 'Convertible' | 'Van' | 'Truck'
  fuel_type: 'Petrol' | 'Diesel' | 'Petrol Hybrid' | 'Diesel Hybrid' | 'EV' | 'Petrol + Hybrid' | 'Diesel + Hybrid'
  transmission: 'Automatic' | 'Manual' | 'Auto'
  engine_capacity?: string
  exterior_color?: string
  registered_year?: number
  selling_amount: number
  mileage?: number
  entry_type: string
  entry_date: string
  status: 'In Sale' | 'Out of Sale' | 'Sold' | 'Reserved'
  tag_notes?: string
  special_note_print?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface VehicleImage {
  id: string
  vehicle_id: string
  image_url: string
  image_type: 'gallery' | 'cr_paper' | 'document'
  storage_path: string
  file_name: string
  file_size?: number
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface VehicleOptionMaster {
  id: string
  option_name: string
  option_type: 'standard' | 'special' | 'custom'
  is_active: boolean
  created_at: string
}

export interface VehicleOption {
  id: string
  vehicle_id: string
  option_id: string
  option_type: 'standard' | 'special' | 'custom'
  is_enabled: boolean
  created_at: string
  // Include the option details
  vehicle_options_master?: VehicleOptionMaster
}

export interface VehicleCustomOption {
  id: string
  vehicle_id: string
  option_name: string
  created_at: string
}

export interface Seller {
  id: string
  vehicle_id: string
  first_name: string
  last_name: string
  full_name?: string
  address?: string
  city?: string
  nic_number?: string
  mobile_number: string
  land_phone_number?: string
  email_address?: string
  created_at: string
  updated_at: string
}

// Combined view for displaying vehicles with related data
export interface VehicleWithDetails {
  id: string
  vehicle_number: string
  brand: VehicleBrand
  model: VehicleModel
  model_number_other?: string
  manufacture_year: number
  country: Country
  body_type: string
  fuel_type: string
  transmission: string
  engine_capacity?: string
  exterior_color?: string
  registered_year?: number
  selling_amount: number
  mileage?: number
  entry_type: string
  entry_date: string
  status: string
  tag_notes?: string
  special_note_print?: string
  created_at: string
  updated_at: string
  images: VehicleImage[]
  options: VehicleOption[]
  custom_options: VehicleCustomOption[]
  seller?: Seller
}

// Frontend display types
export interface VehicleCardData {
  id: string
  name: string // brand + model
  brand: string
  model: string
  year: number
  price: number
  fuelType: string
  transmission: string
  mileage?: number
  condition?: string
  imageUrl?: string
  images?: Array<{ id: string; image_url: string; display_order: number }>
  rating?: number
  daysAgo?: number
}