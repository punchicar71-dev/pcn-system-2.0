# Deployment Checklist - Multiple Sold-Out Records Feature

## Pre-Deployment Verification

### 1. Database Migrations Ready
- ✅ `2025_12_13_add_vehicle_snapshot_to_pending_sales.sql` - Adds snapshot columns
- ✅ `2025_12_13_allow_multiple_soldout_records.sql` - Makes vehicle_id nullable

### 2. Code Changes
- ✅ [sales-transactions/page.tsx](dashboard/src/app/(dashboard)/sales-transactions/page.tsx) - Updated `handleConfirmSoldOut` to populate snapshots
- ✅ [SoldOutVehiclesTable.tsx](dashboard/src/components/sales-transactions/SoldOutVehiclesTable.tsx) - Already uses snapshot data
- ✅ [SoldOutVehicleModal.tsx](dashboard/src/components/sales-transactions/SoldOutVehicleModal.tsx) - Already uses snapshot data
- ✅ [add-vehicle/page.tsx](dashboard/src/app/(dashboard)/add-vehicle/page.tsx) - Already handles re-adding sold vehicles

## Deployment Steps

### Step 1: Backup Database
```bash
# Create backup before applying migrations
pg_dump -h <your-host> -U postgres -d postgres > backup_before_multiple_soldout_$(date +%Y%m%d).sql
```

### Step 2: Apply Database Migrations

**Option A: If snapshot columns don't exist yet**
```bash
cd dashboard

# Apply both migrations in order
psql -h <your-host> -U postgres -d postgres -f migrations/2025_12_13_add_vehicle_snapshot_to_pending_sales.sql
psql -h <your-host> -U postgres -d postgres -f migrations/2025_12_13_allow_multiple_soldout_records.sql
```

**Option B: If snapshot columns already exist**
```bash
cd dashboard

# Only apply the nullable constraint migration
psql -h <your-host> -U postgres -d postgres -f migrations/2025_12_13_allow_multiple_soldout_records.sql
```

### Step 3: Verify Database Changes
```sql
-- 1. Check vehicle_id is nullable
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'pending_vehicle_sales' 
AND column_name = 'vehicle_id';
-- Expected: is_nullable = 'YES'

-- 2. Check snapshot columns exist
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'pending_vehicle_sales' 
AND column_name IN ('vehicle_number', 'brand_name', 'model_name', 'manufacture_year');
-- Expected: 4 rows returned

-- 3. Verify foreign key constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.pending_vehicle_sales'::regclass
AND conname LIKE '%vehicle_id%';
-- Expected: Definition includes "ON DELETE SET NULL"

-- 4. Check existing sold records have snapshot data
SELECT 
    COUNT(*) as total_sold_records,
    COUNT(vehicle_number) as with_vehicle_number,
    COUNT(brand_name) as with_brand_name,
    COUNT(vehicle_id) as with_vehicle_id
FROM pending_vehicle_sales
WHERE status = 'sold';
-- Expected: with_vehicle_number and with_brand_name should equal total_sold_records
```

### Step 4: Deploy Application Code

**Development:**
```bash
# Dashboard should already be running with hot reload
# Changes are automatically picked up
```

**Production (Docker):**
```bash
# Rebuild and restart dashboard container
docker-compose up -d --build dashboard
```

**Production (PM2/Node):**
```bash
cd dashboard
npm run build
pm2 restart pcn-dashboard
```

### Step 5: Smoke Testing

#### Test 1: View Existing Sold Records
1. Navigate to Sales Transactions → Sold Out tab
2. **Expected:** All existing sold records display correctly
3. **Verify:** Vehicle numbers, brands, and models show properly

#### Test 2: Mark New Sale as Sold Out
1. Go to Sales Transactions → Pending tab
2. Select a pending sale
3. Click "Sold out"
4. **Expected:** Vehicle moved to Sold Out table successfully
5. **Verify:** Vehicle details display correctly in Sold Out table

#### Test 3: Re-Add Previously Sold Vehicle
1. Note a vehicle number from Sold Out table (e.g., "ABC-1234")
2. Go to Add Vehicle page
3. Try to add the same vehicle number "ABC-1234"
4. Fill in all required details
5. Submit the form
6. **Expected:** Vehicle added successfully (no duplicate error)
7. **Verify:** Vehicle appears in Inventory

#### Test 4: Sell Same Vehicle Again
1. Create a pending sale for the re-added vehicle "ABC-1234"
2. Mark it as sold out
3. Go to Sold Out tab
4. Search for "ABC-1234"
5. **Expected:** TWO separate records for "ABC-1234"
6. **Verify:** Both records have different sold dates
7. **Verify:** Both records show complete vehicle details

#### Test 5: View Details of Historical Record
1. Click "View" on the older sold-out record (first sale of "ABC-1234")
2. **Expected:** Modal opens with complete vehicle information
3. **Verify:** All fields populated correctly
4. **Verify:** No errors in console

## Post-Deployment Monitoring

### Check Application Logs
```bash
# Docker
docker logs pcn-dashboard --tail=100 -f

# PM2
pm2 logs pcn-dashboard
```

**Look for:**
- ✅ "Vehicle snapshot columns already populated" - Good!
- ✅ "Populating vehicle snapshot columns" - Good! (for records without snapshot)
- ❌ Any SQL errors related to vehicle_id constraint
- ❌ Errors when viewing sold-out vehicles

### Check Database State
```sql
-- Monitor sold records over time
SELECT 
    vehicle_number,
    brand_name,
    model_name,
    status,
    updated_at as sold_date,
    vehicle_id IS NULL as vehicle_deleted
FROM pending_vehicle_sales
WHERE status = 'sold'
ORDER BY vehicle_number, updated_at DESC;

-- Find vehicles sold multiple times
SELECT 
    vehicle_number,
    COUNT(*) as times_sold,
    MIN(updated_at) as first_sale,
    MAX(updated_at) as latest_sale
FROM pending_vehicle_sales
WHERE status = 'sold'
GROUP BY vehicle_number
HAVING COUNT(*) > 1;
```

## Rollback Plan (If Needed)

### Step 1: Rollback Database
```bash
# Restore from backup
psql -h <your-host> -U postgres -d postgres < backup_before_multiple_soldout_YYYYMMDD.sql
```

### Step 2: Revert Code Changes
```bash
cd dashboard/src/app/(dashboard)/sales-transactions
git checkout HEAD page.tsx
```

### Step 3: Restart Application
```bash
# Docker
docker-compose restart dashboard

# PM2
pm2 restart pcn-dashboard
```

## Success Criteria

- ✅ All existing sold-out records display correctly
- ✅ New vehicles can be marked as sold without issues
- ✅ Same vehicle can be re-added after being sold
- ✅ Same vehicle can be sold multiple times
- ✅ All sold-out records for a vehicle are preserved
- ✅ Each sold record shows correct details and timestamp
- ✅ No duplicate vehicle number errors when re-adding
- ✅ No console errors or SQL errors in logs

## Support Information

### Files to Check if Issues Occur
1. [sales-transactions/page.tsx#L42-L69](dashboard/src/app/(dashboard)/sales-transactions/page.tsx) - handleConfirmSoldOut function
2. [SoldOutVehiclesTable.tsx#L38-L90](dashboard/src/components/sales-transactions/SoldOutVehiclesTable.tsx) - Data fetching and transformation
3. [add-vehicle/page.tsx#L423-L460](dashboard/src/app/(dashboard)/add-vehicle/page.tsx) - Re-adding sold vehicles logic

### Common Issues and Solutions

**Issue:** "Duplicate vehicle number" error when re-adding
- **Cause:** Vehicle still has status other than 'Sold'
- **Solution:** Check vehicle status, should be 'Sold' before re-adding

**Issue:** Sold-out record shows N/A for vehicle details
- **Cause:** Snapshot columns not populated
- **Solution:** Run backfill query from migration file

**Issue:** Cannot mark vehicle as sold - foreign key error
- **Cause:** Migration not applied correctly
- **Solution:** Re-run migration, verify foreign key has ON DELETE SET NULL

## Documentation

- 📄 [MULTIPLE_SOLDOUT_RECORDS_IMPLEMENTATION.md](MULTIPLE_SOLDOUT_RECORDS_IMPLEMENTATION.md) - Complete technical documentation
- 📄 [2025_12_13_allow_multiple_soldout_records.sql](dashboard/migrations/2025_12_13_allow_multiple_soldout_records.sql) - Database migration
- 📄 This file - Deployment checklist

## Deployment Sign-Off

- [ ] Database backup created
- [ ] Migrations applied successfully
- [ ] Database verification passed
- [ ] Application deployed
- [ ] Smoke tests passed
- [ ] No errors in logs
- [ ] All sold-out records display correctly
- [ ] Re-add and re-sell tested successfully

**Deployed By:** _________________  
**Date:** _________________  
**Environment:** [ ] Development [ ] Staging [ ] Production  
**Status:** [ ] Success [ ] Rollback Required  
**Notes:** _________________________________________________
