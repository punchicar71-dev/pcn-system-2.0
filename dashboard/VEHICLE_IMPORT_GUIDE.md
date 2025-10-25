# Vehicle Data Import Guide

## Prerequisites

1. **Set up Supabase database**
   - Run the SQL migration from `supabase-migration.sql` in your Supabase SQL Editor
   - Ensure tables `vehicle_brands` and `vehicle_models` are created

2. **Configure environment**
   - Make sure `.env.local` has your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **CSV file location**
   - The script expects the CSV file at: `/Users/asankaherath/Downloads/vehicle brand & models.csv`
   - Or modify the path in `scripts/import-vehicles.js` (line 21)

## Running the Import

### Option 1: Using npm script (Recommended)

```bash
cd dashboard
npm run import-vehicles
```

### Option 2: Direct node execution

```bash
cd dashboard
node scripts/import-vehicles.js
```

## What the script does

1. **Reads CSV file** - Parses the vehicle brands and models CSV
2. **Groups data** - Organizes models by brand
3. **Inserts brands** - Adds unique brands to `vehicle_brands` table
4. **Inserts models** - Adds all models linked to their brands
5. **Handles duplicates** - Skips existing brands and models
6. **Batching** - Processes models in batches of 50 to avoid rate limits

## Expected Output

```
Starting vehicle data import...

Found 155 unique brands
Total models: 1228

[1/155] ✓ Inserted brand: Abarth
  ✓ Inserted 2 models for Abarth
[2/155] ✓ Inserted brand: Acura
  ✓ Inserted 20 models for Acura
...

========================================
IMPORT SUMMARY
========================================
New brands inserted: 155
Existing brands skipped: 0
Total models inserted: 1228
========================================

Import completed successfully!
```

## Troubleshooting

### Error: CSV file not found
- Check the file path in the script (line 21)
- Make sure the CSV file is downloaded to the correct location

### Error: Missing Supabase credentials
- Verify `.env.local` exists and has correct values
- Check that variable names match: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: Permission denied
- Check Supabase Row Level Security (RLS) policies
- Ensure your anon key has insert permissions

### Duplicate entries
- The script uses `upsert` with `ignoreDuplicates: true`
- Existing brands and models will be skipped automatically

## After Import

1. **Verify in dashboard**
   - Go to http://localhost:3001/dashboard/settings
   - Click on "Vehicle Brands" tab
   - You should see all 155 brands with their models

2. **Check Supabase**
   - Open Supabase Table Editor
   - View `vehicle_brands` table (should have 155 rows)
   - View `vehicle_models` table (should have 1228 rows)

## CSV Format

The script expects this CSV format:
```
Brand,Model
Abarth,124 Spider Abarth
Abarth,500 Abarth
Acura,CL
...
```

- First line is header (skipped)
- Each line: `Brand,Model`
- No quotes needed unless comma in name
