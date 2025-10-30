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
 * Delete all images for a vehicle
 */
export const deleteVehicleImages = async (vehicleId: string): Promise<boolean> => {
  try {
    const folders = ['cr_pepar_image', 'vehicle_360_image', 'vehicle_images'];
    
    for (const folder of folders) {
      // List all objects for this vehicle in each folder
      const listCommand = new ListObjectsV2Command({
        Bucket: S3_BUCKET_NAME,
        Prefix: `${folder}/${vehicleId}/`,
      });

      const listResult = await s3Client.send(listCommand);

      if (listResult.Contents && listResult.Contents.length > 0) {
        // Delete all objects in this folder
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: S3_BUCKET_NAME,
          Delete: {
            Objects: listResult.Contents.map((obj: any) => ({ Key: obj.Key! })),
          },
        });

        await s3Client.send(deleteCommand);
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
