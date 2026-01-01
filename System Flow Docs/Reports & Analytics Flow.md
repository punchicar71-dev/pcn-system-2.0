# Reports & Analytics Flow - PCN System

## Overview

The Reports & Analytics module provides comprehensive reporting capabilities for vehicle sales data, financial analysis, and sales agent performance tracking. The module is accessible via the `/reports` route in the dashboard and consists of three main tabs: **Summary**, **Financial Reports**, and **Sales Agents Report**.

**Access Level**: Admin Only (Role-Based Access Control)

**Last Updated**: January 1, 2026

> **⚠️ AUTHENTICATION STATUS**: The system uses cookie-based session authentication. Role verification is performed client-side via `useRoleAccess` hook. Full server-side role validation will be added with Better Auth integration.

> **✅ DATA CONSISTENCY**: All reports now properly handle multiple field name variations (`sale_price`, `selling_price`, `selling_amount`) to ensure accurate data display across historical and new records.

---

## Table of Contents

1. [User Access Levels & Permissions](#1-user-access-levels--permissions)
2. [Database Schema & Connections](#2-database-schema--connections)
3. [Summary Tab - Functions & Logic](#3-summary-tab---functions--logic)
4. [Financial Reports Tab - Functions & Logic](#4-financial-reports-tab---functions--logic)
5. [Sales Agents Report Tab - Functions & Logic](#5-sales-agents-report-tab---functions--logic)
6. [UI Design & Components](#6-ui-design--components)
7. [Data Types & Interfaces](#7-data-types--interfaces)
8. [Export Functionality](#8-export-functionality)

---

## 1. User Access Levels & Permissions

### 1.1 Role-Based Access Control (RBAC)

**Configuration File**: `dashboard/src/lib/rbac/config.ts`

```typescript
export const RESTRICTED_ROUTES: RoutePermission[] = [
  {
    path: '/reports',
    allowedRoles: ['admin'],
    name: 'Reports & Analytics',
  },
]

export const NAVIGATION_RESTRICTIONS: Record<string, UserRole[]> = {
  '/reports': ['admin'],
}
```

### 1.2 User Roles

| Role | Access Level | Reports Access |
|------|-------------|----------------|
| `admin` | Full Access | ✓ Full access to all reports |
| `editor` | Limited Access | ✗ No access (redirected) |

### 1.3 Access Control Implementation

**Hook**: `dashboard/src/hooks/useRoleAccess.ts`

The `useRoleAccess` hook provides:
- `userRole` - Current user's role (admin/editor)
- `hasPermissionFor(allowedRoles)` - Check permission for specific roles
- `shouldShowNavItem(href)` - Determines navigation visibility
- `canAccessRoute(path)` - Route access validation

**RoleGuard Component**: `dashboard/src/components/auth/RoleGuard.tsx`

Wraps protected components to prevent unauthorized access.

### 1.4 Navigation Filtering

**Layout File**: `dashboard/src/app/(dashboard)/layout.tsx`

```typescript
const { hasPermissionFor } = useRoleAccess()

const filteredNavigation = useMemo(() => {
  return navigation.filter(item => hasPermissionFor(item.allowedRoles))
}, [hasPermissionFor])
```

---

## 2. Database Schema & Connections

### 2.1 Primary Tables Used

#### `pending_vehicle_sales` Table

**Purpose**: Main source for sales data (both pending and sold transactions)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vehicle_id` | UUID | Foreign key to vehicles |
| `vehicle_number` | VARCHAR(50) | Vehicle registration number (snapshot) |
| `brand_name` | VARCHAR(100) | Brand name (snapshot) |
| `model_name` | VARCHAR(100) | Model name (snapshot) |
| `manufacture_year` | INTEGER | Year of manufacture (snapshot) |
| `selling_price` | DECIMAL(12,2) | Sale price (database column) |
| `sale_price` | DECIMAL(12,2) | Sale price (alternate field from sell-vehicle page) |
| `selling_amount` | DECIMAL(12,2) | Sale price (legacy field name) |
| `advance_amount` | DECIMAL(12,2) | Down payment |
| `payment_type` | VARCHAR(50) | Cash, Leasing, Bank Transfer, Check |
| `status` | VARCHAR(20) | 'pending', 'reserved', 'sold', 'cancelled' |
| `sales_agent_id` | UUID | Foreign key to sales_agents |
| `third_party_agent` | VARCHAR(100) | Vehicle Showroom Agent name |
| `updated_at` | TIMESTAMP | Last update timestamp (used as sold date) |

> **📝 Note**: The table has multiple price fields due to historical schema evolution. Reports must handle all three field names (`sale_price`, `selling_price`, `selling_amount`) for data consistency.

#### `vehicles` Table

**Purpose**: Vehicle inventory data

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vehicle_number` | VARCHAR(50) | Registration number |
| `brand_id` | UUID | Foreign key to vehicle_brands |
| `model_id` | UUID | Foreign key to vehicle_models |
| `body_type` | VARCHAR(50) | SUV, Sedan, Hatchback, etc. |
| `status` | VARCHAR(20) | 'In Sale', 'Reserved', 'Sold' |
| `selling_amount` | DECIMAL(12,2) | Listed price |
| `entry_date` | DATE | Date added to inventory |

#### `sales_agents` Table

**Purpose**: Sales agent registry

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |

> **📝 Note**: The `user_id` field was removed in January 2026 for database simplification.
| `name` | VARCHAR(100) | Agent name |
| `agent_type` | VARCHAR(50) | 'Office Sales Agent' or 'Vehicle Showroom Agent' |
| `is_active` | BOOLEAN | Agent status |
| `email` | VARCHAR(255) | Contact email |

#### `price_categories` Table

**Purpose**: PCN advance calculation tiers

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `min_price` | DECIMAL(12,2) | Minimum price threshold |
| `max_price` | DECIMAL(12,2) | Maximum price threshold |
| `pcn_advance_amount` | DECIMAL(12,2) | PCN profit/advance for this tier |
| `is_active` | BOOLEAN | Category status |

### 2.2 Supabase Connection

**Client**: `dashboard/src/lib/supabase-client.ts`

```typescript
const supabase = createClient()
```

---

## 3. Summary Tab - Functions & Logic

**File**: `dashboard/src/components/reports/SummaryReportsTab.tsx`

### 3.1 State Management

```typescript
const [dateRange, setDateRange] = useState('last30days')
const [loading, setLoading] = useState(true)
const [chartData, setChartData] = useState<ChartDataPoint[]>([])
const [vehicleBreakdown, setVehicleBreakdown] = useState<VehicleBreakdown[]>([])
const [totalVehicles, setTotalVehicles] = useState(0)
const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([])
const [brandSales, setBrandSales] = useState<BrandSales[]>([])
```

### 3.2 Date Range Options

| Option | Days | Description |
|--------|------|-------------|
| `last7days` | 7 | Last 7 days |
| `last30days` | 30 | Last 30 days (default) |
| `last90days` | 90 | Last 3 months |
| `last365days` | 365 | Last year |

### 3.3 Data Fetching Functions

#### `fetchDashboardData()`

**Purpose**: Main orchestrator function that triggers all data fetches

```typescript
const fetchDashboardData = async () => {
  const daysCount = getDaysCount(dateRange)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysCount)
  const startDateStr = startDate.toISOString().split('T')[0]

  await Promise.all([
    fetchChartData(startDateStr, daysCount),
    fetchVehicleBreakdown(),
    fetchAgentPerformance(startDateStr),
    fetchBrandSales(startDateStr)
  ])
}
```

#### `fetchChartData(startDateStr, daysCount)`

**Purpose**: Fetches data for the Sales Performance Area Chart

**Database Query**:
```typescript
// Vehicles added to inventory
const { data: vehicles } = await supabase
  .from('vehicles')
  .select('entry_date, status')
  .gte('entry_date', startDateStr)

// Sold vehicles
const { data: soldSales } = await supabase
  .from('pending_vehicle_sales')
  .select('updated_at')
  .eq('status', 'sold')
  .gte('updated_at', startDateStr)
```

**Output**: Array of `ChartDataPoint` with daily inventory and sold counts

#### `fetchVehicleBreakdown()`

**Purpose**: Gets current showroom inventory by body type

**Database Query**:
```typescript
const { data: vehicles } = await supabase
  .from('vehicles')
  .select('body_type')
  .in('status', ['In Sale', 'Reserved'])
```

**Body Types Tracked**: SUV, Sedan, Hatchback, Wagon, Coupe, Convertible, Van, Truck

#### `fetchAgentPerformance(startDateStr)`

**Purpose**: Gets sales count per agent for the selected period

**Database Query**:
```typescript
const { data: soldSales } = await supabase
  .from('pending_vehicle_sales')
  .select(`
    *,
    sales_agents:sales_agent_id (
      id, name, agent_type
    )
  `)
  .eq('status', 'sold')
  .gte('updated_at', startDateStr)
```

**Logic**:
1. Maps Office Sales Agents from `sales_agent_id` relationship
2. Maps Vehicle Showroom Agents from `third_party_agent` field
3. Aggregates sales count per agent
4. Sorts by sales count descending

#### `fetchBrandSales(startDateStr)`

**Purpose**: Gets top 10 selling brands for doughnut chart

**Database Query**:
```typescript
const { data: soldSales } = await supabase
  .from('pending_vehicle_sales')
  .select(`
    *,
    vehicles:vehicle_id (
      brand_id,
      vehicle_brands:brand_id (name)
    )
  `)
  .eq('status', 'sold')
  .gte('updated_at', startDateStr)
```

**Data Processing**:
```typescript
// Prioritize snapshot data over joined data
const brandName = sale.brand_name || sale.vehicles?.vehicle_brands?.name || 'Unknown'
const sellingAmount = sale.sale_price ?? sale.selling_price ?? sale.selling_amount ?? 0
```

**Output**: Top 10 brands sorted by sales volume with assigned colors

> **📝 Note**: Uses snapshot data as primary source and handles all price field variations for accuracy.

### 3.4 Charts & Visualizations

#### Sales Area Chart (`SalesAreaChart` Component)

- **Type**: Stacked Area Chart (Recharts)
- **Data Keys**: `inventory` (orange), `sold` (teal)
- **Features**: 
  - Gradient fills
  - Interactive tooltips
  - Legend
  - Date-based X-axis

#### Brand Sales Doughnut Chart (`DoughnutChart` Component)

- **Type**: Custom SVG Doughnut Chart
- **Features**:
  - Center total display
  - Color-coded segments
  - Legend grid
  - Hover effects

---

## 4. Financial Reports Tab - Functions & Logic

**File**: `dashboard/src/components/reports/FinancialReportsTab.tsx`

### 4.1 State Management

```typescript
const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
  from: startOfMonth(today),  // Current month start
  to: endOfMonth(today),      // Current month end
})
const [loading, setLoading] = useState(true)
const [reportData, setReportData] = useState<FinancialReportData[]>([])
const [currentPage, setCurrentPage] = useState(1)
const [rowsPerPage, setRowsPerPage] = useState(5)
```

// Using select(*) to get all columns including price field variations
const { data: soldSales } = await supabase
  .from('pending_vehicle_sales')
  .select(`
    *,
    vehicles:vehicle_id (
      id, vehicle_number, selling_amount, brand_id, model_id,
      vehicle_brands:brand_id (id, name),
      vehicle_models:model_id (id, name)
    )
  `)
  .eq('status', 'sold')
  .gte('updated_at', dateRange.from.toISOString())
  .lte('updated_at', dateRange.to.toISOString())
  .order('updated_at', { ascending: false })

// Fetch price categories for PCN advance calculation
const { data: priceCategories } = await supabase
  .from('price_categories')
  .select('*')
  .eq('is_active', true)
  .order('min_price')
```

**Data Processing**:

```typescript
// Handle multiple field name variations for backwards compatibility
const sellingAmount = sale.sale_price ?? sale.selling_price ?? sale.selling_amount ?? 0
```

> **📝 Note**: The query uses `select(*)` to capture all field variations. The processing logic handles `sale_price` (from sell-vehicle page), `selling_price` (database schema), and `selling_amount` (legacy) for complete backwards compatibility.Fetch price categories for PCN advance calculation
const { data: priceCategories } = await supabase
  .from('price_categories')
  .select('*')
  .eq('is_active', true)
  .order('min_price')
```

### 4.3 PCN Advance Calculation Logic

```typescript
// Find matching price category for each sale
const matchingCategory = priceCategories.find(
  (cat) => sellingAmount >= cat.min_price && sellingAmount <= cat.max_price
)
if (matchingCategory) {
  pcnAdvance = matchingCategory.pcn_advance_amount || 0
}
```

### 4.4 Summary Statistics

| Metric | Calculation |
|--------|-------------|
| Total Vehicles Sold | `reportData.length` |
| Total Sales Amount | `sum(sales_price)` |
| Total PCN Advance (Profit) | `sum(pcn_advance)` |

### 4.5 Report Columns

| Column | Source | Description |
|--------|--------|-------------|
| Vehicle Number | `vehicle_number` (snapshot) | Registration plate |
| Brand | `brand_name` (snapshot) | Vehicle brand |
| Model | `model_name` (snapshot) | Vehicle model |
| Seller Price | `vehicles.selling_amount` | Original listing price |
| Sales Price | `selling_amount` | Final sale price |
| Down Payment | `advance_amount` | Customer down payment |
| PCN Advance | Calculated | PCN profit margin |
| Payment Type | `payment_type` | Cash/Leasing/etc. |
| Sold Out Date | `updated_at` | Sale completion date |

---

## 5. Sales Agents Report Tab - Functions & Logic

**File**: `dashboard/src/components/reports/SalesAgentsReportTab.tsx`

### 5.1 State Management

```typescript
const [loading, setLoading] = useState(true)
const [agentType, setAgentType] = useState<'Office Sales Agent' | 'Vehicle Showroom Agent' | 'all'>('all')
const [selectedAgent, setSelectedAgent] = useState<string>('all')
const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
  from: undefined,
  to: undefined,
})

// Data states
const [agents, setAgents] = useState<SalesAgent[]>([])
const [agentStats, setAgentStats] = useState<AgentStats[]>([])
const [salesData, setSalesData] = useState<SaleRecord[]>([])
const [filteredSalesData, setFilteredSalesData] = useState<SaleRecord[]>([])

// Pagination states
const [currentPage, setCurrentPage] = useState(1)
const [rowsPerPage, setRowsPerPage] = useState(5)
```

### 5.2 Agent Types

| Type | Description | Storage |
|------|-------------|---------|
| Office Sales Agent | Internal PCN sales staff | `sales_agent_id` FK |
| Vehicle Showroom Agent | Third-party/external agents | `third_party_agent` field |

### 5.3 Data Fetching: `fetchInitialData()`

**Step 1**: Fetch all active agents from settings

```typescript
const { data: agentsData } = await supabase
  .from('sales_agents')
  .select('*')
  .eq('is_active', true)
  .order('name')
```

**Step 2**: Fetch all sold sales with vehicle and agent details

```typescript
// Using select(*) to capture all field variations
const { data: soldOutSalesData } = await supabase
  .from('pending_vehicle_sales')
  .select(`
    *,
    vehicle_number, brand_name, model_name, manufacture_year,
    vehicles:vehicle_id (
      id, vehicle_number, brand_id, model_id, manufacture_year, selling_amount,
      vehicle_brands:brand_id (id, name),
      vehicle_models:model_id (id, name)
    ),
    sales_agents:sales_agent_id (id, name, agent_type)
  `)
  .eq('status', 'sold')
  .order('updated_at', { ascending: false })
```

> **📝 Note**: The query includes `*` to capture all price field variations (`sale_price`, `selling_price`, `selling_amount`) for data consistency.

### 5.4 Data Processing Logic

**Processing Sales Records**:

```typescript
const processedSales = soldOutSalesData.map((sale) => {
  // Determine Office Sales Agent
  const officeSalesAgent = sale.sales_agents?.name || 'N/A'
  
  // Determine Vehicle Showroom Agent (third_party_agent field)
  const showroomAgent = sale.third_party_agent || 'N/A'
  
  return {
    id: sale.id,
    vehicle_number: sale.vehicle_number || vehicle?.vehicle_number || 'Unknown',
    brand_name: sale.brand_name || vehicle?.vehicle_brands?.name || 'Unknown',
    model_name: sale.model_name || vehicle?.vehicle_models?.name || 'Unknown',
    manufacture_year: sale.manufacture_year || vehicle?.manufacture_year || 0,
    // Handle multiple field name variations for price
    selling_amount: sale.sale_price ?? sale.selling_price ?? sale.selling_amount ?? 0,
    payment_type: sale.payment_type,
    office_sales_agent: officeSalesAgent,
    showroom_agent: showroomAgent,
    sold_date: sale.updated_at,
  }
})
```

> **📝 Note**: The price calculation uses nullish coalescing (`??`) to handle all three field name variations in order of preference: `sale_price` → `selling_price` → `selling_amount`.

### 5.5 Filtering Logic: `filterSalesData()`

**Filter by Agent Type**:
```typescript
if (agentType === 'Office Sales Agent') {
  filtered = filtered.filter(sale => sale.office_sales_agent !== 'N/A')
} else if (agentType === 'Vehicle Showroom Agent') {
  filtered = filtered.filter(sale => sale.showroom_agent !== 'N/A')
}
```

**Filter by Specific Agent**:
```typescript
if (selectedAgent !== 'all') {
  if (agentType === 'Office Sales Agent') {
    filtered = filtered.filter(sale => sale.office_sales_agent === selectedAgent)
  } else if (agentType === 'Vehicle Showroom Agent') {
    filtered = filtered.filter(sale => sale.showroom_agent === selectedAgent)
  } else {
    // All types - check both fields
    filtered = filtered.filter(sale => 
      sale.office_sales_agent === selectedAgent || 
      sale.showroom_agent === selectedAgent
    )
  }
}
```

**Filter by Date Range**:
```typescript
if (dateRange.from && dateRange.to) {
  filtered = filtered.filter(sale => {
    const saleDate = new Date(sale.sold_date)
    return saleDate >= dateRange.from && saleDate <= dateRange.to
  })
}
```

### 5.6 Agent Stats Functions

```typescript
// Count active Office Sales Agents
const getOfficeAgentStats = () => {
  return agents.filter(agent => 
    agent.agent_type === 'Office Sales Agent' && agent.is_active
  ).length
}

// Count active Vehicle Showroom Agents
const getShowroomAgentStats = () => {
  return agents.filter(agent => 
    agent.agent_type === 'Vehicle Showroom Agent' && agent.is_active
  ).length
}
```

### 5.7 Dynamic Agent Dropdown: `getAgentsForType()`

Returns filtered list of agents based on selected agent type, combining data from:
1. `sales_agents` table (registered agents)
2. Sales data (for historical agents not in settings)

---

## 6. UI Design & Components

### 6.1 Page Structure

**File**: `dashboard/src/app/(dashboard)/reports/page.tsx`

```tsx
<Tabs defaultValue="summary" className="w-full">
  <TabsList>
    <TabsTrigger value="summary">Summary</TabsTrigger>
    <TabsTrigger value="financial">Financial Reports</TabsTrigger>
    <TabsTrigger value="salesAgents">Sales Agents Report</TabsTrigger>
  </TabsList>

  <TabsContent value="summary">
    <SummaryReportsTab />
  </TabsContent>

  <TabsContent value="financial">
    <FinancialReportsTab />
  </TabsContent>

  <TabsContent value="salesAgents">
    <SalesAgentsReportTab />
  </TabsContent>
</Tabs>
```

### 6.2 Summary Tab UI Components

| Component | Description |
|-----------|-------------|
| Date Range Selector | Dropdown (7/30/90/365 days) |
| Sales Performance Chart | Stacked area chart with inventory vs sold |
| Showroom Available Vehicles | Card showing total count by body type |
| Sales Agent Performance | Table with agent name, type, sales count |
| Most Selling Brands | Doughnut chart with top 10 brands |

### 6.3 Financial Reports Tab UI Components

| Component | Description |
|-----------|-------------|
| Date Range Picker | Calendar popup for from/to dates |
| Export CSV Button | Downloads report as CSV |
| Total Sale Card | Shows vehicle count sold |
| Total Transaction Card | Shows total sales amount |
| PCN Profit Card | Shows total PCN advance/profit |
| Data Table | Paginated table with all financial columns |
| Pagination Controls | Rows per page selector + page navigation |

### 6.4 Sales Agents Report Tab UI Components

| Component | Description |
|-----------|-------------|
| Office Sale Agent Card | Shows active count with green badge |
| Vehicle Showroom Agent Card | Shows active count with green badge |
| Agent Type Filter | Dropdown (All/Office/Showroom) |
| Agent Filter | Dynamic dropdown based on type |
| Date Range Picker | Calendar popup for date filtering |
| Selected Agent Info | Shows agent name and total sales |
| Export CSV Button | Downloads filtered report |
| Sales Table | 9-column table with vehicle and agent details |
| Pagination Controls | Rows per page + page navigation |

### 6.5 Shared UI Components

| Component | Source |
|-----------|--------|
| Card, CardHeader, CardContent | `@/components/ui/card` |
| Table, TableRow, TableCell | `@/components/ui/table` |
| Select, SelectTrigger, SelectContent | `@/components/ui/select` |
| Button | `@/components/ui/button` |
| Badge | `@/components/ui/badge` |
| Calendar | `@/components/ui/calendar` |
| Popover | `@/components/ui/popover` |
| Separator | `@/components/ui/separator` |
| Tabs, TabsList, TabsTrigger | `@/components/ui/tabs` |

### 6.6 Payment Type Badges

| Type | Color Scheme |
|------|--------------|
| Cash | Green (bg-green-100 text-green-700) |
| Leasing | Blue (bg-blue-100 text-blue-700) |
| Bank Transfer | Purple (bg-purple-100 text-purple-700) |
| Check | Orange (bg-orange-100 text-orange-700) |

### 6.7 Agent Type Badges

| Type | Color Scheme |
|------|--------------|
| Office Sales Agent | Purple (bg-purple-100 text-purple-700) |
| Vehicle Showroom Agent | Green (bg-green-100 text-green-700) |

---

## 7. Data Types & Interfaces

### 7.1 Summary Tab Types

```typescript
interface ChartDataPoint {
  day: number
  date: string
  inventory: number
  sold: number
  displayDate?: string
}

interface VehicleBreakdown {
  type: string
  count: number
}

interface AgentPerformance {
  name: string
  type: 'Office Sales Agent' | 'Vehicle Showroom Agent'
  sales: number
  typeColor: string
}

interface BrandSales {
  name: string
  value: number
  color: string
}
```

### 7.2 Financial Reports Types

```typescript
interface FinancialReportData {
  id: string
  vehicle_number: string
  brand_name: string
  model_name: string
  seller_price: number
  sales_price: number
  down_payment: number
  pcn_advance: number
  payment_type: string
  sold_out_date: string
}
```

### 7.3 Sales Agents Report Types

```typescript
interface SalesAgent {
  id: string
  user_id: string
  name: string
  email?: string
  agent_type: 'Office Sales Agent' | 'Vehicle Showroom Agent'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AgentStats {
  agentType: 'Office Sales Agent' | 'Vehicle Showroom Agent'
  name: string
  activeCount: number
}

interface SaleRecord {
  id: string
  vehicle_number: string
  brand_name: string
  model_name: string
  manufacture_year: number
  selling_amount: number
  payment_type: string
  office_sales_agent: string
  showroom_agent: string
  sold_date: string
}
```

### 7.4 Shared Analytics Types

**File**: `shared/types.ts`

```typescript
export interface DashboardStats {
  availableVehicles: {
    total: number
    sedan: number
    hatchback: number
    suv: number
  }
  pendingVehicles: {
    total: number
    sedan: number
    hatchback: number
    suv: number
  }
  soldToday: {
    total: number
    sedan: number
    hatchback: number
    suv: number
  }
}

export interface SalesAnalytics {
  totalSales: number
  salesByCategory: {
    category: string
    count: number
  }[]
  salesByAgent: {
    agentName: string
    count: number
  }[]
}
```

---

## 8. Export Functionality

### 8.1 Financial Reports CSV Export

**Function**: `handleExportCSV()`

**Headers**:
```
Vehicle Number, Brand, Model, Seller Price, Sales Price, 
Down Payment, PCN Advance, Payment Type, Sold Out Date
```

**File Naming**: `financial_report_{from_date}_to_{to_date}.csv`

**Implementation**:
```typescript
const handleExportCSV = () => {
  if (reportData.length === 0) return

  const headers = [
    'Vehicle Number', 'Brand', 'Model', 'Seller Price', 
    'Sales Price', 'Down Payment', 'PCN Advance', 
    'Payment Type', 'Sold Out Date'
  ]

  const csvContent = [
    headers.join(','),
    ...reportData.map(row => [
      row.vehicle_number,
      row.brand_name,
      row.model_name,
      row.seller_price,
      row.sales_price,
      row.down_payment,
      row.pcn_advance,
      row.payment_type,
      format(new Date(row.sold_out_date), 'yyyy-MM-dd'),
    ].join(','))
  ].join('\n')

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.setAttribute('href', URL.createObjectURL(blob))
  link.setAttribute('download', `financial_report_${format(dateRange.from!, 'yyyy-MM-dd')}_to_${format(dateRange.to!, 'yyyy-MM-dd')}.csv`)
  link.click()
}
```

### 8.2 Sales Agents Report CSV Export

**Function**: `handleExportCSV()`

**Headers**:
```
Vehicle Number, Brand, Model, Year, Sales Price, Payment Type,
Office Sales Agent, Vehicle Showroom Agent, Sold Out Date
```

**File Naming**: `sales_agents_report_{timestamp}.csv`

**Implementation**:
```typescript
const handleExportCSV = () => {
  if (filteredSalesData.length === 0) {
    alert('No data to export')
    return
  }

  const headers = [
    'Vehicle Number', 'Brand', 'Model', 'Year', 'Sales Price',
    'Payment Type', 'Office Sales Agent', 'Vehicle Showroom Agent',
    'Sold Out Date'
  ]

  const rows = filteredSalesData.map(record => [
    record.vehicle_number,
    record.brand_name,
    record.model_name,
    record.manufacture_year,
    `Rs. ${record.selling_amount.toLocaleString()}`,
    record.payment_type,
    record.office_sales_agent,
    record.showroom_agent,
    format(new Date(record.sold_date), 'yyyy.MM.dd'),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  
  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sales_agents_report_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

---

## 9. File Structure Summary

```
dashboard/
├── src/
│   ├── app/(dashboard)/
│   │   └── reports/
│   │       └── page.tsx              # Main reports page with tabs
│   │
│   ├── components/
│   │   └── reports/
│   │       ├── SummaryReportsTab.tsx      # Summary tab component
│   │       ├── FinancialReportsTab.tsx    # Financial reports component
│   │       └── SalesAgentsReportTab.tsx   # Sales agents report component
│   │
│   ├── hooks/
│   │   └── useRoleAccess.ts          # RBAC hook for access control
│   │
│   └── lib/
│       ├── rbac/
│       │   ├── index.ts              # RBAC module exports
│       │   ├── types.ts              # Role types and helpers
│       │   └── config.ts             # Route restrictions config
│       │
│       └── supabase-client.ts        # Supabase client initialization
│
shared/
└── types.ts                          # Shared TypeScript types
```

---

## 10. Security Considerations

### 10.1 Access Control Layers

1. **Client-Side Navigation Filtering**
   - Navigation items filtered based on user role
   - Reports link only visible to admins

2. **Route Protection (RoleGuard)**
   - Component wrapper prevents unauthorized rendering
   - Redirects non-admin users

3. **Hook-Level Validation**
   - `useRoleAccess` hook validates permissions
   - Returns `false` for `hasPermissionFor()` if unauthorized

### 10.2 Data Security

- All database queries use Supabase RLS (Row Level Security)
- User authentication required for all API calls
- Session validation on each request

---

## 11. Future Enhancements

1. **PDF Export** - Add PDF generation for reports
2. **Email Reports** - Schedule automated report emails
3. **Custom Date Presets** - Quick filters (This Month, Last Quarter, etc.)
4. **Comparison Mode** - Compare periods (This month vs Last month)
5. **Additional Metrics**:
   - Profit margin analysis
   - Agent commission calculations
   - Inventory turnover rates
   - Customer demographics
6. **Dashboard Widgets** - Embeddable report widgets for main dashboard
