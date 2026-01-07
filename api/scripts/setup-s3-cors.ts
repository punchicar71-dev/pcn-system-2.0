/**
 * Script to configure CORS on S3 bucket for browser uploads
 * Run: cd api && npx ts-node scripts/setup-s3-cors.ts
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME || '';

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3000',
        'https://*.punchicar.lk',
        'https://punchicar.lk',
        'https://app.punchicar.lk',
        'https://*.railway.app',
      ],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function setupCors() {
  console.log('🔧 Setting up CORS for bucket:', bucketName);
  console.log('📋 CORS Configuration:', JSON.stringify(corsConfiguration, null, 2));

  try {
    // Set CORS configuration
    const putCommand = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(putCommand);
    console.log('✅ CORS configuration applied successfully!');

    // Verify CORS configuration
    const getCommand = new GetBucketCorsCommand({
      Bucket: bucketName,
    });

    const result = await s3Client.send(getCommand);
    console.log('📖 Current CORS configuration:', JSON.stringify(result.CORSRules, null, 2));

  } catch (error) {
    console.error('❌ Error setting up CORS:', error);
    process.exit(1);
  }
}

setupCors();
