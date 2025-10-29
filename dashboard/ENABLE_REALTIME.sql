-- Enable Realtime for user_sessions table
-- Run this AFTER creating the user_sessions table

-- Step 1: Enable Realtime replication for the table
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;

-- Step 2: Verify Realtime is enabled
SELECT 
  schemaname,
  tablename,
  pubname
FROM pg_publication_tables
WHERE tablename = 'user_sessions';

-- Expected result should show:
-- schemaname | tablename      | pubname
-- public     | user_sessions  | supabase_realtime

-- Step 3: Test by checking current active sessions
SELECT 
  us.id,
  us.user_id,
  u.first_name,
  u.last_name,
  us.is_active,
  us.last_activity,
  us.created_at,
  EXTRACT(EPOCH FROM (NOW() - us.last_activity))/60 as minutes_since_activity
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.is_active = true
ORDER BY us.last_activity DESC;

-- This will show all currently active sessions with user details
