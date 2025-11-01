-- ============================================
-- COMPLETE DATABASE SETUP - RUN THIS FIRST
-- This creates ALL tables needed including parent tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CREATE PARENT TABLES FIRST
-- ==========================================

-- Vehicle Brands Table
CREATE TABLE IF NOT EXISTS public.vehicle_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Models Table
CREATE TABLE IF NOT EXISTS public.vehicle_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES public.vehicle_brands(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(brand_id, name)
);

-- Countries Table
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. CREATE VEHICLE TABLES
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
  created_by UUID,
  CONSTRAINT check_body_type CHECK (body_type IN ('SUV', 'Sedan', 'Hatchback', 'Wagon', 'Coupe', 'Convertible', 'Van', 'Truck')),
  CONSTRAINT check_fuel_type CHECK (fuel_type IN ('Petrol', 'Diesel', 'Petrol Hybrid', 'Diesel Hybrid', 'EV', 'Petrol + Hybrid', 'Diesel + Hybrid')),
  CONSTRAINT check_transmission CHECK (transmission IN ('Auto', 'Manual')),
  CONSTRAINT check_status CHECK (status IN ('In Sale', 'Out of Sale', 'Sold', 'Reserved'))
);

-- Sellers Table
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  title VARCHAR(10) CHECK (title IN ('Mr.', 'Miss.', 'Mrs.', 'Dr.')),
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
-- 3. INSERT SAMPLE BRANDS
-- ==========================================

INSERT INTO public.vehicle_brands (name) VALUES
  ('Toyota'),
  ('Honda'),
  ('Nissan'),
  ('Mitsubishi'),
  ('Suzuki'),
  ('Mazda'),
  ('BMW'),
  ('Mercedes-Benz'),
  ('Audi'),
  ('Volkswagen'),
  ('Hyundai'),
  ('Kia')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 4. INSERT SAMPLE MODELS
-- ==========================================

INSERT INTO public.vehicle_models (brand_id, name)
SELECT 
  vb.id,
  model_name
FROM public.vehicle_brands vb
CROSS JOIN LATERAL (
  VALUES 
    ('Toyota', 'Prius'),
    ('Toyota', 'Corolla'),
    ('Toyota', 'Aqua'),
    ('Toyota', 'Vitz'),
    ('Toyota', 'Premio'),
    ('Toyota', 'Axio'),
    ('Toyota', 'CH-R'),
    ('Honda', 'Civic'),
    ('Honda', 'Fit'),
    ('Honda', 'Grace'),
    ('Honda', 'Vezel'),
    ('Honda', 'CR-V'),
    ('Nissan', 'Leaf'),
    ('Nissan', 'Note'),
    ('Nissan', 'X-Trail'),
    ('Suzuki', 'Swift'),
    ('Suzuki', 'Alto'),
    ('Suzuki', 'Wagon R'),
    ('Suzuki', 'Hustler'),
    ('Mazda', 'Demio'),
    ('Mazda', 'Axela'),
    ('Mazda', 'CX-5')
) AS models(brand_name, model_name)
WHERE vb.name = models.brand_name
ON CONFLICT (brand_id, name) DO NOTHING;

-- ==========================================
-- 5. INSERT SAMPLE COUNTRIES
-- ==========================================

INSERT INTO public.countries (name) VALUES
  ('Japan'),
  ('United Kingdom'),
  ('Germany'),
  ('United States'),
  ('South Korea'),
  ('Sri Lanka'),
  ('India'),
  ('Australia')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 6. INSERT DEFAULT VEHICLE OPTIONS
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

-- Insert special options
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
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_number ON public.vehicles(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_id ON public.vehicles(brand_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_model_id ON public.vehicles(model_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_entry_date ON public.vehicles(entry_date);
CREATE INDEX IF NOT EXISTS idx_sellers_vehicle_id ON public.sellers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_options_vehicle_id ON public.vehicle_options(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_brand_id ON public.vehicle_models(brand_id);

-- ==========================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_custom_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_options_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 9. CREATE RLS POLICIES
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all access to vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow all access to sellers" ON public.sellers;
DROP POLICY IF EXISTS "Allow all access to vehicle_options" ON public.vehicle_options;
DROP POLICY IF EXISTS "Allow all access to vehicle_custom_options" ON public.vehicle_custom_options;
DROP POLICY IF EXISTS "Allow all access to vehicle_images" ON public.vehicle_images;
DROP POLICY IF EXISTS "Allow all access to vehicle_options_master" ON public.vehicle_options_master;
DROP POLICY IF EXISTS "Allow all access to vehicle_brands" ON public.vehicle_brands;
DROP POLICY IF EXISTS "Allow all access to vehicle_models" ON public.vehicle_models;
DROP POLICY IF EXISTS "Allow all access to countries" ON public.countries;

-- Create permissive policies for development (you can tighten these later)
CREATE POLICY "Allow all access to vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sellers" ON public.sellers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to vehicle_options" ON public.vehicle_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to vehicle_custom_options" ON public.vehicle_custom_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to vehicle_images" ON public.vehicle_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to vehicle_options_master" ON public.vehicle_options_master FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to vehicle_brands" ON public.vehicle_brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to vehicle_models" ON public.vehicle_models FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to countries" ON public.countries FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 10. CREATE STORAGE BUCKET
-- ==========================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 11. CREATE STORAGE POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Allow all to upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all to view vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all to delete vehicle images" ON storage.objects;

CREATE POLICY "Allow all to upload vehicle images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-images');

CREATE POLICY "Allow all to view vehicle images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

CREATE POLICY "Allow all to delete vehicle images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vehicle-images');

-- ==========================================
-- 12. CREATE UPDATE TRIGGERS
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

DROP TRIGGER IF EXISTS update_vehicle_brands_updated_at ON public.vehicle_brands;
CREATE TRIGGER update_vehicle_brands_updated_at BEFORE UPDATE ON public.vehicle_brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicle_models_updated_at ON public.vehicle_models;
CREATE TRIGGER update_vehicle_models_updated_at BEFORE UPDATE ON public.vehicle_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 13. CREATE INVENTORY VIEW
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
-- 14. VERIFICATION QUERIES
-- ==========================================

-- Check tables created
SELECT 'Tables Created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
AND tablename IN ('vehicles', 'sellers', 'vehicle_options', 'vehicle_custom_options', 
                  'vehicle_images', 'vehicle_options_master', 'vehicle_brands', 
                  'vehicle_models', 'countries');

-- Check sample data
SELECT 'Sample Data Counts:' as status;
SELECT 'Brands' as type, COUNT(*) as count FROM public.vehicle_brands
UNION ALL
SELECT 'Models', COUNT(*) FROM public.vehicle_models
UNION ALL
SELECT 'Countries', COUNT(*) FROM public.countries
UNION ALL
SELECT 'Options', COUNT(*) FROM public.vehicle_options_master;

-- Check storage bucket
SELECT 'Storage Bucket:' as status;
SELECT name FROM storage.buckets WHERE id = 'vehicle-images';

-- Success message
SELECT '✅ DATABASE SETUP COMPLETE!' as message,
       'All 9 tables created' as tables,
       'Sample data inserted' as data,
       'Storage bucket ready' as storage,
       'RLS policies active' as security,
       'Ready to add vehicles!' as status;
