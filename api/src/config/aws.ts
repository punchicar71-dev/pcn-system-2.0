/**
 * AWS S3 Configuration for Vehicle Image Uploads
 * Handles all S3 interactions for the PCN System
 */

import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.AWS_REGION) {
  console.warn('⚠️  AWS_REGION not set. S3 uploads will not work.');
}

if (!process.env.AWS_ACCESS_KEY_ID) {
  console.warn('⚠️  AWS_ACCESS_KEY_ID not set. S3 uploads will not work.');
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn('⚠️  AWS_SECRET_ACCESS_KEY not set. S3 uploads will not work.');
}

if (!process.env.AWS_S3_BUCKET_NAME) {
  console.warn('⚠️  AWS_S3_BUCKET_NAME not set. S3 uploads will not work.');
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  // Disable automatic checksum for browser uploads compatibility
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';
export const S3_REGION = process.env.AWS_REGION || 'us-east-1';

// CloudFront CDN URL (optional - for faster image delivery)
export const CDN_URL = process.env.AWS_CLOUDFRONT_URL || '';

/**
 * Generate S3 key (path) for vehicle images
 * Maps to S3 folder structure:
 * - cr_pepar_image/ for CR/Paper documents
 * - vehicle_360_image/ for 360 images
 * - vehicle_images/ for regular vehicle images
 */
export const generateS3Key = (
  vehicleId: string,
  imageType: 'gallery' | 'image_360' | 'cr_paper',
  fileName: string
): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Map imageType to S3 folder names
  let folderName: string;
  switch (imageType) {
    case 'cr_paper':
      folderName = 'cr_pepar_image';
      break;
    case 'image_360':
      folderName = 'vehicle_360_image';
      break;
    case 'gallery':
    default:
      folderName = 'vehicle_images';
      break;
  }
  
  return `${folderName}/${vehicleId}/${timestamp}-${sanitizedFileName}`;
};

/**
 * Get public URL for S3 object
 */
export const getS3PublicUrl = (key: string): string => {
  if (CDN_URL) {
    return `${CDN_URL}/${key}`;
  }
  return `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${key}`;
};

/**
 * Check if AWS S3 is properly configured
 */
export const isS3Configured = (): boolean => {
  return !!(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
  );
};
