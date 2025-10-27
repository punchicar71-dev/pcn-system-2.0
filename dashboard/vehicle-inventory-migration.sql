-- Vehicle Inventory Database Migration
-- PCN Car Niwasa Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- VEHICLE MAIN TABLE
-- ==========================================
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

-- ==========================================
-- SELLER DETAILS TABLE
-- ==========================================
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

-- ==========================================
-- VEHICLE OPTIONS (STANDARD & SPECIAL)
-- ==========================================
CREATE TABLE IF NOT EXISTS vehicle_options_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_name VARCHAR(100) UNIQUE NOT NULL,
  option_type VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_option_type CHECK (option_type IN ('standard', 'special', 'custom'))
);

-- Insert default standard options
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

-- Insert default special options
INSERT INTO vehicle_options_master (option_name, option_type) VALUES
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
ON CONFLICT (option_name) DO NOTHING;

-- Vehicle to Options mapping
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

-- Custom manually added options
CREATE TABLE IF NOT EXISTS vehicle_custom_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  option_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- VEHICLE IMAGES
-- ==========================================
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

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_vehicles_vehicle_number ON vehicles(vehicle_number);
CREATE INDEX idx_vehicles_brand_id ON vehicles(brand_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_entry_date ON vehicles(entry_date);
CREATE INDEX idx_vehicles_manufacture_year ON vehicles(manufacture_year);
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at);

CREATE INDEX idx_sellers_vehicle_id ON sellers(vehicle_id);
CREATE INDEX idx_sellers_mobile_number ON sellers(mobile_number);
CREATE INDEX idx_sellers_nic_number ON sellers(nic_number);

CREATE INDEX idx_vehicle_options_vehicle_id ON vehicle_options(vehicle_id);
CREATE INDEX idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX idx_vehicle_images_type ON vehicle_images(image_type);

-- ==========================================
-- UPDATE TIMESTAMP TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_custom_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Allow authenticated users to view vehicles" ON vehicles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert vehicles" ON vehicles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update vehicles" ON vehicles
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete vehicles" ON vehicles
  FOR DELETE TO authenticated USING (true);

-- Similar policies for other tables
CREATE POLICY "Allow authenticated users full access to sellers" ON sellers
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to vehicle_options" ON vehicle_options
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to vehicle_custom_options" ON vehicle_custom_options
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to vehicle_images" ON vehicle_images
  FOR ALL TO authenticated USING (true);

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================
-- Create storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
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
-- VIEWS FOR COMMON QUERIES
-- ==========================================
CREATE OR REPLACE VIEW vehicle_inventory_view AS
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
  v.updated_at,
  (SELECT json_agg(json_build_object('id', vi.id, 'url', vi.image_url, 'type', vi.image_type, 'is_primary', vi.is_primary))
   FROM vehicle_images vi WHERE vi.vehicle_id = v.id) as images,
  (SELECT json_agg(json_build_object('name', vom.option_name, 'type', vo.option_type))
   FROM vehicle_options vo 
   JOIN vehicle_options_master vom ON vo.option_id = vom.id 
   WHERE vo.vehicle_id = v.id AND vo.is_enabled = true) as options
FROM vehicles v
LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
LEFT JOIN vehicle_models vm ON v.model_id = vm.id
LEFT JOIN countries c ON v.country_id = c.id
LEFT JOIN sellers s ON s.vehicle_id = v.id;

COMMENT ON VIEW vehicle_inventory_view IS 'Complete vehicle inventory with all related data';
