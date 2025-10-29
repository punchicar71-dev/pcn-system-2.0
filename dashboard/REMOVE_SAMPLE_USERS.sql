-- Remove sample/test users from the database
-- This will keep only real registered users

-- Show current users before deletion
SELECT id, first_name, last_name, email, access_level, status 
FROM public.users 
ORDER BY created_at DESC;

-- Delete sample users (users with example.com emails)
DELETE FROM public.users 
WHERE email LIKE '%example.com%';

-- Delete Rashmina Yapa (sample user)
DELETE FROM public.users WHERE email = 'rashmina.yapa.2000@gmail.com';

-- Show remaining users after deletion
SELECT id, first_name, last_name, email, access_level, status 
FROM public.users 
ORDER BY created_at DESC;
