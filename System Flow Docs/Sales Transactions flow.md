# Sales Transactions Flow - PCN System

## Overview

The Sales Transactions module manages the complete lifecycle of vehicle sales from pending status to sold completion. It consists of two main tabs: **Pending Sales** and **Sold Out** (completed sales), with comprehensive database tracking, UI components, and document generation.

**Last Updated**: January 1, 2026

> **Note**: This module requires authentication. Users must be logged in with a valid session cookie to access sales transactions.

---

## Table of Contents

1. [Database Schema & Connections](#1-database-schema--connections)
2. [Pending Tab Functions & Flow](#2-pending-tab-functions--flow)
3. [Sold Out Tab Functions & Flow](#3-sold-out-tab-functions--flow)
4. [UI Design & Components](#4-ui-design--components)
5. [API Routes & Endpoints](#5-api-routes--endpoints)
6. [Types & Interfaces](#6-types--interfaces)
7. [Status Flow Diagram](#7-status-flow-diagram)
8. [Document Printing](#8-document-printing)
9. [Reports Integration](#9-reports-integration)

---

## 1. Database Schema & Connections

### 1.1 Main Table: `pending_vehicle_sales`

**Purpose**: Stores both pending and sold vehicle sales transactions

**Supabase Connection**: `dashboard/src/lib/supabaseClient.ts`

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `id` | UUID | Primary key (auto-generated) | ✓ |
| `vehicle_id` | UUID | Foreign key to `vehicles` table | ✓ |
| `vehicle_number` | VARCHAR(50) | Snapshot of vehicle number at sale time | - |
| `brand_name` | VARCHAR(100) | Snapshot of brand name at sale time | - |
| `model_name` | VARCHAR(100) | Snapshot of model name at sale time | - |
| `manufacture_year` | INTEGER | Snapshot of manufacture year | - |
| `customer_title` | VARCHAR(10) | Mr., Miss., Mrs., Dr. | - |
| `customer_name` | VARCHAR(200) | Combined customer name (first + last) | ✓ |
| `customer_address` | TEXT | Customer address | - |
| `customer_nic` | VARCHAR(50) | Customer NIC number | - |
| `customer_mobile` | VARCHAR(20) | Customer mobile phone | - |
| `sale_price` | DECIMAL(12,2) | Sale price (primary field) | ✓ |
| `selling_price` | DECIMAL(12,2) | Sale price (database column) | - |
| `selling_amount` | DECIMAL(12,2) | Sale price (legacy field) | - |
| `advance_amount` | DECIMAL(12,2) | Down payment (default: 0) | - |
| `payment_type` | VARCHAR(50) | Cash, Leasing, Bank Transfer, Check | ✓ |

> **📝 Note**: The table has multiple price fields (`sale_price`, `selling_price`, `selling_amount`) due to historical schema evolution. Reports and queries must handle all three variations for data consistency.
| `leasing_company_id` | UUID | FK to `leasing_companies` (when Leasing) | - |
| `sales_agent_id` | UUID | FK to `sales_agents` (Office Sales Agent) | - |
| `third_party_agent` | TEXT | Vehicle Showroom Agent name | - |
| `status` | VARCHAR(20) | 'pending' or 'sold' | ✓ |
| `created_at` | TIMESTAMPTZ | Created timestamp | ✓ |
| `updated_at` | TIMESTAMPTZ | Updated timestamp | - |
| `created_by` | UUID | User who created the sale | - |

**Relevant Migrations**:
- `dashboard/migrations/FIX_pending_vehicle_sales_schema.sql`
- `dashboard/migrations/2025_11_02_complete_pending_sales_migration.sql`
- `dashboard/migrations/2025_12_13_add_vehicle_snapshot_to_pending_sales.sql`

---

### 1.2 Supporting Table: `sales_agents`

**Purpose**: Stores sales agent information

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Agent name |
| `agent_type` | ENUM | 'Office Sales Agent' or 'Vehicle Showroom Agent' |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMPTZ | Created timestamp |
| `updated_at` | TIMESTAMPTZ | Updated timestamp |

**Migration**: `dashboard/migrations/2025_11_add_agent_type_to_sales_agents.sql`

---

### 1.3 Supporting Table: `leasing_companies`

**Purpose**: Stores leasing company master data for leasing payment type

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `company_id` | VARCHAR(20) | Company code (unique) |
| `name` | VARCHAR(200) | Company name |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMPTZ | Created timestamp |
| `updated_at` | TIMESTAMPTZ | Updated timestamp |

**Migration**: `dashboard/migrations/2025_11_add_leasing_companies.sql`

---

### 1.4 Supporting Table: `vehicle_locks`

**Purpose**: Prevents concurrent vehicle edits during sale process

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vehicle_id` | UUID | FK to vehicles (unique constraint) |
| `locked_by_user_id` | UUID | User who locked |
| `locked_by_name` | TEXT | User name |
| `lock_type` | TEXT | 'editing', 'selling', or 'moving_to_soldout' |
| `locked_at` | TIMESTAMPTZ | Lock timestamp |
| `expires_at` | TIMESTAMPTZ | Lock expiration |

**Migration**: `dashboard/migrations/2025_11_25_add_vehicle_locks.sql`

---

### 1.5 Supporting Table: `price_categories`

**Purpose**: Price categories with PCN advance amounts for document printing

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Category name (Low Level, Mid Level, etc.) |
| `min_price` | DECIMAL | Minimum price range |
| `max_price` | DECIMAL | Maximum price range |
| `pcn_advance_amount` | DECIMAL(12,2) | PCN advance for this category |
| `is_active` | BOOLEAN | Active status |

**Migration**: `dashboard/migrations/2025_11_add_pcn_advance_amount_to_price_categories.sql`

---

### 1.6 Database Relationships

```
┌─────────────────────┐     ┌──────────────────┐
│ pending_vehicle_    │────►│    vehicles      │
│ sales               │     └──────────────────┘
│                     │
│  vehicle_id ────────┼────►┌──────────────────┐
│  sales_agent_id ────┼────►│  sales_agents    │
│  leasing_company_id─┼────►└──────────────────┘
│  created_by ────────┼────►┌──────────────────┐
└─────────────────────┘    │ leasing_companies │
                           └──────────────────┘
                           ┌──────────────────┐
                           │     users        │
                           └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│  vehicle_locks   │────►│    vehicles      │
└──────────────────┘     └──────────────────┘
```

---

## 2. Pending Tab Functions & Flow

### 2.1 Main Page Component

**File**: `dashboard/src/app/(dashboard)/sales-transactions/page.tsx`

### 2.2 Pending Sales Table Component

**File**: `dashboard/src/components/sales-transactions/PendingSalesTable.tsx`

### 2.3 Key Functions

#### Fetching Pending Sales

```typescript
// Location: PendingSalesTable.tsx → fetchPendingSales()

const { data: pendingSales } = await supabase
  .from('pending_vehicle_sales')
  .select(`
    *,
    vehicles:vehicle_id (
      id, 
      vehicle_number, 
      brand_id, 
      model_id, 
      manufacture_year,
      vehicle_brands:brand_id (id, name),
      vehicle_models:model_id (id, name)
    ),
    sales_agents:sales_agent_id (id, name),
    leasing_companies:leasing_company_id (id, name)
  `)
  .eq('status', 'pending')
  .order('created_at', { ascending: false });
```

#### View Sale Details

```typescript
// Function: handleViewSale(sale)
// Opens: ViewPendingSaleModal

const handleViewSale = (sale: PendingSale) => {
  setSelectedSale(sale);
  setShowViewModal(true);
};
```

#### Mark as Sold Out

```typescript
// Function: handleMarkAsSold(sale)
// Process:
// 1. Get vehicle_id from pending sale
// 2. Delete S3 images via API
// 3. Update sale status to 'sold'
// 4. Update vehicle status to 'Sold'
// 5. Delete vehicle images from database
// 6. Create notification

const handleConfirmSoldOut = async () => {
  // 1. Get vehicle_id
  const { data: saleData } = await supabase
    .from('pending_vehicle_sales')
    .select('vehicle_id')
    .eq('id', selectedSaleId)
    .single();

  // 2. Delete S3 images
  await fetch(`/api/upload/delete-vehicle/${saleData.vehicle_id}`, { 
    method: 'DELETE' 
  });

  // 3. Update sale status to 'sold'
  await supabase
    .from('pending_vehicle_sales')
    .update({ status: 'sold' })
    .eq('id', selectedSaleId);

  // 4. Update vehicle status to 'Sold'
  await supabase
    .from('vehicles')
    .update({ status: 'Sold' })
    .eq('id', saleData.vehicle_id);

  // 5. Delete vehicle images from database
  await supabase
    .from('vehicle_images')
    .delete()
    .eq('vehicle_id', saleData.vehicle_id);

  // 6. Create notification
  await supabase
    .from('notifications')
    .insert({ 
      type: 'sold',
      vehicle_id: saleData.vehicle_id,
      message: 'Vehicle marked as sold'
    });
};
```

#### Return to Inventory

```typescript
// Function: handleReturnToInventory(sale)
// Process:
// 1. Get vehicle_id from sale record
// 2. Delete sale record from pending_vehicle_sales
// 3. Restore vehicle status to 'In Sale'

const handleConfirmReturn = async () => {
  // 1. Get vehicle_id
  const { data: saleData } = await supabase
    .from('pending_vehicle_sales')
    .select('vehicle_id')
    .eq('id', selectedSaleId)
    .single();

  // 2. Delete sale record
  await supabase
    .from('pending_vehicle_sales')
    .delete()
    .eq('id', selectedSaleId);

  // 3. Restore vehicle status to 'In Sale'
  await supabase
    .from('vehicles')
    .update({ status: 'In Sale' })
    .eq('id', saleData.vehicle_id);
};
```

#### Print Document

```typescript
// Function: handlePrintDocument(sale)
// Opens: PrintDocumentModal with document templates
// Document Types: CASH_SELLER, CASH_DEALER, LEASING templates

const handlePrintDocument = (sale: PendingSale) => {
  setSelectedSale(sale);
  setShowPrintModal(true);
};
```

### 2.4 Pending Tab Features

| Feature | Description |
|---------|-------------|
| **Search** | Search by vehicle number, customer name, NIC |
| **Pagination** | Configurable items per page |
| **View Details** | Full sale details with vehicle images |
| **Mark Sold** | Move to sold out with confirmation |
| **Return** | Return vehicle to inventory |
| **Print** | Generate sale documents |
| **Refresh** | Manual data refresh button |

---

## 3. Sold Out Tab Functions & Flow

### 3.1 Sold Out Table Component

**File**: `dashboard/src/components/sales-transactions/SoldOutTable.tsx`

### 3.2 Key Functions

#### Fetching Sold Sales

```typescript
// Location: SoldOutTable.tsx → fetchSoldSales()

const { data: soldSales } = await supabase
  .from('pending_vehicle_sales')
  .select(`
    *,
    vehicles:vehicle_id (
      id, 
      vehicle_number, 
      brand_id, 
      model_id, 
      manufacture_year,
      vehicle_brands:brand_id (id, name),
      vehicle_models:model_id (id, name)
    ),
    sales_agents:sales_agent_id (id, name),
    leasing_companies:leasing_company_id (id, name)
  `)
  .eq('status', 'sold')
  .order('updated_at', { ascending: false });
```

#### View Sold Sale Details

```typescript
// Function: handleViewSale(sale)
// Opens: ViewSoldSaleModal (no images - they're deleted)

const handleViewSale = (sale: SoldSale) => {
  setSelectedSale(sale);
  setShowViewModal(true);
};
```

#### Export to CSV

```typescript
// Function: handleExportCSV()
// Exports filtered sold sales data to CSV file

const handleExportCSV = () => {
  const csvData = filteredSales.map(sale => ({
    'Vehicle Number': sale.vehicle_number || sale.vehicles?.vehicle_number,
    'Brand': sale.brand_name || sale.vehicles?.vehicle_brands?.name,
    'Model': sale.model_name || sale.vehicles?.vehicle_models?.name,
    'Customer Name': `${sale.customer_title || ''} ${sale.customer_first_name} ${sale.customer_last_name}`,
    'Selling Amount': sale.selling_amount,
    'Payment Type': sale.payment_type,
    'Sales Agent': sale.sales_agents?.name || sale.third_party_agent,
    'Sold Date': formatDate(sale.updated_at)
  }));
  
  // Generate and download CSV
  downloadCSV(csvData, 'sold-vehicles.csv');
};
```

#### Date Range Filter

```typescript
// Filter sold sales by date range
const filteredSales = soldSales.filter(sale => {
  const saleDate = new Date(sale.updated_at);
  const matchesDateRange = 
    (!startDate || saleDate >= new Date(startDate)) &&
    (!endDate || saleDate <= new Date(endDate));
  return matchesDateRange && matchesSearch;
});
```

### 3.3 Sold Out Tab Features

| Feature | Description |
|---------|-------------|
| **Search** | Search by vehicle number, customer name |
| **Date Filter** | Filter by sold date range |
| **View Details** | Sale details (without images) |
| **CSV Export** | Export filtered data to CSV |
| **Pagination** | Configurable items per page |
| **Statistics** | Total sales count and amount |

---

## 4. UI Design & Components

### 4.1 Page Layout

**File**: `dashboard/src/app/(dashboard)/sales-transactions/page.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│  Sales Transactions                              [Refresh]  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  Pending Sales  │  │   Sold Out      │   ← Tab Buttons   │
│  └─────────────────┘  └─────────────────┘                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Search Bar]              [Date Filter] [Export CSV]       │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Table Content (Pending or Sold Out based on tab)       ││
│  │                                                         ││
│  │  Columns:                                               ││
│  │  - Vehicle Number                                       ││
│  │  - Brand/Model                                          ││
│  │  - Customer Name                                        ││
│  │  - Selling Amount                                       ││
│  │  - Payment Type                                         ││
│  │  - Sales Agent                                          ││
│  │  - Date                                                 ││
│  │  - Actions                                              ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [Pagination: < 1 2 3 ... > ]      Items per page: [10 ▼]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Component Hierarchy

```
sales-transactions/page.tsx
├── Tab Buttons (Pending / Sold Out)
├── PendingSalesTable.tsx (when activeTab = 'pending')
│   ├── Search Input
│   ├── Data Table
│   │   ├── Table Headers
│   │   └── Table Rows with Actions
│   │       ├── View Button → ViewPendingSaleModal
│   │       ├── Mark Sold Button → MarkAsSoldModal
│   │       ├── Return Button → ReturnToInventoryModal
│   │       └── Print Button → PrintDocumentModal
│   └── Pagination Controls
│
└── SoldOutTable.tsx (when activeTab = 'sold')
    ├── Search Input
    ├── Date Range Filter
    ├── Export CSV Button
    ├── Data Table
    │   ├── Table Headers
    │   └── Table Rows with Actions
    │       └── View Button → ViewSoldSaleModal
    └── Pagination Controls
```

### 4.3 Modal Components

#### ViewPendingSaleModal
**File**: `dashboard/src/components/sales-transactions/ViewPendingSaleModal.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│  Sale Details                                         [X]   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Vehicle Images (Carousel/Grid)                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Vehicle Information                                        │
│  ├── Vehicle Number: ABC-1234                              │
│  ├── Brand: Toyota                                         │
│  ├── Model: Corolla                                        │
│  └── Year: 2020                                            │
│                                                             │
│  Customer Information                                       │
│  ├── Name: Mr. John Doe                                    │
│  ├── NIC: 123456789V                                       │
│  ├── Mobile: +94 77 123 4567                               │
│  ├── Landphone: +94 11 234 5678                            │
│  ├── Email: john@email.com                                 │
│  ├── Address: 123 Main Street                              │
│  └── City: Colombo                                         │
│                                                             │
│  Sale Information                                           │
│  ├── Selling Amount: Rs. 5,000,000.00                      │
│  ├── Advance Amount: Rs. 500,000.00                        │
│  ├── Payment Type: Leasing                                 │
│  ├── Leasing Company: Bank of Ceylon                       │
│  ├── Sales Agent: Agent Name                               │
│  └── Created Date: 2025-01-15                              │
│                                                             │
│  [Close]                                                    │
└─────────────────────────────────────────────────────────────┘
```

#### MarkAsSoldModal
**File**: `dashboard/src/components/sales-transactions/MarkAsSoldModal.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│  Confirm Mark as Sold                                 [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚠️  Are you sure you want to mark this vehicle as sold?   │
│                                                             │
│  Vehicle: ABC-1234 (Toyota Corolla 2020)                    │
│  Customer: Mr. John Doe                                     │
│  Amount: Rs. 5,000,000.00                                   │
│                                                             │
│  Note: Vehicle images will be permanently deleted.          │
│                                                             │
│                          [Cancel]  [Confirm Mark as Sold]   │
└─────────────────────────────────────────────────────────────┘
```

#### ReturnToInventoryModal
**File**: `dashboard/src/components/sales-transactions/ReturnToInventoryModal.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│  Confirm Return to Inventory                          [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚠️  Are you sure you want to return this vehicle to       │
│     inventory?                                              │
│                                                             │
│  Vehicle: ABC-1234 (Toyota Corolla 2020)                    │
│                                                             │
│  This will:                                                 │
│  • Delete the pending sale record                           │
│  • Change vehicle status back to "In Sale"                  │
│                                                             │
│                            [Cancel]  [Confirm Return]       │
└─────────────────────────────────────────────────────────────┘
```

#### PrintDocumentModal
**File**: `dashboard/src/components/sales-transactions/PrintDocumentModal.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│  Print Sale Document                                  [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Select Document Type:                                      │
│                                                             │
│  ○ Cash Sale - Seller Copy                                  │
│  ○ Cash Sale - Dealer Copy                                  │
│  ○ Leasing Sale Document                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │                Document Preview                         ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│                              [Cancel]  [Print Document]     │
└─────────────────────────────────────────────────────────────┘
```

#### ViewSoldSaleModal
**File**: `dashboard/src/components/sales-transactions/ViewSoldSaleModal.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│  Sold Vehicle Details                                 [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Vehicle Information (from snapshot)                        │
│  ├── Vehicle Number: ABC-1234                              │
│  ├── Brand: Toyota                                         │
│  ├── Model: Corolla                                        │
│  └── Year: 2020                                            │
│                                                             │
│  Customer Information                                       │
│  ├── Name: Mr. John Doe                                    │
│  ├── NIC: 123456789V                                       │
│  ├── Mobile: +94 77 123 4567                               │
│  └── City: Colombo                                         │
│                                                             │
│  Sale Information                                           │
│  ├── Selling Amount: Rs. 5,000,000.00                      │
│  ├── Advance Amount: Rs. 500,000.00                        │
│  ├── Payment Type: Cash                                    │
│  ├── Sales Agent: Agent Name                               │
│  └── Sold Date: 2025-01-20                                 │
│                                                             │
│  [Close]                                                    │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Action Buttons & Colors

| Button | Color | Icon | Action |
|--------|-------|------|--------|
| View | Blue | 👁️ Eye | Opens detail modal |
| Mark Sold | Green | ✓ Check | Moves to sold out |
| Return | Orange | ↩️ Arrow | Returns to inventory |
| Print | Purple | 🖨️ Printer | Opens print dialog |
| Export CSV | Gray | 📥 Download | Downloads CSV file |
| Refresh | Blue | 🔄 Refresh | Refreshes data |

### 4.5 Table Columns

#### Pending Sales Table

| Column | Width | Sortable | Description |
|--------|-------|----------|-------------|
| Vehicle Number | 120px | ✓ | From snapshot or vehicle |
| Brand/Model | 150px | ✓ | Combined brand & model |
| Year | 80px | ✓ | Manufacture year |
| Customer | 150px | ✓ | Title + First + Last name |
| NIC | 120px | - | Customer NIC |
| Mobile | 120px | - | Customer mobile |
| Selling Amount | 120px | ✓ | Formatted currency |
| Payment Type | 100px | ✓ | Cash/Leasing/etc |
| Sales Agent | 120px | ✓ | Agent or third party |
| Date | 100px | ✓ | Created date |
| Actions | 150px | - | Action buttons |

#### Sold Out Table

| Column | Width | Sortable | Description |
|--------|-------|----------|-------------|
| Vehicle Number | 120px | ✓ | From snapshot |
| Brand/Model | 150px | ✓ | From snapshot |
| Customer | 150px | ✓ | Full name |
| Selling Amount | 120px | ✓ | Formatted currency |
| Payment Type | 100px | ✓ | Payment method |
| Sales Agent | 120px | ✓ | Agent name |
| Sold Date | 100px | ✓ | Updated date |
| Actions | 80px | - | View button only |

---

## 5. API Routes & Endpoints

### 5.1 Sales API Routes

**File**: `api/src/routes/sales.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales` | Get all sales transactions |
| POST | `/api/sales` | Create new sale |

> **Note**: Most sales operations are handled directly via Supabase client on the frontend for real-time capabilities.

### 5.2 Image Deletion Endpoint

**File**: `api/src/routes/upload.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | `/api/upload/delete-vehicle/:vehicleId` | Delete all S3 images for a vehicle |

### 5.3 Supabase Direct Operations

**Connection File**: `dashboard/src/lib/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Tables Accessed**:
- `pending_vehicle_sales` - Main sales table
- `vehicles` - Vehicle data
- `vehicle_images` - Vehicle images
- `sales_agents` - Sales agent data
- `leasing_companies` - Leasing company data
- `vehicle_locks` - Vehicle locking
- `notifications` - System notifications
- `price_categories` - PCN advance amounts

---

## 6. Types & Interfaces

### 6.1 Shared Types

**File**: `shared/types.ts`

```typescript
// Sale Interface
export interface Sale {
  id: string;
  vehicleId: string;
  customerId: string;
  salesAgentId: string;
  salePrice: number;
  paymentType: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Leasing' | 'Check';
  downPayment?: number;
  leasingAmount?: number;
  leasingPeriod?: number;
  interestRate?: number;
  status: 'pending' | 'completed' | 'cancelled';
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface SalesAnalytics {
  totalSales: number;
  salesByCategory: { category: string; count: number; }[];
  salesByAgent: { agentName: string; count: number; }[];
}
```

### 6.2 Constants

**File**: `shared/constants.ts`

```typescript
export const PAYMENT_TYPES = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'Leasing',
  'Check',
] as const;

export const VEHICLE_STATUS = ['available', 'pending', 'sold'] as const;

export const CUSTOMER_TITLES = ['Mr.', 'Mrs.', 'Miss.', 'Dr.'] as const;

export const API_ENDPOINTS = {
  VEHICLES: '/api/vehicles',
  SALES: '/api/sales',
  USERS: '/api/users',
  ANALYTICS: '/api/analytics',
} as const;
```

### 6.3 Component Interfaces

```typescript
// PendingSale interface (used in components)
interface PendingSale {
  id: string;
  vehicle_id: string;
  vehicle_number?: string;
  brand_name?: string;
  model_name?: string;
  manufacture_year?: number;
  customer_title?: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_address?: string;
  customer_city?: string;
  customer_nic?: string;
  customer_mobile: string;
  customer_landphone?: string;
  customer_email?: string;
  selling_amount: number;
  advance_amount?: number;
  payment_type: string;
  leasing_company_id?: string;
  sales_agent_id?: string;
  third_party_agent?: string;
  status: 'pending' | 'sold';
  created_at: string;
  updated_at?: string;
  // Joined relations
  vehicles?: Vehicle;
  sales_agents?: SalesAgent;
  leasing_companies?: LeasingCompany;
}

// Modal Props
interface ViewPendingSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: PendingSale | null;
}

interface MarkAsSoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  sale: PendingSale | null;
  isLoading: boolean;
}
```

---

## 7. Status Flow Diagram

### 7.1 Vehicle Status Flow

```
┌──────────────┐     Sell Vehicle     ┌──────────────┐     Mark as Sold     ┌──────────────┐
│   In Sale    │ ───────────────────► │ Pending Sale │ ───────────────────► │     Sold     │
│   (Yellow)   │                      │   (Orange)   │                      │    (Green)   │
└──────────────┘                      └──────────────┘                      └──────────────┘
       ▲                                     │
       │                                     │
       │         Return to Inventory         │
       └─────────────────────────────────────┘
```

### 7.2 Sale Record Status Flow

```
                     Create Sale
                          │
                          ▼
                   ┌─────────────┐
                   │   pending   │
                   │   status    │
                   └─────────────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             │             ▼
    ┌─────────────┐       │     ┌─────────────┐
    │   'sold'    │       │     │  (deleted)  │
    │   status    │       │     │   Return    │
    └─────────────┘       │     └─────────────┘
                          │
                          ▼
               Record stays in database
               Images deleted from S3
```

### 7.3 Complete Sale Transaction Flow

```
1. User clicks "Sell Vehicle" on vehicle in inventory
                    │
                    ▼
2. Vehicle lock acquired (prevents concurrent edits)
                    │
                    ▼
3. User enters customer details (Step 1)
                    │
                    ▼
4. User enters sale details (Step 2)
   - Selling Amount
   - Advance Amount
   - Payment Type (Cash/Leasing/Bank Transfer/Check)
   - Leasing Company (if Leasing)
   - Sales Agent
                    │
                    ▼
5. User confirms sale (Step 3)
                    │
                    ▼
6. System creates pending_vehicle_sales record
   - Status: 'pending'
   - Vehicle snapshot captured
                    │
                    ▼
7. Vehicle status updated to 'Pending Sale'
                    │
                    ▼
8. Notification created
                    │
                    ▼
9. SMS sent to original seller
                    │
                    ▼
10. Vehicle lock released
                    │
                    ▼
11. Sale appears in Pending Sales tab
                    │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
   Mark as Sold       Return to Inventory
          │                 │
          ▼                 ▼
   - S3 images deleted    - Sale record deleted
   - Status → 'sold'      - Vehicle status → 'In Sale'
   - Vehicle → 'Sold'
   - DB images deleted
          │
          ▼
   Sale appears in Sold Out tab
```

---

## 8. Document Printing

### 8.1 Document Types

**File**: `dashboard/src/components/sales-transactions/PrintDocumentModal.tsx`

| Document Type | Code | Description |
|---------------|------|-------------|
| Cash Sale (Seller) | `CASH_SELLER` | Document for seller in cash sale |
| Cash Sale (Dealer) | `CASH_DEALER` | Document for dealer in cash sale |
| Leasing Documents | - | Documents with leasing company info |

### 8.2 Document Data Sources

```typescript
// Data used in documents
const documentData = {
  // Customer Details
  customerTitle: sale.customer_title,        // From pending_vehicle_sales
  customerName: `${sale.customer_first_name} ${sale.customer_last_name}`,
  customerNIC: sale.customer_nic,
  customerAddress: sale.customer_address,
  customerCity: sale.customer_city,
  customerMobile: sale.customer_mobile,
  
  // Seller Details (from original vehicle seller)
  sellerTitle: seller.title,                 // From sellers table
  sellerName: seller.name,
  sellerNIC: seller.nic,
  sellerAddress: seller.address,
  
  // Vehicle Details (from snapshot)
  vehicleNumber: sale.vehicle_number,
  brandName: sale.brand_name,
  modelName: sale.model_name,
  manufactureYear: sale.manufacture_year,
  
  // Sale Details
  sellingAmount: sale.selling_amount,
  advanceAmount: sale.advance_amount,
  paymentType: sale.payment_type,
  
  // PCN Advance (calculated from price_categories)
  pcnAdvance: priceCategory.pcn_advance_amount,
  
  // Leasing Info (if payment_type = 'Leasing')
  leasingCompany: sale.leasing_companies?.name,
};
```

### 8.3 Price Category Lookup

```typescript
// Get PCN advance amount based on selling price
const { data: priceCategory } = await supabase
  .from('price_categories')
  .select('pcn_advance_amount')
  .lte('min_price', sellingAmount)
  .gte('max_price', sellingAmount)
  .eq('is_active', true)
  .single();
```

---

## 9. Reports Integration

### 9.1 Financial Reports

**File**: `dashboard/src/components/reports/FinancialReports.tsx`

**Data Sources**:
- `pending_vehicle_sales` with `status = 'sold'`
- `price_categories` for PCN advance amounts

**Calculations**:
```typescript
// Total vehicles sold
const totalSold = soldSales.length;

// Total sales amount
const totalSalesAmount = soldSales.reduce(
  (sum, sale) => sum + sale.selling_amount, 0
);

// Total PCN advances
const totalPCNAdvances = soldSales.reduce(
  (sum, sale) => sum + (sale.pcn_advance || 0), 0
);
```

### 9.2 Sales Agents Report

**File**: `dashboard/src/components/reports/SalesAgentReport.tsx`

**Query**:
```typescript
const { data: agentSales } = await supabase
  .from('pending_vehicle_sales')
  .select(`
    *,
    sales_agents:sales_agent_id (id, name)
  `)
  .eq('status', 'sold');

// Group by agent
const salesByAgent = agentSales.reduce((acc, sale) => {
  const agentName = sale.sales_agents?.name || sale.third_party_agent || 'Unknown';
  if (!acc[agentName]) {
    acc[agentName] = { count: 0, totalAmount: 0 };
  }
  acc[agentName].count++;
  acc[agentName].totalAmount += sale.selling_amount;
  return acc;
}, {});
```

---

## 10. Security & Permissions

### 10.1 Role-Based Access

| Role | Pending Tab | Sold Out Tab | Actions |
|------|-------------|--------------|---------|
| Admin | ✓ View | ✓ View | All actions |
| Manager | ✓ View | ✓ View | View, Print, Mark Sold |
| Sales Agent | ✓ View (own) | ✓ View (own) | View, Print |

### 10.2 Vehicle Locking

**Purpose**: Prevents concurrent edits during sale process

**Lock Types**:
- `editing` - Vehicle being edited
- `selling` - Vehicle being sold
- `moving_to_soldout` - Moving to sold out

**Lock Duration**: Configurable, auto-expires

### 10.3 Row Level Security (Supabase)

```sql
-- Enable RLS on pending_vehicle_sales
ALTER TABLE pending_vehicle_sales ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all pending sales
CREATE POLICY "View pending sales" ON pending_vehicle_sales
  FOR SELECT USING (true);

-- Policy: Only authenticated users can insert
CREATE POLICY "Insert pending sales" ON pending_vehicle_sales
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only admin/manager can update
CREATE POLICY "Update pending sales" ON pending_vehicle_sales
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );
```

---

## 11. Error Handling

### 11.1 Common Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| Vehicle locked | Another user is editing | Wait or contact admin |
| Sale not found | Record deleted | Refresh page |
| S3 deletion failed | Network/permission issue | Retry or manual cleanup |
| Invalid vehicle_id | Vehicle deleted | Contact admin |

### 11.2 Error Messages

```typescript
// Toast notifications for errors
toast.error('Failed to mark vehicle as sold. Please try again.');
toast.error('Failed to return vehicle to inventory.');
toast.error('Vehicle is currently locked by another user.');
toast.error('Failed to load pending sales.');
```

---

## 12. File Reference

### 12.1 Main Files

| File | Purpose |
|------|---------|
| `dashboard/src/app/(dashboard)/sales-transactions/page.tsx` | Main page component |
| `dashboard/src/components/sales-transactions/PendingSalesTable.tsx` | Pending sales table |
| `dashboard/src/components/sales-transactions/SoldOutTable.tsx` | Sold out table |
| `dashboard/src/components/sales-transactions/ViewPendingSaleModal.tsx` | View pending sale modal |
| `dashboard/src/components/sales-transactions/ViewSoldSaleModal.tsx` | View sold sale modal |
| `dashboard/src/components/sales-transactions/MarkAsSoldModal.tsx` | Mark as sold confirmation |
| `dashboard/src/components/sales-transactions/ReturnToInventoryModal.tsx` | Return to inventory confirmation |
| `dashboard/src/components/sales-transactions/PrintDocumentModal.tsx` | Document printing |
| `dashboard/src/components/sales-transactions/SaleDetailModal.tsx` | Generic detail modal |

### 12.2 Supporting Files

| File | Purpose |
|------|---------|
| `api/src/routes/sales.ts` | Sales API routes |
| `api/src/routes/upload.ts` | Image upload/delete routes |
| `shared/types.ts` | TypeScript interfaces |
| `shared/constants.ts` | Application constants |
| `dashboard/src/lib/supabaseClient.ts` | Supabase client |

### 12.3 Migration Files

| File | Purpose |
|------|---------|
| `dashboard/migrations/FIX_pending_vehicle_sales_schema.sql` | Schema fixes |
| `dashboard/migrations/2025_11_02_complete_pending_sales_migration.sql` | Customer fields |
| `dashboard/migrations/2025_12_13_add_vehicle_snapshot_to_pending_sales.sql` | Vehicle snapshots |
| `dashboard/migrations/2025_11_add_agent_type_to_sales_agents.sql` | Agent types |
| `dashboard/migrations/2025_11_add_leasing_companies.sql` | Leasing companies |
| `dashboard/migrations/2025_11_25_add_vehicle_locks.sql` | Vehicle locking |
| `dashboard/migrations/2025_11_add_pcn_advance_amount_to_price_categories.sql` | PCN advances |

---

*Last Updated: December 28, 2025*
