# Inventory & Web Flow Documentation

This document provides a comprehensive overview of how inventory data flows from the database to the web vehicle pages, including data connections, transformations, and display mechanisms.

> **Note**: The web application is public-facing and does not require authentication. The dashboard inventory management uses cookie-based session authentication.

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Structure](#database-structure)
4. [Data Flow](#data-flow)
5. [API Routes & Endpoints](#api-routes--endpoints)
6. [Frontend Components](#frontend-components)
7. [Data Transformations](#data-transformations)
8. [Image Handling](#image-handling)
9. [Filtering & Search](#filtering--search)
10. [Status Management](#status-management)
11. [Related Data](#related-data)
12. [How It Works](#how-it-works)

---

## Overview

The Inventory & Web flow is responsible for displaying vehicle inventory data from the database to end users through the public-facing web application. The system uses a Next.js frontend that connects directly to Supabase (PostgreSQL) to fetch and display vehicle information in real-time.

### Key Features

- **Real-time Inventory Display**: Vehicles with status "In Sale" are displayed on the web
- **Advanced Filtering**: Filter by brand, fuel type, transmission, price range, and country
- **Search Functionality**: Search vehicles by brand name, model name, or vehicle number
- **Detailed Vehicle Pages**: Individual vehicle detail pages with images, specifications, and options
- **Image Galleries**: Multiple gallery images and 360-degree panoramic views
- **Related Vehicles**: Display related vehicles from the same brand
- **Pagination**: Efficient pagination for large vehicle lists

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   vehicles   │  │ vehicle_     │  │  vehicle_    │      │
│  │              │  │   images     │  │   brands     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  vehicle_    │  │  vehicle_    │  │   sellers    │      │
│  │   models     │  │   options    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  countries   │  │  vehicle_    │                         │
│  │              │  │  inventory_  │                         │
│  │              │  │     view     │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Supabase Client
                           │ (REST API / PostgREST)
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Web Application                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes (Server-side)                 │   │
│  │  /api/vehicles         - List all vehicles           │   │
│  │  /api/vehicles/[id]    - Get vehicle by ID           │   │
│  │  /api/brands           - Get vehicle brands          │   │
│  │  /api/countries        - Get countries               │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           │ JSON Response                    │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Frontend Pages (Client-side)                │   │
│  │  /vehicles             - Vehicle listing page         │   │
│  │  /vehicles/[id]        - Vehicle detail page          │   │
│  │  Components:                                         │   │
│  │  - VehicleCard        - Vehicle card component        │   │
│  │  - VehicleDetail      - Detail view component         │   │
│  │  - Filters            - Filter sidebar                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP Requests
                           │
┌─────────────────────────────────────────────────────────────┐
│                        End Users                             │
│                    (Web Browsers)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Structure

### Core Tables

#### 1. **vehicles** Table
The main table storing vehicle inventory data.

```sql
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY,
  vehicle_number VARCHAR(50) UNIQUE NOT NULL,
  brand_id UUID REFERENCES vehicle_brands(id),
  model_id UUID REFERENCES vehicle_models(id),
  model_number_other VARCHAR(100),
  manufacture_year INTEGER NOT NULL,
  country_id UUID REFERENCES countries(id),
  body_type VARCHAR(50) NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  transmission VARCHAR(20) NOT NULL,
  engine_capacity VARCHAR(50),
  exterior_color VARCHAR(50),
  registered_year INTEGER,
  selling_amount DECIMAL(12, 2) NOT NULL,
  mileage DECIMAL(10, 2),
  entry_type VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'In Sale',
  tag_notes TEXT,
  special_note_print TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Status Values:**
- `'In Sale'` - Vehicle is available for sale (displayed on web)
- `'Out of Sale'` - Vehicle temporarily unavailable
- `'Sold'` - Vehicle has been sold
- `'Reserved'` - Vehicle is reserved for a customer

#### 2. **vehicle_images** Table
Stores vehicle images with metadata.

```sql
CREATE TABLE public.vehicle_images (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  s3_key TEXT,
  image_type VARCHAR(50) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE
);
```

**Image Types:**
- `'gallery'` - Standard gallery images
- `'image_360'` - 360-degree panoramic images
- `'cr_paper'` - CR paper/document images
- `'document'` - Other document images

#### 3. **Related Tables**
- `vehicle_brands` - Brand information (Toyota, Honda, etc.)
- `vehicle_models` - Model information (Aqua, Vitz, etc.)
- `countries` - Country of origin
- `sellers` - Seller information linked to vehicles
- `vehicle_options` - Vehicle options/features
- `vehicle_custom_options` - Custom vehicle options

### Database View: vehicle_inventory_view

A materialized view that joins multiple tables for efficient querying:

```sql
CREATE OR REPLACE VIEW public.vehicle_inventory_view AS
SELECT 
  v.id,
  v.vehicle_number,
  vb.name as brand_name,
  vm.name as model_name,
  v.model_number_other,
  v.manufacture_year,
  v.registered_year,
  c.name as country_name,
  v.body_type,
  v.fuel_type,
  v.transmission,
  v.engine_capacity,
  v.exterior_color,
  v.selling_amount,
  v.mileage,
  v.entry_type,
  v.entry_date,
  v.status,
  v.tag_notes,
  v.special_note_print,
  s.full_name as seller_name,
  s.mobile_number as seller_mobile,
  s.email_address as seller_email,
  v.created_at,
  v.updated_at
FROM public.vehicles v
LEFT JOIN public.vehicle_brands vb ON v.brand_id = vb.id
LEFT JOIN public.vehicle_models vm ON v.model_id = vm.id
LEFT JOIN public.countries c ON v.country_id = c.id
LEFT JOIN public.sellers s ON s.vehicle_id = v.id;
```

**Note:** This view is primarily used by the dashboard. The web application uses direct Supabase queries with joins for more flexibility.

---

## Data Flow

### Flow Diagram

```
1. User visits /vehicles page
   │
   ├─> Frontend: VehiclesPage component loads
   │   │
   │   └─> useEffect triggers fetchVehicles()
   │
2. Frontend makes API request
   │
   ├─> GET /api/vehicles
   │   │
   │   ├─> API Route: web/src/app/api/vehicles/route.ts
   │   │   │
   │   │   ├─> Creates Supabase client
   │   │   │   └─> supabase = createClient(url, anonKey)
   │   │   │
   │   │   ├─> Queries Supabase
   │   │   │   └─> supabase.from('vehicles').select(...)
   │   │   │       └─> Includes joins: vehicle_brands, vehicle_models, 
   │   │   │           countries, vehicle_images
   │   │   │       └─> Filters: .eq('status', 'In Sale')
   │   │   │       └─> Orders: .order('created_at', { ascending: false })
   │   │   │
   │   │   ├─> Supabase executes query
   │   │   │   └─> PostgreSQL returns data
   │   │   │
   │   │   ├─> Transforms data
   │   │   │   └─> transformToVehicleCard() function
   │   │   │       └─> Maps to VehicleCardData format
   │   │   │
   │   │   └─> Returns JSON response
   │
3. Frontend receives response
   │
   ├─> Updates state with vehicle data
   │   └─> setVehicles(data.vehicles)
   │
4. Frontend renders components
   │
   ├─> VehicleCard components render for each vehicle
   │   └─> Displays: image, brand, model, year, price, specs
   │
5. User clicks on a vehicle
   │
   ├─> Navigates to /vehicles/[vehicleId]
   │   │
   │   └─> Frontend: VehicleDetailPage component loads
   │       │
   │       └─> useEffect triggers fetchVehicle()
   │
6. Frontend makes API request
   │
   ├─> GET /api/vehicles/[id]
   │   │
   │   ├─> API Route: web/src/app/api/vehicles/[id]/route.ts
   │   │   │
   │   │   ├─> Creates Supabase client
   │   │   │
   │   │   ├─> Queries Supabase for single vehicle
   │   │   │   └─> supabase.from('vehicles').select(...)
   │   │   │       └─> Includes all related data:
   │   │   │           - vehicle_brands
   │   │   │           - vehicle_models
   │   │   │           - countries
   │   │   │           - vehicle_images (gallery & 360)
   │   │   │           - vehicle_options (with master)
   │   │   │           - vehicle_custom_options
   │   │   │           - sellers
   │   │   │       └─> .eq('id', vehicleId).single()
   │   │   │
   │   │   ├─> Transforms data structure
   │   │   │   └─> Separates gallery images from 360 images
   │   │   │   └─> Groups options by type
   │   │   │   └─> Formats data for frontend
   │   │   │
   │   │   └─> Returns JSON response
   │
7. Frontend receives detailed vehicle data
   │
   ├─> Updates state
   │   └─> setVehicle(data)
   │
8. Frontend renders detail page
   │
   └─> Displays: images, specs, options, seller info, related vehicles
```

### Data Connection: Supabase

The web application uses **Supabase** as the database connection layer:

**Configuration:**
```typescript
// web/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key

**Connection Method:**
- Supabase uses **PostgREST** to provide a RESTful API over PostgreSQL
- The Supabase JavaScript client handles authentication, query building, and response parsing
- All queries are executed server-side in Next.js API routes for security

---

## API Routes & Endpoints

### 1. GET /api/vehicles

**Purpose:** Fetch a list of vehicles with filtering and pagination

**Location:** `web/src/app/api/vehicles/route.ts`

**Query Parameters:**
- `limit` (optional) - Number of vehicles per page (default: 12)
- `offset` (optional) - Pagination offset (default: 0)
- `search` (optional) - Search query (applied client-side after fetch)
- `brand` (optional) - Filter by brand ID
- `fuel` (optional) - Filter by fuel type
- `transmission` (optional) - Filter by transmission type
- `minPrice` (optional) - Minimum price filter
- `maxPrice` (optional) - Maximum price filter

**Database Query:**
```typescript
supabase
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
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1)
```

**Response Format:**
```json
{
  "vehicles": [
    {
      "id": "uuid",
      "name": "Toyota Aqua",
      "brand": "Toyota",
      "model": "Aqua",
      "year": 2018,
      "price": 5490000,
      "fuelType": "Petrol",
      "transmission": "Automatic",
      "mileage": 50000,
      "imageUrl": "https://...",
      "images": [...],
      "daysAgo": 5
    }
  ],
  "total": 150,
  "limit": 12,
  "offset": 0
}
```

**Key Features:**
- Only returns vehicles with `status = 'In Sale'`
- Includes related data (brands, models, countries, images) in a single query
- Transforms database format to frontend-friendly `VehicleCardData` format
- Supports pagination with limit/offset
- Applies filters at database level for efficiency

### 2. GET /api/vehicles/[id]

**Purpose:** Fetch detailed information about a specific vehicle

**Location:** `web/src/app/api/vehicles/[id]/route.ts`

**Path Parameter:**
- `id` - Vehicle UUID

**Database Query:**
```typescript
supabase
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
  .single()
```

**Response Format:**
```json
{
  "id": "uuid",
  "vehicle_number": "ABC-1234",
  "brand": {
    "id": "uuid",
    "name": "Toyota",
    "logo_url": "https://..."
  },
  "model": {
    "id": "uuid",
    "name": "Aqua"
  },
  "manufacture_year": 2018,
  "country": {
    "id": "uuid",
    "name": "Japan"
  },
  "body_type": "Sedan",
  "fuel_type": "Petrol",
  "transmission": "Automatic",
  "engine_capacity": "1500cc",
  "exterior_color": "White",
  "registered_year": 2018,
  "selling_amount": 5490000,
  "mileage": 50000,
  "images": [
    {
      "id": "uuid",
      "image_url": "https://...",
      "is_primary": true,
      "display_order": 0
    }
  ],
  "image_360": [
    {
      "id": "uuid",
      "image_url": "https://...",
      "image_type": "image_360",
      "display_order": 0
    }
  ],
  "options": [
    {
      "id": "uuid",
      "name": "GPS Navigation",
      "type": "standard"
    }
  ],
  "custom_options": [
    {
      "id": "uuid",
      "option_name": "Custom Feature"
    }
  ],
  "seller": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "mobile_number": "+94771234567"
  }
}
```

**Key Features:**
- Fetches comprehensive vehicle data including all related entities
- Separates gallery images from 360-degree images
- Filters and formats vehicle options
- Returns seller information if available
- Returns 404 if vehicle not found

### 3. GET /api/brands

**Purpose:** Fetch vehicle brands (optionally filtered to only brands with available vehicles)

**Location:** `web/src/app/api/brands/route.ts`

**Query Parameters:**
- `inventoryOnly` (optional) - If `true`, only return brands that have vehicles with status "In Sale"

**Response Format:**
```json
[
  {
    "id": "uuid",
    "name": "Toyota",
    "logo_url": "https://..."
  }
]
```

**Usage:**
- Used in the filter sidebar to populate brand filter options
- When `inventoryOnly=true`, ensures only brands with available vehicles are shown

### 4. GET /api/countries

**Purpose:** Fetch countries (optionally filtered to only countries with available vehicles)

**Location:** `web/src/app/api/countries/route.ts`

**Query Parameters:**
- `inventoryOnly` (optional) - If `true`, only return countries that have vehicles with status "In Sale"

**Response Format:**
```json
[
  {
    "id": "uuid",
    "name": "Japan"
  }
]
```

---

## Frontend Components

### 1. VehiclesPage Component

**Location:** `web/src/app/vehicles/page.tsx`

**Purpose:** Main vehicle listing page with filters and search

**Features:**
- Displays list of vehicles in card format
- Filter sidebar (brand, fuel type, transmission, price range, country)
- Search bar with debounced input
- Pagination controls
- Sort functionality (price, year)
- Items per page selector

**State Management:**
```typescript
const [vehicles, setVehicles] = useState<VehicleCardData[]>([])
const [brands, setBrands] = useState<VehicleBrand[]>([])
const [loading, setLoading] = useState(true)
const [selectedBrand, setSelectedBrand] = useState<string>('')
const [selectedFuelType, setSelectedFuelType] = useState<string>('')
const [searchQuery, setSearchQuery] = useState<string>('')
// ... more filter states
```

**Data Fetching:**
```typescript
const fetchVehicles = async (isInitialLoad = false) => {
  const params = new URLSearchParams()
  if (selectedBrand) params.append('brand', selectedBrand)
  if (selectedFuelType) params.append('fuel', selectedFuelType)
  // ... add other filters
  
  const response = await fetch(`/api/vehicles?${params.toString()}`)
  const data = await response.json()
  setVehicles(data.vehicles || [])
}
```

**Filter Flow:**
1. User selects a filter (brand, fuel type, etc.)
2. State updates via `setSelectedBrand()`, etc.
3. `useEffect` triggers `fetchVehicles()` when filter states change
4. API call includes filter parameters
5. Database query applies filters
6. Response updates vehicle list

### 2. VehicleCard Component

**Location:** `web/src/components/VehicleCard.tsx`

**Purpose:** Individual vehicle card displayed in the listing

**Displays:**
- Vehicle image(s) with auto-play carousel
- Brand and model name
- Manufacture year
- Selling price
- Fuel type and transmission
- "View Details" button

**Features:**
- Image carousel (auto-plays, pauses on hover)
- Responsive layout (vertical on mobile, horizontal on desktop)
- Link to vehicle detail page

**Image Handling:**
- Shows primary image or first gallery image
- Displays multiple images in carousel
- Auto-advances every 3 seconds
- Dot indicators for multiple images

### 3. VehicleDetailPage Component

**Location:** `web/src/app/vehicles/[vehicleId]/page.tsx`

**Purpose:** Detailed view of a single vehicle

**Sections:**
1. **Hero Section** - Background image with breadcrumb navigation
2. **Image Gallery** - Main image display with gallery/360° toggle
3. **Vehicle Details** - Specifications (body, fuel, transmission, etc.)
4. **Extra Features** - Vehicle options and custom options
5. **Our Service** - Service information (static content)
6. **Leasing Calculator** - Interactive calculator for leasing amounts
7. **Related Vehicles** - Other vehicles from the same brand

**State Management:**
```typescript
const [vehicle, setVehicle] = useState<VehicleDetail | null>(null)
const [currentImageIndex, setCurrentImageIndex] = useState(0)
const [viewMode, setViewMode] = useState<'gallery' | '360'>('gallery')
const [relatedVehicles, setRelatedVehicles] = useState<RelatedVehicle[]>([])
```

**Data Fetching:**
```typescript
useEffect(() => {
  const fetchVehicle = async () => {
    const response = await fetch(`/api/vehicles/${vehicleId}`)
    const data = await response.json()
    setVehicle(data)
  }
  if (vehicleId) fetchVehicle()
}, [vehicleId])
```

**Related Vehicles:**
- Fetches vehicles from the same brand
- Filters out the current vehicle
- Limits to 3 related vehicles
- Uses the same `/api/vehicles` endpoint with brand filter

---

## Data Transformations

### Database to Frontend Transformation

The API routes transform raw database data into frontend-friendly formats:

#### 1. Vehicle List Transformation

**Function:** `transformToVehicleCard()` in `/api/vehicles/route.ts`

**Input (Database Format):**
```typescript
{
  id: "uuid",
  vehicle_number: "ABC-1234",
  manufacture_year: 2018,
  selling_amount: 5490000,
  fuel_type: "Petrol",
  transmission: "Auto",
  vehicle_brands: { id: "uuid", name: "Toyota" },
  vehicle_models: { id: "uuid", name: "Aqua" },
  vehicle_images: [
    { image_url: "https://...", is_primary: true, display_order: 0 }
  ]
}
```

**Output (Frontend Format):**
```typescript
{
  id: "uuid",
  name: "Toyota Aqua",
  brand: "Toyota",
  model: "Aqua",
  year: 2018,
  price: 5490000,
  fuelType: "Petrol",
  transmission: "Automatic", // "Auto" -> "Automatic"
  imageUrl: "https://...",   // Primary image URL
  images: [...],             // All gallery images
  daysAgo: 5                 // Calculated from created_at
}
```

**Transformation Steps:**
1. Extract brand and model names from nested objects
2. Combine brand + model for display name
3. Extract primary image URL
4. Filter and sort gallery images by display_order
5. Calculate days since creation
6. Map transmission values ("Auto" → "Automatic")

#### 2. Vehicle Detail Transformation

**Location:** `/api/vehicles/[id]/route.ts`

**Transformations:**
1. **Image Separation:**
   ```typescript
   images: vehicle.vehicle_images
     ?.filter(img => img.image_type === 'gallery')
     ?.sort((a, b) => {
       if (a.is_primary && !b.is_primary) return -1
       if (!a.is_primary && b.is_primary) return 1
       return a.display_order - b.display_order
     }) || []
   
   image_360: vehicle.vehicle_images
     ?.filter(img => img.image_type === 'image_360')
     ?.sort((a, b) => a.display_order - b.display_order)
   ```

2. **Options Formatting:**
   ```typescript
   options: vehicle.vehicle_options
     ?.filter(option => option.is_enabled)
     ?.map(option => ({
       id: option.id,
       name: option.vehicle_options_master?.option_name,
       type: option.option_type
     })) || []
   ```

3. **Seller Data:**
   ```typescript
   seller: vehicle.sellers?.[0] || null
   ```

---

## Image Handling

### Image Storage

**Storage Location:** AWS S3 (via Supabase Storage)

**Image URLs:** Stored in `vehicle_images.image_url` as full S3 URLs

**S3 Keys:** Also stored in `vehicle_images.s3_key` for direct S3 access if needed

### Image Types

1. **Gallery Images** (`image_type = 'gallery'`)
   - Standard vehicle photos
   - Multiple images per vehicle
   - Sorted by `display_order`
   - Primary image marked with `is_primary = true`

2. **360-Degree Images** (`image_type = 'image_360'`)
   - Panoramic/spherical images
   - Used in 360° viewer component
   - Usually 1 per vehicle

3. **Document Images** (`image_type = 'cr_paper'` or `'document'`)
   - CR papers, documents
   - Not displayed on web (dashboard only)

### Image Display Flow

**Vehicle Listing Page:**
1. API returns all gallery images for each vehicle
2. `VehicleCard` component extracts primary image or first image
3. If multiple images, displays in carousel with auto-play
4. Carousel advances every 3 seconds, pauses on hover

**Vehicle Detail Page:**
1. API separates gallery and 360° images
2. Gallery images displayed in main image area
3. Thumbnail strip shows first 3 gallery images
4. Toggle button switches between Gallery and 360° view
5. 360° images use `PanoramaViewer` component for interactive viewing

### Image Optimization

**Next.js Image Component:**
- Not currently used (uses standard `<img>` tags)
- Images served directly from S3/Supabase
- Consider implementing Next.js Image optimization for better performance

---

## Filtering & Search

### Filter Types

1. **Brand Filter**
   - Multi-select (but currently single-select implementation)
   - Filters by `brand_id`
   - Only shows brands with available vehicles (`inventoryOnly=true`)

2. **Fuel Type Filter**
   - Single-select checkbox
   - Values: Petrol, Diesel, EV, Petrol + Hybrid, Diesel + Hybrid
   - Filters by `fuel_type` column

3. **Transmission Filter**
   - Single-select checkbox
   - Values: Automatic, Manual, Auto
   - Filters by `transmission` column

4. **Price Range Filter**
   - Dual range slider
   - Range: Rs. 500,000 to Rs. 100,000,000
   - Filters by `selling_amount` using `gte()` and `lte()`

5. **Country Filter**
   - Multi-select buttons
   - Filters by country name
   - Only shows countries with available vehicles

### Search Functionality

**Implementation:** Client-side search (after data fetch)

**Search Fields:**
- Brand name
- Model name
- Combined name (brand + model)

**Code:**
```typescript
if (search) {
  const searchLower = search.toLowerCase()
  vehicleCards = vehicleCards.filter(v => 
    v.brand.toLowerCase().includes(searchLower) ||
    v.model.toLowerCase().includes(searchLower) ||
    v.name.toLowerCase().includes(searchLower)
  )
}
```

**Note:** Currently implemented as client-side filtering. Could be moved to database-level for better performance with large datasets.

### Filter Application Flow

```
User selects filter
    │
    ├─> State updates (setSelectedBrand, etc.)
    │
    ├─> useEffect detects state change
    │
    ├─> fetchVehicles() called
    │
    ├─> URLSearchParams built with filter values
    │
    ├─> API call: GET /api/vehicles?brand=xxx&fuel=xxx
    │
    ├─> API route applies filters to Supabase query
    │   ├─> .eq('brand_id', brandId)
    │   ├─> .eq('fuel_type', fuelType)
    │   ├─> .gte('selling_amount', minPrice)
    │   └─> .lte('selling_amount', maxPrice)
    │
    ├─> Database returns filtered results
    │
    ├─> Data transformed to VehicleCardData format
    │
    ├─> Response sent to frontend
    │
    └─> Frontend updates vehicle list
```

### Reset Filters

**Clear All Filters Button:**
- Resets all filter states to empty/default
- Triggers new fetch with no filters
- Shows all available vehicles

---

## Status Management

### Vehicle Status Values

**Database Constraint:**
```sql
CONSTRAINT check_status CHECK (status IN ('In Sale', 'Out of Sale', 'Sold', 'Reserved'))
```

### Status Filtering on Web

**Web Display Rule:** Only vehicles with `status = 'In Sale'` are displayed

**Implementation:**
```typescript
// In /api/vehicles/route.ts
.eq('status', 'In Sale')
```

**Why Only "In Sale":**
- Web is public-facing, should only show available vehicles
- Prevents showing sold/reserved vehicles to customers
- "Out of Sale" vehicles are temporarily unavailable (maintenance, etc.)

### Status Changes Impact

When a vehicle status changes in the dashboard:

1. **Sold/Reserved:**
   - Vehicle immediately disappears from web listing
   - No caching, so change is instant
   - Detail page will return 404 if accessed directly

2. **Out of Sale:**
   - Vehicle hidden from web
   - Can be set back to "In Sale" to make visible again

3. **In Sale:**
   - Vehicle appears on web immediately
   - Visible in search results
   - Can be accessed via detail page

**Note:** No caching layer, so status changes are reflected immediately on the next API call.

---

## Related Data

### Data Relationships

The vehicle data structure includes several related entities:

```
vehicles (1) ──< (many) vehicle_images
vehicles (1) ──< (1) sellers
vehicles (1) ──< (many) vehicle_options
vehicles (1) ──< (many) vehicle_custom_options
vehicles (many) >── (1) vehicle_brands
vehicles (many) >── (1) vehicle_models
vehicles (many) >── (1) countries
```

### Joins in API Queries

**Vehicle List Query:**
```typescript
.select(`
  *,
  vehicle_brands (...),
  vehicle_models (...),
  countries (...),
  vehicle_images (...)
`)
```

**Vehicle Detail Query:**
```typescript
.select(`
  *,
  vehicle_brands (...),
  vehicle_models (...),
  countries (...),
  vehicle_images (...),
  vehicle_options (
    ...,
    vehicle_options_master (...)
  ),
  vehicle_custom_options (...),
  sellers (...)
`)
```

**Supabase Join Syntax:**
- Uses nested select syntax for joins
- Automatic foreign key resolution
- Returns nested objects in response

### Related Vehicles Feature

**Purpose:** Show other vehicles from the same brand on the detail page

**Implementation:**
```typescript
// In VehicleDetailPage component
useEffect(() => {
  const fetchRelatedVehicles = async () => {
    const response = await fetch(`/api/vehicles?brand=${vehicle.brand.id}&limit=6`)
    const data = await response.json()
    const filtered = data.vehicles
      .filter(v => v.id !== vehicleId)
      .slice(0, 3)
    setRelatedVehicles(filtered)
  }
  if (vehicle) fetchRelatedVehicles()
}, [vehicle, vehicleId])
```

**Flow:**
1. After vehicle detail loads, fetch vehicles from same brand
2. Request 6 vehicles (to ensure 3 after filtering)
3. Filter out current vehicle
4. Limit to 3 vehicles
5. Display in related vehicles section

---

## How It Works

### Complete Request Flow Example

**Scenario:** User visits `/vehicles` page and views a vehicle detail

#### Step 1: Page Load

```
1. Browser requests /vehicles
2. Next.js serves VehiclesPage component
3. Component mounts, useEffect triggers
4. Multiple parallel API calls:
   - GET /api/vehicles (vehicle list)
   - GET /api/brands?inventoryOnly=true (brands for filter)
   - GET /api/countries?inventoryOnly=true (countries for filter)
```

#### Step 2: API Processing

```
/api/vehicles route:
├─> Creates Supabase client
├─> Builds query with joins
├─> Applies .eq('status', 'In Sale')
├─> Executes query via PostgREST
├─> PostgreSQL returns data
├─> Transforms each vehicle via transformToVehicleCard()
└─> Returns JSON response
```

#### Step 3: Frontend Rendering

```
Frontend receives data:
├─> setVehicles(data.vehicles)
├─> setBrands(brands)
├─> setCountries(countries)
├─> Component re-renders
├─> Maps vehicles array to VehicleCard components
└─> Displays filter sidebar with brand/country options
```

#### Step 4: User Interaction

```
User clicks "View Details" on a vehicle:
├─> Link navigation: /vehicles/[vehicleId]
├─> Next.js router navigates
├─> VehicleDetailPage component mounts
├─> useEffect triggers fetchVehicle()
└─> GET /api/vehicles/[vehicleId]
```

#### Step 5: Detail Page Load

```
/api/vehicles/[id] route:
├─> Creates Supabase client
├─> Queries vehicles table with comprehensive joins
├─> .eq('id', vehicleId).single()
├─> PostgreSQL returns single vehicle with all relations
├─> Transforms data:
│   ├─> Separates gallery and 360° images
│   ├─> Formats options array
│   ├─> Extracts seller data
│   └─> Structures response
└─> Returns JSON response
```

#### Step 6: Detail Page Rendering

```
Frontend receives vehicle data:
├─> setVehicle(data)
├─> Component re-renders with full vehicle details
├─> Displays:
│   ├─> Image gallery with gallery/360° toggle
│   ├─> Vehicle specifications
│   ├─> Options list
│   ├─> Leasing calculator (client-side)
│   └─> Related vehicles section
└─> Fetches related vehicles (parallel call)
```

### Performance Considerations

**Optimizations:**
1. **Single Query with Joins:** Fetches all related data in one query instead of multiple
2. **Pagination:** Limits results to reduce payload size
3. **Status Filtering:** Only fetches "In Sale" vehicles from database
4. **Client-side Search:** Reduces API calls for search operations

**Potential Improvements:**
1. **Caching:** Add caching layer for frequently accessed data
2. **Image Optimization:** Use Next.js Image component for automatic optimization
3. **Database-level Search:** Move search to database for better performance
4. **Incremental Loading:** Load more vehicles on scroll instead of pagination

### Error Handling

**API Error Handling:**
```typescript
if (error) {
  console.error('Error fetching vehicles:', error)
  return NextResponse.json(
    { error: 'Failed to fetch vehicles', details: error.message },
    { status: 500 }
  )
}
```

**Frontend Error Handling:**
```typescript
try {
  const response = await fetch(`/api/vehicles/${vehicleId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch vehicle')
  }
  const data = await response.json()
  setVehicle(data)
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred')
}
```

**404 Handling:**
```typescript
if (error.code === 'PGRST116') {
  return NextResponse.json(
    { error: 'Vehicle not found' },
    { status: 404 }
  )
}
```

### Security Considerations

1. **Server-side API Routes:** All database queries run server-side, not exposed to client
2. **Supabase Anon Key:** Uses public/anonymous key (read-only access controlled by RLS policies)
3. **No Authentication Required:** Public website, no user authentication needed
4. **Input Validation:** Query parameters validated and sanitized in API routes
5. **Status Filtering:** Always filters by status to prevent showing unavailable vehicles

---

## Summary

The Inventory & Web flow provides a seamless experience for displaying vehicle inventory to end users:

1. **Data Source:** Supabase (PostgreSQL) with comprehensive vehicle, brand, model, and image data
2. **API Layer:** Next.js API routes that query Supabase and transform data for frontend consumption
3. **Frontend:** React components that display vehicles in listing and detail views
4. **Features:** Advanced filtering, search, pagination, image galleries, and related vehicle suggestions
5. **Real-time:** No caching, so status changes are immediately reflected on the web

The system is designed to be performant, maintainable, and user-friendly, providing customers with an intuitive way to browse and view available vehicles.

