export interface VehicleBrand {
  id: string
  name: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface VehicleModel {
  id: string
  brand_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface PriceCategory {
  id: string
  name: string
  min_price: number
  max_price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SalesAgent {
  id: string
  user_id: string
  name: string
  email?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Country {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ==========================================
// VEHICLE INVENTORY TYPES
// ==========================================

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
}

export interface VehicleCustomOption {
  id: string
  vehicle_id: string
  option_name: string
  created_at: string
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

export interface VehicleInventoryView {
  id: string
  vehicle_number: string
  brand_name: string
  model_name: string
  model_number_other?: string
  manufacture_year: number
  registered_year?: number
  country_name: string
  body_type: string
  fuel_type: string
  transmission: string
  engine_capacity?: string
  exterior_color?: string
  selling_amount: number
  mileage?: number
  entry_type: string
  entry_date: string
  status: string
  tag_notes?: string
  special_note_print?: string
  seller_name?: string
  seller_mobile?: string
  seller_email?: string
  created_at: string
  updated_at: string
  images?: Array<{
    id: string
    url: string
    type: string
    is_primary: boolean
  }>
  options?: Array<{
    name: string
    type: string
  }>
}

// Form Data Types
export interface VehicleFormData {
  // Step 1: Vehicle Details
  vehicle_number: string
  brand_id: string
  model_id: string
  model_number_other: string
  manufacture_year: number
  country_id: string
  body_type: string
  fuel_type: string
  transmission: string
  engine_capacity: string
  exterior_color: string
  registered_year: number
  vehicle_images: File[]
  cr_images: File[]
  
  // Step 2: Seller Details
  seller_first_name: string
  seller_last_name: string
  seller_address: string
  seller_city: string
  seller_nic: string
  seller_mobile: string
  seller_landphone: string
  seller_email: string
  
  // Step 3: Vehicle Options
  standard_options: string[]
  special_options: string[]
  custom_options: string[]
  
  // Step 4: Selling Details
  selling_amount: number
  mileage: number
  entry_type: string
  entry_date: string
  status: string
  
  // Step 5: Notes
  tag_notes: string
  special_note_print: string
}
