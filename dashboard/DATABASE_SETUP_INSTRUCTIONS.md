# 🚀 DATABASE SETUP - QUICK START

## ⚡ 3-Minute Setup Guide

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your **PCN System 2.0** project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run First Script (Create Tables)
1. Open file: `SETUP_DATABASE_STEP_1.sql`
2. **Copy ALL content** (Ctrl+A, Ctrl+C)
3. **Paste into SQL Editor** (Ctrl+V)
4. Click **Run** button (or press Ctrl+Enter)
5. ✅ Wait for success message: "DATABASE SETUP COMPLETE!"

### Step 3: Run Second Script (Add Sample Data)
1. Click **New Query** again
2. Open file: `SETUP_DATABASE_STEP_2.sql`
3. **Copy ALL content** (Ctrl+A, Ctrl+C)
4. **Paste into SQL Editor** (Ctrl+V)
5. Click **Run** button
6. ✅ Wait for success message: "SAMPLE DATA SETUP COMPLETE!"

### Step 4: Test the Application
1. Go back to your browser: http://localhost:3001/add-vehicle
2. Click **Publish** button on Step 6
3. ✅ You should see: "Vehicle published successfully!" 🎉

---

## ✅ What Gets Created

### Script 1 (SETUP_DATABASE_STEP_1.sql):
- ✅ 6 tables (vehicles, sellers, options, images, etc.)
- ✅ 22 default vehicle options (A/C, Bluetooth, etc.)
- ✅ Indexes for fast queries
- ✅ Row Level Security policies
- ✅ Storage bucket for images
- ✅ Auto-update triggers
- ✅ Inventory view for reports

### Script 2 (SETUP_DATABASE_STEP_2.sql):
- ✅ 12 vehicle brands (Toyota, Honda, BMW, etc.)
- ✅ 18+ vehicle models (Prius, Civic, Leaf, etc.)
- ✅ 6 countries (Japan, UK, Germany, etc.)

---

## 🔍 Verification

After running both scripts, check tables exist:

```sql
-- Quick verification query
SELECT 
  'vehicles' as table_name, COUNT(*) as exists 
FROM information_schema.tables 
WHERE table_name = 'vehicles' AND table_schema = 'public'

UNION ALL

SELECT 'vehicle_brands', COUNT(*) 
FROM public.vehicle_brands

UNION ALL

SELECT 'vehicle_models', COUNT(*) 
FROM public.vehicle_models

UNION ALL

SELECT 'countries', COUNT(*) 
FROM public.countries;
```

**Expected Results:**
- vehicles: 1 (table exists)
- vehicle_brands: 12 (brands)
- vehicle_models: 18+ (models)
- countries: 6 (countries)

---

## ❌ Troubleshooting

### Error: "relation already exists"
**Solution:** Table already created! Skip to Step 3.

### Error: "permission denied"
**Solution:** Make sure you're logged into Supabase and selected the correct project.

### Error: "foreign key violation"
**Solution:** Run scripts in order (Step 1 first, then Step 2).

### Still seeing "Could not find the table"?
**Solution:** 
1. Refresh your browser (Ctrl+R)
2. Clear browser cache
3. Restart dev server: `npm run dev`

---

## 🎯 Next Steps After Setup

1. ✅ Test adding a vehicle
2. ✅ Test uploading images
3. ✅ Verify data saved in Supabase Table Editor
4. 🚀 Build inventory list page (Phase 2)

---

## 📞 Need Help?

If you encounter any errors:
1. Copy the error message from Supabase SQL Editor
2. Check which line number failed
3. Share the error for assistance

**Common Issues:**
- ❌ "does not exist" → Run Step 1 first
- ❌ "already exists" → Skip that step, continue
- ❌ "permission denied" → Check project access
- ❌ "foreign key" → Run Step 2 after Step 1

---

**🎉 Once both scripts run successfully, your database is ready!**

Go to http://localhost:3001/add-vehicle and test the Publish button!
