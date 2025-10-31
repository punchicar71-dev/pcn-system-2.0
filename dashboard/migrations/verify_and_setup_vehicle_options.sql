-- ==========================================
-- VEHICLE OPTIONS MASTER DATA VERIFICATION & SETUP
-- Run this script to ensure all vehicle options are properly configured
-- ==========================================

-- Step 1: Check current state of vehicle_options_master table
SELECT 
  '=== Current Vehicle Options Master Data ===' as info;

SELECT 
  option_type,
  COUNT(*) as count,
  STRING_AGG(option_name, ', ' ORDER BY option_name) as options
FROM vehicle_options_master
WHERE is_active = true
GROUP BY option_type
ORDER BY option_type;

-- Step 2: Delete existing options to prevent conflicts (optional - comment out if you want to keep existing data)
-- DELETE FROM vehicle_options WHERE option_id IN (SELECT id FROM vehicle_options_master);
-- DELETE FROM vehicle_options_master;

-- Step 3: Insert ALL Standard Vehicle Options from TypeScript constants
-- This ensures the vehicle_options_master table has all options defined in the frontend

INSERT INTO vehicle_options_master (option_name, option_type) VALUES
  ('A/C', 'standard'),
  ('Power Steering', 'standard'),
  ('Power Shutters', 'standard'),
  ('Central Lock', 'standard'),
  ('Remote C/Lock', 'standard'),
  ('5 Speed', 'standard'),
  ('Automatic Gear', 'standard'),
  ('Manual Gear', 'standard'),
  ('Digital Meter', 'standard'),
  ('Alloy Wheels', 'standard'),
  ('Reverse Camera', 'standard'),
  ('Reverse Sensor', 'standard'),
  ('Bluetooth', 'standard'),
  ('MP3', 'standard'),
  ('USB Port', 'standard'),
  ('Touch Display', 'standard'),
  ('Cruise Control', 'standard'),
  ('Multi-Function Steering', 'standard'),
  ('Fog Lights', 'standard'),
  ('Crystal Light', 'standard'),
  ('Full Option', 'standard'),
  ('ABS Brakes', 'standard'),
  ('Air Bags', 'standard'),
  ('Immobilizer', 'standard'),
  ('Keyless Entry', 'standard'),
  ('Push Start', 'standard'),
  ('Rear Wiper', 'standard'),
  ('Defogger', 'standard')
ON CONFLICT (option_name, option_type) DO UPDATE SET 
  is_active = true;

-- Step 4: Insert ALL Special Vehicle Options
INSERT INTO vehicle_options_master (option_name, option_type) VALUES
  ('4WD / AWD', 'special'),
  ('Hybrid System', 'special'),
  ('Electric Motor', 'special'),
  ('Turbo Engine', 'special'),
  ('Sunroof / Moonroof', 'special'),
  ('Roof Rails', 'special'),
  ('Leather Seats', 'special'),
  ('Heated Seats', 'special'),
  ('Navigation System (GPS)', 'special'),
  ('Rear Spoiler', 'special'),
  ('LED Headlights', 'special'),
  ('Projector Headlights', 'special'),
  ('Smart Key System', 'special'),
  ('Dual Climate Control', 'special'),
  ('Auto Parking', 'special'),
  ('Blind Spot Monitor', 'special'),
  ('Lane Assist', 'special'),
  ('Adaptive Cruise Control', 'special'),
  ('360° Camera', 'special'),
  ('Power Mirrors', 'special'),
  ('Power Tailgate', 'special')
ON CONFLICT (option_name, option_type) DO UPDATE SET 
  is_active = true;

-- Step 5: Verify the insertion
SELECT 
  '=== Verification: Options Count by Type ===' as info;

SELECT 
  option_type,
  COUNT(*) as count
FROM vehicle_options_master
WHERE is_active = true
GROUP BY option_type
ORDER BY option_type;

-- Step 6: Show all active options
SELECT 
  '=== All Active Vehicle Options ===' as info;

SELECT 
  id,
  option_name,
  option_type,
  is_active,
  created_at
FROM vehicle_options_master
WHERE is_active = true
ORDER BY option_type, option_name;

-- Step 7: Check for any duplicate or inactive options
SELECT 
  '=== Duplicate or Inactive Options ===' as info;

SELECT 
  option_name,
  option_type,
  COUNT(*) as count
FROM vehicle_options_master
GROUP BY option_name, option_type
HAVING COUNT(*) > 1;

-- Step 8: Final status message
SELECT 
  '✅ VEHICLE OPTIONS MASTER DATA SETUP COMPLETE!' as message,
  (SELECT COUNT(*) FROM vehicle_options_master WHERE option_type = 'standard' AND is_active = true) as standard_options,
  (SELECT COUNT(*) FROM vehicle_options_master WHERE option_type = 'special' AND is_active = true) as special_options,
  (SELECT COUNT(*) FROM vehicle_options_master WHERE is_active = true) as total_active_options,
  'Ready to add vehicles with options!' as status;
