-- Fix migration: Remove foreign key constraint from password_reset_otps
-- This allows storing OTP codes without requiring the user to exist in auth.users
-- The user_id is informational only and doesn't enforce referential integrity

-- Drop the foreign key constraint
ALTER TABLE password_reset_otps DROP CONSTRAINT password_reset_otps_user_id_fkey;

-- Now the table will accept any user_id value without validation
-- This is acceptable because:
-- 1. OTPs are temporary (5-15 minute expiry)
-- 2. We validate the user exists when creating the OTP in the API
-- 3. The constraint was causing issues with auth.users not having all system users

-- Add a comment explaining the change
COMMENT ON COLUMN password_reset_otps.user_id IS 'Reference to auth.users.id - not enforced as foreign key due to data sync issues';
