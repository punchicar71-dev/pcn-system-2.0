-- Drop table if exists to ensure clean creation
DROP TABLE IF EXISTS password_reset_otps CASCADE;

-- Create password_reset_otps table to store OTP codes temporarily
CREATE TABLE password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_password_reset_otps_mobile ON password_reset_otps(mobile_number);
CREATE INDEX idx_password_reset_otps_otp_code ON password_reset_otps(otp_code);
CREATE INDEX idx_password_reset_otps_expires_at ON password_reset_otps(expires_at);
CREATE INDEX idx_password_reset_otps_user_id ON password_reset_otps(user_id);

-- Enable RLS
ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role (for backend operations)
CREATE POLICY "Service role can manage password_reset_otps"
  ON password_reset_otps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_otps
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE password_reset_otps IS 'Stores OTP codes for password reset flow with 5-minute expiration';
COMMENT ON COLUMN password_reset_otps.mobile_number IS 'Sri Lankan mobile number in format 94XXXXXXXXX';
COMMENT ON COLUMN password_reset_otps.otp_code IS '6-digit OTP code';
COMMENT ON COLUMN password_reset_otps.expires_at IS 'OTP expiration time (5 minutes from creation)';
COMMENT ON COLUMN password_reset_otps.verified IS 'Whether OTP has been used';
