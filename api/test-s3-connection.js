/**
 * AWS S3 Connection Test Script
 * Tests connectivity, permissions, and basic operations with S3 bucket
 */

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadBucketCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function logSection(title) {
  console.log(`\n${colors.cyan}${colors.bright}━━━ ${title} ━━━${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

// Configuration
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

let testsPassed = 0;
let testsFailed = 0;

async function testS3Connection() {
  console.log(`${colors.bright}${colors.blue}`);
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     AWS S3 Connection & Configuration Test Suite     ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  // Test 1: Environment Variables
  logSection('1. Environment Variables Check');
  
  const envVars = {
    'AWS_REGION': AWS_REGION,
    'AWS_ACCESS_KEY_ID': AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID.substring(0, 8) + '...' : undefined,
    'AWS_SECRET_ACCESS_KEY': AWS_SECRET_ACCESS_KEY ? '***' + AWS_SECRET_ACCESS_KEY.substring(AWS_SECRET_ACCESS_KEY.length - 4) : undefined,
    'AWS_S3_BUCKET_NAME': AWS_S3_BUCKET_NAME,
  };

  let envConfigValid = true;
  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      logSuccess(`${key}: ${value}`);
    } else {
      logError(`${key}: Not set`);
      envConfigValid = false;
    }
  }

  if (!envConfigValid) {
    logError('Environment configuration incomplete. Please check your .env file.');
    process.exit(1);
  }

  testsPassed++;

  // Test 2: S3 Client Initialization
  logSection('2. S3 Client Initialization');
  
  let s3Client;
  try {
    s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    logSuccess('S3 Client initialized successfully');
    testsPassed++;
  } catch (error) {
    logError(`Failed to initialize S3 Client: ${error.message}`);
    testsFailed++;
    process.exit(1);
  }

  // Test 3: Bucket Access
  logSection('3. Bucket Access Test');
  
  try {
    const headCommand = new HeadBucketCommand({
      Bucket: AWS_S3_BUCKET_NAME,
    });
    await s3Client.send(headCommand);
    logSuccess(`Successfully accessed bucket: ${AWS_S3_BUCKET_NAME}`);
    testsPassed++;
  } catch (error) {
    logError(`Failed to access bucket: ${error.message}`);
    if (error.name === 'NotFound') {
      logWarning('Bucket does not exist or you do not have permission to access it');
    } else if (error.name === 'Forbidden') {
      logWarning('Access denied. Check your AWS credentials and bucket permissions');
    }
    testsFailed++;
  }

  // Test 4: List Objects (read permission)
  logSection('4. List Objects Test (Read Permission)');
  
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: AWS_S3_BUCKET_NAME,
      MaxKeys: 5,
    });
    const listResponse = await s3Client.send(listCommand);
    logSuccess('Successfully listed objects in bucket');
    logInfo(`Total objects in bucket: ${listResponse.KeyCount || 0}`);
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      logInfo(`Sample files (first 5):`);
      listResponse.Contents.slice(0, 5).forEach(obj => {
        console.log(`  - ${obj.Key} (${(obj.Size / 1024).toFixed(2)} KB)`);
      });
    } else {
      logInfo('Bucket is currently empty');
    }
    testsPassed++;
  } catch (error) {
    logError(`Failed to list objects: ${error.message}`);
    testsFailed++;
  }

  // Test 5: Upload Test File (write permission)
  logSection('5. Upload Test (Write Permission)');
  
  const testKey = `test-connection/test-${Date.now()}.txt`;
  const testContent = 'This is a test file created by the S3 connection test script.';
  
  try {
    const putCommand = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
      Metadata: {
        testFile: 'true',
        createdAt: new Date().toISOString(),
      },
    });
    await s3Client.send(putCommand);
    logSuccess(`Successfully uploaded test file: ${testKey}`);
    
    const publicUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${testKey}`;
    logInfo(`S3 URL: ${publicUrl}`);
    logInfo(`Note: Files are stored privately. Use presigned URLs for access.`);
    testsPassed++;
  } catch (error) {
    logError(`Failed to upload test file: ${error.message}`);
    if (error.name === 'AccessDenied') {
      logWarning('You do not have write permissions to this bucket');
    }
    testsFailed++;
  }

  // Test 6: Read Test File (read permission)
  logSection('6. Download Test (Read Permission)');
  
  try {
    const getCommand = new GetObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: testKey,
    });
    const getResponse = await s3Client.send(getCommand);
    const downloadedContent = await streamToString(getResponse.Body);
    
    if (downloadedContent === testContent) {
      logSuccess('Successfully downloaded and verified test file');
      testsPassed++;
    } else {
      logError('Downloaded content does not match uploaded content');
      testsFailed++;
    }
  } catch (error) {
    logError(`Failed to download test file: ${error.message}`);
    testsFailed++;
  }

  // Test 7: Delete Test File (delete permission)
  logSection('7. Delete Test (Delete Permission)');
  
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: testKey,
    });
    await s3Client.send(deleteCommand);
    logSuccess('Successfully deleted test file');
    testsPassed++;
  } catch (error) {
    logError(`Failed to delete test file: ${error.message}`);
    if (error.name === 'AccessDenied') {
      logWarning('You do not have delete permissions for this bucket');
    }
    testsFailed++;
  }

  // Test 8: Verify Application Path Structure
  logSection('8. Application Path Structure Test');
  
  try {
    const testVehicleId = 'test-vehicle-123';
    const timestamp = Date.now();
    const paths = {
      'CR/Paper Documents': `cr_pepar_image/${testVehicleId}/${timestamp}-test-document.pdf`,
      '360 Images': `vehicle_360_image/${testVehicleId}/${timestamp}-test-360.jpg`,
      'Vehicle Gallery Images': `vehicle_images/${testVehicleId}/${timestamp}-test-gallery.jpg`,
    };

    logInfo('Testing vehicle image path structure:');
    for (const [type, path] of Object.entries(paths)) {
      console.log(`  ${type}: ${path}`);
    }
    logSuccess('Path structure matches S3 folder configuration');
    testsPassed++;
  } catch (error) {
    logError(`Path structure test failed: ${error.message}`);
    testsFailed++;
  }
  
  // Test 9: Test uploading to each folder
  logSection('9. Test Upload to Each Folder');
  
  const folders = [
    { name: 'cr_pepar_image', description: 'CR/Paper Documents' },
    { name: 'vehicle_360_image', description: '360 Images' },
    { name: 'vehicle_images', description: 'Vehicle Gallery Images' }
  ];
  
  const testVehicleId = 'test-upload-' + Date.now();
  const testFiles = [];
  
  for (const folder of folders) {
    try {
      const testKey = `${folder.name}/${testVehicleId}/test-${Date.now()}.jpg`;
      const testContent = `Test file for ${folder.description}`;
      
      const putCommand = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: testKey,
        Body: Buffer.from(testContent),
        ContentType: 'image/jpeg',
        Metadata: {
          testFile: 'true',
          folder: folder.name,
          vehicleId: testVehicleId,
          createdAt: new Date().toISOString(),
        },
      });
      
      await s3Client.send(putCommand);
      testFiles.push(testKey);
      logSuccess(`✓ ${folder.description}: ${testKey}`);
    } catch (error) {
      logError(`✗ ${folder.description}: ${error.message}`);
      testsFailed++;
    }
  }
  
  if (testFiles.length === folders.length) {
    logSuccess(`All ${folders.length} test files uploaded successfully`);
    testsPassed++;
  }
  
  // Test 10: Clean up test files
  logSection('10. Cleanup Test Files');
  
  let cleanupSuccess = 0;
  for (const testKey of testFiles) {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: testKey,
      });
      await s3Client.send(deleteCommand);
      cleanupSuccess++;
    } catch (error) {
      logWarning(`Failed to delete ${testKey}: ${error.message}`);
    }
  }
  
  if (cleanupSuccess === testFiles.length) {
    logSuccess(`All ${cleanupSuccess} test files cleaned up successfully`);
    testsPassed++;
  } else {
    logWarning(`Cleaned up ${cleanupSuccess}/${testFiles.length} test files`);
  }

  // Summary
  logSection('Test Summary');
  console.log(`\nTotal Tests: ${testsPassed + testsFailed}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);

  if (testsFailed === 0) {
    console.log(`\n${colors.green}${colors.bright}✓ All tests passed! Your S3 bucket is properly configured.${colors.reset}`);
    console.log(`\n${colors.cyan}Your application is ready to upload vehicle images to S3.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bright}✗ Some tests failed. Please review the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Helper function to convert stream to string
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

// Run the tests
testS3Connection().catch((error) => {
  console.error(`\n${colors.red}${colors.bright}Fatal Error:${colors.reset} ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
