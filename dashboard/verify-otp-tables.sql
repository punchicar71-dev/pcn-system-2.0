-- Verify OTP tables exist and show their structure

-- Check if password_reset_otps table exists
SELECT 'password_reset_otps' AS table_name, 
       EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'password_reset_otps'
       ) AS exists;

-- Check if phone_verification_otps table exists
SELECT 'phone_verification_otps' AS table_name, 
       EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'phone_verification_otps'
       ) AS exists;

-- Show column structure if tables exist
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('password_reset_otps', 'phone_verification_otps')
ORDER BY table_name, ordinal_position;

-- Show RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('password_reset_otps', 'phone_verification_otps');
