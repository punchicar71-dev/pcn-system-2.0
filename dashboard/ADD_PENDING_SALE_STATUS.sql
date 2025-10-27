-- First, check the current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'vehicles'::regclass 
AND contype = 'c';

-- Drop the existing check constraint on status
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS check_status;

-- Add the new constraint with "Pending Sale" and "Sold" included
ALTER TABLE vehicles ADD CONSTRAINT check_status 
CHECK (status IN ('In Transit', 'In Sale', 'Pending Sale', 'Sold'));

-- Verify the new constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'vehicles'::regclass 
AND contype = 'c'
AND conname = 'check_status';

-- Now update the existing vehicles that are in pending sales
UPDATE vehicles
SET status = 'Pending Sale'
WHERE id IN (
  SELECT vehicle_id 
  FROM pending_vehicle_sales 
  WHERE status = 'pending'
);

-- Verify the update
SELECT 
  v.vehicle_number,
  v.status as vehicle_status,
  pvs.status as sale_status,
  pvs.customer_first_name,
  pvs.customer_last_name
FROM vehicles v
JOIN pending_vehicle_sales pvs ON v.id = pvs.vehicle_id
WHERE pvs.status = 'pending';
