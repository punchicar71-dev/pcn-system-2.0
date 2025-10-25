-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create vehicle_brands table
CREATE TABLE IF NOT EXISTS vehicle_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create vehicle_models table
CREATE TABLE IF NOT EXISTS vehicle_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES vehicle_brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(brand_id, name)
);

-- Create price_categories table
CREATE TABLE IF NOT EXISTS price_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  min_price DECIMAL(15,2) NOT NULL,
  max_price DECIMAL(15,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sales_agents table
CREATE TABLE IF NOT EXISTS sales_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default countries
INSERT INTO countries (name, is_active) VALUES
  ('China', true),
  ('United States', true),
  ('Japan', true),
  ('India', true),
  ('South Korea', true),
  ('Germany', true),
  ('Mexico', true),
  ('Spain', true),
  ('Brazil', true),
  ('Thailand', true),
  ('Canada', true),
  ('France', true),
  ('Turkey', true),
  ('Czechia', true),
  ('Indonesia', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample sales agents
INSERT INTO sales_agents (user_id, name, is_active) VALUES
  ('00471', 'Rashmina Yapa', true),
  ('00453', 'Ralph Edwards', true),
  ('00423', 'Jenny Wilson', false)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample price categories
INSERT INTO price_categories (name, min_price, max_price, is_active) VALUES
  ('Low Level', 0, 2500000, true),
  ('Mid Level', 2500000, 5000000, true),
  ('High Level', 5000000, 10000000, true),
  ('Luxury', 10000000, 999999999, true)
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_brands_updated_at BEFORE UPDATE ON vehicle_brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_models_updated_at BEFORE UPDATE ON vehicle_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_categories_updated_at BEFORE UPDATE ON price_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_agents_updated_at BEFORE UPDATE ON sales_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_agents ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON countries FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON countries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON countries FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON countries FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON vehicle_brands FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON vehicle_brands FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON vehicle_brands FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON vehicle_brands FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON vehicle_models FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON vehicle_models FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON vehicle_models FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON vehicle_models FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON price_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON price_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON price_categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON price_categories FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON sales_agents FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON sales_agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON sales_agents FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON sales_agents FOR DELETE USING (true);
