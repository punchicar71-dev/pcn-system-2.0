/**
 * S3 Cloud Storage Utility
 * All vehicle images are stored exclusively in AWS S3
 */

import {
  uploadToS3WithPresignedUrl,
  deleteFromS3,
  checkS3Status,
  type S3UploadResult,
} from './s3-client';

export interface StorageImage {
  id: string;
  vehicleId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string; // S3 URL
  s3Key: string; // S3 object key
  storageType: 's3';
  imageType: 'gallery' | 'image_360' | 'cr_paper';
  uploadedAt: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface VehicleImageStorage {
  vehicleId: string;
  galleryImages: StorageImage[];
  image360: StorageImage[];
  crImages: StorageImage[];
  lastUpdated: string;
  storageType: 's3';
}

/**
 * Check if S3 is enabled and configured
 */
export const isS3Enabled = async (): Promise<boolean> => {
  // Always check with server - no caching for S3 status
  // This ensures we always know the current configuration status
  console.log('🔍 Checking S3 status with server...');
  const enabled = await checkS3Status();
  console.log('✅ S3 status from server:', enabled);
  
  return enabled;
};

/**
 * Save image to S3
 */
export const saveImage = async (
  file: File,
  vehicleId: string,
  imageType: 'gallery' | 'image_360' | 'cr_paper',
  displayOrder: number = 0,
  isPrimary: boolean = false
): Promise<StorageImage | null> => {
  try {
    console.log('🔍 Checking S3 status...');
    const s3Enabled = await isS3Enabled();
    
    if (!s3Enabled) {
      const errorMsg = 'S3 is not configured. Please configure AWS S3 to upload images.';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('✅ S3 is enabled, proceeding with upload');

    const imageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('📤 Uploading to S3:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      vehicleId,
      imageType,
    });

    // Upload to S3
    const result = await uploadToS3WithPresignedUrl(file, vehicleId, imageType);
    
    console.log('📥 S3 Upload result:', result);
    
    if (!result.success) {
      const errorMsg = result.error || 'Failed to upload image to S3';
      console.error('❌ Upload failed:', errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!result.url || !result.key) {
      const errorMsg = 'S3 upload succeeded but missing URL or key in response';
      console.error('❌', errorMsg, result);
      throw new Error(errorMsg);
    }

    console.log('✅ Image uploaded successfully to S3:', result.url);

    const image: StorageImage = {
      id: imageId,
      vehicleId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      url: result.url,
      s3Key: result.key,
      storageType: 's3',
      imageType,
      uploadedAt: new Date().toISOString(),
      displayOrder,
      isPrimary,
    };

    return image;
  } catch (error) {
    console.error('❌ Error in saveImage:', error);
    throw error;
  }
};

/**
 * Delete image from S3
 */
export const deleteImage = async (
  vehicleId: string,
  imageId: string,
  imageType: 'gallery' | 'image_360' | 'cr_paper',
  s3Key?: string
): Promise<boolean> => {
  try {
    // If s3Key is provided, delete directly
    if (s3Key) {
      await deleteFromS3(s3Key);
      return true;
    }

    // Otherwise, we need to get the image info from the database or list from S3
    // This is a simplified version - you may need to enhance this based on your needs
    console.warn('Delete image called without s3Key - image may not be deleted from S3');
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Get all images for a vehicle from S3
 */
export const getAllVehicleImages = async (vehicleId: string): Promise<{
  gallery: StorageImage[];
  image360: StorageImage[];
  crPaper: StorageImage[];
}> => {
  try {
    // Import listVehicleImages from s3-client
    const { listVehicleImages } = await import('./s3-client');
    
    const [galleryUrls, image360Urls, crPaperUrls] = await Promise.all([
      listVehicleImages(vehicleId, 'gallery'),
      listVehicleImages(vehicleId, 'image_360'),
      listVehicleImages(vehicleId, 'cr_paper'),
    ]);

    // Convert URLs to StorageImage format
    const gallery: StorageImage[] = galleryUrls.map((url, index) => ({
      id: `gallery-${index}`,
      vehicleId,
      fileName: url.split('/').pop() || '',
      fileType: 'image/jpeg',
      fileSize: 0,
      url,
      s3Key: url.split('.com/')[1] || '',
      storageType: 's3' as const,
      imageType: 'gallery' as const,
      uploadedAt: new Date().toISOString(),
      displayOrder: index,
      isPrimary: index === 0,
    }));

    const image360: StorageImage[] = image360Urls.map((url, index) => ({
      id: `360-${index}`,
      vehicleId,
      fileName: url.split('/').pop() || '',
      fileType: 'image/jpeg',
      fileSize: 0,
      url,
      s3Key: url.split('.com/')[1] || '',
      storageType: 's3' as const,
      imageType: 'image_360' as const,
      uploadedAt: new Date().toISOString(),
      displayOrder: index,
      isPrimary: false,
    }));

    const crPaper: StorageImage[] = crPaperUrls.map((url, index) => ({
      id: `cr-${index}`,
      vehicleId,
      fileName: url.split('/').pop() || '',
      fileType: 'image/jpeg',
      fileSize: 0,
      url,
      s3Key: url.split('.com/')[1] || '',
      storageType: 's3' as const,
      imageType: 'cr_paper' as const,
      uploadedAt: new Date().toISOString(),
      displayOrder: index,
      isPrimary: false,
    }));

    return { gallery, image360, crPaper };
  } catch (error) {
    console.error('Error getting vehicle images from S3:', error);
    return { gallery: [], image360: [], crPaper: [] };
  }
};

/**
 * Clear all images for a vehicle from S3
 */
export const clearVehicleImages = async (vehicleId: string): Promise<boolean> => {
  try {
    // Import deleteVehicleImagesFromS3 from s3-client
    const { deleteVehicleImagesFromS3 } = await import('./s3-client');
    const result = await deleteVehicleImagesFromS3(vehicleId);
    return result;
  } catch (error) {
    console.error('Error clearing vehicle images:', error);
    return false;
  }
};

/**
 * Get storage type - always S3
 */
export const getStorageType = (): 's3' => {
  return 's3';
};
