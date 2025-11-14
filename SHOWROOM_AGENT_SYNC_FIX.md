# Showroom Agent Data Synchronization Fix

## Issues Fixed

### 1. **Missing Showroom Agent Data**
**Problem:** Showroom agent sales were not appearing in the report because:
- Queries were only fetching from `pending_vehicle_sales` table
- Some showroom agent data was stored in the separate `sold_vehicles` table
- The `third_party_agent` field was not being properly synced with registered agents

### 2. **Incomplete Data Sources**
**Solution:** Now fetches from BOTH tables:
- `pending_vehicle_sales` (status='sold') 
- `sold_vehicles` table
- Combined and deduplicated by ID

### 3. **Agent Type Filtering Issue**
**Problem:** Default was set to "Office Sales Agent" only, hiding showroom agents
**Solution:** 
- Changed default to "All Agent Types"
- Added "All Agent Types" option to dropdown
- Now shows both office and showroom agents by default

## Data Fetching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    SOLD VEHICLES DATA                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Source 1: pending_vehicle_sales (status='sold')            │
│  ├── sales_agent_id → Office/Showroom Agents from table     │
│  └── third_party_agent → Direct showroom agent names        │
│                                                               │
│  Source 2: sold_vehicles                                     │
│  ├── sales_agent_id → Office/Showroom Agents from table     │
│  └── third_party_agent → Direct showroom agent names        │
│                                                               │
│  ✓ Combine both sources                                      │
│  ✓ Remove duplicates by ID                                   │
│  ✓ Process with agent type detection                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Agent Type Detection

```typescript
if (sale.sales_agents) {
  // From sales_agents table (registered)
  agentName = sale.sales_agents.name
  agentTypeValue = sale.sales_agents.agent_type
} else if (sale.third_party_agent) {
  // Stored as text field (third-party)
  agentName = sale.third_party_agent
  agentTypeValue = 'Vehicle Showroom Agent'
}
```

## Key Changes

### 1. Dual Data Source Fetch
```typescript
// Fetch from pending_vehicle_sales
const { data: pendingSalesData } = await supabase
  .from('pending_vehicle_sales')
  .select(...)
  .eq('status', 'sold')

// Fetch from sold_vehicles
const { data: soldVehiclesData } = await supabase
  .from('sold_vehicles')
  .select(...)

// Combine
const salesData = [...pendingSalesData, ...soldVehiclesData]
```

### 2. Deduplication
```typescript
const uniqueSales = Array.from(
  new Map(processedSales.map(item => [item.id, item])).values()
)
```

### 3. Default Filter Changed
- From: `'Office Sales Agent'`
- To: `'all'`
- Added "All Agent Types" option

### 4. Statistics Now Aggregate Both Sources
```typescript
// Counts all sales from both tables
const statsMap = new Map<string, { count: number; type: string }>()
uniqueSales.forEach(sale => {
  const key = `${sale.sales_agent_name}|${sale.agent_type}`
  statsMap.set(key, { count: current.count + 1, type: current.type })
})
```

## What Now Works

✅ Office Sales Agent sales display correctly  
✅ Registered Showroom Agent sales display correctly  
✅ Third-party Showroom Agent sales display correctly  
✅ Statistics show accurate counts for ALL agent types  
✅ Default view shows all agents (both types)  
✅ Filtering by agent type works correctly  
✅ Individual agent filtering includes all agents  
✅ CSV export includes all data from both sources  
✅ Pagination works with complete dataset  

## Testing Instructions

1. **View All Agents** (Default)
   - Should see both Office Sales Agent and Showroom Sale Agent sales
   - Statistics should show counts for both types

2. **Filter by Office Sales Agent**
   - Should show only office agent sales
   - Statistics should show only office agent count

3. **Filter by Showroom Sale Agent**
   - Should show both registered AND third-party showroom agents
   - Should include all showroom agent sales data
   - Dropdown should list all available showroom agents

4. **Filter by Specific Agent**
   - Should show only that agent's sales
   - Should work for all agent types

5. **Export CSV**
   - Should export all filtered records
   - Should include agent type and name columns
   - Should work with both office and showroom agents

## Database Queries

### Query 1: Pending Vehicle Sales
```sql
SELECT * FROM pending_vehicle_sales 
WHERE status = 'sold'
ORDER BY updated_at DESC
```

### Query 2: Sold Vehicles  
```sql
SELECT * FROM sold_vehicles 
ORDER BY updated_at DESC
```

### Combined Processing
- Join with `sales_agents` table on `sales_agent_id`
- Check `third_party_agent` field for direct agent names
- Determine agent type (Office or Showroom)
- Combine data, remove duplicates, display
