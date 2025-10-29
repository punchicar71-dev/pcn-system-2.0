-- Check if pending_vehicle_sales table has any sold vehicles
-- Run this in Supabase SQL Editor to see your data

-- 1. Check all records in pending_vehicle_sales
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_count
FROM pending_vehicle_sales;

-- 2. Check sold vehicles with their body types
SELECT 
  pvs.id,
  pvs.status,
  pvs.updated_at,
  v.body_type,
  v.brand,
  v.model
FROM pending_vehicle_sales pvs
LEFT JOIN vehicles v ON pvs.vehicle_id = v.id
WHERE pvs.status = 'sold'
ORDER BY pvs.updated_at DESC
LIMIT 10;

-- 3. Check if there are any vehicles at all
SELECT COUNT(*) as total_vehicles FROM vehicles;

-- 4. Check if there are any pending sales at all
SELECT COUNT(*) as total_pending_sales FROM pending_vehicle_sales;

-- If you see 0 sold vehicles, you can create test data with the script below:
-- (Uncomment and run if needed)

/*
-- Insert test sold vehicle data
-- First, get a vehicle ID
DO $$
DECLARE
  test_vehicle_id UUID;
BEGIN
  -- Get first vehicle from vehicles table
  SELECT id INTO test_vehicle_id FROM vehicles LIMIT 1;
  
  -- Insert test sold record
  IF test_vehicle_id IS NOT NULL THEN
    INSERT INTO pending_vehicle_sales (
      vehicle_id,
      customer_first_name,
      customer_last_name,
      customer_mobile,
      selling_amount,
      advance_amount,
      payment_type,
      status,
      created_at,
      updated_at
    ) VALUES (
      test_vehicle_id,
      'Test',
      'Customer',
      '0771234567',
      5000000.00,
      500000.00,
      'Cash',
      'sold',
      NOW() - INTERVAL '5 days',
      NOW() - INTERVAL '2 days'
    );
    
    RAISE NOTICE 'Test sold vehicle record created!';
  ELSE
    RAISE NOTICE 'No vehicles found in vehicles table!';
  END IF;
END $$;
*/
