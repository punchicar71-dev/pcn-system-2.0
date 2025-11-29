-- =====================================================
-- VEHICLE LOCKS TABLE MIGRATION
-- Created: November 25, 2025
-- Purpose: Enable real-time vehicle locking to prevent
--          concurrent edits by multiple users
-- =====================================================

-- Create vehicle_locks table
CREATE TABLE IF NOT EXISTS vehicle_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  locked_by_user_id UUID NOT NULL,
  locked_by_name TEXT NOT NULL,
  lock_type TEXT NOT NULL CHECK (lock_type IN ('editing', 'selling', 'moving_to_soldout')),
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(vehicle_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicle_locks_vehicle_id ON vehicle_locks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_locks_expires_at ON vehicle_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_locks_locked_by ON vehicle_locks(locked_by_user_id);

-- Add table comment
COMMENT ON TABLE vehicle_locks IS 'Stores temporary locks on vehicles to prevent concurrent editing/selling by multiple users';

-- Enable Row Level Security
ALTER TABLE vehicle_locks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Anyone can view vehicle locks" ON vehicle_locks;
DROP POLICY IF EXISTS "Users can create their own locks" ON vehicle_locks;
DROP POLICY IF EXISTS "Users can delete their own locks" ON vehicle_locks;

-- Policy: Anyone can view locks (needed for real-time notifications)
CREATE POLICY "Anyone can view vehicle locks"
  ON vehicle_locks FOR SELECT
  USING (true);

-- Policy: Authenticated users can create locks for themselves
CREATE POLICY "Users can create their own locks"
  ON vehicle_locks FOR INSERT
  WITH CHECK (auth.uid() = locked_by_user_id);

-- Policy: Users can delete their own locks
CREATE POLICY "Users can delete their own locks"
  ON vehicle_locks FOR DELETE
  USING (auth.uid() = locked_by_user_id);

-- Policy: Users can update their own locks (for expiration extension)
CREATE POLICY "Users can update their own locks"
  ON vehicle_locks FOR UPDATE
  USING (auth.uid() = locked_by_user_id);

-- =====================================================
-- CLEANUP FUNCTION
-- Automatically removes expired locks
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_vehicle_locks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM vehicle_locks
  WHERE expires_at < NOW();
  
  RAISE NOTICE 'Cleaned up expired vehicle locks';
END;
$$;

-- Add function comment
COMMENT ON FUNCTION cleanup_expired_vehicle_locks() IS 'Removes vehicle locks that have expired';

-- =====================================================
-- OPTIONAL: Schedule automatic cleanup using pg_cron
-- Note: This requires pg_cron extension to be enabled
-- If pg_cron is not available, cleanup will happen
-- when users check lock status or manually
-- =====================================================

-- Uncomment these lines if you have pg_cron extension enabled:
-- SELECT cron.schedule(
--   'cleanup-vehicle-locks',
--   '*/5 * * * *',  -- Run every 5 minutes
--   'SELECT cleanup_expired_vehicle_locks()'
-- );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permission on cleanup function to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_expired_vehicle_locks() TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify table was created
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicle_locks'
  ) THEN
    RAISE NOTICE '✅ Table vehicle_locks created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create vehicle_locks table';
  END IF;
END $$;
