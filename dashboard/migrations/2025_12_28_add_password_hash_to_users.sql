-- Add password_hash column to users table for local authentication
-- This column stores the hashed password for users who use email/password login

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add an index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_email_password ON users(email) WHERE password_hash IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN users.password_hash IS 'Hashed password for local authentication';
