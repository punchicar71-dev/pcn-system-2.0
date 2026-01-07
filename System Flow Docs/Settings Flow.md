# Settings Flow - PCN System

## Overview

The Settings module provides centralized configuration management for the PCN Vehicle Selling System. It allows administrators to manage vehicle brands, price categories, leasing companies, sales agents, and countries. All settings are used throughout the application for vehicle inventory, sales transactions, and reporting.

**Access Level**: All authenticated users can view; Admin users can modify.

**Last Updated**: January 3, 2026

> **Note**: Authentication is handled via cookie-based sessions. Users must be logged in to access settings.

---

## 📢 LATEST UPDATE - January 1, 2026 (Sales Agent Tab Cleanup)

### ⚙️ Sales Agent Tab Database Alignment

**Update: Removed deprecated `user_id` field from Sales Agent Tab UI!**

#### What's Changed:

1. **Removed `user_id` Field**:
   - The `user_id` field was deprecated and has been removed from the UI
   - Cleaner database schema alignment
   - Sales agents no longer require direct user account linkage

2. **Sales Agent Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Agent name |
| `agent_type` | VARCHAR | 'Office Sales Agent' or 'Vehicle Showroom Agent' |
| `is_active` | BOOLEAN | Agent status |
| `email` | VARCHAR | Contact email |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### Modified Files:
- `dashboard/src/components/settings/SalesAgentTab.tsx` ✅

---

## Table of Contents

1. [Database Schema & Connections](#1-database-schema--connections)
2. [Settings Page Structure](#2-settings-page-structure)
3. [Vehicle Brands Tab](#3-vehicle-brands-tab)
4. [Price Category Tab](#4-price-category-tab)
5. [Leasing Company Tab](#5-leasing-company-tab)
6. [Sales Agent Tab](#6-sales-agent-tab)
7. [Countries Tab](#7-countries-tab)
8. [Types & Interfaces](#8-types--interfaces)
9. [File Structure Summary](#9-file-structure-summary)

---

## 1. Database Schema & Connections

### 1.1 Settings Tables Overview

| Table | Purpose | Used In |
|-------|---------|---------|
| `vehicle_brands` | Vehicle manufacturer names | Add Vehicle, Inventory |
| `vehicle_models` | Vehicle model names per brand | Add Vehicle, Inventory |
| `price_categories` | Price ranges with PCN advance | Add Vehicle, Financial Reports |
| `leasing_companies` | Finance company partners | Sell Vehicle |
| `sales_agents` | In-house sales staff | Sell Vehicle, Reports |
| `countries` | Vehicle manufacturing countries | Add Vehicle |

### 1.2 Supabase Connection

**Client**: `dashboard/src/lib/supabase-client.ts`

```typescript
import { supabase } from '@/lib/supabase-client'
```

---

## 2. Settings Page Structure

### 2.1 Main Page

**File**: `dashboard/src/app/(dashboard)/settings/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [Vehicle Brands] [Price Category] [Leasing Company] [Sales Agent] [Countries] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Tab Content Area                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation**:
```tsx
export default function SettingsPage() {
  return (
    <div className="space-y-6 bg-slate-50 p-6">
      <Tabs defaultValue="brands" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="brands">Vehicle Brands</TabsTrigger>
          <TabsTrigger value="price">Price Category</TabsTrigger>
          <TabsTrigger value="leasing">Leasing Company</TabsTrigger>
          <TabsTrigger value="agents">Sales Agent</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
        </TabsList>

        <TabsContent value="brands"><VehicleBrandsTab /></TabsContent>
        <TabsContent value="price"><PriceCategoryTab /></TabsContent>
        <TabsContent value="leasing"><LeasingCompanyTab /></TabsContent>
        <TabsContent value="agents"><SalesAgentTab /></TabsContent>
        <TabsContent value="countries"><CountriesTab /></TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## 3. Vehicle Brands Tab

### 3.1 Database Tables

#### `vehicle_brands` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Brand name (e.g., Toyota) |
| logo_url | VARCHAR | Brand logo URL (optional) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `vehicle_models` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| brand_id | UUID | Foreign key to vehicle_brands |
| name | VARCHAR | Model name (e.g., Aqua) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### 3.2 Component File

**File**: `dashboard/src/components/settings/VehicleBrandsTab.tsx`

### 3.3 State Management

```typescript
const [brands, setBrands] = useState<VehicleBrand[]>([])
const [models, setModels] = useState<Record<string, VehicleModel[]>>({})
const [loading, setLoading] = useState(true)
const [isAddBrandOpen, setIsAddBrandOpen] = useState(false)
const [isSyncModelOpen, setIsSyncModelOpen] = useState(false)
const [isViewModelsOpen, setIsViewModelsOpen] = useState(false)
const [isEditBrandOpen, setIsEditBrandOpen] = useState(false)
const [isDeleteBrandOpen, setIsDeleteBrandOpen] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
```

### 3.4 Functions

#### Fetch Brands & Models (Parallel Query)

```typescript
const fetchBrands = async () => {
  const [brandsResult, modelsResult] = await Promise.all([
    supabase.from('vehicle_brands').select('*').order('name'),
    supabase.from('vehicle_models').select('*').order('name')
  ])

  // Group models by brand_id for faster lookup
  const modelsData: Record<string, VehicleModel[]> = {}
  allModels.forEach((model) => {
    if (!modelsData[model.brand_id]) {
      modelsData[model.brand_id] = []
    }
    modelsData[model.brand_id].push(model)
  })
}
```

#### Add Brand

```typescript
const handleAddBrand = async () => {
  if (!newBrandName.trim()) return

  const { data, error } = await supabase
    .from('vehicle_brands')
    .insert([{ name: newBrandName }])
    .select()
    .single()

  // Optimistic UI update
  if (data) {
    setBrands(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setModels(prev => ({ ...prev, [data.id]: [] }))
  }
}
```

#### Edit Brand

```typescript
const handleEditBrand = async () => {
  const { error } = await supabase
    .from('vehicle_brands')
    .update({ name: editingBrand.name })
    .eq('id', editingBrand.id)

  // Optimistic UI update
  setBrands(prev => 
    prev.map(b => b.id === editingBrand.id ? editingBrand : b)
      .sort((a, b) => a.name.localeCompare(b.name))
  )
}
```

#### Delete Brand (Cascades to Models)

```typescript
const confirmDeleteBrand = async () => {
  const { error } = await supabase
    .from('vehicle_brands')
    .delete()
    .eq('id', brandToDelete)

  // Also removes associated models from UI
  setBrands(prev => prev.filter(b => b.id !== brandToDelete))
  setModels(prev => {
    const newModels = { ...prev }
    delete newModels[brandToDelete]
    return newModels
  })
}
```

#### Add Model (Sync Models)

```typescript
const handleAddModel = async () => {
  const { data, error } = await supabase
    .from('vehicle_models')
    .insert([{ brand_id: selectedBrandForModel, name: newModelName }])
    .select()
    .single()

  // Update models state
  if (data) {
    setModels(prev => ({
      ...prev,
      [selectedBrandForModel]: [...(prev[selectedBrandForModel] || []), data]
    }))
  }
}
```

#### Search Filter (Memoized)

```typescript
const filteredBrands = useMemo(() => {
  if (!searchQuery) return brandsWithModels
  
  return brandsWithModels.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.models.some(model => 
      model.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )
}, [searchQuery, brandsWithModels])
```

### 3.5 UI Components

| Component | Purpose |
|-----------|---------|
| Search Input | Filter brands by name or model name |
| Add Brand Button | Opens add brand dialog |
| Sync Models Button | Opens add model dialog |
| DataTable | Display brands with pagination |
| View All Models | Shows all models for a brand |
| Edit Dialog | Edit brand name |
| Delete Dialog | Confirm brand deletion |

### 3.6 Features

- **Search**: Search across brand names and model names
- **Pagination**: DataTable with customizable rows per page (6, 10, 20, 50)
- **Optimistic Updates**: Instant UI feedback without full refetch
- **Parallel Queries**: Brands and models fetched simultaneously

---

## 4. Price Category Tab

### 4.1 Database Table: `price_categories`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Category name (e.g., "Low Level") |
| min_price | DECIMAL | Minimum price threshold |
| max_price | DECIMAL | Maximum price threshold |
| pcn_advance_amount | DECIMAL | PCN profit/commission amount |
| is_active | BOOLEAN | Category availability status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### 4.2 Component File

**File**: `dashboard/src/components/settings/PriceCategoryTab.tsx`

### 4.3 State Management

```typescript
const [categories, setCategories] = useState<PriceCategory[]>([])
const [loading, setLoading] = useState(true)
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
const [editingCategory, setEditingCategory] = useState<PriceCategory | null>(null)
const [formData, setFormData] = useState({
  name: '',
  min_price: '',
  max_price: '',
  pcn_advance_amount: '',
})
```

### 4.4 Functions

#### Fetch Categories

```typescript
const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('price_categories')
    .select('*')
    .order('min_price')

  if (error) throw error
  setCategories(data || [])
}
```

#### Add Category

```typescript
const handleAddCategory = async () => {
  if (!formData.name.trim() || !formData.min_price || !formData.max_price || !formData.pcn_advance_amount) return

  const { error } = await supabase
    .from('price_categories')
    .insert([{
      name: formData.name,
      min_price: parseFloat(formData.min_price),
      max_price: parseFloat(formData.max_price),
      pcn_advance_amount: parseFloat(formData.pcn_advance_amount),
      is_active: true,
    }])

  setFormData({ name: '', min_price: '', max_price: '', pcn_advance_amount: '' })
  setIsAddDialogOpen(false)
  fetchCategories()
}
```

#### Edit Category

```typescript
const handleEditCategory = async () => {
  const { error } = await supabase
    .from('price_categories')
    .update({
      name: formData.name,
      min_price: parseFloat(formData.min_price),
      max_price: parseFloat(formData.max_price),
      pcn_advance_amount: parseFloat(formData.pcn_advance_amount),
    })
    .eq('id', editingCategory.id)

  fetchCategories()
}
```

#### Toggle Active Status

```typescript
const handleToggleActive = async (id: string, currentStatus: boolean) => {
  const { error } = await supabase
    .from('price_categories')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  fetchCategories()
}
```

#### Delete Category

```typescript
const confirmDelete = async () => {
  const { error } = await supabase
    .from('price_categories')
    .delete()
    .eq('id', categoryToDelete)

  fetchCategories()
}
```

#### Format Price Helper

```typescript
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
```

### 4.5 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Available Price Category                    [+ Add Category] │
│ Manage vehicle price ranges                                  │
├─────────────────────────────────────────────────────────────┤
│ Category Name │ Price Range │ PCN Advance │ Status │ Actions│
├───────────────┼─────────────┼─────────────┼────────┼────────┤
│ Low Level     │ 0 - 2.5M    │ 25,000      │ [ON]   │ ✏️ 🗑  │
│ Middle Level  │ 2.5M - 5M   │ 50,000      │ [ON]   │ ✏️ 🗑  │
│ High Level    │ 5M - 10M    │ 75,000      │ [OFF]  │ ✏️ 🗑  │
└─────────────────────────────────────────────────────────────┘
```

### 4.6 Integration Points

- **Add Vehicle**: Price category selection determines PCN advance
- **Financial Reports**: PCN advance used for profit calculations
- **Sell Vehicle**: Auto-calculates PCN advance based on selling amount

---

## 5. Leasing Company Tab

### 5.1 Database Table: `leasing_companies`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| company_id | VARCHAR(5) | Auto-generated 5-digit ID |
| name | VARCHAR | Company name |
| is_active | BOOLEAN | Availability status |
| created_at | TIMESTAMP | Creation timestamp |

### 5.2 Component File

**File**: `dashboard/src/components/settings/LeasingCompanyTab.tsx`

### 5.3 State Management

```typescript
const [companies, setCompanies] = useState<LeasingCompany[]>([])
const [loading, setLoading] = useState(true)
const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false)
const [newCompanyName, setNewCompanyName] = useState('')
const [isSaving, setIsSaving] = useState(false)
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
const [companyToDelete, setCompanyToDelete] = useState<LeasingCompany | null>(null)
```

### 5.4 Functions

#### Generate Company ID

```typescript
const generateCompanyId = () => {
  // Generate a 5-digit random number for company ID
  return String(Math.floor(10000 + Math.random() * 90000))
}
```

#### Fetch Companies

```typescript
const fetchCompanies = async () => {
  const { data, error } = await supabase
    .from('leasing_companies')
    .select('*')
    .order('created_at', { ascending: false })

  setCompanies(data || [])
}
```

#### Add Company

```typescript
const handleAddCompany = async () => {
  if (!newCompanyName.trim()) {
    alert('Please enter a company name')
    return
  }

  const companyId = generateCompanyId()
  
  const { data, error } = await supabase
    .from('leasing_companies')
    .insert([{
      company_id: companyId,
      name: newCompanyName.trim(),
      is_active: true,
    }])
    .select()
    .single()

  if (data) {
    setCompanies((prev) => [data, ...prev])
  }
}
```

#### Toggle Availability

```typescript
const handleToggleAvailability = async (company: LeasingCompany) => {
  const { error } = await supabase
    .from('leasing_companies')
    .update({ is_active: !company.is_active })
    .eq('id', company.id)

  setCompanies((prev) =>
    prev.map((c) =>
      c.id === company.id ? { ...c, is_active: !c.is_active } : c
    )
  )
}
```

#### Delete Company

```typescript
const confirmDelete = async () => {
  const { error } = await supabase
    .from('leasing_companies')
    .delete()
    .eq('id', companyToDelete.id)

  setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id))
}
```

### 5.5 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Leasing Companies                           [+ Add Company] │
│ Manage finance and leasing company partners                 │
├─────────────────────────────────────────────────────────────┤
│ Company ID │ Finance Company Name      │ Availability │ 🗑  │
├────────────┼──────────────────────────┼──────────────┼─────┤
│ 12345      │ People's Leasing         │ [ON]         │ 🗑  │
│ 67890      │ Commercial Credit        │ [ON]         │ 🗑  │
│ 11111      │ HNB Finance              │ [OFF]        │ 🗑  │
└─────────────────────────────────────────────────────────────┘
```

### 5.6 Pre-loaded Companies

33 Sri Lankan leasing companies are pre-loaded, including:
- People's Leasing & Finance PLC
- Commercial Credit & Finance PLC
- HNB Finance PLC
- LOLC Finance PLC
- And more...

---

## 6. Sales Agent Tab

### 6.1 Database Table: `sales_agents`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | VARCHAR(5) | Auto-generated sequential ID (00001, 00002...) |
| name | VARCHAR | Agent name |
| email | VARCHAR | Agent email (optional) |
| agent_type | VARCHAR | 'Office Sales Agent' or 'Vehicle Showroom Agent' |
| is_active | BOOLEAN | Active status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### 6.2 Component File

**File**: `dashboard/src/components/settings/SalesAgentTab.tsx`

### 6.3 Agent Types

```typescript
const AGENT_TYPES = [
  { value: 'Office Sales Agent', label: 'Office Sales Agent' },
  { value: 'Vehicle Showroom Agent', label: 'Vehicle Showroom Agent' },
] as const
```

| Agent Type | Description |
|------------|-------------|
| Office Sales Agent | Internal PCN office sales staff |
| Vehicle Showroom Agent | Third-party/external showroom agents |

### 6.4 State Management

```typescript
const [agents, setAgents] = useState<SalesAgent[]>([])
const [loading, setLoading] = useState(true)
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
const [agentToDelete, setAgentToDelete] = useState<string | null>(null)
const [formData, setFormData] = useState<{
  name: string
  email: string
  agent_type: 'Office Sales Agent' | 'Vehicle Showroom Agent'
}>({
  name: '',
  email: '',
  agent_type: 'Office Sales Agent',
})
```

### 6.5 Functions

#### Fetch Agents

```typescript
const fetchAgents = async () => {
  const { data, error } = await supabase
    .from('sales_agents')
    .select('*')
    .order('name')

  setAgents(data || [])
}
```

#### Add Agent

```typescript
const handleAddAgent = async () => {
  if (!formData.name.trim()) {
    alert('Please fill in Sales Agent Name')
    return
  }

  // Simplified - no user_id generation required
  const { error } = await supabase
    .from('sales_agents')
    .insert([{
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      agent_type: formData.agent_type,
      is_active: true,
    }])

  setFormData({ name: '', email: '', agent_type: 'Office Sales Agent' })
  setIsAddDialogOpen(false)
  fetchAgents()
}
```

> **📝 Note**: As of January 2026, the sequential `user_id` field has been removed. Agent creation is now simplified without ID generation.

#### Toggle Active Status

```typescript
const handleToggleActive = async (id: string, currentStatus: boolean) => {
  const { error } = await supabase
    .from('sales_agents')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  fetchAgents()
}
```

#### Delete Agent

```typescript
const confirmDelete = async () => {
  const { error } = await supabase
    .from('sales_agents')
    .delete()
    .eq('id', agentToDelete)

  fetchAgents()
}
```

### 6.6 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ In-house Sales Agents                     [+ Add new seller] │
│ Only in-house permanent sales staff are displayed.          │
├─────────────────────────────────────────────────────────────┤
│ User ID │ Name          │ Agent Type           │ Status │ 🗑│
├─────────┼───────────────┼─────────────────────┼────────┼───┤
│ 00001   │ Rashmina Yapa │ Office Sales Agent  │ [ON]   │ 🗑│
│ 00002   │ John Silva    │ Vehicle Showroom    │ [ON]   │ 🗑│
└─────────────────────────────────────────────────────────────┘
```

### 6.7 Integration Points

- **Sell Vehicle**: Select sales agent for transactions
- **Sales Reports**: Track agent performance
- **Financial Reports**: Agent-based sales breakdown

---

## 7. Countries Tab

### 7.1 Database Table: `countries`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Country name |
| is_active | BOOLEAN | Availability status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### 7.2 Component File

**File**: `dashboard/src/components/settings/CountriesTab.tsx`

### 7.3 State Management

```typescript
const [countries, setCountries] = useState<Country[]>([])
const [loading, setLoading] = useState(true)
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
const [newCountryName, setNewCountryName] = useState('')
```

### 7.4 Functions

#### Fetch Countries

```typescript
const fetchCountries = async () => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name')

  setCountries(data || [])
}
```

#### Add Country

```typescript
const handleAddCountry = async () => {
  if (!newCountryName.trim()) return

  const { error } = await supabase
    .from('countries')
    .insert([{ name: newCountryName, is_active: true }])

  setNewCountryName('')
  setIsAddDialogOpen(false)
  fetchCountries()
}
```

#### Toggle Active Status

```typescript
const handleToggleActive = async (id: string, currentStatus: boolean) => {
  const { error } = await supabase
    .from('countries')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  fetchCountries()
}
```

#### Delete Country

```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this country?')) return

  const { error } = await supabase
    .from('countries')
    .delete()
    .eq('id', id)

  fetchCountries()
}
```

### 7.5 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Vehicle Manufacture Countries               [+ Add Country] │
│ Manage countries where vehicles are manufactured            │
├─────────────────────────────────────────────────────────────┤
│ Country        │ Availability │ Actions                     │
├────────────────┼──────────────┼─────────────────────────────┤
│ Japan          │ [ON]         │ 🗑                          │
│ Germany        │ [ON]         │ 🗑                          │
│ South Korea    │ [OFF]        │ 🗑                          │
└─────────────────────────────────────────────────────────────┘
```

### 7.6 Common Countries

Pre-loaded manufacturing countries:
- Japan
- Germany
- South Korea
- India
- Thailand
- United Kingdom
- USA
- China

---

## 8. Types & Interfaces

### 8.1 Vehicle Brand & Model Types

```typescript
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

// Extended type for UI
export interface BrandWithModels extends VehicleBrand {
  models: VehicleModel[]
}
```

### 8.2 Price Category Type

```typescript
export interface PriceCategory {
  id: string
  name: string
  min_price: number
  max_price: number
  pcn_advance_amount: number
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### 8.3 Leasing Company Type

```typescript
export interface LeasingCompany {
  id: string
  company_id: string    // 5-digit auto-generated
  name: string
  is_active: boolean
  created_at: string
}
```

### 8.4 Sales Agent Type

```typescript
export interface SalesAgent {
  id: string
  user_id: string       // Sequential 5-digit ID
  name: string
  email?: string
  agent_type: 'Office Sales Agent' | 'Vehicle Showroom Agent'
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### 8.5 Country Type

```typescript
export interface Country {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```

---

## 9. File Structure Summary

```
dashboard/
├── src/
│   ├── app/(dashboard)/settings/
│   │   └── page.tsx                        # Main settings page with tabs
│   │
│   ├── components/settings/
│   │   ├── VehicleBrandsTab.tsx            # Vehicle brands management
│   │   ├── vehicle-brands-columns.tsx      # DataTable column definitions
│   │   ├── PriceCategoryTab.tsx            # Price categories management
│   │   ├── LeasingCompanyTab.tsx           # Leasing companies management
│   │   ├── SalesAgentTab.tsx               # Sales agents management
│   │   └── CountriesTab.tsx                # Countries management
│   │
│   ├── components/ui/
│   │   ├── data-table.tsx                  # Reusable data table
│   │   ├── dialog.tsx                      # Dialog/modal component
│   │   ├── switch.tsx                      # Toggle switch component
│   │   └── table.tsx                       # Table components
│   │
│   └── lib/
│       ├── database.types.ts               # TypeScript interfaces
│       └── supabase-client.ts              # Supabase client
```

---

## 10. UI Components Used

| Component | Source | Usage |
|-----------|--------|-------|
| Tabs, TabsList, TabsTrigger, TabsContent | `@/components/ui/tabs` | Tab navigation |
| Table, TableHeader, TableBody, TableRow, TableCell | `@/components/ui/table` | Data tables |
| Dialog, DialogContent, DialogHeader, DialogTitle | `@/components/ui/dialog` | Modal dialogs |
| Button | `@/components/ui/button` | Action buttons |
| Input | `@/components/ui/input` | Text inputs |
| Label | `@/components/ui/label` | Form labels |
| Switch | `@/components/ui/switch` | Toggle switches |
| Select, SelectContent, SelectItem | `@/components/ui/select` | Dropdown selects |
| DataTable | `@/components/ui/data-table` | Paginated data table |
| Plus, Trash2, Pencil, Search | `lucide-react` | Icons |

---

## 11. Performance Optimizations

### 11.1 Parallel Queries

Vehicle Brands Tab fetches brands and models simultaneously:
```typescript
const [brandsResult, modelsResult] = await Promise.all([
  supabase.from('vehicle_brands').select('*').order('name'),
  supabase.from('vehicle_models').select('*').order('name')
])
```

### 11.2 Memoization

Search filtering uses `useMemo` to avoid recalculation:
```typescript
const filteredBrands = useMemo(() => {
  if (!searchQuery) return brandsWithModels
  return brandsWithModels.filter(/* ... */)
}, [searchQuery, brandsWithModels])
```

### 11.3 Optimistic Updates

UI updates immediately without waiting for database confirmation:
```typescript
// Update UI first
setBrands(prev => [...prev, data])
// Database operation already completed
```

---

## 12. Future Enhancements

- **Bulk Import/Export**: CSV import for brands, models, and categories
- **Logo Upload**: Add brand logo images
- **Audit Trail**: Track who modified settings and when
- **Validation Rules**: Price range overlap detection
- **Search in All Tabs**: Global search across all settings
- **Soft Delete**: Archive instead of permanent delete
- **Default Values**: System defaults for new installations
