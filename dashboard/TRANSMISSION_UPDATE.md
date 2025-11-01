# 🚗 Transmission Options Update

## What Changed

**Before:**
- Automatic ❌ (removed)
- Manual ✅
- Auto ✅

**After:**
- Auto ✅
- Manual ✅

## 🚀 Apply the Update (2 Steps)

### Step 1: Update the Database

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Update any existing 'Automatic' values to 'Auto'
UPDATE public.vehicles 
SET transmission = 'Auto' 
WHERE transmission = 'Automatic';

-- Drop the old constraint
ALTER TABLE public.vehicles 
DROP CONSTRAINT IF EXISTS check_transmission;

-- Add the new constraint
ALTER TABLE public.vehicles 
ADD CONSTRAINT check_transmission CHECK (transmission IN ('Auto', 'Manual'));
```

### Step 2: Restart Your Application

```bash
# Stop the dashboard (if running)
# Then start it again
cd dashboard
npm run dev
```

## ✅ Verification

After the update:
1. Go to `http://localhost:3001/add-vehicle`
2. Check the **Transmission** dropdown
3. You should see only:
   - Auto
   - Manual

## 📁 Files Updated

1. **`src/types/vehicle-form.types.ts`** - Removed 'Automatic' from TRANSMISSIONS array
2. **`COMPLETE_DATABASE_SETUP.sql`** - Updated constraint to only allow 'Auto' and 'Manual'
3. **`migrations/2025_01_update_transmission_values.sql`** - Migration script for existing database

## 🔄 Data Migration

The migration script automatically converts any existing vehicles with "Automatic" transmission to "Auto", so no data is lost.

## 📊 Impact

- ✅ Cleaner UI - fewer redundant options
- ✅ Database consistency - enforced at constraint level
- ✅ Backward compatible - existing data is preserved and migrated

---

**Ready to go! Just run the SQL in Supabase and restart your app.** 🎉
