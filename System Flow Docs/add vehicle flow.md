# Add Vehicle Flow Documentation

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
10. [Troubleshooting](#troubleshooting)

---

**Last Updated**: January 3, 2026

---

## 📢 LATEST UPDATE - January 1, 2026 (Performance & Data Sync)

### 🚀 Performance Optimizations & Data Consistency

**Update: Enhanced performance with memoization and better data handling!**

#### Key Improvements:
- Memoized expensive operations using `useMemo` and `useCallback` hooks
- Optimized form state management to reduce re-renders
- Better search performance with debouncing
- Memory leak prevention with proper cleanup

#### Modified Files:
- `dashboard/src/app/(dashboard)/add-vehicle/page.tsx` ✅
- `dashboard/src/components/vehicle/Step1VehicleDetails.tsx` ✅

---

## 📢 PREVIOUS UPDATE - December 29, 2025 (SMS Security Enhancement)

### 🔐 SMS API Security

**Update**: Vehicle acceptance SMS notifications now use secured API endpoints with authentication and rate limiting.

#### Changes:
- SMS endpoint `/api/vehicles/send-sms` is now protected with authentication
- Rate limited to 10 SMS per hour per user
- All SMS messages are template-based (built server-side)
- No arbitrary messages can be sent from client
- API tokens loaded from environment variables only

#### Affected Files:
- `dashboard/src/app/api/vehicles/send-sms/route.ts` - Protected endpoint
- `dashboard/src/lib/vehicle-sms-service.ts` - Client service (sends structured data only)
- `dashboard/src/lib/sms-service.ts` - Server-side templates

---

## Overview

The Add Vehicle flow is a comprehensive 6-step wizard that allows users to add new vehicles to the PCN (Punchi Car Niwasa) inventory system. The system handles both structured data (stored in PostgreSQL/Supabase) and image files (stored in AWS S3).

### Key Features
- **6-Step Wizard Interface**: Guided form with step-by-step progression
- **Real-time Validation**: Field validation and duplicate checking
- **Image Upload**: Multiple image types (Gallery, 360°, CR Papers) via S3
- **Database Integration**: Supabase PostgreSQL for structured data
- **Cloud Storage**: AWS S3 for image storage
- **Master Data Lookup**: Dynamic brand/model/country selection
- **Notification System**: Real-time notifications on vehicle addition
- **SMS Integration**: Secure template-based SMS to seller on vehicle acceptance

### Technology Stack
- **Frontend**: Next.js 14+ (React, TypeScript)
- **Backend API**: Express.js (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Storage**: AWS S3
- **Authentication**: Custom Auth with Session-Based API Protection

---

## Complete Flow Process

### Step-by-Step Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ADD VEHICLE WIZARD                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  STEP 1: Vehicle Details             │
        │  - Vehicle Number (with duplicate     │
        │    check)                              │
        │  - Brand & Model (dynamic lookup)      │
        │  - Year, Country, Body Type           │
        │  - Fuel Type, Transmission             │
        │  - Engine Capacity, Color              │
        │  - Vehicle Images (Gallery)            │
        │  - 360° Images                         │
        │  - CR Papers                           │
        └──────────────┬────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  STEP 2: Seller Details               │
        │  - Title, Name, NIC                    │
        │  - Address, City                       │
        │  - Mobile, Landline, Email            │
        └──────────────┬────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  STEP 3: Vehicle Options              │
        │  - Standard Options (checkboxes)       │
        │  - Special Options (checkboxes)        │
        │  - Custom Options (free text)          │
        └──────────────┬────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  STEP 4: Selling Details              │
        │  - Selling Amount                      │
        │  - Mileage                             │
        │  - Entry Type                          │
        │  - Entry Date                          │
        │  - Status                              │
        └──────────────┬────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  STEP 5: Special Notes                │
        │  - Tag Notes (internal)                │
        │  - Special Note Print                  │
        └──────────────┬────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  STEP 6: Summary & Review              │
        │  - Complete vehicle preview             │
        │  - Edit sections                       │
        │  - Publish Button                       │
        └──────────────┬────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  PUBLISH PROCESS                       │
        │  1. Validate all required fields       │
        │  2. Check for duplicate vehicle number │
        │  3. Remove old sold vehicle (if exists)│
        │  4. Insert Vehicle (Supabase)           │
        │  5. Insert Seller (Supabase)            │
        │  6. Insert Options (Supabase)           │
        │  7. Upload Images (S3)                  │
        │  8. Create Notification                 │
        │  9. Send SMS to Seller                  │
        └──────────────┬────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  STEP 7: Success Screen                │
        │  - Confirmation message                 │
        │  - Vehicle details summary              │
        │  - Navigation options                   │
        └────────────────────────────────────────┘
```

### Step 1: Vehicle Details

**Purpose**: Collect core vehicle information and images

**Fields**:
- **Vehicle Number** (Required)
  - Unique identifier (VIN/Chassis number)
  - Real-time duplicate checking
  - Normalized to uppercase
  - Blocks duplicates in active inventory or pending sales
  - Allows re-adding previously sold vehicles

- **Brand** (Required)
  - Dropdown populated from `vehicle_brands` table
  - Triggers model fetch on selection

- **Model** (Required)
  - Dropdown populated from `vehicle_models` table
  - Filtered by selected brand
  - Includes "Other" option for custom model numbers

- **Model Number Other** (Optional)
  - Free text field
  - Only shown when "Other" model is selected

- **Manufacture Year** (Required)
  - Dropdown: 1980 to current year
  - Reverse chronological order

- **Registered Year** (Optional)
  - Dropdown: 1980 to current year

- **Country** (Required)
  - Dropdown from `countries` table
  - Only active countries shown

- **Body Type** (Required)
  - Options: SUV, Sedan, Hatchback, Wagon, Coupe, Convertible, Van, Truck

- **Fuel Type** (Required)
  - Options: Petrol, Diesel, Petrol + Hybrid, Diesel + Hybrid, EV

- **Transmission** (Required)
  - Options: Auto, Manual

- **Engine Capacity** (Optional)
  - Free text field

- **Exterior Color** (Optional)
  - Free text field

**Image Uploads**:
1. **Vehicle Gallery Images**
   - Multiple images (typically 3-10)
   - Drag & drop support
   - Preview with delete option
   - First image marked as primary

2. **360° Images**
   - Sequential rotation images (12-24 recommended)
   - Equal angle intervals (15° or 30°)
   - Numbered badges show order
   - Used for interactive 360° viewer

3. **CR Papers**
   - Document images (registration, CR book)
   - Multiple files supported

**Validation**:
- Vehicle number duplicate check (debounced)
- Required field validation
- Image file type validation
- File size limits

### Step 2: Seller Details

**Purpose**: Collect seller contact and personal information

**Fields**:
- **Title** (Optional, default: "Mr.")
  - Options: Mr., Miss., Mrs., Dr.

- **First Name** (Required)
- **Last Name** (Required)
- **NIC Number** (Optional)
- **Address** (Optional)
- **City** (Optional)
- **Mobile Number** (Required)
  - Used for SMS notifications
- **Land Phone Number** (Optional)
- **Email Address** (Optional)

**Validation**:
- Required field validation
- Mobile number format validation

### Step 3: Vehicle Options

**Purpose**: Select vehicle features and options

**Standard Options** (Checkboxes):
- A/C, Power Steering, Power Shutters, Central Lock, Remote C/Lock
- 5 Speed, Automatic Gear, Manual Gear
- Digital Meter, Alloy Wheels
- Reverse Camera, Reverse Sensor
- Bluetooth, MP3, USB Port, Touch Display
- Cruise Control, Multi-Function Steering
- Fog Lights, Crystal Light, Full Option
- ABS Brakes, Air Bags, Immobilizer
- Keyless Entry, Push Start, Rear Wiper, Defogger

**Special Options** (Checkboxes):
- 4WD / AWD, Hybrid System, Electric Motor
- Turbo Engine, Sunroof / Moonroof, Roof Rails
- Leather Seats, Heated Seats
- Navigation System (GPS)
- Rear Spoiler, LED Headlights, Projector Headlights
- Smart Key System, Dual Climate Control
- Auto Parking, Blind Spot Monitor, Lane Assist
- Adaptive Cruise Control, 360° Camera
- Power Mirrors, Power Tailgate

**Custom Options** (Free Text):
- Add custom option names
- Multiple custom options supported
- Stored separately in `vehicle_custom_options` table

**Data Storage**:
- Standard/Special options: Linked via `vehicle_options_master` table
- Custom options: Stored directly in `vehicle_custom_options` table

### Step 4: Selling Details

**Purpose**: Define pricing and sale information

**Fields**:
- **Selling Amount** (Required)
  - Formatted currency input
  - Commas automatically added
  - Stored as decimal in database

- **Mileage** (Optional)
  - Formatted number input
  - Commas automatically added
  - Stored as decimal in database

- **Price Category** (Optional)
  - Dropdown from `price_categories` table
  - Used for pricing tiers

- **Entry Type** (Required)
  - Options: PVC Pvt Ltd., PCN Import, Consignment

- **Entry Date** (Required)
  - Date picker
  - Defaults to current date

- **Status** (Required, default: "In Sale")
  - Options: In Sale, Out of Sale, Reserved

**Validation**:
- Selling amount required and must be > 0
- Entry type required
- Date format validation

### Step 5: Special Notes

**Purpose**: Add internal and printable notes

**Fields**:
- **Tag Notes** (Optional)
  - Internal notes for staff
  - Not printed on customer-facing documents
  - Character counter

- **Special Note Print** (Optional)
  - Notes to be printed on documents
  - Visible to customers
  - Character counter

**Validation**:
- Character limit warnings (if applicable)

### Step 6: Summary & Review

**Purpose**: Review all entered data before publishing

**Features**:
- Complete vehicle information display
- All sections shown in organized layout
- Edit buttons for each section
- Navigation back to specific steps
- Publish button with validation

**Validation Before Publish**:
- All required fields checked
- Vehicle number uniqueness verified
- Image uploads validated (if any)
- Database constraints checked

### Step 7: Success Screen

**Purpose**: Confirm successful vehicle addition

**Features**:
- Success message with vehicle details
- Vehicle number, brand, model, year
- Selling amount
- Seller information
- Navigation options:
  - View in Inventory
  - Add Another Vehicle
  - Return to Dashboard

---

## Database Connections

### Database Architecture

The system uses **Supabase (PostgreSQL)** for all structured data storage.

### Main Tables

#### 1. `vehicles` Table
**Purpose**: Core vehicle information

```sql
CREATE TABLE vehicles (
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
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by UUID
);
```

**Constraints**:
- `body_type`: CHECK (IN ('SUV', 'Sedan', 'Hatchback', 'Wagon', 'Coupe', 'Convertible', 'Van', 'Truck'))
- `fuel_type`: CHECK (IN ('Petrol', 'Diesel', 'Petrol Hybrid', 'Diesel Hybrid', 'EV', 'Petrol + Hybrid', 'Diesel + Hybrid'))
- `transmission`: CHECK (IN ('Auto', 'Manual'))
- `status`: CHECK (IN ('In Sale', 'Out of Sale', 'Sold', 'Reserved'))

**Insert Process**:
1. Validate all required fields
2. Check for duplicate vehicle number
3. Remove old sold vehicle (if exists)
4. Insert new vehicle record
5. Return vehicle ID for related records

#### 2. `sellers` Table
**Purpose**: Seller information linked to vehicles

```sql
CREATE TABLE sellers (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  title VARCHAR(10),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  address TEXT,
  city VARCHAR(100),
  nic_number VARCHAR(20),
  mobile_number VARCHAR(20) NOT NULL,
  land_phone_number VARCHAR(20),
  email_address VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Insert Process**:
1. Insert after vehicle creation
2. Link via `vehicle_id` foreign key
3. Auto-generate `full_name` from first + last name

#### 3. `vehicle_options_master` Table
**Purpose**: Master list of available vehicle options

```sql
CREATE TABLE vehicle_options_master (
  id UUID PRIMARY KEY,
  option_name VARCHAR(100) NOT NULL,
  option_type VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  UNIQUE(option_name, option_type)
);
```

**Option Types**:
- `standard`: Standard vehicle features
- `special`: Special/premium features
- `custom`: User-defined custom options

#### 4. `vehicle_options` Table
**Purpose**: Link vehicles to standard/special options

```sql
CREATE TABLE vehicle_options (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  option_id UUID REFERENCES vehicle_options_master(id) ON DELETE CASCADE,
  option_type VARCHAR(20) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  UNIQUE(vehicle_id, option_id)
);
```

**Insert Process**:
1. Lookup option ID from `vehicle_options_master`
2. Insert link record for each selected option
3. Track failed insertions for reporting

#### 5. `vehicle_custom_options` Table
**Purpose**: Store custom/free-text vehicle options

```sql
CREATE TABLE vehicle_custom_options (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  option_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP
);
```

**Insert Process**:
1. Insert directly (no master table lookup)
2. One record per custom option

#### 6. `vehicle_images` Table
**Purpose**: Store image metadata (images stored in S3)

```sql
CREATE TABLE vehicle_images (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(20) NOT NULL DEFAULT 'gallery',
  s3_key TEXT,
  storage_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP
);
```

**Image Types**:
- `gallery`: Regular vehicle photos
- `image_360`: 360° rotation images
- `cr_paper`: CR papers and documents

**Insert Process**:
1. Upload image to S3 (get S3 key and public URL)
2. Insert metadata record with:
   - S3 public URL
   - S3 key (for deletion)
   - Image type
   - Display order
   - Primary flag (first gallery image)

### Master Data Tables

#### `vehicle_brands` Table
- Stores vehicle brand names
- Populated from master data
- Used for dropdown in Step 1

#### `vehicle_models` Table
- Stores vehicle model names
- Linked to brands via `brand_id`
- Filtered by selected brand

#### `countries` Table
- Stores country names
- `is_active` flag for filtering
- Used for country selection

### Database Connection Flow

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Dashboard)                    │
│              Next.js App (Port 3001)                    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Supabase Client SDK
                        │ (createClient)
                        ▼
┌─────────────────────────────────────────────────────────┐
│              SUPABASE (PostgreSQL)                      │
│  - Authentication (Supabase Auth)                      │
│  - Database Queries (PostgREST API)                    │
│  - Real-time Subscriptions                             │
└─────────────────────────────────────────────────────────┘
```

**Connection Details**:
- **Client**: `@supabase/supabase-js`
- **Connection**: Via Supabase REST API
- **Authentication**: JWT tokens from Supabase Auth
- **Query Method**: Supabase client methods (`.from()`, `.select()`, `.insert()`)

**Example Connection**:
```typescript
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

// Fetch brands
const { data: brands } = await supabase
  .from('vehicle_brands')
  .select('*')
  .order('name');

// Insert vehicle
const { data: vehicle, error } = await supabase
  .from('vehicles')
  .insert({ ...vehicleData })
  .select()
  .single();
```

### Transaction Flow

**Publish Process** (Sequential):
1. **Validate** → Client-side validation
2. **Check Duplicate** → Query `vehicles` table
3. **Remove Old Sold** → Delete old sold vehicle (if exists)
4. **Insert Vehicle** → Create vehicle record
5. **Insert Seller** → Create seller record
6. **Insert Options** → Create option links (standard/special)
7. **Insert Custom Options** → Create custom option records
8. **Upload Images** → Upload to S3 (parallel)
9. **Insert Image Metadata** → Create image records (after each upload)
10. **Create Notification** → Insert notification record
11. **Send SMS** → External SMS service call

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

**S3 Client Setup**:
```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
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

**S3 Key Generation**:
```typescript
function generateS3Key(
  vehicleId: string,
  imageType: 'gallery' | 'image_360' | 'cr_paper',
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  let folderName: string;
  switch (imageType) {
    case 'cr_paper': folderName = 'cr_pepar_image'; break;
    case 'image_360': folderName = 'vehicle_360_image'; break;
    case 'gallery': default: folderName = 'vehicle_images'; break;
  }
  
  return `${folderName}/${vehicleId}/${timestamp}-${sanitizedFileName}`;
}
```

### Upload Methods

#### Method 1: Presigned URL Upload (Recommended)

**Flow**:
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Request Presigned URL
       │    POST /api/upload/presigned-url
       │    { vehicleId, imageType, fileName, mimeType }
       ▼
┌─────────────────┐
│  API Server     │
│  (Express.js)   │
└──────┬──────────┘
       │
       │ 2. Generate Presigned URL
       │    AWS SDK: getSignedUrl()
       │
       ▼
┌─────────────────┐
│   AWS S3        │
└─────────────────┘
       │
       │ 3. Return Presigned URL
       │    { presignedUrl, publicUrl, key }
       │
       ▼
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 4. Upload File Directly
       │    PUT {presignedUrl}
       │    Body: File
       │
       ▼
┌─────────────────┐
│   AWS S3        │
│  (Direct Upload)│
└─────────────────┘
       │
       │ 5. Save Metadata
       │    INSERT vehicle_images
       │
       ▼
┌─────────────────┐
│   Supabase      │
│   (PostgreSQL)  │
└─────────────────┘
```

**Advantages**:
- Files upload directly from browser to S3
- No server bandwidth usage
- Faster uploads
- Better scalability

**Implementation**:
```typescript
// Step 1: Get presigned URL
const response = await fetch('/api/upload/presigned-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    vehicleId,
    imageType: 'gallery',
    fileName: file.name,
    mimeType: file.type,
  }),
});

const { presignedUrl, publicUrl, key } = await response.json();

// Step 2: Upload directly to S3
await fetch(presignedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
});

// Step 3: Save metadata to database
await supabase.from('vehicle_images').insert({
  vehicle_id: vehicleId,
  image_url: publicUrl,
  s3_key: key,
  image_type: 'gallery',
  // ... other fields
});
```

#### Method 2: Server-Side Upload (Alternative)

**Flow**:
```
Browser → API Server → AWS S3 → Database
```

**Use Case**: When presigned URLs are not available or for server-side processing

### S3 Upload Process

**During Vehicle Publish**:

1. **Vehicle Created** → Get `vehicleId`
2. **For Each Image Type**:
   - Gallery images
   - 360° images
   - CR papers
3. **For Each File**:
   - Get presigned URL
   - Upload to S3
   - Save metadata to database
4. **Parallel Processing**: All images upload in parallel

**Code Flow**:
```typescript
const uploadImages = async (vehicleId: string) => {
  const uploadPromises: Promise<any>[] = [];

  // Gallery images
  for (let i = 0; i < vehicleImages.length; i++) {
    const file = vehicleImages[i];
    const uploadPromise = (async () => {
      // 1. Get presigned URL
      const { presignedUrl, publicUrl, key } = await getPresignedUrl(...);
      
      // 2. Upload to S3
      await fetch(presignedUrl, { method: 'PUT', body: file });
      
      // 3. Save metadata
      await supabase.from('vehicle_images').insert({...});
    })();
    uploadPromises.push(uploadPromise);
  }

  // Wait for all uploads
  await Promise.all(uploadPromises);
};
```

### S3 Public URLs

**URL Format**:
- **With CloudFront CDN**: `https://cdn.example.com/vehicle_images/{vehicleId}/{filename}`
- **Direct S3 URL**: `https://{bucket}.s3.{region}.amazonaws.com/vehicle_images/{vehicleId}/{filename}`

**URL Generation**:
```typescript
function getS3PublicUrl(key: string): string {
  if (CDN_URL) {
    return `${CDN_URL}/${key}`;
  }
  return `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${key}`;
}
```

### S3 Image Metadata

**Stored in Database**:
- `image_url`: Public URL for displaying images
- `s3_key`: S3 object key for deletion/management
- `storage_path`: Same as `s3_key` (legacy compatibility)
- `file_name`: Original filename
- `file_size`: File size in bytes
- `image_type`: 'gallery', 'image_360', or 'cr_paper'
- `is_primary`: Boolean (first gallery image)
- `display_order`: Integer (for sorting)

### S3 Deletion

**When Vehicle is Deleted**:
1. Fetch all `s3_key` values from `vehicle_images` table
2. Delete objects from S3 using `DeleteObjectsCommand`
3. Delete metadata records from database

**Batch Deletion**:
- S3 supports up to 1000 objects per batch
- System splits into batches if needed

---

## UI Components & Working Details

### Component Structure

```
add-vehicle/
├── page.tsx                    # Main page component
├── components/
│   ├── StepIndicator.tsx       # Progress indicator
│   ├── Step1VehicleDetails.tsx  # Step 1 component
│   ├── Step2SellerDetails.tsx  # Step 2 component
│   ├── Step3VehicleOptions.tsx # Step 3 component
│   ├── Step4SellingDetails.tsx # Step 4 component
│   ├── Step5SpecialNotes.tsx   # Step 5 component
│   ├── Step6Summary.tsx         # Step 6 component
│   └── Step7Success.tsx         # Step 7 component
```

### Step Indicator Component

**Purpose**: Visual progress indicator

**Features**:
- Shows current step (highlighted)
- Shows completed steps (checkmarks)
- Shows upcoming steps (grayed out)
- Clickable steps (jump to any step)

**Implementation**:
```typescript
<StepIndicator 
  currentStep={formState.currentStep} 
  completedSteps={completedSteps} 
/>
```

### Step 1: Vehicle Details Component

**Key Features**:

1. **Vehicle Number Input**:
   - Real-time duplicate checking
   - Debounced validation (500ms delay)
   - Error message display
   - Blocks submission if duplicate found

2. **Brand/Model Dropdowns**:
   - Brand selection triggers model fetch
   - Models filtered by selected brand
   - "Other" option for custom models

3. **Image Upload Sections**:
   - **Gallery Images**:
     - Drag & drop zone
     - File input button
     - Preview grid with delete
     - Multiple file selection
   - **360° Images**:
     - Sequential upload
     - Numbered badges
     - Order preservation
   - **CR Papers**:
     - Document upload
     - Multiple files

**Image Upload Flow**:
```typescript
const handleFileSelect = (files: FileList, type: 'gallery' | 'image_360' | 'cr_paper') => {
  const fileArray = Array.from(files);
  
  // Validate files
  fileArray.forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
  });
  
  // Create previews
  fileArray.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Add to preview array
      setPreviews([...previews, e.target.result]);
    };
    reader.readAsDataURL(file);
  });
  
  // Update form state
  onChange({ [type]: [...existingFiles, ...fileArray] });
};
```

### Step 2: Seller Details Component

**Key Features**:
- Title dropdown (Mr., Miss., Mrs., Dr.)
- Name fields with validation
- Address and city inputs
- Contact information (mobile required)
- Email validation

### Step 3: Vehicle Options Component

**Key Features**:
- **Standard Options**: Grid of checkboxes
- **Special Options**: Grid of checkboxes
- **Custom Options**: 
  - Add button
  - Input field
  - List of added options
  - Remove button for each

**State Management**:
```typescript
const [standardOptions, setStandardOptions] = useState({
  'A/C': false,
  'Power Steering': false,
  // ... all options
});

const toggleOption = (optionName: string) => {
  setStandardOptions(prev => ({
    ...prev,
    [optionName]: !prev[optionName]
  }));
};
```

### Step 4: Selling Details Component

**Key Features**:
- **Selling Amount**: 
  - Currency formatter
  - Auto-adds commas
  - Validates numeric input
- **Mileage**: 
  - Number formatter
  - Optional field
- **Entry Type**: Dropdown
- **Entry Date**: Date picker
- **Status**: Dropdown

### Step 5: Special Notes Component

**Key Features**:
- Two textarea fields
- Character counters
- Optional fields

### Step 6: Summary Component

**Key Features**:
- Complete vehicle information display
- Organized by sections
- Edit buttons for each section
- Publish button with loading state
- Validation before publish

**Display Sections**:
1. Vehicle Information
2. Seller Information
3. Vehicle Options
4. Selling Details
5. Special Notes
6. Images Preview

### Step 7: Success Component

**Key Features**:
- Success animation/icon
- Vehicle details summary
- Navigation buttons:
  - View in Inventory
  - Add Another Vehicle
  - Return to Dashboard

### Form State Management

**State Structure**:
```typescript
interface VehicleFormState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  vehicleDetails: VehicleDetailsData;
  sellerDetails: SellerDetailsData;
  vehicleOptions: VehicleOptionsData;
  sellingDetails: SellingDetailsData;
  specialNotes: SpecialNotesData;
}
```

**State Updates**:
- Each step updates its section
- State persists during navigation
- State cleared on success or cancel

### Navigation Flow

**Forward Navigation**:
- "Next" button validates current step
- Moves to next step
- Marks current step as completed

**Backward Navigation**:
- "Back" button moves to previous step
- No validation required
- State preserved

**Step Jumping**:
- Click step indicator to jump
- Validates before allowing jump
- Preserves all form data

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

**Implementation**:
```typescript
router.post('/presigned-url', async (req, res) => {
  const { vehicleId, imageType, fileName, mimeType } = req.body;
  
  const key = generateS3Key(vehicleId, imageType, fileName);
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });
  
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const publicUrl = getS3PublicUrl(key);
  
  res.json({ success: true, presignedUrl, publicUrl, key });
});
```

#### 2. S3 Status Check

**Endpoint**: `GET /api/upload/status`

**Response**:
```json
{
  "s3Configured": true,
  "message": "AWS S3 is properly configured"
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

1. **Parallel Image Uploads**: All images upload simultaneously
2. **Debounced Validation**: Vehicle number check delayed
3. **Lazy Loading**: Master data loaded on demand
4. **Image Compression**: Client-side compression (if implemented)
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
│  Fill Form → Navigate Steps → Review → Publish             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              CLIENT-SIDE VALIDATION                           │
│  - Required fields check                                     │
│  - Format validation                                         │
│  - Duplicate vehicle number check                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              PUBLISH PROCESS                                 │
│  1. Validate all data                                        │
│  2. Get current user                                          │
│  3. Check for duplicate                                      │
│  4. Remove old sold vehicle (if exists)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐           ┌───────────────────────┐
│  DATABASE     │           │    IMAGE UPLOADS      │
│  (Supabase)   │           │    (AWS S3)           │
└───────┬───────┘           └───────────┬───────────┘
        │                               │
        │ 1. Insert Vehicle             │ 1. Get Presigned URL
        │ 2. Insert Seller              │ 2. Upload to S3
        │ 3. Insert Options              │ 3. Save Metadata
        │ 4. Insert Custom Options       │    (to Database)
        │                               │
        └───────────────┬───────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              POST-PUBLISH ACTIONS                            │
│  1. Create Notification                                      │
│  2. Send SMS to Seller                                       │
│  3. Show Success Screen                                      │
└─────────────────────────────────────────────────────────────┘
```

### State Management Flow

```
Initial State
    │
    ▼
Step 1: Vehicle Details
    │ (user fills form)
    ▼
Step 2: Seller Details
    │ (user fills form)
    ▼
Step 3: Vehicle Options
    │ (user selects options)
    ▼
Step 4: Selling Details
    │ (user fills pricing)
    ▼
Step 5: Special Notes
    │ (user adds notes)
    ▼
Step 6: Summary
    │ (user reviews)
    ▼
    │ (user clicks Publish)
    ▼
Publish Process
    │ (async operations)
    ▼
Step 7: Success
```

---

## Error Handling & Validation

### Client-Side Validation

**Step 1 Validation**:
- Vehicle number: Required, duplicate check
- Brand: Required
- Model: Required
- Manufacture year: Required
- Country: Required
- Body type: Required
- Fuel type: Required
- Transmission: Required

**Step 2 Validation**:
- First name: Required
- Last name: Required
- Mobile number: Required, format validation

**Step 4 Validation**:
- Selling amount: Required, > 0
- Entry type: Required
- Entry date: Required

**Publish Validation**:
- All required fields from all steps
- Vehicle number uniqueness
- Database constraint checks

### Server-Side Validation

**Database Constraints**:
- Foreign key constraints (brand_id, model_id, country_id)
- Unique constraints (vehicle_number)
- CHECK constraints (body_type, fuel_type, transmission, status)
- NOT NULL constraints

**Error Messages**:
- User-friendly messages for each error type
- Field-specific error guidance
- Actionable error resolution steps

### Error Recovery

**Upload Failures**:
- Retry mechanism for failed uploads
- Partial success handling
- Error reporting for failed images

**Database Failures**:
- Transaction rollback (where applicable)
- Error logging
- User notification

---

## API Endpoints

### Upload Endpoints

#### `POST /api/upload/presigned-url`
Generate presigned URL for direct S3 upload

#### `GET /api/upload/status`
Check S3 configuration status

#### `POST /api/upload/upload`
Server-side upload (alternative method)

#### `DELETE /api/upload/delete`
Delete single image from S3

#### `DELETE /api/upload/delete-vehicle/:vehicleId`
Delete all images for a vehicle

#### `GET /api/upload/list/:vehicleId`
List all images for a vehicle

### Database Operations

All database operations use Supabase client directly (no custom API endpoints):
- `.from('vehicles').insert()`
- `.from('sellers').insert()`
- `.from('vehicle_options').insert()`
- `.from('vehicle_images').insert()`

---

## Troubleshooting

### Common Issues

#### 1. Vehicle Number Duplicate Error

**Problem**: Cannot add vehicle with existing number

**Solution**:
- Check if vehicle is sold (can be re-added)
- Remove old sold vehicle record
- Verify vehicle number spelling

#### 2. Image Upload Failures

**Problem**: Images not uploading to S3

**Solutions**:
- Check AWS credentials in environment variables
- Verify S3 bucket name and region
- Check network connectivity
- Verify file size limits (10MB)
- Check file type (images only)

#### 3. Brand/Model Not Loading

**Problem**: Dropdowns empty

**Solutions**:
- Verify master data exists in database
- Check database connection
- Refresh page
- Check browser console for errors

#### 4. Database Insert Errors

**Problem**: Vehicle creation fails

**Solutions**:
- Check all required fields are filled
- Verify foreign key references exist
- Check database constraints
- Review error message for specific field

#### 5. S3 Configuration Errors

**Problem**: S3 not configured

**Solutions**:
- Set environment variables:
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_S3_BUCKET_NAME`
- Restart API server
- Verify AWS credentials are valid

### Debugging Tips

1. **Check Browser Console**: Client-side errors
2. **Check API Logs**: Server-side errors
3. **Check Network Tab**: API request/response details
4. **Check Database**: Verify data insertion
5. **Check S3 Console**: Verify image uploads

### Performance Issues

**Slow Image Uploads**:
- Check internet connection
- Verify S3 region matches user location
- Use CloudFront CDN
- Compress images before upload

**Slow Form Navigation**:
- Check database query performance
- Optimize master data loading
- Reduce image preview sizes

---

## Best Practices

### For Developers

1. **Always validate on both client and server**
2. **Use presigned URLs for S3 uploads**
3. **Handle errors gracefully with user-friendly messages**
4. **Log errors for debugging**
5. **Test with various file sizes and types**
6. **Optimize image uploads (parallel processing)**
7. **Use database transactions where possible**
8. **Implement proper error recovery**

### For Users

1. **Fill all required fields before proceeding**
2. **Check vehicle number for duplicates before submitting**
3. **Upload high-quality images (but within size limits)**
4. **Review summary before publishing**
5. **Save work frequently (form state persists)**
6. **Contact support if errors persist**

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

