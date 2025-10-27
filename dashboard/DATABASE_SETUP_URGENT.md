# 🚨 URGENT: Database Setup Required

## You're seeing "Failed to publish vehicle" because the database tables don't exist yet!

### ✅ Quick Fix (5 minutes):

---

## Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: **PCN System 2.0**
3. Click on **SQL Editor** (left sidebar)

---

## Step 2: Run This SQL Script

Copy and paste this ENTIRE script into the SQL Editor and click **RUN**:

```sql
-- ==========================================
-- QUICK SETUP: Vehicle Inventory Tables
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. VEHICLE MAIN TABLE
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_number VARCHAR(50) UNIQUE NOT NULL,
  brand_id UUID REFERENCES vehicle_brands(id) ON DELETE RESTRICT,
  model_id UUID REFERENCES vehicle_models(id) ON DELETE RESTRICT,
  model_number_other VARCHAR(100),
  manufacture_year INTEGER NOT NULL,
  country_id UUID REFERENCES countries(id) ON DELETE RESTRICT,
  body_type VARCHAR(50) NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  transmission VARCHAR(20) NOT NULL,
  engine_capacity VARCHAR(50),
  exterior_color VARCHAR(50),
  registered_year INTEGER,
  selling_amount DECIMAL(12, 2) NOT NULL,
  mileage DECIMAL(10, 2),
  entry_type VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'In Sale',
  tag_notes TEXT,
  special_note_print TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT check_body_type CHECK (body_type IN ('SUV', 'Sedan', 'Hatchback', 'Wagon', 'Coupe', 'Convertible', 'Van', 'Truck')),
  CONSTRAINT check_fuel_type CHECK (fuel_type IN ('Petrol', 'Diesel', 'Petrol Hybrid', 'Diesel Hybrid', 'EV', 'Petrol + Hybrid', 'Diesel + Hybrid')),
  CONSTRAINT check_transmission CHECK (transmission IN ('Automatic', 'Manual', 'Auto')),
  CONSTRAINT check_status CHECK (status IN ('In Sale', 'Out of Sale', 'Sold', 'Reserved'))
);

-- 2. SELLER DETAILS TABLE
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  address TEXT,
  city VARCHAR(100),
  nic_number VARCHAR(20),
  mobile_number VARCHAR(20) NOT NULL,
  land_phone_number VARCHAR(20),
  email_address VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. VEHICLE OPTIONS MASTER
CREATE TABLE IF NOT EXISTS vehicle_options_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_name VARCHAR(100) UNIQUE NOT NULL,
  option_type VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_option_type CHECK (option_type IN ('standard', 'special', 'custom'))
);

-- 4. VEHICLE OPTIONS
CREATE TABLE IF NOT EXISTS vehicle_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  option_id UUID REFERENCES vehicle_options_master(id) ON DELETE CASCADE,
  option_type VARCHAR(20) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_vehicle_option_type CHECK (option_type IN ('standard', 'special', 'custom')),
  UNIQUE(vehicle_id, option_id)
);

-- 5. VEHICLE CUSTOM OPTIONS
CREATE TABLE IF NOT EXISTS vehicle_custom_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  option_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. VEHICLE IMAGES
CREATE TABLE IF NOT EXISTS vehicle_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(20) NOT NULL DEFAULT 'gallery',
  storage_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_image_type CHECK (image_type IN ('gallery', 'cr_paper', 'document'))
);

-- Insert default vehicle options
INSERT INTO vehicle_options_master (option_name, option_type) VALUES
  ('A/C', 'standard'),
  ('5 Speed', 'standard'),
  ('Bluetooth', 'standard'),
  ('Crystal Light', 'standard'),
  ('MP3', 'standard'),
  ('Alloy Wheels', 'standard'),
  ('Reverse Camera', 'standard'),
  ('Full Option', 'standard'),
  ('Remote C / Lock', 'standard'),
  ('Power Shutters', 'standard'),
  ('Digital Meter', 'standard')
ON CONFLICT (option_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_number ON vehicles(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_id ON vehicles(brand_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_sellers_vehicle_id ON sellers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_options_vehicle_id ON vehicle_options(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);

-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_custom_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;

-- Create policies (allow authenticated users full access)
CREATE POLICY "Allow authenticated users full access to vehicles" ON vehicles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to sellers" ON sellers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to vehicle_options" ON vehicle_options
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to vehicle_custom_options" ON vehicle_custom_options
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to vehicle_images" ON vehicle_images
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow authenticated users to upload vehicle images'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload vehicle images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'vehicle-images');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow public to view vehicle images'
  ) THEN
    CREATE POLICY "Allow public to view vehicle images"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'vehicle-images');
  END IF;
END$$;

-- Success message
SELECT 'Database setup complete! ✅' as message;
```

---

## Step 3: Add Sample Master Data

After running the above, run this script to add test brands, models, and countries:

```sql
-- Add sample brands (if not already exist)
INSERT INTO vehicle_brands (name) VALUES 
  ('Toyota'),
  ('Honda'),
  ('Nissan'),
  ('Suzuki'),
  ('Mitsubishi'),
  ('BMW'),
  ('Mercedes-Benz'),
  ('Audi')
ON CONFLICT DO NOTHING;

-- Add sample models for each brand
INSERT INTO vehicle_models (brand_id, name) 
SELECT id, 'Aqua' FROM vehicle_brands WHERE name = 'Toyota'
UNION ALL SELECT id, 'Prius' FROM vehicle_brands WHERE name = 'Toyota'
UNION ALL SELECT id, 'Vitz' FROM vehicle_brands WHERE name = 'Toyota'
UNION ALL SELECT id, 'Corolla' FROM vehicle_brands WHERE name = 'Toyota'
UNION ALL SELECT id, 'Civic' FROM vehicle_brands WHERE name = 'Honda'
UNION ALL SELECT id, 'Fit' FROM vehicle_brands WHERE name = 'Honda'
UNION ALL SELECT id, 'Vezel' FROM vehicle_brands WHERE name = 'Honda'
UNION ALL SELECT id, 'X-Trail' FROM vehicle_brands WHERE name = 'Nissan'
UNION ALL SELECT id, 'Leaf' FROM vehicle_brands WHERE name = 'Nissan'
UNION ALL SELECT id, 'Note' FROM vehicle_brands WHERE name = 'Nissan'
UNION ALL SELECT id, 'Swift' FROM vehicle_brands WHERE name = 'Suzuki'
UNION ALL SELECT id, 'Wagon R' FROM vehicle_brands WHERE name = 'Suzuki'
UNION ALL SELECT id, 'Alto' FROM vehicle_brands WHERE name = 'Suzuki'
ON CONFLICT DO NOTHING;

-- Add sample countries (if not already exist)
INSERT INTO countries (name, is_active) VALUES 
  ('Japan', true),
  ('United Kingdom', true),
  ('Germany', true),
  ('USA', true),
  ('South Korea', true),
  ('France', true),
  ('Italy', true)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Sample data added successfully! ✅' as message;
```

---

## Step 4: Verify Setup

Run this query to check if everything is set up:

```sql
-- Check tables
SELECT 
  'vehicles' as table_name, COUNT(*) as ready 
FROM pg_tables WHERE tablename = 'vehicles'
UNION ALL
SELECT 'sellers', COUNT(*) FROM pg_tables WHERE tablename = 'sellers'
UNION ALL
SELECT 'vehicle_options_master', COUNT(*) FROM pg_tables WHERE tablename = 'vehicle_options_master'
UNION ALL
SELECT 'vehicle_options', COUNT(*) FROM pg_tables WHERE tablename = 'vehicle_options'
UNION ALL
SELECT 'vehicle_images', COUNT(*) FROM pg_tables WHERE tablename = 'vehicle_images';

-- Check master data
SELECT 'Brands' as type, COUNT(*) as count FROM vehicle_brands
UNION ALL
SELECT 'Models', COUNT(*) FROM vehicle_models
UNION ALL
SELECT 'Countries', COUNT(*) FROM countries
UNION ALL
SELECT 'Vehicle Options', COUNT(*) FROM vehicle_options_master;
```

You should see:
- ✅ All tables show ready = 1
- ✅ Brands count > 5
- ✅ Models count > 10
- ✅ Countries count > 5
- ✅ Vehicle Options count = 11

---

## Step 5: Test Again!

1. Go back to your app: http://localhost:3001/add-vehicle
2. Fill in all 7 steps
3. Click **Publish** on Step 6
4. You should now see the SUCCESS screen! 🎉

---

## 🐛 If You Still See Errors:

### Error: "relation does not exist"
→ Step 2 wasn't run completely. Run the full script again.

### Error: "foreign key constraint"
→ Step 3 wasn't run. Add the sample brands/models/countries.

### Error: "permission denied"
→ Check that RLS policies were created (they're in Step 2 script).

---

## ✅ Success Criteria:

After setup, you should be able to:
- [x] See brands in dropdown (Step 1)
- [x] See models when brand selected (Step 1)
- [x] See countries in dropdown (Step 1)
- [x] Complete all 7 steps
- [x] Click Publish without errors
- [x] See success screen
- [x] Find vehicle in Supabase database

---

**Time Required**: 5-10 minutes  
**Difficulty**: Copy & Paste  
**Status**: ⏳ REQUIRED BEFORE TESTING

**Once done, the app will work perfectly! 🚀**
