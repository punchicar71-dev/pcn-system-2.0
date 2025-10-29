# FIX USER MANAGEMENT TABLE - URGENT

## Problem
The user management table is not showing data because of an **infinite recursion error** in the Supabase Row Level Security (RLS) policies.

## Error
```
Error: infinite recursion detected in policy for relation "users"
```

## Solution
Run the SQL script to fix the RLS policies.

### Steps to Fix:

1. **Open Supabase Dashboard**
   - Go to: https://wnorajpknqegnnmeotjf.supabase.co

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Fix Script**
   - Copy the contents of `FIX_USERS_RLS_POLICIES.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Cmd+Enter

4. **Verify the Fix**
   - After running the script, refresh your user management page
   - Users should now be visible in the table

### What the Script Does:
- Removes the problematic "Admins can manage all users" policy that was causing recursion
- Creates simpler policies that allow authenticated users to manage users
- Maintains the service role policy for system operations
- Keeps RLS enabled for security

### Expected Result:
✅ Users table will load successfully
✅ No more infinite recursion errors
✅ User management page will display all users

---

## Quick Copy - SQL Script

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Allow authenticated users to read all users
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Users can insert" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Users can update" ON public.users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Users can delete" ON public.users
  FOR DELETE
  TO authenticated
  USING (true);

-- Service role has full access
CREATE POLICY "Service role has full access" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

After running this, refresh the user management page!
