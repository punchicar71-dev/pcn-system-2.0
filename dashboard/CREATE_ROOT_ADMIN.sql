-- CREATE ROOT ADMIN USER
-- This script creates the root admin user for the PCN System 2.0
-- Email: punchicar71@gmail.com
-- Username: punchcarrootadmin2025
-- Password: punchcarrootadmin2025

-- First, ensure the users table exists with proper structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert the root admin user into users table
INSERT INTO public.users (email, username, full_name, role)
VALUES (
  'punchicar71@gmail.com',
  'punchcarrootadmin2025',
  'Root Administrator',
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Note: To create the auth user, you need to run this in Supabase SQL Editor
-- or use the Supabase Dashboard to create the user manually.

-- MANUAL STEPS IN SUPABASE DASHBOARD:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Email: punchicar71@gmail.com
-- 4. Password: punchcarrootadmin2025
-- 5. Uncheck "Auto Confirm User" or manually confirm after creation
-- 6. Click "Create User"

-- After creating the auth user, update the users table to link them:
-- UPDATE public.users 
-- SET id = (SELECT id FROM auth.users WHERE email = 'punchicar71@gmail.com')
-- WHERE email = 'punchicar71@gmail.com';
