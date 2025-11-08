-- Migration: Add phone_verification_otps table
-- Date: November 8, 2025
-- Purpose: Enable phone number verification via SMS OTP

-- Create phone_verification_otps table
CREATE TABLE IF NOT EXISTS phone_verification_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'verification', -- 'verification', 'login', 'password-reset'
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Add phone_verified column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add phone_verified_at column to track when phone was verified
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_verified_at'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_verified_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_phone_verification_otps_mobile 
  ON phone_verification_otps(mobile_number);

CREATE INDEX IF NOT EXISTS idx_phone_verification_otps_user_id 
  ON phone_verification_otps(user_id);

CREATE INDEX IF NOT EXISTS idx_phone_verification_otps_expires_at 
  ON phone_verification_otps(expires_at);

-- Enable Row Level Security
ALTER TABLE phone_verification_otps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own OTPs" ON phone_verification_otps;
CREATE POLICY "Users can view their own OTPs"
  ON phone_verification_otps
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own OTPs" ON phone_verification_otps;
CREATE POLICY "Users can create their own OTPs"
  ON phone_verification_otps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Service role has full access to phone_verification_otps" ON phone_verification_otps;
CREATE POLICY "Service role has full access to phone_verification_otps"
  ON phone_verification_otps
  USING (auth.role() = 'service_role');

-- Create function to clean up expired OTPs (run periodically via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM phone_verification_otps 
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$;

-- Add comment to table
COMMENT ON TABLE phone_verification_otps IS 'Stores OTP codes for phone number verification, login, and password reset';
COMMENT ON COLUMN phone_verification_otps.purpose IS 'Purpose of OTP: verification, login, or password-reset';
COMMENT ON COLUMN phone_verification_otps.verified IS 'Whether this OTP has been successfully verified';
COMMENT ON COLUMN phone_verification_otps.expires_at IS 'OTP expiration timestamp (typically 15 minutes from creation)';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON phone_verification_otps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON phone_verification_otps TO service_role;
