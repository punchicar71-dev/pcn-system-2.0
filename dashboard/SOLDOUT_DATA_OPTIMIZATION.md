# Sold-Out Vehicles Data Fetching Optimization

## Overview
Optimized the Dashboard's "Sold-Out Vehicles (Total)" card to fetch data more efficiently and handle edge cases where vehicles have been re-added after being sold.

## Problem
The previous implementation had two issues:

1. **Performance**: The dashboard was fetching sold-out vehicle data by joining `pending_vehicle_sales` with the `vehicles` table to get `body_type` information
2. **Data Loss**: When a vehicle was sold and later re-added to inventory, the old sold record would have `vehicle_id = NULL`, causing the LEFT JOIN to the `vehicles` table to fail and losing the ability to display vehicle body_type stats

## Solution

### 1. Database Migration
Created migration `2025_12_13_add_body_type_to_snapshot.sql` that:
- Adds `body_type` column to `pending_vehicle_sales` table
- Backfills existing records with body_type from vehicles table
- Creates index on body_type for better performance

### 2. Dashboard Query Optimization
**Before:**
```typescript
const { data: soldSalesData } = await supabase
  .from('pending_vehicle_sales')
  .select(`
    id,
    vehicle_id,
    updated_at,
    vehicles (
      body_type
    )
  `)
  .eq('status', 'sold')
```

**After:**
```typescript
const { data: soldSalesData } = await supabase
  .from('pending_vehicle_sales')
  .select('id, body_type, updated_at')
  .eq('status', 'sold')
```

### 3. Updated Sell Vehicle Flow
Modified the following files to save `body_type` snapshot:
- `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx` - Saves body_type when creating sale
- `dashboard/src/app/(dashboard)/sales-transactions/page.tsx` - Populates body_type when marking as sold
- `dashboard/src/components/sell-vehicle/SellingInfo.tsx` - Fetches body_type from vehicle_inventory_view

## Benefits

1. **✅ Better Performance**: 
   - No JOIN needed - direct column access
   - Reduced query complexity
   - Faster data fetching

2. **✅ Data Integrity**:
   - Works correctly when vehicle_id is NULL
   - Preserves historical body_type information
   - Supports multiple sold-out records for same vehicle number

3. **✅ Scalability**:
   - Indexed body_type column for fast filtering
   - Efficient for large datasets

## Files Changed

### Migration
- `dashboard/migrations/2025_12_13_add_body_type_to_snapshot.sql`

### Dashboard
- `dashboard/src/app/(dashboard)/dashboard/page.tsx`

### Sell Vehicle Flow
- `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx`
- `dashboard/src/app/(dashboard)/sales-transactions/page.tsx`
- `dashboard/src/components/sell-vehicle/SellingInfo.tsx`

## Testing
After applying the migration:

1. **Verify Migration:**
   ```sql
   SELECT COUNT(*) as total_records,
          COUNT(body_type) as records_with_body_type
   FROM pending_vehicle_sales
   WHERE status = 'sold';
   ```

2. **Test Dashboard:**
   - Open dashboard
   - Verify "Sold-Out Vehicles (Total)" card displays correctly
   - Check console for optimized query logs

3. **Test Sell Flow:**
   - Create a new pending sale
   - Verify body_type is saved in pending_vehicle_sales
   - Mark vehicle as sold
   - Verify body_type is preserved

## Migration Instructions

Run the migration:
```bash
cd dashboard
./apply-migrations.sh
```

Or manually execute:
```bash
psql -U your_user -d your_database -f migrations/2025_12_13_add_body_type_to_snapshot.sql
```
