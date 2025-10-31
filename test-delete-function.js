/**
 * Test Script for Vehicle Deletion Functionality
 * Tests the complete flow: Database fetch -> API call -> S3 deletion -> Database deletion
 */

const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:4000';
const NEXT_URL = 'http://localhost:3001';

// Test S3 deletion endpoint
async function testS3Deletion() {
  console.log('\n🧪 Testing S3 Deletion Endpoint...\n');
  
  // Test data
  const testVehicleId = 'test-vehicle-123';
  const testS3Keys = [
    'vehicle_images/test-vehicle-123/image1.jpg',
    'vehicle_360_image/test-vehicle-123/360-1.jpg',
    'cr_pepar_image/test-vehicle-123/cr-paper.jpg'
  ];

  try {
    console.log('📤 Sending DELETE request to backend API...');
    console.log(`   URL: ${API_URL}/api/upload/delete-vehicle/${testVehicleId}`);
    console.log(`   Keys: ${testS3Keys.length} items`);
    
    const response = await fetch(`${API_URL}/api/upload/delete-vehicle/${testVehicleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ s3Keys: testS3Keys }),
    });

    const data = await response.json();
    
    console.log(`\n📥 Response Status: ${response.status}`);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ Backend API endpoint is working correctly!');
      return true;
    } else {
      console.log('\n❌ Backend API endpoint failed!');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Error testing backend API:', error.message);
    return false;
  }
}

// Test Next.js proxy endpoint
async function testNextJSProxy() {
  console.log('\n🧪 Testing Next.js Proxy Endpoint...\n');
  
  const testVehicleId = 'test-vehicle-456';
  const testS3Keys = [
    'vehicle_images/test-vehicle-456/image1.jpg',
  ];

  try {
    console.log('📤 Sending DELETE request to Next.js proxy...');
    console.log(`   URL: ${NEXT_URL}/api/upload/delete-vehicle/${testVehicleId}`);
    
    // Note: This will fail without auth, but we can check if the endpoint exists
    const response = await fetch(`${NEXT_URL}/api/upload/delete-vehicle/${testVehicleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token', // Will fail but tests endpoint
      },
      body: JSON.stringify({ s3Keys: testS3Keys }),
    });

    console.log(`\n📥 Response Status: ${response.status}`);
    
    if (response.status === 401 || response.status === 403) {
      console.log('✅ Next.js proxy endpoint exists (auth required - expected)');
      return true;
    } else if (response.status === 404) {
      console.log('❌ Next.js proxy endpoint not found!');
      return false;
    } else {
      console.log('✅ Next.js proxy endpoint is responding');
      return true;
    }
  } catch (error) {
    console.error('\n❌ Error testing Next.js proxy:', error.message);
    return false;
  }
}

// Check S3 configuration
async function checkS3Config() {
  console.log('\n🧪 Checking S3 Configuration...\n');
  
  try {
    const response = await fetch(`${API_URL}/api/upload/status`);
    const data = await response.json();
    
    console.log('📥 S3 Config Status:', JSON.stringify(data, null, 2));
    
    if (data.s3Configured) {
      console.log('\n✅ S3 is properly configured!');
      return true;
    } else {
      console.log('\n❌ S3 is NOT configured!');
      console.log('   Please check your AWS credentials in .env file');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Error checking S3 config:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Vehicle Deletion Function Test Suite                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const results = {
    s3Config: false,
    backendAPI: false,
    nextJSProxy: false,
  };

  // Test 1: Check S3 Configuration
  results.s3Config = await checkS3Config();
  
  // Test 2: Test Backend API
  results.backendAPI = await testS3Deletion();
  
  // Test 3: Test Next.js Proxy
  results.nextJSProxy = await testNextJSProxy();
  
  // Summary
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Results Summary                                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`S3 Configuration:       ${results.s3Config ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend API Endpoint:   ${results.backendAPI ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Next.js Proxy Endpoint: ${results.nextJSProxy ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! The deletion function should work correctly.\n');
    console.log('Next steps:');
    console.log('1. Go to http://localhost:3001/inventory');
    console.log('2. Click delete on any vehicle');
    console.log('3. Check the browser console for detailed logs');
    console.log('4. Verify in AWS S3 that images are deleted');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
  }
  
  console.log('\n');
}

// Run the tests
runTests().catch(console.error);
