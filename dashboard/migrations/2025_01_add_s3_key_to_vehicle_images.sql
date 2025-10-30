/**
 * Migration: Add S3 Key Column to Vehicle Images Table
 * This adds support for tracking S3 object keys for proper S3 operations
 */

-- Add s3_key column if it doesn't exist
ALTER TABLE IF EXISTS vehicle_images
ADD COLUMN IF NOT EXISTS s3_key VARCHAR(500);

-- Make storage_path nullable since we're using s3_key for S3 storage
-- This allows backward compatibility with old records while supporting new S3 workflow
ALTER TABLE IF EXISTS vehicle_images
ALTER COLUMN storage_path DROP NOT NULL;

-- Update constraint to allow image_360 type
ALTER TABLE IF EXISTS vehicle_images
DROP CONSTRAINT IF EXISTS check_image_type;

ALTER TABLE IF EXISTS vehicle_images
ADD CONSTRAINT check_image_type CHECK (image_type IN ('gallery', 'cr_paper', 'document', 'image_360'));

-- Create index for S3 key lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_images_s3_key ON vehicle_images(s3_key);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_image_type ON vehicle_images(image_type);
