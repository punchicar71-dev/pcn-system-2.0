-- ============================================
-- COMPLETE DATABASE SETUP FOR PCN SYSTEM 2.0
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CREATE ALL TABLES
-- ==========================================

-- Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_number VARCHAR(50) UNIQUE NOT NULL,
  brand_id UUID REFERENCES public.vehicle_brands(id) ON DELETE RESTRICT,
  model_id UUID REFERENCES public.vehicle_models(id) ON DELETE RESTRICT,
  model_number_other VARCHAR(100),
  manufacture_year INTEGER NOT NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE RESTRICT,
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

-- Sellers Table
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
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

-- Vehicle Options Master Table
CREATE TABLE IF NOT EXISTS public.vehicle_options_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_name VARCHAR(100) NOT NULL,
  option_type VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_option_type CHECK (option_type IN ('standard', 'special', 'custom')),
  UNIQUE(option_name, option_type)
);

-- Vehicle Options Table
CREATE TABLE IF NOT EXISTS public.vehicle_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.vehicle_options_master(id) ON DELETE CASCADE,
  option_type VARCHAR(20) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_vehicle_option_type CHECK (option_type IN ('standard', 'special', 'custom')),
  UNIQUE(vehicle_id, option_id)
);

-- Vehicle Custom Options Table
CREATE TABLE IF NOT EXISTS public.vehicle_custom_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  option_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Images Table
CREATE TABLE IF NOT EXISTS public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
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

-- ==========================================
-- 2. INSERT DEFAULT VEHICLE OPTIONS
-- ==========================================

INSERT INTO public.vehicle_options_master (option_name, option_type) VALUES
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
ON CONFLICT (option_name, option_type) DO NOTHING;

-- Insert special options (same list)
INSERT INTO public.vehicle_options_master (option_name, option_type) VALUES
  ('A/C', 'special'),
  ('5 Speed', 'special'),
  ('Bluetooth', 'special'),
  ('Crystal Light', 'special'),
  ('MP3', 'special'),
  ('Alloy Wheels', 'special'),
  ('Reverse Camera', 'special'),
  ('Full Option', 'special'),
  ('Remote C / Lock', 'special'),
  ('Power Shutters', 'special'),
  ('Digital Meter', 'special')
ON CONFLICT (option_name, option_type) DO NOTHING;

-- ==========================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_number ON public.vehicles(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_id ON public.vehicles(brand_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_entry_date ON public.vehicles(entry_date);
CREATE INDEX IF NOT EXISTS idx_sellers_vehicle_id ON public.sellers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_options_vehicle_id ON public.vehicle_options(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);

-- ==========================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_custom_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_options_master ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. CREATE RLS POLICIES
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users full access to vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow authenticated users full access to sellers" ON public.sellers;
DROP POLICY IF EXISTS "Allow authenticated users full access to vehicle_options" ON public.vehicle_options;
DROP POLICY IF EXISTS "Allow authenticated users full access to vehicle_custom_options" ON public.vehicle_custom_options;
DROP POLICY IF EXISTS "Allow authenticated users full access to vehicle_images" ON public.vehicle_images;
DROP POLICY IF EXISTS "Allow authenticated users to read vehicle_options_master" ON public.vehicle_options_master;

-- Create new policies
CREATE POLICY "Allow authenticated users full access to vehicles" ON public.vehicles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to sellers" ON public.sellers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to vehicle_options" ON public.vehicle_options
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to vehicle_custom_options" ON public.vehicle_custom_options
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to vehicle_images" ON public.vehicle_images
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read vehicle_options_master" ON public.vehicle_options_master
  FOR SELECT TO authenticated USING (true);

-- ==========================================
-- 6. CREATE STORAGE BUCKET
-- ==========================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 7. CREATE STORAGE POLICIES
-- ==========================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete vehicle images" ON storage.objects;

-- Create storage policies
CREATE POLICY "Allow authenticated users to upload vehicle images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vehicle-images');

CREATE POLICY "Allow public to view vehicle images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'vehicle-images');

CREATE POLICY "Allow authenticated users to delete vehicle images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'vehicle-images');

-- ==========================================
-- 8. CREATE UPDATE TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sellers_updated_at ON public.sellers;
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 9. CREATE INVENTORY VIEW
-- ==========================================

CREATE OR REPLACE VIEW public.vehicle_inventory_view AS
SELECT 
  v.id,
  v.vehicle_number,
  vb.name as brand_name,
  vm.name as model_name,
  v.model_number_other,
  v.manufacture_year,
  v.registered_year,
  c.name as country_name,
  v.body_type,
  v.fuel_type,
  v.transmission,
  v.engine_capacity,
  v.exterior_color,
  v.selling_amount,
  v.mileage,
  v.entry_type,
  v.entry_date,
  v.status,
  v.tag_notes,
  v.special_note_print,
  s.full_name as seller_name,
  s.mobile_number as seller_mobile,
  s.email_address as seller_email,
  v.created_at,
  v.updated_at
FROM public.vehicles v
LEFT JOIN public.vehicle_brands vb ON v.brand_id = vb.id
LEFT JOIN public.vehicle_models vm ON v.model_id = vm.id
LEFT JOIN public.countries c ON v.country_id = c.id
LEFT JOIN public.sellers s ON s.vehicle_id = v.id;

-- ==========================================
-- 10. VERIFICATION
-- ==========================================

-- Check if all tables were created
SELECT 
  '✅ vehicles' as status WHERE EXISTS (SELECT FROM pg_tables WHERE tablename = 'vehicles')
UNION ALL
SELECT '✅ sellers' WHERE EXISTS (SELECT FROM pg_tables WHERE tablename = 'sellers')
UNION ALL
SELECT '✅ vehicle_options_master' WHERE EXISTS (SELECT FROM pg_tables WHERE tablename = 'vehicle_options_master')
UNION ALL
SELECT '✅ vehicle_options' WHERE EXISTS (SELECT FROM pg_tables WHERE tablename = 'vehicle_options')
UNION ALL
SELECT '✅ vehicle_custom_options' WHERE EXISTS (SELECT FROM pg_tables WHERE tablename = 'vehicle_custom_options')
UNION ALL
SELECT '✅ vehicle_images' WHERE EXISTS (SELECT FROM pg_tables WHERE tablename = 'vehicle_images')
UNION ALL
SELECT '✅ vehicle_inventory_view' WHERE EXISTS (SELECT FROM pg_views WHERE viewname = 'vehicle_inventory_view')
UNION ALL
SELECT '✅ vehicle-images bucket' WHERE EXISTS (SELECT FROM storage.buckets WHERE id = 'vehicle-images');

-- Show counts
SELECT 'Vehicle options installed' as info, COUNT(*) as count FROM public.vehicle_options_master;

-- Success message
SELECT '🎉 DATABASE SETUP COMPLETE! All tables and policies created successfully!' as message;
SELECT '📝 Next step: Add sample brands, models, and countries (see next script)' as next_action;
