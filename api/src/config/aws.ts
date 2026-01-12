/**
 * AWS S3 Configuration for Vehicle Image Uploads
 * Handles all S3 interactions for the PCN System
 */

import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variable configuration with detailed logging
const AWS_CONFIG = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // Support both naming conventions for bucket name
  bucketName: process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME,
};

// Log configuration status at startup (without exposing secrets)
console.log('🔧 [AWS CONFIG] Initializing S3 configuration...');
console.log(`   AWS_REGION: ${AWS_CONFIG.region ? '✅ Set (' + AWS_CONFIG.region + ')' : '❌ NOT SET'}`);
console.log(`   AWS_ACCESS_KEY_ID: ${AWS_CONFIG.accessKeyId ? '✅ Set (' + AWS_CONFIG.accessKeyId.substring(0, 4) + '****)' : '❌ NOT SET'}`);
console.log(`   AWS_SECRET_ACCESS_KEY: ${AWS_CONFIG.secretAccessKey ? '✅ Set (****hidden****)' : '❌ NOT SET'}`);
console.log(`   AWS_S3_BUCKET_NAME: ${process.env.AWS_S3_BUCKET_NAME ? '✅ Set' : '❌ NOT SET'}`);
console.log(`   AWS_BUCKET_NAME: ${process.env.AWS_BUCKET_NAME ? '✅ Set' : '❌ NOT SET'}`);
console.log(`   Resolved Bucket: ${AWS_CONFIG.bucketName || '❌ NONE'}`);

// Warn about missing configuration
if (!AWS_CONFIG.region) {
  console.warn('⚠️  AWS_REGION not set. S3 uploads will not work.');
}
if (!AWS_CONFIG.accessKeyId) {
  console.warn('⚠️  AWS_ACCESS_KEY_ID not set. S3 uploads will not work.');
}
if (!AWS_CONFIG.secretAccessKey) {
  console.warn('⚠️  AWS_SECRET_ACCESS_KEY not set. S3 uploads will not work.');
}
if (!AWS_CONFIG.bucketName) {
  console.warn('⚠️  AWS_S3_BUCKET_NAME or AWS_BUCKET_NAME not set. S3 uploads will not work.');
}

// Create S3 client with explicit configuration
export const s3Client = new S3Client({
  region: AWS_CONFIG.region || 'us-east-1',
  credentials: AWS_CONFIG.accessKeyId && AWS_CONFIG.secretAccessKey
    ? {
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
      }
    : undefined, // Let SDK try default credential chain if env vars not set
  // Disable automatic checksum for browser uploads compatibility
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
  // Add retry configuration for production reliability
  maxAttempts: 3,
});

export const S3_BUCKET_NAME = AWS_CONFIG.bucketName || '';
export const S3_REGION = AWS_CONFIG.region || 'us-east-1';

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
  const configured = !!(
    AWS_CONFIG.region &&
    AWS_CONFIG.accessKeyId &&
    AWS_CONFIG.secretAccessKey &&
    AWS_CONFIG.bucketName
  );
  
  if (!configured) {
    console.warn('⚠️  [isS3Configured] S3 not fully configured:', {
      hasRegion: !!AWS_CONFIG.region,
      hasAccessKey: !!AWS_CONFIG.accessKeyId,
      hasSecretKey: !!AWS_CONFIG.secretAccessKey,
      hasBucket: !!AWS_CONFIG.bucketName,
    });
  }
  
  return configured;
};

/**
 * Test S3 connectivity - call this to verify credentials work
 */
export const testS3Connection = async (): Promise<{ success: boolean; error?: string; details?: any }> => {
  console.log('🔍 [S3 TEST] Testing S3 connection...');
  
  if (!isS3Configured()) {
    return { success: false, error: 'S3 not configured' };
  }
  
  try {
    const command = new HeadBucketCommand({ Bucket: S3_BUCKET_NAME });
    const startTime = Date.now();
    await s3Client.send(command);
    const duration = Date.now() - startTime;
    
    console.log(`✅ [S3 TEST] Connection successful! Bucket '${S3_BUCKET_NAME}' is accessible (${duration}ms)`);
    return { success: true };
  } catch (error: any) {
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.Code || error.$metadata?.httpStatusCode,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      extendedRequestId: error.$metadata?.extendedRequestId,
      region: error.$metadata?.region,
    };
    
    console.error('❌ [S3 TEST] Connection failed:', errorDetails);
    
    // Provide helpful error messages
    if (error.$metadata?.httpStatusCode === 403) {
      console.error('   🔐 This is a PERMISSION error. Check your IAM user/role has s3:HeadBucket permission.');
    } else if (error.$metadata?.httpStatusCode === 404) {
      console.error(`   📦 Bucket '${S3_BUCKET_NAME}' does not exist or you don't have permission to access it.`);
    } else if (error.name === 'CredentialsProviderError') {
      console.error('   🔑 Credentials are invalid or not found.');
    }
    
    return { success: false, error: error.message, details: errorDetails };
  }
};
