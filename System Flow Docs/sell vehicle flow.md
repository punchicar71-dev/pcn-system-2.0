# Sell Vehicle Flow Documentation

## Table of Contents
1. [Overview](#overview)
2. [Complete Flow Process](#complete-flow-process)
3. [Customer Data Handling](#customer-data-handling)
4. [Vehicle Selection Process](#vehicle-selection-process)
5. [Data Set Functions & Storage](#data-set-functions--storage)
6. [Database Connections](#database-connections)
7. [UI Components & Working Details](#ui-components--working-details)
8. [Vehicle Locking System](#vehicle-locking-system)
9. [Technical Implementation](#technical-implementation)
10. [Error Handling & Validation](#error-handling--validation)
11. [API Endpoints](#api-endpoints)
12. [SMS Integration](#sms-integration)
13. [Troubleshooting](#troubleshooting)

---

## Overview

The Sell Vehicle flow is a comprehensive 3-step wizard that allows users to record vehicle sales transactions in the PCN (Punchi Car Niwasa) system. The system handles customer information, vehicle selection from inventory, selling details, payment information, and sales agent assignment.

### Key Features
- **3-Step Wizard Interface**: Guided form with step-by-step progression
- **Customer Data Management**: Complete customer information collection and storage
- **Vehicle Search & Selection**: Real-time vehicle search from inventory
- **Vehicle Locking**: Prevents concurrent edits/sales by multiple users
- **Payment Options**: Support for Cash and Leasing payment types
- **Sales Agent Assignment**: In-house and third-party agent tracking
- **Database Integration**: Supabase PostgreSQL for structured data
- **SMS Integration**: Automatic SMS notifications to original vehicle seller
- **Notification System**: Real-time notifications for sales transactions
- **Vehicle Snapshot**: Preserves vehicle information at time of sale

### Technology Stack
- **Frontend**: Next.js 14+ (React, TypeScript)
- **Backend API**: Express.js (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom Auth (Migration to Better Auth in progress)
- **Real-time**: Supabase Realtime subscriptions

---

## Complete Flow Process

### Step-by-Step Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  SELL VEHICLE WIZARD                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  STEP 1: Customer Details             │
        │  - Title (Mr./Miss./Mrs./Dr.)          │
        │  - First Name & Last Name              │
        │  - Address & City                      │
        │  - NIC Number                          │
        │  - Mobile Number (Required)             │
        │  - Land Phone Number                   │
        │  - Email Address                       │
        │                                        │
        │  State Management: customerData        │
        └──────────────┬────────────────────────┘
                        │
                        ▼ (Next Button)
        ┌───────────────────────────────────────┐
        │  STEP 2: Selling Information          │
        │  - Search Vehicle (Real-time search)   │
        │  - Select Vehicle from Inventory       │
        │  - Vehicle Details Display             │
        │  - Selling Amount (Required)           │
        │  - Advance Amount                      │
        │  - To Pay Amount (Auto-calculated)     │
        │  - Payment Method (Cash/Leasing)       │
        │  - Leasing Company (if Leasing)        │
        │  - Office Sales Agent                  │
        │  - Vehicle Showroom Agent              │
        │                                        │
        │  State Management: sellingData         │
        │  Vehicle Locking: Active on Step 2     │
        └──────────────┬────────────────────────┘
                        │
                        ▼ (Sell Vehicle Button)
        ┌───────────────────────────────────────┐
        │  SUBMIT PROCESS                        │
        │  1. Acquire Vehicle Lock               │
        │  2. Fetch Sales Agent Name (if needed) │
        │  3. Build Sale Data Object             │
        │  4. Add Vehicle Snapshot (if available)│
        │  5. Insert to pending_vehicle_sales    │
        │  6. Update Vehicle Status to           │
        │     'Pending Sale'                     │
        │  7. Create Notification                │
        │  8. Send SMS to Original Seller        │
        │  9. Release Vehicle Lock               │
        └──────────────┬────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  STEP 3: Confirmation Screen           │
        │  - Success Message                     │
        │  - Vehicle Details Summary             │
        │  - Print Document Button               │
        │  - Pending List Button                 │
        └────────────────────────────────────────┘
```

---

## Customer Data Handling

### Customer Data Structure

The customer data is managed in the `SellVehiclePage` component using React state:

```typescript
const [customerData, setCustomerData] = useState({
  title: 'Mr.',              // Default title
  firstName: '',             // Required
  lastName: '',              // Required
  address: '',               // Optional
  city: '',                  // Optional
  nicNumber: '',             // Optional
  mobileNumber: '',          // Required
  landPhoneNumber: '',       // Optional
  emailAddress: '',          // Optional
});
```

### Customer Data Fields

#### 1. **Title** (Optional, Default: "Mr.")
- **Options**: Mr., Miss., Mrs., Dr.
- **Storage**: Stored in `customer_title` column in `pending_vehicle_sales` table
- **Component**: Dropdown button with chevron icon
- **Implementation**: `CustomerDetails.tsx` uses a custom dropdown overlay

#### 2. **First Name** (Required)
- **Storage**: Stored in `customer_first_name` column
- **Validation**: Required field validation
- **Component**: Text input field

#### 3. **Last Name** (Required)
- **Storage**: Stored in `customer_last_name` column
- **Validation**: Required field validation
- **Component**: Text input field

#### 4. **Address** (Optional)
- **Storage**: Stored in `customer_address` column (nullable)
- **Component**: Text input field

#### 5. **City** (Optional)
- **Storage**: Stored in `customer_city` column (nullable)
- **Label**: Displayed as "Town" in UI
- **Component**: Text input field

#### 6. **NIC Number** (Optional)
- **Storage**: Stored in `customer_nic` column (nullable)
- **Component**: Text input field with placeholder "Ex: 8748909230V"

#### 7. **Mobile Number** (Required)
- **Storage**: Stored in `customer_mobile` column
- **Validation**: Required field validation
- **Component**: Tel input field with placeholder "+94"
- **Usage**: Primary contact method

#### 8. **Land Phone Number** (Optional)
- **Storage**: Stored in `customer_landphone` column (nullable)
- **Component**: Tel input field with placeholder "+94"

#### 9. **Email Address** (Optional)
- **Storage**: Stored in `customer_email` column (nullable)
- **Validation**: Email format validation (browser-level)
- **Component**: Email input field with placeholder "Ex: john.doe@gmail.com"

### Customer Data Change Handler

```typescript
const handleCustomerDataChange = (field: string, value: string) => {
  setCustomerData((prev) => ({ ...prev, [field]: value }));
};
```

**Function**: Updates specific field in customer data state
- **Parameters**: `field` (string), `value` (string)
- **Behavior**: Uses functional update to merge changes with previous state
- **Usage**: Called from `CustomerDetails` component via `onChange` prop

### Customer Data Storage Flow

1. **State Management**: Customer data stored in React state during Step 1
2. **Step Transition**: Data persists when moving to Step 2
3. **Submit Process**: Customer data merged into sale data object during submission
4. **Database Insert**: Customer fields inserted into `pending_vehicle_sales` table

### Customer Data Mapping to Database

```typescript
const saleData = {
  customer_title: customerData.title || 'Mr.',
  customer_first_name: customerData.firstName,
  customer_last_name: customerData.lastName,
  customer_address: customerData.address || null,
  customer_city: customerData.city || null,
  customer_nic: customerData.nicNumber || null,
  customer_mobile: customerData.mobileNumber,
  customer_landphone: customerData.landPhoneNumber || null,
  customer_email: customerData.emailAddress || null,
};
```

---

## Vehicle Selection Process

### Vehicle Selection State

The vehicle selection is managed as part of the selling data state:

```typescript
const [sellingData, setSellingData] = useState({
  searchVehicle: '',              // Search input value
  selectedVehicle: null as any,   // Selected vehicle object
  sellingAmount: '',
  advanceAmount: '',
  paymentType: '',
  leasingCompany: '',
  inHouseSalesAgent: '',
  thirdPartySalesAgent: '',
});
```

### Vehicle Search Implementation

#### 1. **Search Input Component**
- **Location**: `SellingInfo.tsx`
- **Type**: Text input with search icon
- **Placeholder**: "Search by Vehicle Number (min 2 chars)"
- **Minimum Characters**: 2 characters required before search triggers
- **Debouncing**: 300ms debounce to reduce API calls

#### 2. **Server-Side Search Query**

```typescript
const searchVehicles = useCallback(async (searchTerm: string, requestId: number) => {
  if (!searchTerm || searchTerm.length < 2) {
    setFilteredVehicles([]);
    setShowDropdown(false);
    return;
  }

  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('vehicle_inventory_view')
    .select('id, vehicle_number, brand_name, model_name, manufacture_year, selling_amount, status')
    .eq('status', 'In Sale')  // Only show vehicles available for sale
    .ilike('vehicle_number', `%${searchTerm}%`)  // Case-insensitive search
    .order('vehicle_number', { ascending: true })
    .limit(10);  // Limit results for performance

  setFilteredVehicles(data || []);
  setShowDropdown(true);
}, []);
```

**Key Features**:
- **Source Table**: `vehicle_inventory_view` (optimized view for inventory)
- **Status Filter**: Only vehicles with status 'In Sale'
- **Search Method**: `ILIKE` for case-insensitive pattern matching
- **Result Limit**: Maximum 10 results
- **Race Condition Prevention**: Uses request ID to ignore stale responses

#### 3. **Search Dropdown Display**

- **Trigger**: Shows when search results are available
- **Position**: Absolute positioning below search input
- **Styling**: White background, border, shadow, max-height with scroll
- **Items**: Each vehicle shows:
  - Vehicle Number (bold)
  - Brand, Model, Year (secondary text)
- **Interaction**: Click to select vehicle

#### 4. **Vehicle Selection Handler**

```typescript
const handleVehicleSelect = async (vehicle: any) => {
  try {
    setIsSelectingVehicle(true);
    setShowDropdown(false);
    
    const supabase = createClient();
    
    // Fetch vehicle images and seller details in parallel
    const [imagesResult, sellerResult] = await Promise.all([
      supabase
        .from('vehicle_images')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .eq('image_type', 'gallery')
        .order('display_order', { ascending: true }),
      supabase
        .from('sellers')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .maybeSingle()
    ]);

    const images = imagesResult.data;
    const seller = sellerResult.data;

    // Combine all data into complete vehicle object
    const completeVehicleData = {
      ...vehicle,
      images: images || [],
      seller_name: seller ? `${seller.title || ''} ${seller.first_name} ${seller.last_name}`.trim() : 'N/A',
      seller_mobile: seller?.mobile_number || 'N/A',
      seller_address: seller?.address || '',
      seller_city: seller?.city || '',
    };

    onChange('selectedVehicle', completeVehicleData);
    onChange('searchVehicle', vehicle.vehicle_number);
  } catch (error) {
    console.error('Error selecting vehicle:', error);
  } finally {
    setIsSelectingVehicle(false);
  }
};
```

**Process**:
1. **Hide Dropdown**: Immediately hide search dropdown for better UX
2. **Fetch Images**: Get gallery images for selected vehicle
3. **Fetch Seller**: Get original seller information (who gave vehicle to showroom)
4. **Combine Data**: Merge vehicle, images, and seller data into single object
5. **Update State**: Set selected vehicle and search input value

#### 5. **Vehicle Details Display**

When a vehicle is selected, a card displays on the right side showing:

- **Vehicle Image**: First gallery image (or placeholder if none)
- **Vehicle Information**: Brand, Model, Year, Vehicle Number
- **Seller Details Card**:
  - Seller Name (formatted: Title FirstName LastName)
  - Seller Address (if available)
  - Seller City (if available)
  - Seller Mobile Number

**Component Structure**:
```typescript
{formData.selectedVehicle ? (
  <div className="bg-gray-100 rounded-lg p-4 sticky top-32">
    {/* Vehicle Image */}
    {formData.selectedVehicle.images?.[0]?.image_url && (
      <Image src={...} alt={...} />
    )}
    
    {/* Brand, Model, Year : Vehicle Number */}
    <div>...</div>
    
    {/* Seller Details */}
    <div className="bg-white p-4 rounded-md">
      <p>Name: {seller_name}</p>
      <p>Address: {seller_address}</p>
      <p>City: {seller_city}</p>
      <p>Mobile: {seller_mobile}</p>
    </div>
  </div>
) : (
  // Empty state with search icon
)}
```

#### 6. **Vehicle Search States**

- **Initial State**: Empty, shows placeholder card
- **Searching**: Shows loading spinner
- **Results Found**: Shows dropdown with matching vehicles
- **No Results**: Shows "No vehicles found" message
- **Vehicle Selected**: Shows complete vehicle details card

---

## Data Set Functions & Storage

### Selling Data State Management

```typescript
const [sellingData, setSellingData] = useState({
  searchVehicle: '',
  selectedVehicle: null as any,
  sellingAmount: '',
  advanceAmount: '',
  paymentType: '',
  leasingCompany: '',
  inHouseSalesAgent: '',
  thirdPartySalesAgent: '',
});
```

### Selling Data Change Handler

```typescript
const handleSellingDataChange = (field: string, value: any) => {
  setSellingData((prev) => ({ ...prev, [field]: value }));
};
```

**Function**: Updates specific field in selling data state
- **Parameters**: `field` (string), `value` (any)
- **Behavior**: Merges new value into existing state
- **Usage**: Called from `SellingInfo` component via `onChange` prop

### Selling Data Fields & Storage

#### 1. **Search Vehicle** (`searchVehicle`)
- **Type**: String
- **Purpose**: User input for vehicle search
- **Storage**: Not stored in database (transient state)
- **Sync**: Updated to vehicle number when vehicle is selected

#### 2. **Selected Vehicle** (`selectedVehicle`)
- **Type**: Object (complete vehicle data with images and seller)
- **Purpose**: Currently selected vehicle for sale
- **Storage**: Not stored directly (used to extract vehicle_id)
- **Structure**:
  ```typescript
  {
    id: string,
    vehicle_number: string,
    brand_name: string,
    model_name: string,
    manufacture_year: number,
    selling_amount: number,
    status: string,
    images: Array<{image_url: string, ...}>,
    seller_name: string,
    seller_mobile: string,
    seller_address: string,
    seller_city: string,
  }
  ```

#### 3. **Selling Amount** (`sellingAmount`)
- **Type**: String (numeric input)
- **Purpose**: Total selling price of vehicle
- **Storage**: `selling_amount` (DECIMAL) in `pending_vehicle_sales`
- **Validation**: Required, must be > 0
- **Conversion**: `parseFloat(sellingAmount)` on submit

#### 4. **Advance Amount** (`advanceAmount`)
- **Type**: String (numeric input)
- **Purpose**: Down payment or advance payment received
- **Storage**: `advance_amount` (DECIMAL) in `pending_vehicle_sales`
- **Validation**: Optional
- **Default**: 0 if not provided
- **Conversion**: `parseFloat(advanceAmount) || 0` on submit

#### 5. **To Pay Amount** (Calculated Field)
- **Type**: Calculated (not stored separately)
- **Formula**: `Selling Amount - Advance Amount`
- **Display**: Shown in blue highlight box on Step 2
- **Purpose**: Shows remaining balance to be paid

#### 6. **Payment Type** (`paymentType`)
- **Type**: String (select dropdown)
- **Options**: "Cash", "Leasing"
- **Storage**: `payment_type` (VARCHAR) in `pending_vehicle_sales`
- **Validation**: Required
- **Impact**: Shows/hides Leasing Company field

#### 7. **Leasing Company** (`leasingCompany`)
- **Type**: String (UUID of leasing company)
- **Purpose**: Leasing company ID when payment type is "Leasing"
- **Storage**: `leasing_company_id` (UUID) in `pending_vehicle_sales`
- **Source**: Fetched from `leasing_companies` table
- **Filter**: Only active companies (`is_active = true`)
- **Validation**: Required when payment type is "Leasing"

#### 8. **In-House Sales Agent** (`inHouseSalesAgent`)
- **Type**: String (UUID of sales agent)
- **Purpose**: Office sales agent handling the sale
- **Storage**: `sales_agent_id` (UUID) in `pending_vehicle_sales`
- **Source**: Fetched from `sales_agents` table
- **Filter**: Only agents with `agent_type = 'Office Sales Agent'` and `is_active = true`
- **Validation**: Optional

#### 9. **Third-Party Sales Agent** (`thirdPartySalesAgent`)
- **Type**: String (UUID of sales agent)
- **Purpose**: Vehicle showroom agent (third-party)
- **Storage**: `third_party_agent` (TEXT - agent name) in `pending_vehicle_sales`
- **Source**: Fetched from `sales_agents` table
- **Filter**: Only agents with `agent_type = 'Vehicle Showroom Agent'` and `is_active = true`
- **Processing**: Agent ID converted to agent name before storage
- **Validation**: Optional

### Master Data Fetching

On component mount, `SellingInfo` fetches master data:

```typescript
useEffect(() => {
  const fetchInitialData = async () => {
    const supabase = createClient();
    
    // Fetch sales agents and leasing companies in parallel
    const [agentsResult, companiesResult] = await Promise.all([
      supabase
        .from('sales_agents')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase
        .from('leasing_companies')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
    ]);

    setSalesAgents(agentsResult.data || []);
    setLeasingCompanies(companiesResult.data || []);
  };

  fetchInitialData();
}, []);
```

**Tables Fetched**:
- `sales_agents`: All active sales agents
- `leasing_companies`: All active leasing companies

---

## Database Connections

### Database Architecture

The system uses **Supabase (PostgreSQL)** for all structured data storage.

### Main Tables Used

#### 1. `pending_vehicle_sales` Table

**Purpose**: Stores pending sales transactions

```sql
CREATE TABLE pending_vehicle_sales (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  
  -- Vehicle Snapshot (preserves vehicle info at time of sale)
  vehicle_number VARCHAR(50),
  brand_name VARCHAR(100),
  model_name VARCHAR(100),
  manufacture_year INTEGER,
  
  -- Customer Information
  customer_title VARCHAR(10),
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100) NOT NULL,
  customer_address TEXT,
  customer_city VARCHAR(100),
  customer_nic VARCHAR(50),
  customer_mobile VARCHAR(20) NOT NULL,
  customer_landphone VARCHAR(20),
  customer_email VARCHAR(255),
  
  -- Sale Details
  selling_amount DECIMAL(12, 2) NOT NULL,
  advance_amount DECIMAL(12, 2) DEFAULT 0,
  payment_type VARCHAR(50) NOT NULL,
  leasing_company_id UUID REFERENCES leasing_companies(id),
  sales_agent_id UUID REFERENCES sales_agents(id),
  third_party_agent TEXT,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);
```

**Key Constraints**:
- `payment_type`: CHECK (IN ('Cash', 'Leasing', 'Bank Transfer', 'Check'))
- `status`: CHECK (IN ('pending', 'sold'))
- `customer_title`: CHECK (IN ('Mr.', 'Miss.', 'Mrs.', 'Dr.'))

**Indexes**:
- `idx_pending_vehicle_sales_vehicle_number` on `vehicle_number`
- `idx_pending_vehicle_sales_brand_name` on `brand_name`
- `idx_pending_vehicle_sales_customer_title` on `customer_title`
- `idx_pending_vehicle_sales_leasing_company` on `leasing_company_id`

#### 2. `vehicles` Table

**Purpose**: Vehicle inventory (source for vehicle selection)

**Key Columns Used**:
- `id`: Vehicle ID
- `vehicle_number`: Vehicle number for search
- `status`: Must be 'In Sale' for selection
- Updated to 'Pending Sale' after sale submission

#### 3. `vehicle_images` Table

**Purpose**: Vehicle gallery images

**Query Used**:
```typescript
supabase
  .from('vehicle_images')
  .select('*')
  .eq('vehicle_id', vehicle.id)
  .eq('image_type', 'gallery')
  .order('display_order', { ascending: true })
```

#### 4. `sellers` Table

**Purpose**: Original vehicle seller information

**Query Used**:
```typescript
supabase
  .from('sellers')
  .select('*')
  .eq('vehicle_id', vehicle.id)
  .maybeSingle()
```

**Usage**: Displays original seller info in vehicle details card, used for SMS notification

#### 5. `sales_agents` Table

**Purpose**: Sales agent master data

**Query Used**:
```typescript
supabase
  .from('sales_agents')
  .select('*')
  .eq('is_active', true)
  .order('name', { ascending: true })
```

**Filtering**: By `agent_type` ('Office Sales Agent' vs 'Vehicle Showroom Agent')

#### 6. `leasing_companies` Table

**Purpose**: Leasing company master data

**Query Used**:
```typescript
supabase
  .from('leasing_companies')
  .select('*')
  .eq('is_active', true)
  .order('name', { ascending: true })
```

#### 7. `vehicle_inventory_view` View

**Purpose**: Optimized view for vehicle search

**Columns Used**:
- `id`, `vehicle_number`, `brand_name`, `model_name`, `manufacture_year`, `selling_amount`, `status`

**Filter**: `status = 'In Sale'`

#### 8. `vehicle_locks` Table

**Purpose**: Vehicle locking to prevent concurrent edits

**Structure**:
```sql
CREATE TABLE vehicle_locks (
  id UUID PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  locked_by_user_id UUID NOT NULL,
  locked_by_name TEXT NOT NULL,
  lock_type TEXT NOT NULL CHECK (lock_type IN ('editing', 'selling', 'moving_to_soldout')),
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(vehicle_id)
);
```

#### 9. `notifications` Table

**Purpose**: System notifications

**Usage**: Creates notification when vehicle moved to sales

---

## UI Components & Working Details

### Component Structure

```
SellVehiclePage (Main Container)
├── SellVehicleStepIndicator (Step Progress)
├── VehicleLockWarning (Conditional - if locked)
├── CustomerDetails (Step 1)
├── SellingInfo (Step 2)
│   ├── Vehicle Search Input
│   ├── Vehicle Search Dropdown
│   ├── Selling Form Fields
│   └── Vehicle Details Card
└── Confirmation (Step 3)
    ├── Success Message
    ├── Print Document Button
    └── Pending List Button
```

### Step Indicator Component

**Component**: `SellVehicleStepIndicator.tsx`

**Props**:
- `currentStep`: 1 | 2 | 3
- `completedSteps`: number[]

**Visual States**:
- **Current Step**: Green background, white text, step number
- **Completed Step**: Green background, white text, checkmark (✓)
- **Upcoming Step**: Gray background, gray text, step number

**Steps**:
1. Details (Customer Details)
2. Selling Info (Vehicle Selection & Sale Details)
3. Confirmation (Success Screen)

### Step 1: Customer Details Component

**Component**: `CustomerDetails.tsx`

**Layout**: Two-column form layout (responsive)

**Fields**:
- Title dropdown + First Name (combined row)
- Last Name
- Address (full width)
- City + NIC Number (two columns)
- Mobile Number + Land Phone Number (two columns)
- Email Address (full width)

**Navigation**: "Next" button to proceed to Step 2

**Validation**: 
- First Name: Required
- Last Name: Required
- Mobile Number: Required
- Email: Browser validation (email format)

### Step 2: Selling Info Component

**Component**: `SellingInfo.tsx`

**Layout**: Two-column layout
- **Left Column**: Form fields (width: 500px)
- **Right Column**: Vehicle details card (width: 400px, sticky)

**Form Fields** (Left Column):
1. **Search Vehicle**: Text input with search icon, dropdown results
2. **Selling Amount**: Number input, required
3. **Advance Amount**: Number input, optional
4. **To Pay Amount**: Calculated display (blue highlight box)
5. **Payment Method**: Select dropdown (Cash/Leasing), required
6. **Leasing Company**: Select dropdown (conditional, shown when Leasing selected)
7. **Office Sales Agent**: Select dropdown, optional
8. **Vehicle Showroom Agent**: Select dropdown, optional

**Vehicle Details Card** (Right Column):
- Shows when vehicle is selected
- Vehicle image (first gallery image or placeholder)
- Vehicle information (Brand Model Year : Vehicle Number)
- Seller details card with white background

**Navigation**: 
- "Back" button (outline style) to return to Step 1
- "Sell Vehicle" button (primary style) to submit

**Loading States**:
- Search input: Spinner icon while searching
- Vehicle selection: Full card loading state
- Submit button: Spinner with "Processing..." text

### Step 3: Confirmation Component

**Component**: `Confirmation.tsx`

**Layout**: Centered content with success icon

**Elements**:
- Large green checkmark circle (success icon)
- Vehicle details heading (Brand Model Year - Vehicle Number)
- Success message: "Vehicle Selling conformation successful"
- Two action buttons:
  - "Print Document" (outline button)
  - "Pending List" (primary button, navigates to /sales-transactions)

**Modal Integration**: 
- `PrintDocumentModal` component for document printing

---

## Vehicle Locking System

### Purpose

Prevents multiple users from simultaneously editing or selling the same vehicle, avoiding data conflicts and race conditions.

### Implementation

**Hook**: `useVehicleLock`

**Usage in Sell Vehicle Flow**:
```typescript
const { isLocked, lockedBy, hasMyLock, acquireLock, releaseLock } = useVehicleLock(
  sellingData.selectedVehicle?.id || null,
  'selling',
  currentStep === 2 // Only enable locking on step 2
);
```

**Parameters**:
- `vehicleId`: Vehicle ID to lock (null if no vehicle selected)
- `lockType`: 'selling' (operation type)
- `enabled`: Only enabled on Step 2 (selling info step)

### Lock Acquisition

**When**: Automatically when vehicle is selected on Step 2

```typescript
useEffect(() => {
  if (sellingData.selectedVehicle?.id && currentStep === 2) {
    acquireLock();
  }
}, [sellingData.selectedVehicle?.id, currentStep, acquireLock]);
```

**Process**:
1. Check if user is authenticated
2. Attempt to create lock record in `vehicle_locks` table
3. Lock expires after set duration (prevents stale locks)
4. If lock exists, show warning and disable form

### Lock States

- **isLocked**: Boolean - Vehicle is locked by another user
- **lockedBy**: String - Name of user who has the lock
- **hasMyLock**: Boolean - Current user has the lock
- **isFormDisabled**: `isLocked && !hasMyLock` - Form should be disabled

### Lock Warning Component

**Component**: `VehicleLockWarning`

**Display**: Shows when `isFormDisabled === true` on Step 2

**Content**: 
- Warning message
- Name of user who has the lock
- Instruction that form is disabled

### Lock Release

**When**: After successful sale submission

```typescript
// Release lock after successful sale
if (sellingData.selectedVehicle?.id) {
  await releaseLock();
}
```

**Also Released**: Automatically on component unmount or when vehicle changes

### Lock Expiration

Locks have expiration timestamps to prevent stale locks from blocking vehicles indefinitely. Expired locks are automatically cleaned up.

---

## Technical Implementation

### Submit Sale Process

**Function**: `handleSubmitSale` in `SellVehiclePage`

**Complete Flow**:

```typescript
const handleSubmitSale = async () => {
  setIsSubmitting(true);
  try {
    const supabase = createClient();
    
    // 1. Fetch showroom agent name if third-party agent selected
    let showroomAgentName = null;
    if (sellingData.thirdPartySalesAgent) {
      const { data: agentData } = await supabase
        .from('sales_agents')
        .select('name')
        .eq('id', sellingData.thirdPartySalesAgent)
        .single();
      
      if (agentData) {
        showroomAgentName = agentData.name;
      }
    }
    
    // 2. Build sale data object
    const saleData: Record<string, any> = {
      vehicle_id: sellingData.selectedVehicle?.id,
      customer_title: customerData.title || 'Mr.',
      customer_first_name: customerData.firstName,
      customer_last_name: customerData.lastName,
      customer_address: customerData.address || null,
      customer_city: customerData.city || null,
      customer_nic: customerData.nicNumber || null,
      customer_mobile: customerData.mobileNumber,
      customer_landphone: customerData.landPhoneNumber || null,
      customer_email: customerData.emailAddress || null,
      selling_amount: parseFloat(sellingData.sellingAmount),
      advance_amount: sellingData.advanceAmount ? parseFloat(sellingData.advanceAmount) : 0,
      payment_type: sellingData.paymentType,
      leasing_company_id: sellingData.leasingCompany || null,
      sales_agent_id: sellingData.inHouseSalesAgent || null,
      third_party_agent: showroomAgentName || null,
      status: 'pending',
    };
    
    // 3. Add vehicle snapshot fields (if columns exist)
    try {
      const testQuery = await supabase
        .from('pending_vehicle_sales')
        .select('vehicle_number')
        .limit(0);
      
      if (!testQuery.error) {
        saleData.vehicle_number = sellingData.selectedVehicle?.vehicle_number || null;
        saleData.brand_name = sellingData.selectedVehicle?.brand_name || null;
        saleData.model_name = sellingData.selectedVehicle?.model_name || null;
        saleData.manufacture_year = sellingData.selectedVehicle?.manufacture_year || null;
      }
    } catch (e) {
      // Columns don't exist, skip snapshot fields
      console.log('Vehicle snapshot columns not available');
    }

    // 4. Insert into pending_vehicle_sales table
    const { data, error } = await supabase
      .from('pending_vehicle_sales')
      .insert([saleData])
      .select()
      .single();

    if (error) {
      console.error('Error creating sale:', error);
      alert('Failed to create sale: ' + error.message);
      return;
    }

    // 5. Store created sale ID
    if (data && data.id) {
      setCreatedSaleId(data.id);
    }

    // 6. Update vehicle status to 'Pending Sale'
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ status: 'Pending Sale' })
      .eq('id', sellingData.selectedVehicle?.id);

    if (updateError) {
      console.error('Error updating vehicle status:', updateError);
      // Continue anyway - sale was recorded
    }

    // 7. Create notification
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .eq('auth_id', session.user.id)
          .single()

        if (userData) {
          const userName = `${userData.first_name} ${userData.last_name}`
          const vehicleInfo = `${sellingData.selectedVehicle.brand_name} ${sellingData.selectedVehicle.model_name} (${sellingData.selectedVehicle.vehicle_number})`

          await supabase.from('notifications').insert({
            user_id: userData.id,
            type: 'moved_to_sales',
            title: 'Moved to Sales',
            message: `${userName} moved ${vehicleInfo} to the Selling Process — now listed in Sales Transactions (Pending).`,
            vehicle_number: sellingData.selectedVehicle.vehicle_number,
            vehicle_brand: sellingData.selectedVehicle.brand_name,
            vehicle_model: sellingData.selectedVehicle.model_name,
            is_read: false
          })
        }
      }
    } catch (notifError) {
      console.error('Failed to create notification:', notifError)
      // Don't block sale if notification fails
    }

    // 8. Send SMS to original vehicle seller
    try {
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('title, first_name, last_name, mobile_number')
        .eq('vehicle_id', sellingData.selectedVehicle.id)
        .single();

      if (!sellerError && sellerData && sellerData.mobile_number) {
        const smsResult = await sendSellVehicleConfirmationSMS({
          seller: {
            title: sellerData.title || 'Mr.',
            firstName: sellerData.first_name,
            lastName: sellerData.last_name,
            mobileNumber: sellerData.mobile_number,
          },
          vehicle: {
            vehicleNumber: sellingData.selectedVehicle.vehicle_number,
            brand: sellingData.selectedVehicle.brand_name,
            model: sellingData.selectedVehicle.model_name,
            year: sellingData.selectedVehicle.manufacture_year,
          },
          sellingPrice: parseFloat(sellingData.sellingAmount),
        });
        // SMS failure doesn't block sale confirmation
      }
    } catch (smsError) {
      console.error('SMS error occurred:', smsError);
      // Continue with sale confirmation
    }

    // 9. Release vehicle lock
    if (sellingData.selectedVehicle?.id) {
      await releaseLock();
    }

    // 10. Move to confirmation step
    setCompletedSteps([1, 2]);
    setCurrentStep(3);
  } catch (error) {
    console.error('Error creating sale:', error);
    alert('An error occurred. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

### State Management Flow

**Step Transitions**:
1. **Step 1 → Step 2**: `handleNextFromCustomerDetails`
   - Sets `completedSteps` to `[1]`
   - Sets `currentStep` to `2`

2. **Step 2 → Step 1**: `handleBackFromSellingInfo`
   - Sets `currentStep` to `1`
   - Customer data preserved in state

3. **Step 2 → Step 3**: `handleSubmitSale`
   - Submits sale data
   - Sets `completedSteps` to `[1, 2]`
   - Sets `currentStep` to `3`

**State Persistence**:
- Customer data persists across step navigation
- Selling data persists across step navigation
- Selected vehicle data persists until sale is completed

---

## Error Handling & Validation

### Form Validation

#### Customer Details (Step 1)
- **First Name**: Required
- **Last Name**: Required
- **Mobile Number**: Required
- **Email**: Browser-level email format validation

#### Selling Info (Step 2)
- **Vehicle Selection**: Required (button disabled if no vehicle selected)
- **Selling Amount**: Required, must be valid number
- **Payment Method**: Required
- **Leasing Company**: Required when Payment Method is "Leasing"

### Error Handling Strategy

1. **Database Errors**: 
   - Display user-friendly error message
   - Log detailed error to console
   - Don't proceed to next step

2. **Vehicle Search Errors**:
   - Log error to console
   - Show empty results
   - Don't block user interaction

3. **Vehicle Selection Errors**:
   - Log error to console
   - Reset selection state
   - Allow user to search again

4. **Notification Errors**:
   - Log error to console
   - Don't block sale submission
   - Sale continues even if notification fails

5. **SMS Errors**:
   - Log error to console
   - Don't block sale submission
   - Sale continues even if SMS fails

6. **Vehicle Status Update Errors**:
   - Log error to console
   - Don't block sale submission
   - Sale record is created even if status update fails

### Validation Messages

- **Required Fields**: Red asterisk (*) next to field label
- **Form Submission**: Button disabled until required fields are filled
- **Search Validation**: "Type at least 2 characters" hint in search input
- **Lock Warning**: Warning banner when vehicle is locked by another user

---

## API Endpoints

### Supabase Client Methods

All database operations use Supabase client methods (no separate REST API):

#### 1. Vehicle Search
```typescript
supabase
  .from('vehicle_inventory_view')
  .select('id, vehicle_number, brand_name, model_name, manufacture_year, selling_amount, status')
  .eq('status', 'In Sale')
  .ilike('vehicle_number', `%${searchTerm}%`)
  .order('vehicle_number', { ascending: true })
  .limit(10)
```

#### 2. Fetch Vehicle Images
```typescript
supabase
  .from('vehicle_images')
  .select('*')
  .eq('vehicle_id', vehicle.id)
  .eq('image_type', 'gallery')
  .order('display_order', { ascending: true })
```

#### 3. Fetch Vehicle Seller
```typescript
supabase
  .from('sellers')
  .select('*')
  .eq('vehicle_id', vehicle.id)
  .maybeSingle()
```

#### 4. Fetch Sales Agents
```typescript
supabase
  .from('sales_agents')
  .select('*')
  .eq('is_active', true)
  .order('name', { ascending: true })
```

#### 5. Fetch Leasing Companies
```typescript
supabase
  .from('leasing_companies')
  .select('*')
  .eq('is_active', true)
  .order('name', { ascending: true })
```

#### 6. Fetch Agent Name (for third-party agent)
```typescript
supabase
  .from('sales_agents')
  .select('name')
  .eq('id', agentId)
  .single()
```

#### 7. Insert Sale Record
```typescript
supabase
  .from('pending_vehicle_sales')
  .insert([saleData])
  .select()
  .single()
```

#### 8. Update Vehicle Status
```typescript
supabase
  .from('vehicles')
  .update({ status: 'Pending Sale' })
  .eq('id', vehicleId)
```

#### 9. Create Notification
```typescript
supabase
  .from('notifications')
  .insert({
    user_id: userId,
    type: 'moved_to_sales',
    title: 'Moved to Sales',
    message: notificationMessage,
    vehicle_number: vehicleNumber,
    vehicle_brand: brandName,
    vehicle_model: modelName,
    is_read: false
  })
```

### External API: SMS Service

**Endpoint**: `/api/vehicles/send-sms`

**Method**: POST

**Request Body**:
```typescript
{
  type: 'sell-vehicle-confirmation',
  seller: {
    title: string,
    firstName: string,
    lastName: string,
    mobileNumber: string
  },
  vehicle: {
    vehicleNumber: string,
    brand: string,
    model: string,
    year: number
  },
  sellingPrice: number,
  message: string // Pre-formatted SMS message
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  phoneNumber?: string,
  vehicleNumber?: string,
  error?: string
}
```

---

## SMS Integration

### SMS Service Function

**Function**: `sendSellVehicleConfirmationSMS`

**Location**: `@/lib/vehicle-sms-service`

**Purpose**: Send SMS notification to original vehicle seller when vehicle is sold

### SMS Message Format

```
Dear {Title} {FirstName},

We are pleased to inform you that your vehicle deal has been confirmed as discussed.

Vehicle Details:
• Vehicle: {Brand}, {Model}, {Year}
• Chassis/Registration No: {VehicleNumber}
• Confirmed Offer: Rs. {SellingPrice} (formatted with commas)

Thank you for choosing Punchi Car Niwasa.

For any queries, please contact us at:
0112 413 865 | 0117 275 275
```

### SMS Sending Process

1. **Fetch Seller Data**: Get original seller from `sellers` table
2. **Validate Data**: Check seller name and mobile number exist
3. **Build Message**: Format SMS message with vehicle and price details
4. **Call API**: POST to `/api/vehicles/send-sms`
5. **Handle Response**: Log success/failure, don't block sale if SMS fails

### SMS Error Handling

- **Missing Seller**: Log warning, skip SMS
- **Missing Mobile Number**: Log warning, skip SMS
- **API Error**: Log error, continue with sale
- **Network Error**: Log error, continue with sale

**Key Point**: SMS failures are non-blocking. Sale transaction completes even if SMS cannot be sent.

---

## Troubleshooting

### Common Issues

#### 1. Vehicle Not Found in Search

**Symptoms**: No results appear when searching for vehicle

**Possible Causes**:
- Vehicle status is not 'In Sale'
- Vehicle number doesn't match search term
- Database connection issue

**Solutions**:
- Check vehicle status in inventory
- Verify vehicle number spelling
- Check browser console for errors
- Verify database connection

#### 2. Vehicle Lock Warning Appears

**Symptoms**: Form disabled, warning shows another user has lock

**Possible Causes**:
- Another user is currently selling the same vehicle
- Previous lock not released (stale lock)

**Solutions**:
- Wait for other user to complete
- Lock will expire automatically
- Contact admin if lock persists

#### 3. Sale Submission Fails

**Symptoms**: Error message on sale submission

**Possible Causes**:
- Missing required fields
- Database constraint violation
- Network error
- Vehicle already sold

**Solutions**:
- Check all required fields are filled
- Verify vehicle is still available
- Check browser console for detailed error
- Retry submission
- Check database connection

#### 4. Vehicle Status Not Updated

**Symptoms**: Sale created but vehicle still shows 'In Sale'

**Possible Causes**:
- Vehicle status update failed
- Database permission issue

**Solutions**:
- Sale record is still created (non-critical error)
- Manually update vehicle status in inventory
- Check database permissions
- Check console logs for error details

#### 5. SMS Not Sent

**Symptoms**: Sale completes but SMS not received

**Possible Causes**:
- Seller mobile number missing or invalid
- SMS API error
- Network issue

**Solutions**:
- Verify seller mobile number in sellers table
- Check SMS API service status
- Sale transaction is still valid (SMS is optional)
- Check console logs for SMS error details

#### 6. Vehicle Snapshot Fields Not Saved

**Symptoms**: Vehicle snapshot columns show null

**Possible Causes**:
- Migration not run (snapshot columns don't exist)
- Snapshot data not included in insert

**Solutions**:
- Run migration: `2025_12_13_add_vehicle_snapshot_to_pending_sales.sql`
- Verify columns exist in database
- Check code handles missing columns gracefully

### Debugging Tips

1. **Check Browser Console**: All errors are logged with descriptive messages
2. **Check Network Tab**: Verify API calls are successful
3. **Check Supabase Dashboard**: Verify data is inserted correctly
4. **Check Vehicle Lock Table**: Verify locks are being created/released properly
5. **Check Notifications Table**: Verify notifications are being created

### Performance Optimization

1. **Vehicle Search Debouncing**: 300ms delay reduces unnecessary API calls
2. **Parallel Data Fetching**: Images and seller data fetched in parallel
3. **Request Cancellation**: Stale search requests are ignored
4. **Result Limiting**: Vehicle search limited to 10 results
5. **Sticky Vehicle Card**: Vehicle details card stays visible while scrolling

---

## Summary

The Sell Vehicle flow is a comprehensive 3-step process that:

1. **Collects Customer Information**: Complete customer details in Step 1
2. **Selects Vehicle**: Real-time search and selection from inventory in Step 2
3. **Records Sale**: Submits sale transaction with all details in Step 2
4. **Confirms Success**: Shows confirmation screen with options in Step 3

**Key Features**:
- Real-time vehicle search with debouncing
- Vehicle locking to prevent conflicts
- Complete customer data management
- Payment type handling (Cash/Leasing)
- Sales agent assignment
- Vehicle snapshot preservation
- SMS notifications
- System notifications
- Comprehensive error handling

**Data Storage**:
- Customer and sale data: `pending_vehicle_sales` table
- Vehicle status: Updated to 'Pending Sale'
- Notifications: `notifications` table
- Vehicle locks: `vehicle_locks` table (temporary)

**Integration Points**:
- Supabase database for all data operations
- SMS API for seller notifications
- Real-time subscriptions for lock management
- Notification system for user alerts

