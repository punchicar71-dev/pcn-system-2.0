# Apply Database Migrations

## Quick Fix for "column pending_vehicle_sales.vehicle_number does not exist" Error

The error occurs because the database migrations haven't been applied yet. Follow one of the methods below:

---

## Method 1: Using Supabase Dashboard (EASIEST) ✅ RECOMMENDED

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Click on "SQL Editor"** in the left sidebar
4. **Create a new query**
5. **Copy and paste the SQL from BOTH migration files in order:**

### Step 1: Run this SQL first
```sql
-- Copy the entire contents of:
dashboard/migrations/2025_12_13_add_vehicle_snapshot_to_pending_sales.sql
```

Click "Run" and wait for success message.

### Step 2: Run this SQL second
```sql
-- Copy the entire contents of:
dashboard/migrations/2025_12_13_allow_multiple_soldout_records.sql
```

Click "Run" and wait for success message.

---

## Method 2: Using psql Command Line

If you have `psql` installed:

```bash
cd dashboard
./apply-migrations.sh
```

You'll be prompted for your database password.

---

## Method 3: Using Node.js Script

```bash
cd dashboard
node apply-migrations.js
```

Make sure you have `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file.

---

## Verify Migration Success

After running the migrations, verify they worked:

### Check in Supabase SQL Editor:
```sql
-- Should return 4 rows (vehicle_number, brand_name, model_name, manufacture_year)
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'pending_vehicle_sales' 
  AND column_name IN ('vehicle_number', 'brand_name', 'model_name', 'manufacture_year');
```

### Check in Supabase SQL Editor:
```sql
-- Should return 'YES'
SELECT is_nullable 
FROM information_schema.columns
WHERE table_name = 'pending_vehicle_sales' 
  AND column_name = 'vehicle_id';
```

---

## After Migration

1. **Refresh your browser** (Ctrl/Cmd + R)
2. **Go to Sales Transactions → Pending tab**
3. **Click "Sold out" on any pending vehicle**
4. **Verify it works without errors** ✅

---

## Troubleshooting

### "Migration already applied" error
- This is fine! It means the columns already exist.
- The migration script checks for existence before creating.

### "Permission denied" error
- Make sure you're using the `postgres` user or have admin privileges
- Check your `SUPABASE_SERVICE_ROLE_KEY` is correct

### Still getting "column does not exist" error
- Clear browser cache and refresh
- Check the SQL Editor to confirm columns exist
- Restart your development server

---

## What These Migrations Do

### Migration 1: `2025_12_13_add_vehicle_snapshot_to_pending_sales.sql`
- Adds `vehicle_number`, `brand_name`, `model_name`, `manufacture_year` columns
- These store a snapshot of vehicle data at time of sale
- Preserves history even if vehicle is deleted and re-added

### Migration 2: `2025_12_13_allow_multiple_soldout_records.sql`
- Makes `vehicle_id` nullable (allows historical records)
- Updates foreign key to `ON DELETE SET NULL`
- Adds performance indexes
- Enables the same vehicle to be sold multiple times

---

## Need Help?

If you're still having issues, check:
1. Supabase project is accessible
2. Database credentials are correct in `.env.local`
3. You have admin access to the database
