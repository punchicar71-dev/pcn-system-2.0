-- Enhanced Users Table for PCN System 2.0
-- This script creates a comprehensive users table with all necessary fields

-- Drop existing table if you want to recreate (BE CAREFUL - THIS DELETES DATA!)
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with enhanced fields
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id TEXT UNIQUE, -- Auto-generated user ID like "00471"
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile_number TEXT,
  
  -- Profile
  profile_picture_url TEXT,
  
  -- Role and Access
  access_level TEXT NOT NULL CHECK (access_level IN ('Admin', 'Editor')),
  role TEXT NOT NULL CHECK (role IN ('Manager', 'Accountant', 'Sales Agent')),
  
  -- Status
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Function to generate sequential user ID
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
  user_id_str TEXT;
BEGIN
  -- Get the maximum existing user_id number
  SELECT COALESCE(MAX(CAST(SUBSTRING(user_id FROM 1) AS INTEGER)), 0) + 1
  INTO next_id
  FROM public.users
  WHERE user_id ~ '^[0-9]+$';
  
  -- Format as 5-digit string with leading zeros
  user_id_str := LPAD(next_id::TEXT, 5, '0');
  
  RETURN user_id_str;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate user_id
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := generate_user_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_user_id
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Create policies
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role has full access" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND access_level = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND access_level = 'Admin'
    )
  );

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Insert sample users (optional - remove if not needed)
INSERT INTO public.users (
  user_id, first_name, last_name, username, email, mobile_number,
  access_level, role, status
) VALUES
  ('00471', 'Rashmina', 'Yapa', 'rashmina.yapa', 'rashmina.yapa.2000@gmail.com', '+94771234567', 'Admin', 'Manager', 'Active'),
  ('00453', 'Ralph', 'Edwards', 'ralph.edwards', 'michelle.rivera@example.com', '+94772345678', 'Editor', 'Sales Agent', 'Inactive'),
  ('00423', 'Jenny', 'Wilson', 'jenny.wilson', 'debra.holt@example.com', '+94773456789', 'Editor', 'Accountant', 'Active'),
  ('00413', 'Kathryn', 'Murphy', 'kathryn.murphy', 'debbie.baker@example.com', '+94774567890', 'Admin', 'Manager', 'Active')
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE public.users IS 'System users with roles and access levels';
COMMENT ON COLUMN public.users.user_id IS 'Auto-generated 5-digit user ID';
COMMENT ON COLUMN public.users.access_level IS 'System access level: Admin or Editor';
COMMENT ON COLUMN public.users.role IS 'Business role: Manager, Accountant, or Sales Agent';
