# 🔧 URGENT FIX: Sell Vehicle Flow Error

## ❌ Error Message
```
Failed to create sale: Could not find the 'customer_title' column 
of 'pending_vehicle_sales' in the schema cache
```

## 🎯 Root Cause
The `pending_vehicle_sales` table is missing required columns:
- ❌ `customer_title` (required for all sales)
- ❌ `leasing_company_id` (required for leasing payments)

## ✅ QUICK FIX - Run This Migration NOW

### Step 1: Copy the SQL Migration

Open this file and copy ALL content:
```
/Users/asankaherath/Projects/PCN System . 2.0/dashboard/migrations/2025_11_02_complete_pending_sales_migration.sql
```

### Step 2: Apply in Supabase

1. **Open Supabase Dashboard**: https://app.supabase.com
2. **Navigate to**: SQL Editor (left sidebar)
3. **Paste** the migration SQL
4. **Click**: Run button
5. **Verify**: Success message appears

### Step 3: Test the Fix

1. Refresh your browser (localhost:3001/sell-vehicle)
2. Fill in the sell vehicle form
3. Click "Sell Vehicle"
4. ✅ Should work without errors!

---

## 📋 What the Migration Does

```sql
-- Adds these columns:
ALTER TABLE pending_vehicle_sales 
ADD COLUMN customer_title VARCHAR(10);     -- Mr., Miss., Mrs., Dr.

ALTER TABLE pending_vehicle_sales 
ADD COLUMN leasing_company_id UUID;        -- For leasing payments

-- Adds safety constraints and indexes
```

---

## 🚀 Alternative: Run Migration Script

```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0"
./apply-complete-pending-sales-migration.sh
```

This will:
- ✅ Show you the SQL to run
- ✅ Guide you through the steps
- ✅ Optionally open Supabase Dashboard

---

## ✨ After Migration

Your form will work perfectly:
- ✅ Customer title saved correctly
- ✅ Leasing company tracked (when Leasing selected)
- ✅ All sales transactions saved properly
- ✅ No more schema errors!

---

## 🔍 Verify Migration Success

Run this SQL in Supabase to confirm:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pending_vehicle_sales'
  AND column_name IN ('customer_title', 'leasing_company_id');
```

**Expected Result:**
```
column_name         | data_type        | is_nullable
--------------------|------------------|------------
customer_title      | character varying| YES
leasing_company_id  | uuid             | YES
```

---

## 📞 If Still Not Working

1. **Clear browser cache**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Restart dev server**: Stop and run `npm run dev` again
3. **Check Supabase logs**: Look for any migration errors

---

**Status:** 🔧 FIXABLE IN 2 MINUTES  
**Priority:** 🔴 HIGH - Blocking sell vehicle flow  
**Solution:** Run the migration SQL in Supabase

---

**Pro Tip:** This migration is safe to run multiple times (uses IF NOT EXISTS)
