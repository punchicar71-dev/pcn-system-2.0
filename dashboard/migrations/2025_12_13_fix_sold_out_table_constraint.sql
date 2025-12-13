-- Migration: Fix sold_out table foreign key constraint to allow vehicle deletion
-- Date: 2025-12-13
-- Purpose: Make vehicle_id nullable in sold_out table and update constraint to ON DELETE SET NULL

-- Check if sold_out table exists first
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'sold_out'
  ) THEN
    RAISE NOTICE 'Found sold_out table - updating constraints...';
    
    -- Make vehicle_id nullable if not already
    ALTER TABLE sold_out 
    ALTER COLUMN vehicle_id DROP NOT NULL;
    
    -- Drop existing foreign key constraint if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_sold_out_vehicle' 
      AND table_name = 'sold_out'
    ) THEN
      ALTER TABLE sold_out DROP CONSTRAINT fk_sold_out_vehicle;
      RAISE NOTICE 'Dropped old constraint fk_sold_out_vehicle';
    END IF;
    
    -- Add new foreign key with ON DELETE SET NULL
    ALTER TABLE sold_out
    ADD CONSTRAINT fk_sold_out_vehicle 
    FOREIGN KEY (vehicle_id) 
    REFERENCES vehicles(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Updated sold_out table foreign key to ON DELETE SET NULL';
    
    -- Add indexes for performance
    CREATE INDEX IF NOT EXISTS idx_sold_out_vehicle_id ON sold_out(vehicle_id);
    
    RAISE NOTICE 'Migration completed successfully for sold_out table';
  ELSE
    RAISE NOTICE 'sold_out table does not exist - skipping migration';
  END IF;
END $$;
