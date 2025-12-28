-- Migration: Add password_hash column for Better Auth migration
-- Created: 2025-12-28
-- Description: Adds a password_hash column to the users table to store passwords
--              during the migration from Supabase Auth to Better Auth.
--
-- This is a TEMPORARY column that will be replaced by Better Auth's
-- password management. Users will need to reset their passwords.

-- Add password_hash column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE public.users ADD COLUMN password_hash TEXT;
    COMMENT ON COLUMN public.users.password_hash IS 'Temporary password hash for Better Auth migration. Will be replaced by Better Auth accounts table.';
  END IF;
END $$;

-- Add last_sign_in_at column if it doesn't exist (for tracking)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'last_sign_in_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN last_sign_in_at TIMESTAMP WITH TIME ZONE;
    COMMENT ON COLUMN public.users.last_sign_in_at IS 'Last sign in timestamp';
  END IF;
END $$;

-- Add email_verified column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE public.users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    COMMENT ON COLUMN public.users.email_verified IS 'Whether the user email has been verified';
  END IF;
END $$;

-- Output success message
SELECT 'Migration completed: password_hash, last_sign_in_at, and email_verified columns added to users table' as status;
