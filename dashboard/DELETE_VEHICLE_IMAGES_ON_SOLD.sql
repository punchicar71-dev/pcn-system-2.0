-- SQL Script to automatically delete vehicle images when a vehicle is marked as sold
-- This script creates a database function and trigger to handle image deletion

-- Create a function to delete vehicle images when a vehicle is sold
CREATE OR REPLACE FUNCTION delete_vehicle_images_on_sold()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the status changed to 'sold'
  IF NEW.status = 'sold' AND (OLD.status IS NULL OR OLD.status != 'sold') THEN
    -- Delete all images for this vehicle from vehicle_images table
    DELETE FROM public.vehicle_images 
    WHERE vehicle_id = NEW.vehicle_id;
    
    -- Log the deletion (optional)
    RAISE NOTICE 'Deleted all images for vehicle_id: %', NEW.vehicle_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS trigger_delete_vehicle_images_on_sold ON public.pending_vehicle_sales;

-- Create a trigger on pending_vehicle_sales table
CREATE TRIGGER trigger_delete_vehicle_images_on_sold
AFTER UPDATE ON public.pending_vehicle_sales
FOR EACH ROW
WHEN (NEW.status = 'sold')
EXECUTE FUNCTION delete_vehicle_images_on_sold();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION delete_vehicle_images_on_sold() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_vehicle_images_on_sold() TO anon;

-- Test comment
COMMENT ON FUNCTION delete_vehicle_images_on_sold() IS 'Automatically deletes all vehicle images from vehicle_images table when a vehicle sale status changes to sold';
