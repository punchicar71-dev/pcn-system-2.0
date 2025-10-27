# Quick Database Check

Run this in Supabase SQL Editor to see what's missing:

```sql
-- Check if tables exist
SELECT 
  tablename,
  CASE 
    WHEN tablename IN (
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    ('vehicles'),
    ('sellers'),
    ('vehicle_options_master'),
    ('vehicle_options'),
    ('vehicle_custom_options'),
    ('vehicle_images'),
    ('vehicle_brands'),
    ('vehicle_models'),
    ('countries')
) AS required_tables(tablename);

-- Check master data counts
SELECT 'Brands in database' as info, COUNT(*) as count FROM vehicle_brands
UNION ALL
SELECT 'Models in database', COUNT(*) FROM vehicle_models
UNION ALL
SELECT 'Countries in database', COUNT(*) FROM countries
UNION ALL
SELECT 'Vehicle options in database', COUNT(*) FROM vehicle_options_master;
```

**Expected Result:**
- All tables should show ✅ EXISTS
- Brands count > 0
- Models count > 0
- Countries count > 0
- Vehicle options count = 11

**If any show ❌ MISSING:**
→ Follow DATABASE_SETUP_URGENT.md
