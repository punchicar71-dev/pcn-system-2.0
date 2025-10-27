-- Fix the status of vehicles that are already in pending_vehicle_sales
-- This will update AAG-0333 and AEE-4212 to 'Pending Sale' status

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
