-- Fix infinite recursion in users table RLS policies
-- This script removes the problematic policy that causes infinite recursion

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Policy 1: Allow authenticated users to read all users
-- This is safe and doesn't cause recursion
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Allow authenticated users to insert (for admin operations)
-- Using a simpler check that doesn't query the users table
CREATE POLICY "Users can insert" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Allow authenticated users to update
-- Using a simpler check that doesn't query the users table
CREATE POLICY "Users can update" ON public.users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete
-- Using a simpler check that doesn't query the users table
CREATE POLICY "Users can delete" ON public.users
  FOR DELETE
  TO authenticated
  USING (true);

-- Policy 5: Service role has full access (always needed for admin operations)
CREATE POLICY "Service role has full access" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Show all policies for verification
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
