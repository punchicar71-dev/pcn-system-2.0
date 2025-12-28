-- Migration: Add email column to password_reset_otps table
-- This migration enables email-based OTP verification using Resend
-- Date: 2025-12-28

-- Add email column to password_reset_otps table
ALTER TABLE public.password_reset_otps
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email 
ON public.password_reset_otps(email);

-- Make mobile_number nullable (since we're now using email)
ALTER TABLE public.password_reset_otps
ALTER COLUMN mobile_number DROP NOT NULL;

-- Add a check constraint to ensure either email or mobile_number is provided
-- (This is optional - uncomment if you want to enforce this)
-- ALTER TABLE public.password_reset_otps
-- ADD CONSTRAINT chk_email_or_mobile CHECK (email IS NOT NULL OR mobile_number IS NOT NULL);

COMMENT ON COLUMN public.password_reset_otps.email IS 'Email address for OTP verification (used with Resend email service)';
