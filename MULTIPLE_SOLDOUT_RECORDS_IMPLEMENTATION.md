# Multiple Sold-Out Records Implementation

## Overview

This implementation allows the **same vehicle to be sold multiple times** through the system, with each sale preserved as a separate historical record in the Sold Out table. All sold-out records are maintained with their own transaction details and timestamps.

## How It Works

### 1. Vehicle Snapshot System

When a vehicle is moved to "Sold Out" status, the system:
- Captures a **snapshot** of the vehicle details at the time of sale
- Stores this snapshot directly in the `pending_vehicle_sales` table
- Preserves this data even if the vehicle is later deleted and re-added

**Snapshot Columns in `pending_vehicle_sales`:**
- `vehicle_number` - Vehicle registration number
- `brand_name` - Brand name at time of sale
- `model_name` - Model name at time of sale
- `manufacture_year` - Manufacturing year

### 2. Vehicle Re-Addition Flow

**Scenario:** Same vehicle sold → re-added → sold again

1. **First Sale (Jan 15, 2025):**
   - Vehicle "ABC-1234" is in inventory (vehicle_id: `xyz-123`)
   - Customer buys it, sale is completed
   - Status changes to "Sold" in vehicles table
   - Pending sale record gets `status = 'sold'`
   - Snapshot columns are populated with vehicle details
   - **Result:** One record in Sold Out table

2. **Re-Adding (Mar 20, 2025):**
   - Dealer acquires the same vehicle "ABC-1234" again
   - System detects existing "Sold" vehicle record
   - Old vehicle record is deleted from `vehicles` table
   - New vehicle record is created (new vehicle_id: `xyz-456`)
   - **Previous sold-out record remains intact** (uses snapshot data)

3. **Second Sale (Jun 10, 2025):**
   - Vehicle "ABC-1234" is sold again
   - New sale record created in `pending_vehicle_sales`
   - Status changes to 'sold'
   - Snapshot columns populated
   - **Result:** TWO separate records in Sold Out table

### 3. Database Structure

**Key Features:**
- `vehicle_id` is **nullable** - allows historical records when vehicle is deleted
- Foreign key has `ON DELETE SET NULL` - preserves sold records when vehicle is removed
- Snapshot columns store vehicle info independently from vehicles table
- Each sold record has its own `updated_at` timestamp (the sold-out date)

## Implementation Files

### 1. Database Migration
**File:** `dashboard/migrations/2025_12_13_allow_multiple_soldout_records.sql`

**What it does:**
- Makes `vehicle_id` nullable in `pending_vehicle_sales`
- Updates foreign key constraint to `ON DELETE SET NULL`
- Adds indexes for performance
- Adds documentation comments

**How to apply:**
```bash
cd dashboard
psql -h <your-supabase-host> -U postgres -d postgres -f migrations/2025_12_13_allow_multiple_soldout_records.sql
```

### 2. Vehicle Snapshot Migration
**File:** `dashboard/migrations/2025_12_13_add_vehicle_snapshot_to_pending_sales.sql`

**What it does:**
- Adds snapshot columns: `vehicle_number`, `brand_name`, `model_name`, `manufacture_year`
- Backfills existing sold records with vehicle data
- Adds indexes and documentation

**Status:** ✅ Already applied (based on code analysis)

### 3. Sales Transaction Logic
**File:** `dashboard/src/app/(dashboard)/sales-transactions/page.tsx`

**Updated Logic in `handleConfirmSoldOut`:**
- Fetches vehicle details when marking as sold
- Populates snapshot columns if not already filled
- Preserves vehicle info for historical display

**Key Code:**
```typescript
// Fetch sale WITH vehicle details
const { data: saleData } = await supabase
  .from('pending_vehicle_sales')
  .select(`
    vehicle_id,
    vehicle_number,
    brand_name,
    model_name,
    manufacture_year,
    vehicles:vehicle_id (
      vehicle_number,
      manufacture_year,
      vehicle_brands:brand_id (name),
      vehicle_models:model_id (name)
    )
  `)
  .eq('id', selectedSaleId)
  .single();

// Populate snapshot if missing
if (!saleData.vehicle_number && saleData.vehicles) {
  await supabase
    .from('pending_vehicle_sales')
    .update({
      vehicle_number: saleData.vehicles.vehicle_number,
      brand_name: saleData.vehicles.vehicle_brands.name,
      // ... other fields
    })
    .eq('id', selectedSaleId);
}
```

### 4. Display Components

**Files:**
- `dashboard/src/components/sales-transactions/SoldOutVehiclesTable.tsx`
- `dashboard/src/components/sales-transactions/SoldOutVehicleModal.tsx`

**Display Strategy:**
```typescript
// Priority: snapshot data first, fallback to joined data
const displayVehicleNumber = sale.vehicle_number || sale.vehicles?.vehicle_number || 'N/A';
const displayBrandName = sale.brand_name || sale.vehicles?.vehicle_brands?.name || 'N/A';
const displayModelName = sale.model_name || sale.vehicles?.vehicle_models?.name || 'N/A';
```

**Why this works:**
- New sold records: snapshot columns are populated → uses snapshot data
- Old sold records (before migration): snapshot might be null → falls back to joined vehicle data
- Historical records (vehicle re-added): snapshot columns exist → uses snapshot, even if vehicle_id is NULL

## Benefits

### 1. Complete Sales History
- Every sale transaction is preserved
- No data loss when vehicles are re-added
- Full audit trail for accounting and reporting

### 2. Accurate Reporting
- Track how many times a vehicle has been sold
- Compare selling prices across different sales
- Identify frequently re-sold vehicles

### 3. Data Integrity
- Each sale is a distinct record with unique timestamp
- No overwrites or conflicts
- Preserved even if vehicle is deleted

### 4. Backwards Compatibility
- Existing sold records still display correctly
- Migration backfills snapshot data for old records
- Graceful fallback for any missing data

## Testing Checklist

### Test Scenario 1: New Vehicle First Sale
1. Add vehicle "TEST-001" to inventory
2. Create pending sale for "TEST-001"
3. Mark as sold out
4. **Verify:** One record in Sold Out table with all details

### Test Scenario 2: Re-Add and Second Sale
1. Re-add vehicle "TEST-001" (system removes old sold vehicle)
2. Create new pending sale
3. Mark as sold out again
4. **Verify:** TWO records in Sold Out table for "TEST-001"
5. **Verify:** Both records show correct vehicle details
6. **Verify:** Different sold dates (updated_at) for each record

### Test Scenario 3: Historical Records
1. Check existing sold-out records from before migration
2. **Verify:** All display correctly with vehicle details
3. **Verify:** No errors or missing data

### Test Scenario 4: Filtering and Search
1. Search for vehicle number with multiple sales
2. **Verify:** All sold records appear in results
3. Filter by date range
4. **Verify:** Correct records shown based on sold date (updated_at)

## Migration Instructions

### Step 1: Apply Snapshot Columns (if not already applied)
```bash
cd dashboard
psql -h <your-host> -U postgres -d postgres -f migrations/2025_12_13_add_vehicle_snapshot_to_pending_sales.sql
```

### Step 2: Apply Multiple Sold-Out Records Support
```bash
psql -h <your-host> -U postgres -d postgres -f migrations/2025_12_13_allow_multiple_soldout_records.sql
```

### Step 3: Verify Migration
```sql
-- Check vehicle_id is nullable
SELECT is_nullable 
FROM information_schema.columns
WHERE table_name = 'pending_vehicle_sales' 
AND column_name = 'vehicle_id';
-- Should return: YES

-- Check snapshot columns exist
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'pending_vehicle_sales' 
AND column_name IN ('vehicle_number', 'brand_name', 'model_name', 'manufacture_year');
-- Should return: 4 rows

-- Check foreign key constraint
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint
WHERE conname = 'pending_vehicle_sales_vehicle_id_fkey';
-- Should include: ON DELETE SET NULL
```

### Step 4: Deploy Application Changes
```bash
# Dashboard (already running)
cd dashboard
npm run build

# If using Docker:
docker-compose up -d --build dashboard
```

## Troubleshooting

### Issue: Snapshot columns are NULL for old sold records
**Solution:** Run backfill query:
```sql
UPDATE public.pending_vehicle_sales pvs
SET 
    vehicle_number = v.vehicle_number,
    brand_name = vb.name,
    model_name = vm.name,
    manufacture_year = v.manufacture_year
FROM public.vehicles v
LEFT JOIN public.vehicle_brands vb ON v.brand_id = vb.id
LEFT JOIN public.vehicle_models vm ON v.model_id = vm.id
WHERE pvs.vehicle_id = v.id
AND pvs.status = 'sold'
AND (pvs.vehicle_number IS NULL OR pvs.brand_name IS NULL);
```

### Issue: Cannot add vehicle - duplicate vehicle number
**Solution:** This is expected if the vehicle is already in inventory with status 'In Sale' or 'Pending Sale'. Only vehicles with status 'Sold' are automatically removed when re-adding.

### Issue: Old sold record doesn't show vehicle details
**Check:**
1. Is `vehicle_id` still valid? (Vehicle might not be deleted yet)
2. Are snapshot columns populated? Run backfill query above
3. Check browser console for errors

## Summary

This implementation provides a robust solution for tracking vehicles that are sold multiple times through the system. By using a snapshot approach with nullable foreign keys, we ensure:

✅ **All sold-out records are preserved**  
✅ **Each sale is a separate transaction**  
✅ **Records are distinguished by sold-out timestamp**  
✅ **No overwrites or data loss**  
✅ **Existing flows remain unaffected**  
✅ **Complete historical sales data**

The system now maintains a complete sold-out history per vehicle, based on the time each sale occurred, exactly as requested.
