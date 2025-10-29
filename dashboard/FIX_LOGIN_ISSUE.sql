-- FIX LOGIN ISSUE
-- This script helps diagnose and fix login issues in PCN System 2.0

-- Step 1: Check if users table exists and has proper structure
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) AS users_table_exists;

-- Step 2: Check all users in the system
SELECT 
  u.id,
  u.email, 
  u.username, 
  u.full_name,
  u.role,
  u.created_at
FROM public.users u
ORDER BY u.created_at DESC;

-- Step 3: Check auth.users (Supabase authentication table)
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at,
  au.last_sign_in_at,
  au.confirmation_sent_at
FROM auth.users au
ORDER BY au.created_at DESC;

-- Step 4: Check if users table and auth.users are properly linked
SELECT 
  u.email as users_email,
  u.username,
  u.role,
  au.email as auth_email,
  au.email_confirmed_at,
  CASE 
    WHEN u.id = au.id THEN 'LINKED ✓'
    ELSE 'NOT LINKED ✗'
  END as link_status
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email;

-- Step 5: If you see "NOT LINKED" above, run this to fix it:
-- (Uncomment the lines below)

-- UPDATE public.users 
-- SET id = (SELECT id FROM auth.users WHERE email = public.users.email)
-- WHERE email IN (
--   SELECT u.email 
--   FROM public.users u
--   LEFT JOIN auth.users au ON u.id = au.id
--   WHERE au.id IS NULL
-- );

-- Step 6: If your auth user doesn't exist, you need to create it manually
-- in Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Enter email and password
-- 4. Check "Auto Confirm User"
-- 5. Click "Create User"
-- Then re-run this script to link the accounts
