# Inventory Flow Documentation

## Table of Contents
1. [Overview](#overview)
2. [Complete Flow Process](#complete-flow-process)
3. [Database Connections](#database-connections)
4. [S3 Bucket Connections](#s3-bucket-connections)
5. [UI Components & Working Details](#ui-components--working-details)
6. [Technical Implementation](#technical-implementation)
7. [Data Flow Architecture](#data-flow-architecture)
8. [Error Handling & Validation](#error-handling--validation)
9. [API Endpoints](#api-endpoints)
10. [Connections to Other Flows](#connections-to-other-flows)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The Inventory flow is a comprehensive vehicle management system that allows users to view, search, edit, delete, and manage vehicles in the PCN (Punchi Car Niwasa) inventory. The system provides real-time search capabilities, detailed vehicle information display, image management, and seamless integration with other system flows.

### Key Features
- **Real-time Search**: Search by Vehicle Number, Brand, or Model
- **Vehicle Listing**: Paginated table view with customizable rows per page
- **Vehicle Details View**: Complete vehicle information with image carousel
- **Edit Vehicle**: 4-tab interface for editing vehicle, seller, options, and notes
- **Image Management**: Upload, view, and delete vehicle images
- **Delete Vehicle**: Remove vehicles with S3 image cleanup
- **Print Documents**: Generate printable vehicle documents
- **Export to CSV**: Export inventory data for external use
- **Status Filtering**: Show only available vehicles (In Sale, In Transit)
- **360° Image Viewer**: Interactive 360° vehicle image viewing

### Technology Stack
- **Frontend**: Next.js 14+ (React, TypeScript)
- **Backend API**: Express.js (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Storage**: AWS S3
- **Authentication**: Custom Auth (Migration to Better Auth in progress)

**Last Updated**: January 16, 2026

---

## 📢 LATEST UPDATE - January 16, 2026 (Inventory Table & Filters Enhancement)

### 🔍 Advanced Filtering & Table Columns Update

**Update: Major inventory table enhancement with new columns and real-time filtering!**

#### New Table Columns:

| Column | Width | Description |
|--------|-------|-------------|
| Image | 80x50px | Primary vehicle image with thumbnail display |
| M Year | - | Manufacture Year |
| Reg Year | - | Registered Year |
| Color | - | Exterior Color |

#### New Real-Time Filter System:

| Filter | Type | Options |
|--------|------|----------|
| Search | Text Input | Vehicle Number, Brand, Model |
| Price Range | Min/Max Inputs | Numeric price filtering |
| Transmission | Select Dropdown | All, Auto, Manual |
| Ownership | Select Dropdown | All, Open Papers, Registered Owner |
| Vehicle Type | Select Dropdown | All, Registered, Unregistered |
| Country | Select Dropdown | Dynamic from countries table |

#### Filter Implementation:
```typescript
const filteredVehicles = useMemo(() => {
  return vehicles.filter((vehicle) => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      vehicle.vehicle_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Price range filter
    const matchesPrice = 
      (priceMin === '' || vehicle.selling_amount >= parseFloat(priceMin)) &&
      (priceMax === '' || vehicle.selling_amount <= parseFloat(priceMax))
    
    // Transmission filter
    const matchesTransmission = transmissionFilter === 'all' || 
      vehicle.transmission === transmissionFilter
    
    // Ownership filter
    const matchesOwnership = ownershipFilter === 'all' || 
      vehicle.ownership === ownershipFilter
    
    // Vehicle type filter
    const matchesVehicleType = vehicleTypeFilter === 'all' || 
      vehicle.vehicle_type === vehicleTypeFilter
    
    // Country filter
    const matchesCountry = countryFilter === 'all' || 
      vehicle.country_name === countryFilter
    
    return matchesSearch && matchesPrice && matchesTransmission && 
           matchesOwnership && matchesVehicleType && matchesCountry
  })
}, [vehicles, searchQuery, priceMin, priceMax, transmissionFilter, 
    ownershipFilter, vehicleTypeFilter, countryFilter])
```

#### Database Fields Added:
- `vehicle_type` - Values: 'Registered' or 'Unregistered'
- `ownership` - Values: 'Open Papers' or 'Registered Owner'

#### UI Components Used:
- shadcn/ui Select, Input, Button components
- Filter icon with "Clear Filters" button
- Real-time result count display

#### Modified Files:
- `dashboard/src/app/(dashboard)/inventory/page.tsx` ✅

---

## 📢 PREVIOUS UPDATE - January 16, 2026 (Print Documents Update)

### 🖨️ Print Acceptance & Price Tag Enhancements

**Update: Updated print document templates with new field positions and layout!**

#### Print Acceptance Changes:
- Added Land Phone Number field display
- Fixed field positions for better alignment
- Updated field mapping: `land_phone_number` instead of `phone_number`

#### Price Tag Redesign:
- **Two-column layout**: Options on left, Year/Engine details on right
- Removed browser date/time from print using CSS `@page` rules
- Added `-webkit-print-color-adjust: exact` for background colors

#### Modified Files:
- `dashboard/src/components/inventory/PrintDocumentsModal.tsx` ✅
- `dashboard/src/components/vehicle/Step7Success.tsx` ✅

---

## 📢 PREVIOUS UPDATE - January 1, 2026 (Performance & Data Sync)

### 🚀 Performance Optimizations & Web Data Sync

**Update: Enhanced performance and fixed web app data synchronization!**

#### Key Improvements:

1. **Performance Optimizations**:
   - Memoized expensive operations in inventory page
   - Optimized search with proper debouncing
   - Reduced re-renders with React hooks best practices

2. **Web App Data Sync**:
   - Fixed vehicle data not updating on web after dashboard edits
   - Added cache control headers to API routes
   - Vehicle updates now reflect immediately

3. **Multiple Sold-Out Records**:
   - Vehicles can now have multiple sold-out records for complete transaction history
   - Maintains audit trail when vehicles are re-added and sold again

#### Cache Control Configuration:
```typescript
response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
response.headers.set('Pragma', 'no-cache')
response.headers.set('Expires', '0')
```

#### Modified Files:
- `dashboard/src/app/(dashboard)/inventory/page.tsx` ✅
- `web/next.config.js` ✅
- `web/src/app/api/vehicles/route.ts` ✅
- `web/src/app/api/vehicles/[id]/route.ts` ✅

---

## Complete Flow Process

### Step-by-Step Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INVENTORY PAGE                            │
│              /inventory (Dashboard)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  INITIAL LOAD                         │
        │  1. Fetch vehicles from view          │
        │  2. Filter by status (In Sale/Transit)│
        │  3. Display in paginated table         │
        └──────────────┬────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐           ┌───────────────────────┐
│  SEARCH       │           │  VEHICLE ACTIONS       │
│  - Real-time  │           │  - View Details        │
│  - Filter     │           │  - Edit Vehicle        │
│  - Clear      │           │  - Upload Images      │
└───────┬───────┘           │  - Print Documents     │
        │                   │  - Delete Vehicle      │
        ▼                   └───────────┬───────────┘
┌───────────────┐                      │
│  FILTERED     │                      │
│  RESULTS      │                      │
│  - Pagination │                      │
│  - Sorting    │                      │
└───────────────┘                      │
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                        ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │  VIEW DETAILS MODAL    │       │  EDIT VEHICLE MODAL   │
        │  - Image Carousel       │       │  Tab 1: Vehicle       │
        │  - Vehicle Info         │       │  Tab 2: Seller        │
        │  - Seller Details       │       │  Tab 3: Options       │
        │  - Options List         │       │  Tab 4: Notes        │
        │  - Download CR Paper    │       │  - Update Database    │
        └────────────────────────┘       └───────────┬───────────┘
                                                    │
                                    ┌───────────────┴───────────────┐
                                    │                               │
                                    ▼                               ▼
                    ┌───────────────────────┐       ┌───────────────────────┐
                    │  IMAGE UPLOAD MODAL    │       │  DELETE CONFIRMATION  │
                    │  - Gallery Images       │       │  - Confirm Delete     │
                    │  - 360° Images          │       │  - Delete S3 Images   │
                    │  - CR Papers            │       │  - Delete Database     │
                    │  - Upload to S3         │       │  - Create Notification │
                    └────────────────────────┘       └────────────────────────┘
```

### Main Inventory Page Flow

**1. Page Load**:
- Fetch vehicles from `vehicle_inventory_view`
- Filter by status: `'In Sale'` or `'In Transit'`
- Order by `created_at` (newest first)
- Display in paginated table

**2. Search Functionality**:
- Real-time search as user types
- Searches in: Vehicle Number, Brand Name, Model Name
- Case-insensitive matching
- Updates results instantly
- Shows result count

**3. Pagination**:
- Configurable rows per page: 5, 10, 25, 50
- Page navigation with previous/next buttons
- Page number display (max 5 visible)
- Auto-reset to page 1 on search/filter change

**4. Vehicle Actions**:
- **View Details**: Opens modal with complete vehicle information
- **Edit**: Opens 4-tab edit modal
- **Upload Images**: Opens image upload modal
- **Print**: Opens print documents modal
- **Delete**: Opens confirmation dialog

### View Details Flow

**Purpose**: Display complete vehicle information in a modal

**Process**:
1. User clicks "View" (Eye icon)
2. Fetch vehicle data from `vehicles` table
3. Fetch images from `vehicle_images` table
4. Fetch seller from `sellers` table
5. Fetch options from `vehicle_options` and `vehicle_options_master`
6. Display in organized sections:
   - Image carousel (360° viewer)
   - Vehicle title and download button
   - Selling information
   - Seller details
   - Vehicle specifications
   - Vehicle options

**Features**:
- Image carousel with navigation
- 360° interactive viewer
- Download CR Paper button
- Complete vehicle specifications
- Seller contact information

### Edit Vehicle Flow

**Purpose**: Update vehicle information through 4-tab interface

**Process**:
1. User clicks "Edit" (Pencil icon)
2. Modal opens with 4 tabs:
   - **Tab 1: Vehicle Details**
     - Vehicle number, brand, model, year
     - Country, body type, fuel type, transmission
     - Engine capacity, color, mileage, price
     - Entry type, entry date, status
   - **Tab 2: Seller Details**
     - Title, name, NIC, address
     - Mobile, landline, email
     - Create seller if doesn't exist
   - **Tab 3: Options**
     - Standard options (checkboxes)
     - Special options (checkboxes)
     - Custom options (add/remove)
   - **Tab 4: Notes**
     - Tag notes (internal)
     - Special note print
3. User makes changes
4. Click "Save Changes"
5. Update database:
   - Update `vehicles` table
   - Update/Insert `sellers` table
   - Delete old options, insert new options
   - Update custom options
6. Show success notification
7. Refresh vehicle list

### Image Upload Flow

**Purpose**: Manage vehicle images (Gallery, 360°, CR Papers)

**Process**:
1. User clicks "Edit Images" (Image icon)
2. Modal opens showing current images
3. User can:
   - Upload new images (drag & drop or file picker)
   - Delete existing images
   - View image previews
4. For each upload:
   - Get presigned URL from API
   - Upload directly to S3
   - Save metadata to `vehicle_images` table
5. For each deletion:
   - Delete from S3
   - Delete from database
6. Refresh vehicle list on success

### Delete Vehicle Flow

**Purpose**: Remove vehicle from inventory with cleanup

**Process**:
1. User clicks "Delete" (Trash icon)
2. Confirmation dialog appears
3. User confirms deletion
4. System processes:
   - Fetch all S3 keys for vehicle images
   - Delete images from S3 (via API)
   - Delete vehicle from `vehicles` table (cascades to related tables)
   - Create notification for deletion
5. Show success message
6. Refresh vehicle list

### Print Documents Flow

**Purpose**: Generate printable vehicle documents

**Process**:
1. User clicks "Print" (Printer icon)
2. Fetch vehicle data
3. Fetch seller details
4. Fetch vehicle options
5. Open print modal with formatted document
6. User can print or download as PDF

### Export to CSV Flow

**Purpose**: Export inventory data for external use

**Process**:
1. User clicks "Export CSV" button
2. Get filtered vehicle data
3. Format as CSV with headers:
   - Vehicle Number, Brand, Model, Year
   - Selling Amount, Mileage, Country
   - Transmission, Fuel Type, Body Type
   - Engine Capacity, Color, Status
   - Entry Type, Entry Date
   - Seller Name, Mobile, Email
4. Create blob and download
5. File named: `inventory-YYYY-MM-DD.csv`

---

## Database Connections

### Database Architecture

The system uses **Supabase (PostgreSQL)** for all structured data storage.

### Main Database View

#### `vehicle_inventory_view` (PostgreSQL View)

**Purpose**: Unified view of vehicle inventory with joined data

**Definition**:
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

**Usage**:
- Primary data source for inventory listing
- Automatically joins related tables
- Provides human-readable names (brand, model, country)
- Includes seller information

### Database Tables Used

#### 1. `vehicles` Table
**Purpose**: Core vehicle information

**Key Operations**:
- **SELECT**: Fetch vehicle details for editing/viewing
- **UPDATE**: Update vehicle information
- **DELETE**: Remove vehicle from inventory

**Query Examples**:
```typescript
// Fetch single vehicle
const { data } = await supabase
  .from('vehicles')
  .select('*')
  .eq('id', vehicleId)
  .single()

// Update vehicle
const { error } = await supabase
  .from('vehicles')
  .update({ ...vehicleData, updated_at: new Date().toISOString() })
  .eq('id', vehicleId)

// Delete vehicle
const { error } = await supabase
  .from('vehicles')
  .delete()
  .eq('id', vehicleId)
```

#### 2. `sellers` Table
**Purpose**: Seller information linked to vehicles

**Key Operations**:
- **SELECT**: Fetch seller details for vehicle
- **UPDATE**: Update seller information
- **INSERT**: Create new seller if doesn't exist

**Query Examples**:
```typescript
// Fetch seller
const { data } = await supabase
  .from('sellers')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .maybeSingle()

// Update seller
const { error } = await supabase
  .from('sellers')
  .update({ ...sellerData })
  .eq('id', sellerId)

// Insert seller
const { error } = await supabase
  .from('sellers')
  .insert({ vehicle_id: vehicleId, ...sellerData })
```

#### 3. `vehicle_images` Table
**Purpose**: Image metadata (images stored in S3)

**Key Operations**:
- **SELECT**: Fetch images for vehicle
- **INSERT**: Save new image metadata
- **DELETE**: Remove image metadata

**Query Examples**:
```typescript
// Fetch images
const { data } = await supabase
  .from('vehicle_images')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .order('display_order', { ascending: true })

// Fetch by type
const { data } = await supabase
  .from('vehicle_images')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .eq('image_type', 'gallery')

// Delete image
const { error } = await supabase
  .from('vehicle_images')
  .delete()
  .eq('id', imageId)
```

#### 4. `vehicle_options` Table
**Purpose**: Link vehicles to standard/special options

**Key Operations**:
- **SELECT**: Fetch vehicle options
- **DELETE**: Remove all options (before update)
- **INSERT**: Add new options

**Query Examples**:
```typescript
// Fetch options
const { data } = await supabase
  .from('vehicle_options')
  .select('option_id')
  .eq('vehicle_id', vehicleId)

// Delete all options
const { error } = await supabase
  .from('vehicle_options')
  .delete()
  .eq('vehicle_id', vehicleId)

// Insert options
for (const optionId of selectedOptions) {
  await supabase
    .from('vehicle_options')
    .insert({ vehicle_id: vehicleId, option_id: optionId, option_type: 'standard' })
}
```

#### 5. `vehicle_custom_options` Table
**Purpose**: Store custom/free-text vehicle options

**Key Operations**:
- **SELECT**: Fetch custom options
- **DELETE**: Remove custom options
- **INSERT**: Add custom options

**Query Examples**:
```typescript
// Fetch custom options
const { data } = await supabase
  .from('vehicle_custom_options')
  .select('option_name')
  .eq('vehicle_id', vehicleId)

// Delete custom options
const { error } = await supabase
  .from('vehicle_custom_options')
  .delete()
  .eq('vehicle_id', vehicleId)

// Insert custom options
for (const optionName of customOptions) {
  await supabase
    .from('vehicle_custom_options')
    .insert({ vehicle_id: vehicleId, option_name: optionName })
}
```

#### 6. `vehicle_options_master` Table
**Purpose**: Master list of available options

**Key Operations**:
- **SELECT**: Fetch all available options for dropdowns

**Query Examples**:
```typescript
// Fetch all options
const { data } = await supabase
  .from('vehicle_options_master')
  .select('*')
  .eq('is_active', true)
  .order('option_name')
```

#### 7. `vehicle_brands` Table
**Purpose**: Vehicle brand names

**Key Operations**:
- **SELECT**: Fetch brands for dropdowns

#### 8. `vehicle_models` Table
**Purpose**: Vehicle model names

**Key Operations**:
- **SELECT**: Fetch models filtered by brand

#### 9. `countries` Table
**Purpose**: Country names

**Key Operations**:
- **SELECT**: Fetch active countries for dropdowns

#### 10. `notifications` Table
**Purpose**: System notifications

**Key Operations**:
- **INSERT**: Create notification on vehicle deletion

### Database Connection Flow

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Inventory Page)               │
│              Next.js App (Port 3001)                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Supabase Client SDK
                        │ (createClient)
                        ▼
┌─────────────────────────────────────────────────────────┐
│              SUPABASE (PostgreSQL)                      │
│  - vehicle_inventory_view (SELECT)                     │
│  - vehicles (SELECT, UPDATE, DELETE)                    │
│  - sellers (SELECT, UPDATE, INSERT)                    │
│  - vehicle_images (SELECT, INSERT, DELETE)              │
│  - vehicle_options (SELECT, INSERT, DELETE)            │
│  - vehicle_custom_options (SELECT, INSERT, DELETE)     │
│  - vehicle_options_master (SELECT)                      │
│  - vehicle_brands (SELECT)                              │
│  - vehicle_models (SELECT)                              │
│  - countries (SELECT)                                   │
│  - notifications (INSERT)                                │
└─────────────────────────────────────────────────────────┘
```

**Connection Details**:
- **Client**: `@supabase/supabase-js`
- **Connection**: Via Supabase REST API
- **Authentication**: JWT tokens from Supabase Auth
- **Query Method**: Supabase client methods (`.from()`, `.select()`, `.update()`, `.insert()`, `.delete()`)

**Example Connection**:
```typescript
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

// Fetch vehicles
const { data: vehicles } = await supabase
  .from('vehicle_inventory_view')
  .select('*')
  .in('status', ['In Sale', 'In Transit'])
  .order('created_at', { ascending: false });

// Update vehicle
const { error } = await supabase
  .from('vehicles')
  .update({ ...vehicleData })
  .eq('id', vehicleId);
```

### Transaction Flow

**Edit Vehicle Process** (Sequential):
1. **Fetch Data** → Load vehicle, seller, options, master data
2. **Update Vehicle** → Update `vehicles` table
3. **Update/Insert Seller** → Update or create in `sellers` table
4. **Delete Options** → Remove old options from `vehicle_options`
5. **Insert Options** → Add new options to `vehicle_options`
6. **Delete Custom Options** → Remove old custom options
7. **Insert Custom Options** → Add new custom options

**Delete Vehicle Process** (Sequential):
1. **Fetch S3 Keys** → Get all image S3 keys from `vehicle_images`
2. **Delete S3 Images** → Remove images from AWS S3
3. **Delete Vehicle** → Remove from `vehicles` table (cascades to related tables)
4. **Create Notification** → Insert notification record

**Error Handling**:
- Each step has error handling
- Database errors provide user-friendly messages
- Failed steps don't block subsequent steps (where appropriate)
- Transaction rollback not used (Supabase doesn't support multi-table transactions via client)

---

## S3 Bucket Connections

### AWS S3 Architecture

The system uses **AWS S3** for storing all vehicle images and documents.

### S3 Configuration

**Environment Variables** (Required):
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_CLOUDFRONT_URL=https://your-cdn.cloudfront.net (optional)
```

### S3 Folder Structure

```
your-bucket-name/
├── vehicle_images/          # Gallery images
│   └── {vehicleId}/
│       ├── {timestamp}-image1.jpg
│       ├── {timestamp}-image2.jpg
│       └── ...
├── vehicle_360_image/       # 360° rotation images
│   └── {vehicleId}/
│       ├── {timestamp}-360-1.jpg
│       ├── {timestamp}-360-2.jpg
│       └── ...
└── cr_pepar_image/          # CR papers and documents
    └── {vehicleId}/
        ├── {timestamp}-cr1.jpg
        └── ...
```

### S3 Operations in Inventory Flow

#### 1. Image Upload (VehicleImageUploadModal)

**Flow**:
```
Browser → Get Presigned URL → Upload to S3 → Save Metadata to Database
```

**Process**:
1. User selects images
2. For each image:
   - Request presigned URL from `/api/upload/presigned-url`
   - Upload file directly to S3 using presigned URL
   - Save metadata to `vehicle_images` table
3. Refresh vehicle list

**Implementation**:
```typescript
// Get presigned URL
const response = await fetch('/api/upload/presigned-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    vehicleId,
    imageType: 'gallery',
    fileName: file.name,
    mimeType: file.type,
  }),
});

const { presignedUrl, publicUrl, key } = await response.json();

// Upload to S3
await fetch(presignedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
});

// Save metadata
await supabase.from('vehicle_images').insert({
  vehicle_id: vehicleId,
  image_url: publicUrl,
  s3_key: key,
  image_type: 'gallery',
  // ... other fields
});
```

#### 2. Image Deletion (VehicleImageUploadModal)

**Flow**:
```
Browser → Delete from S3 → Delete Metadata from Database
```

**Process**:
1. User clicks delete on image
2. Call `/api/upload/delete` with image ID and S3 key
3. API deletes from S3
4. Delete metadata from `vehicle_images` table
5. Update UI

**Implementation**:
```typescript
// Delete from S3
await fetch(`/api/upload/delete`, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    vehicleId,
    imageId,
    imageType,
    s3Key,
  }),
});

// Delete from database
await supabase
  .from('vehicle_images')
  .delete()
  .eq('id', imageId);
```

#### 3. Vehicle Deletion (Inventory Page)

**Flow**:
```
Browser → Fetch S3 Keys → Delete All Images from S3 → Delete Vehicle from Database
```

**Process**:
1. User confirms vehicle deletion
2. Fetch all S3 keys for vehicle images
3. Call `/api/upload/delete-vehicle/{vehicleId}` with S3 keys array
4. API deletes all images from S3 (batch deletion)
5. Delete vehicle from database (cascades to related tables)

**Implementation**:
```typescript
// Fetch S3 keys
const { data: imageRecords } = await supabase
  .from('vehicle_images')
  .select('s3_key')
  .eq('vehicle_id', vehicleId);

const s3Keys = imageRecords
  ?.map(record => record.s3_key)
  .filter(key => key !== null && key !== undefined) || [];

// Delete from S3
if (s3Keys.length > 0) {
  await fetch(`/api/upload/delete-vehicle/${vehicleId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ s3Keys }),
  });
}

// Delete from database
await supabase
  .from('vehicles')
  .delete()
  .eq('id', vehicleId);
```

### S3 Public URLs

**URL Format**:
- **With CloudFront CDN**: `https://cdn.example.com/vehicle_images/{vehicleId}/{filename}`
- **Direct S3 URL**: `https://{bucket}.s3.{region}.amazonaws.com/vehicle_images/{vehicleId}/{filename}`

**Usage in UI**:
- Images displayed using `image_url` from `vehicle_images` table
- Direct S3 URLs or CDN URLs work seamlessly
- Next.js Image component optimizes loading

---

## UI Components & Working Details

### Component Structure

```
inventory/
├── page.tsx                           # Main inventory page
└── components/
    ├── EditVehicleModal.tsx           # 4-tab edit modal
    ├── VehicleImageUploadModal.tsx    # Image upload/management
    ├── VehicleDetailModal.tsx         # View-only detail modal
    └── PrintDocumentsModal.tsx        # Print document modal
```

### Main Inventory Page (`page.tsx`)

**Key Features**:

1. **Header Section**:
   - Page title: "Available Vehicle"
   - Vehicle count display
   - Export CSV button

2. **Search Bar**:
   - Real-time search input
   - Search icon
   - Clear button (X icon)
   - Result count display

3. **Vehicle Table**:
   - Columns: Vehicle No, Brand, Model, Year, Price, Mileage, Country, Transmission, Fuel Type, Actions
   - Hover effects on rows
   - Loading state with spinner
   - Empty state message

4. **Action Buttons** (per vehicle):
   - **View** (Eye icon): Opens detail modal
   - **Print** (Printer icon): Opens print modal
   - **Edit Images** (Image icon): Opens image upload modal
   - **Edit** (Pencil icon): Opens edit modal
   - **Delete** (Trash icon): Opens delete confirmation

5. **Pagination**:
   - Rows per page selector (5, 10, 25, 50)
   - Page number display
   - Previous/Next buttons
   - Page number buttons (max 5 visible)

**State Management**:
```typescript
const [vehicles, setVehicles] = useState<Vehicle[]>([])
const [loading, setLoading] = useState(true)
const [searchQuery, setSearchQuery] = useState('')
const [currentPage, setCurrentPage] = useState(1)
const [rowsPerPage, setRowsPerPage] = useState(5)
const [deleteId, setDeleteId] = useState<string | null>(null)
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
// ... modal states
```

**Data Fetching**:
```typescript
const fetchVehicles = async () => {
  const { data, error } = await supabase
    .from('vehicle_inventory_view')
    .select('*')
    .in('status', ['In Sale', 'In Transit'])
    .order('created_at', { ascending: false })
  
  setVehicles(data || [])
}
```

**Search Filtering**:
```typescript
const filteredVehicles = useMemo(() => {
  if (!searchQuery.trim()) return vehicles
  
  const query = searchQuery.toLowerCase().trim()
  return vehicles.filter(vehicle => {
    const vehicleNumber = vehicle.vehicle_number?.toLowerCase() || ''
    const brandName = vehicle.brand_name?.toLowerCase() || ''
    const modelName = vehicle.model_name?.toLowerCase() || ''
    
    return vehicleNumber.includes(query) ||
           brandName.includes(query) ||
           modelName.includes(query)
  })
}, [vehicles, searchQuery])
```

**Pagination**:
```typescript
const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage)
const paginatedVehicles = useMemo(() => {
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  return filteredVehicles.slice(startIndex, endIndex)
}, [filteredVehicles, currentPage, rowsPerPage])
```

### Edit Vehicle Modal (`EditVehicleModal.tsx`)

**Key Features**:

1. **4-Tab Interface**:
   - **Tab 1: Vehicle Details**
     - Vehicle number input
     - Brand/Model dropdowns (dynamic)
     - Year, country, body type, fuel type, transmission
     - Engine capacity, color, mileage, price
     - Entry type, entry date, status
   - **Tab 2: Seller Details**
     - Title dropdown (Mr., Miss., Mrs., Dr.)
     - Name fields (first, last)
     - NIC, address, city
     - Mobile, landline, email
     - Creates seller if doesn't exist
   - **Tab 3: Options**
     - Standard options (checkboxes)
     - Special options (checkboxes)
     - Custom options (add/remove)
   - **Tab 4: Notes**
     - Tag notes (textarea)
     - Special note print (textarea)

2. **Data Loading**:
   - Fetches vehicle data on modal open
   - Fetches seller data
   - Fetches vehicle options
   - Fetches master data (brands, models, countries, options)

3. **Save Process**:
   - Validates required fields
   - Updates vehicle in database
   - Updates/creates seller
   - Deletes old options, inserts new options
   - Updates custom options
   - Shows success notification
   - Refreshes vehicle list

**State Management**:
```typescript
const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
const [sellerData, setSellerData] = useState<SellerData | null>(null)
const [selectedOptions, setSelectedOptions] = useState<string[]>([])
const [customOptions, setCustomOptions] = useState<string[]>([])
const [brands, setBrands] = useState<Brand[]>([])
const [models, setModels] = useState<Model[]>([])
const [countries, setCountries] = useState<Country[]>([])
const [allOptions, setAllOptions] = useState<OptionMaster[]>([])
const [activeTab, setActiveTab] = useState('vehicle')
const [loading, setLoading] = useState(false)
```

### Vehicle Image Upload Modal (`VehicleImageUploadModal.tsx`)

**Key Features**:

1. **Image Type Sections**:
   - **Gallery Images**: Multiple vehicle photos
   - **360° Images**: Sequential rotation images
   - **CR Papers**: Document images

2. **Image Management**:
   - Upload new images (drag & drop or file picker)
   - Preview existing images
   - Delete images with confirmation
   - Image type indicators

3. **Upload Process**:
   - Get presigned URL for each image
   - Upload directly to S3
   - Save metadata to database
   - Update UI with new images

4. **Delete Process**:
   - Delete from S3
   - Delete metadata from database
   - Update UI

**State Management**:
```typescript
const [galleryImages, setGalleryImages] = useState<VehicleImage[]>([])
const [image360s, setImage360s] = useState<VehicleImage[]>([])
const [crPapers, setCrPapers] = useState<VehicleImage[]>([])
const [uploading, setUploading] = useState(false)
const [imageToDelete, setImageToDelete] = useState<VehicleImage | null>(null)
const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
```

### Vehicle Detail Modal (`VehicleDetailModal.tsx`)

**Key Features**:

1. **Image Display**:
   - Image carousel with navigation
   - 360° interactive viewer
   - Image counter

2. **Information Sections**:
   - Vehicle title with download button
   - Selling information
   - Price, mileage, entry date, status
   - Seller details
   - Vehicle specifications
   - Vehicle options (with checkmarks)

3. **Actions**:
   - Download CR Paper button
   - Close modal

### Print Documents Modal (`PrintDocumentsModal.tsx`)

**Key Features**:

1. **Document Layout**:
   - Vehicle information
   - Seller information
   - Vehicle options
   - Formatted for printing

2. **Actions**:
   - Print button
   - Download as PDF (browser print to PDF)

### Delete Confirmation Dialog

**Key Features**:

1. **Confirmation**:
   - Warning message
   - Vehicle information display
   - Delete and Cancel buttons

2. **Delete Process**:
   - Fetch S3 keys
   - Delete from S3
   - Delete from database
   - Create notification
   - Show success message
   - Refresh list

---

## Technical Implementation

### API Endpoints

#### 1. Presigned URL Endpoint

**Endpoint**: `POST /api/upload/presigned-url`

**Request**:
```json
{
  "vehicleId": "uuid",
  "imageType": "gallery" | "image_360" | "cr_paper",
  "fileName": "image.jpg",
  "mimeType": "image/jpeg"
}
```

**Response**:
```json
{
  "success": true,
  "presignedUrl": "https://s3.amazonaws.com/...",
  "publicUrl": "https://bucket.s3.region.amazonaws.com/...",
  "key": "vehicle_images/uuid/timestamp-image.jpg"
}
```

#### 2. Delete Image Endpoint

**Endpoint**: `DELETE /api/upload/delete`

**Request**:
```json
{
  "vehicleId": "uuid",
  "imageId": "uuid",
  "imageType": "gallery",
  "s3Key": "vehicle_images/uuid/timestamp-image.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

#### 3. Delete Vehicle Images Endpoint

**Endpoint**: `DELETE /api/upload/delete-vehicle/:vehicleId`

**Request**:
```json
{
  "s3Keys": ["key1", "key2", "key3"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully deleted 3 images from S3",
  "deletedCount": 3
}
```

### Database Operations

All database operations use Supabase client directly:

**Fetch Vehicles**:
```typescript
const { data, error } = await supabase
  .from('vehicle_inventory_view')
  .select('*')
  .in('status', ['In Sale', 'In Transit'])
  .order('created_at', { ascending: false })
```

**Update Vehicle**:
```typescript
const { error } = await supabase
  .from('vehicles')
  .update({
    vehicle_number: vehicleData.vehicle_number,
    brand_id: vehicleData.brand_id,
    // ... other fields
    updated_at: new Date().toISOString()
  })
  .eq('id', vehicleId)
```

**Delete Vehicle**:
```typescript
const { error } = await supabase
  .from('vehicles')
  .delete()
  .eq('id', vehicleId)
```

**Update Options**:
```typescript
// Delete old options
await supabase
  .from('vehicle_options')
  .delete()
  .eq('vehicle_id', vehicleId)

// Insert new options
for (const optionId of selectedOptions) {
  await supabase
    .from('vehicle_options')
    .insert({
      vehicle_id: vehicleId,
      option_id: optionId,
      option_type: 'standard',
      is_enabled: true
    })
}
```

### Error Handling

**Database Errors**:
- Foreign key violations → User-friendly messages
- Unique constraint violations → Duplicate warnings
- NOT NULL violations → Field-specific errors
- CHECK constraint violations → Value validation errors

**S3 Errors**:
- Configuration errors → Setup instructions
- Upload failures → Retry suggestions
- Network errors → Connection messages

**Validation Errors**:
- Client-side validation before submission
- Server-side validation for security
- User-friendly error messages

### Performance Optimizations

1. **Memoized Filtering**: Search results cached with `useMemo`
2. **Pagination**: Only loads visible vehicles
3. **Lazy Loading**: Images load on demand
4. **Parallel Fetching**: Multiple data fetches in parallel
5. **CDN Usage**: CloudFront for faster image delivery

### Security Measures

1. **Authentication**: Supabase Auth required
2. **Authorization**: User must be logged in
3. **File Validation**: Type and size checks
4. **S3 Access**: Presigned URLs with expiration
5. **Input Sanitization**: SQL injection prevention (Supabase handles)
6. **XSS Prevention**: React auto-escaping

---

## Data Flow Architecture

### Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
│  View Inventory → Search → Edit → Delete                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              PAGE LOAD                                       │
│  - Fetch vehicles from view                                  │
│  - Filter by status                                          │
│  - Display in table                                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐           ┌───────────────────────┐
│  SEARCH       │           │  VEHICLE ACTIONS       │
│  - Filter     │           │  - View Details        │
│  - Update UI  │           │  - Edit Vehicle        │
└───────┬───────┘           │  - Upload Images      │
        │                   │  - Delete Vehicle      │
        ▼                   └───────────┬───────────┘
┌───────────────┐                      │
│  FILTERED      │                      │
│  RESULTS       │                      │
└───────────────┘                      │
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                        ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │  VIEW DETAILS         │       │  EDIT VEHICLE          │
        │  - Fetch vehicle       │       │  - Fetch all data      │
        │  - Fetch images        │       │  - Update vehicle      │
        │  - Fetch seller        │       │  - Update seller       │
        │  - Fetch options        │       │  - Update options      │
        │  - Display modal        │       │  - Refresh list          │
        └────────────────────────┘       └───────────┬───────────┘
                                                    │
                                    ┌───────────────┴───────────────┐
                                    │                               │
                                    ▼                               ▼
                    ┌───────────────────────┐       ┌───────────────────────┐
                    │  IMAGE UPLOAD          │       │  DELETE VEHICLE        │
                    │  - Get presigned URL    │       │  - Fetch S3 keys       │
                    │  - Upload to S3         │       │  - Delete S3 images   │
                    │  - Save metadata        │       │  - Delete database     │
                    │  - Refresh list          │       │  - Create notification │
                    └────────────────────────┘       └────────────────────────┘
```

### State Management Flow

```
Initial State
    │
    ▼
Page Load
    │ (fetchVehicles)
    ▼
Display Vehicles
    │
    ├─→ Search (filteredVehicles)
    │
    ├─→ View Details (fetchVehicleDetails)
    │
    ├─→ Edit Vehicle (fetchAllData → update)
    │
    ├─→ Upload Images (presigned URL → S3 → metadata)
    │
    └─→ Delete Vehicle (S3 → database → notification)
```

---

## Error Handling & Validation

### Client-Side Validation

**Search Validation**:
- Empty search shows all vehicles
- Search is case-insensitive
- Real-time filtering

**Edit Vehicle Validation**:
- Required fields: Vehicle number, brand, model, year, country, body type, fuel type, transmission, selling amount, entry type, entry date
- Optional fields: Registered year, engine capacity, color, mileage
- Seller: Mobile number required if seller exists

**Image Upload Validation**:
- File type: Images only (jpg, jpeg, png, webp)
- File size: Max 10MB per file
- Image count: No hard limit (practical limits apply)

### Server-Side Validation

**Database Constraints**:
- Foreign key constraints (brand_id, model_id, country_id)
- Unique constraints (vehicle_number)
- CHECK constraints (body_type, fuel_type, transmission, status)
- NOT NULL constraints

**S3 Validation**:
- File type validation
- File size limits
- Presigned URL expiration (5 minutes)

### Error Recovery

**Upload Failures**:
- Retry mechanism for failed uploads
- Partial success handling
- Error reporting for failed images

**Database Failures**:
- Error logging
- User notification
- Rollback where applicable

**Network Failures**:
- Retry logic
- Offline detection
- User-friendly error messages

---

## API Endpoints

### Upload Endpoints

#### `POST /api/upload/presigned-url`
Generate presigned URL for direct S3 upload

#### `DELETE /api/upload/delete`
Delete single image from S3 and database

#### `DELETE /api/upload/delete-vehicle/:vehicleId`
Delete all images for a vehicle from S3

### Database Operations

All database operations use Supabase client directly (no custom API endpoints):
- `.from('vehicle_inventory_view').select()`
- `.from('vehicles').update()`
- `.from('vehicles').delete()`
- `.from('sellers').update()`
- `.from('sellers').insert()`
- `.from('vehicle_images').insert()`
- `.from('vehicle_images').delete()`
- `.from('vehicle_options').delete()`
- `.from('vehicle_options').insert()`

---

## Connections to Other Flows

### 1. Add Vehicle Flow

**Connection**: Vehicles added through Add Vehicle flow appear in Inventory

**Data Flow**:
```
Add Vehicle Flow
    │
    │ (Publish Vehicle)
    ▼
Insert into vehicles table
    │
    │ (Status: 'In Sale')
    ▼
Appears in Inventory (vehicle_inventory_view)
```

**Shared Components**:
- `VehicleImageViewer`: 360° image viewer
- Image upload logic (presigned URLs)
- Master data (brands, models, countries)

### 2. Reserve Vehicle Flow

**Connection**: Vehicles from Inventory can be selected for reservation

**Data Flow**:
```
Inventory Page
    │
    │ (User selects vehicle)
    ▼
Reserve Vehicle Page
    │
    │ (Search by vehicle number)
    ▼
Select Vehicle from Inventory
    │
    │ (Fetch vehicle data)
    ▼
Complete Reservation Transaction
    │
    │ (Update status to 'Sold')
    ▼
Vehicle removed from Inventory (status filter)
```

**Shared Data**:
- Vehicle data from `vehicles` table
- Vehicle images from `vehicle_images` table
- Seller information from `sellers` table

**Status Updates**:
- When vehicle is reserved/sold, status changes to `'Sold'`
- Inventory only shows `'In Sale'` and `'Taken Out'` vehicles
- Sold vehicles automatically removed from inventory view

### 3. Sales Transactions Flow

**Connection**: Inventory vehicles can be viewed in sales history

**Data Flow**:
```
Inventory Page
    │
    │ (Vehicle sold)
    ▼
Sales Transactions Page
    │
    │ (View sale history)
    ▼
Historical vehicle data preserved
```

**Shared Data**:
- Vehicle information stored in `pending_vehicle_sales` table
- Vehicle snapshot columns preserve historical data
- No direct link after sale (vehicle_id can be NULL)

### 4. Dashboard Flow

**Connection**: Inventory statistics displayed on dashboard

**Data Flow**:
```
Inventory Page
    │
    │ (Vehicle count, status)
    ▼
Dashboard Page
    │
    │ (Statistics)
    ▼
Display inventory metrics
```

**Shared Queries**:
- Vehicle count by status
- Available vehicles count
- Recent vehicles

### 5. User Role & Auth Flow

**Connection**: Inventory access controlled by authentication

**Data Flow**:
```
User Login
    │
    │ (Authenticate)
    ▼
Check User Role
    │
    │ (Admin/Editor)
    ▼
Access Inventory Page
    │
    │ (All authenticated users)
    ▼
View/Edit/Delete Vehicles
```

**Access Control**:
- All authenticated users (Admin and Editor) can access Inventory
- No role restrictions on inventory operations
- User information tracked in `created_by` field

### 6. Notification Flow

**Connection**: Inventory actions create notifications

**Data Flow**:
```
Inventory Actions
    │
    ├─→ Delete Vehicle
    │   │
    │   ▼
    │   Create Notification
    │   (type: 'deleted')
    │
    └─→ Edit Vehicle
        │
        ▼
        (No notification - edit is silent)
```

**Notification Types**:
- `deleted`: Vehicle deleted from inventory
- Notification includes vehicle information
- Visible to all users in notification system

---

## Troubleshooting

### Common Issues

#### 1. Vehicles Not Loading

**Problem**: Inventory page shows no vehicles

**Solutions**:
- Check database connection
- Verify `vehicle_inventory_view` exists
- Check status filter (only 'In Sale' and 'In Transit' shown)
- Verify vehicles exist with correct status
- Check browser console for errors
- Refresh page

#### 2. Search Not Working

**Problem**: Search doesn't filter results

**Solutions**:
- Check search query format
- Verify vehicle data has brand_name and model_name
- Check browser console for errors
- Clear search and try again
- Verify filteredVehicles memoization

#### 3. Edit Vehicle Fails

**Problem**: Cannot save vehicle changes

**Solutions**:
- Check all required fields are filled
- Verify foreign key references exist (brand_id, model_id, country_id)
- Check database constraints
- Review error message for specific field
- Check browser console for detailed errors
- Verify user has edit permissions

#### 4. Image Upload Fails

**Problem**: Images not uploading

**Solutions**:
- Check AWS credentials in environment variables
- Verify S3 bucket name and region
- Check network connectivity
- Verify file size limits (10MB)
- Check file type (images only)
- Verify presigned URL endpoint is working
- Check browser console for errors

#### 5. Delete Vehicle Fails

**Problem**: Cannot delete vehicle

**Solutions**:
- Check if vehicle has related records
- Verify S3 deletion endpoint is working
- Check database constraints
- Verify user has delete permissions
- Check browser console for errors
- Try deleting images first, then vehicle

#### 6. Images Not Displaying

**Problem**: Vehicle images don't show

**Solutions**:
- Check S3 bucket configuration
- Verify image URLs are accessible
- Check CloudFront CDN configuration (if used)
- Verify image metadata in database
- Check browser console for 404 errors
- Verify image_type is correct ('gallery', 'image_360', 'cr_paper')

#### 7. Pagination Not Working

**Problem**: Pagination doesn't update

**Solutions**:
- Check rowsPerPage state
- Verify filteredVehicles calculation
- Check currentPage state updates
- Verify pagination logic in useMemo
- Check browser console for errors

### Debugging Tips

1. **Check Browser Console**: Client-side errors
2. **Check Network Tab**: API request/response details
3. **Check Database**: Verify data exists and is correct
4. **Check S3 Console**: Verify image uploads
5. **Check Supabase Dashboard**: Verify database queries
6. **Check Environment Variables**: Verify AWS and Supabase config

### Performance Issues

**Slow Page Load**:
- Check database query performance
- Optimize vehicle_inventory_view
- Reduce initial data fetch
- Implement pagination earlier

**Slow Search**:
- Check filteredVehicles memoization
- Optimize search algorithm
- Reduce vehicle count in memory
- Implement server-side search

**Slow Image Loading**:
- Check internet connection
- Verify S3 region matches user location
- Use CloudFront CDN
- Optimize image sizes
- Implement lazy loading

---

## Best Practices

### For Developers

1. **Always validate on both client and server**
2. **Use presigned URLs for S3 uploads**
3. **Handle errors gracefully with user-friendly messages**
4. **Log errors for debugging**
5. **Optimize database queries**
6. **Use memoization for expensive calculations**
7. **Implement proper error recovery**
8. **Test with various data sizes**
9. **Handle edge cases (empty states, loading states)**
10. **Keep UI responsive during operations**

### For Users

1. **Use search to find vehicles quickly**
2. **Check vehicle details before editing**
3. **Upload high-quality images (but within size limits)**
4. **Save changes frequently when editing**
5. **Verify information before deleting**
6. **Use export CSV for data backup**
7. **Contact support if errors persist**

---

## Version Information

- **Documentation Version**: 1.0
- **System Version**: 1.2.4
- **Last Updated**: January 2025
- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: AWS S3

---

*This documentation is maintained as part of the PCN System 2.0. For updates or corrections, please contact the development team.*

