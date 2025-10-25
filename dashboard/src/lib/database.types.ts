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
