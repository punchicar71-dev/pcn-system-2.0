/**
 * AWS S3 Upload Utilities
 * Provides functions for uploading, deleting, and managing vehicle images in S3
 */

import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME, generateS3Key, getS3PublicUrl } from '../config/aws';

export interface S3UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload image to S3
 */
export const uploadToS3 = async (
  file: Buffer,
  vehicleId: string,
  imageType: 'gallery' | 'image_360' | 'cr_paper',
  fileName: string,
  mimeType: string
): Promise<S3UploadResult> => {
  try {
    const key = generateS3Key(vehicleId, imageType, fileName);

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: mimeType,
      // Set cache control for better performance
      CacheControl: 'max-age=31536000', // 1 year
      // Add metadata
      Metadata: {
        vehicleId,
        imageType,
        originalFileName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    const publicUrl = getS3PublicUrl(key);

    return {
      success: true,
      url: publicUrl,
      key,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Generate presigned URL for direct browser upload
 * This is more efficient as files go directly from browser to S3
 */
export const generatePresignedUploadUrl = async (
  vehicleId: string,
  imageType: 'gallery' | 'image_360' | 'cr_paper',
  fileName: string,
  mimeType: string
): Promise<{ presignedUrl: string; key: string; publicUrl: string }> => {
  const key = generateS3Key(vehicleId, imageType, fileName);

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
    CacheControl: 'max-age=31536000',
    Metadata: {
      vehicleId,
      imageType,
      originalFileName: fileName,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Generate presigned URL valid for 5 minutes
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const publicUrl = getS3PublicUrl(key);

  return { presignedUrl, key, publicUrl };
};

/**
 * Delete single image from S3
 */
export const deleteFromS3 = async (key: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
};

/**
 * Delete all images for a vehicle using S3 keys
 */
export const deleteVehicleImages = async (s3Keys: string[]): Promise<boolean> => {
  try {
    if (!s3Keys || s3Keys.length === 0) {
      console.log('No S3 keys provided for deletion');
      return true; // Nothing to delete
    }

    // Filter out any null/undefined keys
    const validKeys = s3Keys.filter(key => key && key.trim() !== '');
    
    if (validKeys.length === 0) {
      console.log('No valid S3 keys to delete');
      return true;
    }

    console.log(`Deleting ${validKeys.length} objects from S3:`, validKeys);

    // S3 DeleteObjects can handle up to 1000 objects at once
    // Split into batches if needed
    const batchSize = 1000;
    for (let i = 0; i < validKeys.length; i += batchSize) {
      const batch = validKeys.slice(i, i + batchSize);
      
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: S3_BUCKET_NAME,
        Delete: {
          Objects: batch.map(key => ({ Key: key })),
          Quiet: false, // Get detailed response
        },
      });

      const result = await s3Client.send(deleteCommand);
      
      if (result.Deleted && result.Deleted.length > 0) {
        console.log(`✅ Successfully deleted ${result.Deleted.length} objects from S3`);
      }
      
      if (result.Errors && result.Errors.length > 0) {
        console.error('❌ Errors deleting some objects:', result.Errors);
        // Continue anyway - some deletions may have succeeded
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting vehicle images from S3:', error);
    return false;
  }
};

/**
 * List all images for a vehicle
 */
export const listVehicleImages = async (
  vehicleId: string,
  imageType?: 'gallery' | 'image_360' | 'cr_paper'
): Promise<string[]> => {
  try {
    let folders: string[];
    
    if (imageType) {
      // Map imageType to folder name
      switch (imageType) {
        case 'cr_paper':
          folders = ['cr_pepar_image'];
          break;
        case 'image_360':
          folders = ['vehicle_360_image'];
          break;
        case 'gallery':
        default:
          folders = ['vehicle_images'];
          break;
      }
    } else {
      // List all folders
      folders = ['cr_pepar_image', 'vehicle_360_image', 'vehicle_images'];
    }
    
    const allImages: string[] = [];
    
    for (const folder of folders) {
      const prefix = `${folder}/${vehicleId}/`;
      
      const command = new ListObjectsV2Command({
        Bucket: S3_BUCKET_NAME,
        Prefix: prefix,
      });

      const result = await s3Client.send(command);

      if (result.Contents) {
        const images = result.Contents.map((obj: any) => getS3PublicUrl(obj.Key!));
        allImages.push(...images);
      }
    }

    return allImages;
  } catch (error) {
    console.error('Error listing vehicle images from S3:', error);
    return [];
  }
};

/**
 * Generate presigned URL for downloading/viewing private images
 */
export const generatePresignedDownloadUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};
