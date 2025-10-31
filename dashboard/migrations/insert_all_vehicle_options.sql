-- Insert ALL Standard Vehicle Options from TypeScript constants
-- This ensures the vehicle_options_master table has all options defined in the frontend

-- Insert Standard Options
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
ON CONFLICT (option_name) DO UPDATE SET 
  option_type = EXCLUDED.option_type,
  is_active = true;

-- Insert Special Options
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
ON CONFLICT (option_name) DO UPDATE SET 
  option_type = EXCLUDED.option_type,
  is_active = true;

-- Verify the insertion
SELECT 
  option_type,
  COUNT(*) as count
FROM vehicle_options_master
WHERE is_active = true
GROUP BY option_type
ORDER BY option_type;

-- Show all options
SELECT 
  option_name,
  option_type,
  is_active,
  created_at
FROM vehicle_options_master
ORDER BY option_type, option_name;
