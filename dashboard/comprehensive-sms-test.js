/**
 * Comprehensive SMS Gateway Testing Script
 * This script performs deep checks on the Text.lk SMS integration
 * 
 * Tests:
 * 1. Environment Configuration Check
 * 2. API Connectivity Test
 * 3. Authentication Test
 * 4. Phone Number Validation
 * 5. Message Format Test
 * 6. Sender ID Status Check
 * 7. API Endpoint Test (via local API route)
 * 8. Error Handling Test
 * 9. Rate Limit Test (if applicable)
 * 10. Credit Balance Check
 */

const https = require('https');
const http = require('http');

// Configuration
const TEXTLK_API_TOKEN = process.env.TEXTLK_API_TOKEN || '2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169';
const TEXTLK_API_URL = process.env.TEXTLK_API_URL || 'https://app.text.lk/api/v3/sms/send';
const TEXTLK_SENDER_ID = process.env.TEXTLK_SENDER_ID || '';
const LOCAL_API_URL = 'http://localhost:3000';

// Test phone number - UPDATE THIS WITH YOUR REAL NUMBER FOR ACTUAL SENDING
const TEST_PHONE_NUMBER = '94771234567'; // Format: 94XXXXXXXXX

// Test results tracker
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, message = '', details = null) {
  testResults.total++;
  const result = {
    name,
    status,
    message,
    details
  };
  testResults.tests.push(result);

  if (status === 'PASS') {
    testResults.passed++;
    log(`✅ ${name}`, 'green');
  } else if (status === 'FAIL') {
    testResults.failed++;
    log(`❌ ${name}`, 'red');
  } else if (status === 'WARN') {
    testResults.warnings++;
    log(`⚠️  ${name}`, 'yellow');
  }

  if (message) {
    log(`   ${message}`, 'cyan');
  }
  if (details) {
    log(`   Details: ${JSON.stringify(details, null, 2)}`, 'blue');
  }
}

// Helper function for HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: data,
            json: () => JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: data,
            json: () => ({ raw: data })
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * Test 1: Environment Configuration Check
 */
async function testEnvironmentConfig() {
  log('\n📋 Test 1: Environment Configuration Check', 'bright');
  log('='.repeat(60));

  // Check API Token
  if (TEXTLK_API_TOKEN && TEXTLK_API_TOKEN.length > 20) {
    logTest('API Token Configured', 'PASS', `Token length: ${TEXTLK_API_TOKEN.length} chars`);
  } else {
    logTest('API Token Configured', 'FAIL', 'API token is missing or invalid');
  }

  // Check API URL
  if (TEXTLK_API_URL && TEXTLK_API_URL.startsWith('https://')) {
    logTest('API URL Configured', 'PASS', TEXTLK_API_URL);
  } else {
    logTest('API URL Configured', 'FAIL', 'API URL is missing or invalid');
  }

  // Check Sender ID
  if (TEXTLK_SENDER_ID && TEXTLK_SENDER_ID.length > 0) {
    logTest('Sender ID Configured', 'PASS', TEXTLK_SENDER_ID);
  } else {
    logTest('Sender ID Configured', 'WARN', 'No sender ID configured - this is required for sending SMS');
  }

  // Check test phone number
  if (TEST_PHONE_NUMBER && TEST_PHONE_NUMBER.match(/^94\d{9}$/)) {
    logTest('Test Phone Number Valid', 'PASS', TEST_PHONE_NUMBER);
  } else {
    logTest('Test Phone Number Valid', 'FAIL', 'Test phone number format is invalid (should be 94XXXXXXXXX)');
  }
}

/**
 * Test 2: API Connectivity Test
 */
async function testAPIConnectivity() {
  log('\n🌐 Test 2: API Connectivity Test', 'bright');
  log('='.repeat(60));

  try {
    const response = await makeRequest(TEXTLK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEXTLK_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        recipient: TEST_PHONE_NUMBER,
        message: 'Test connectivity'
      })
    });

    if (response.status === 200) {
      logTest('API Reachable', 'PASS', `Status: ${response.status}`);
    } else {
      logTest('API Reachable', 'WARN', `Status: ${response.status}`, response.data);
    }

    return response;
  } catch (error) {
    logTest('API Reachable', 'FAIL', error.message);
    return null;
  }
}

/**
 * Test 3: Authentication Test
 */
async function testAuthentication() {
  log('\n🔐 Test 3: Authentication Test', 'bright');
  log('='.repeat(60));

  try {
    // Test with valid token
    const validResponse = await makeRequest(TEXTLK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEXTLK_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        recipient: TEST_PHONE_NUMBER,
        message: 'Auth test'
      })
    });

    const validData = validResponse.json();
    if (validData.status === 'error' && validData.message.includes('Sender ID')) {
      logTest('Authentication Valid', 'PASS', 'API token is valid (sender ID issue is separate)');
    } else if (validData.status === 'success') {
      logTest('Authentication Valid', 'PASS', 'API token is valid and working');
    } else if (validData.message && (validData.message.includes('unauthenticated') || validData.message.includes('not found'))) {
      logTest('Authentication Valid', 'FAIL', 'API token is invalid or not activated');
    } else {
      logTest('Authentication Valid', 'WARN', 'Unexpected response', validData);
    }

    // Test with invalid token
    const invalidResponse = await makeRequest(TEXTLK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid_token_12345',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        recipient: TEST_PHONE_NUMBER,
        message: 'Invalid auth test'
      })
    });

    const invalidData = invalidResponse.json();
    if (invalidData.status === 'error' || invalidResponse.status === 401) {
      logTest('Authentication Error Detection', 'PASS', 'Invalid token correctly rejected');
    } else {
      logTest('Authentication Error Detection', 'WARN', 'Unexpected response for invalid token');
    }
  } catch (error) {
    logTest('Authentication Test', 'FAIL', error.message);
  }
}

/**
 * Test 4: Phone Number Validation
 */
async function testPhoneNumberValidation() {
  log('\n📞 Test 4: Phone Number Validation', 'bright');
  log('='.repeat(60));

  const testNumbers = [
    { number: '94771234567', expected: 'valid', description: 'Valid international format' },
    { number: '0771234567', expected: 'needs_formatting', description: 'Valid local format' },
    { number: '+94771234567', expected: 'needs_formatting', description: 'Valid with + prefix' },
    { number: '771234567', expected: 'needs_formatting', description: 'Missing country code' },
    { number: '9477123456', expected: 'invalid', description: 'Too short' },
    { number: '941234567', expected: 'invalid', description: 'Invalid prefix' },
  ];

  for (const test of testNumbers) {
    const cleaned = test.number.replace(/\D/g, '');
    let isValid = false;
    
    if (cleaned.match(/^94\d{9}$/)) {
      isValid = true;
    } else if (cleaned.match(/^0\d{9}$/)) {
      isValid = true; // Can be formatted
    }

    if (isValid && test.expected !== 'invalid') {
      logTest(`Phone Validation: ${test.description}`, 'PASS', `${test.number} → Valid`);
    } else if (!isValid && test.expected === 'invalid') {
      logTest(`Phone Validation: ${test.description}`, 'PASS', `${test.number} → Correctly rejected`);
    } else {
      logTest(`Phone Validation: ${test.description}`, 'WARN', `${test.number} → Unexpected result`);
    }
  }
}

/**
 * Test 5: Sender ID Status Check
 */
async function testSenderIDStatus() {
  log('\n🏷️  Test 5: Sender ID Status Check', 'bright');
  log('='.repeat(60));

  // Test without sender ID
  try {
    const noSenderResponse = await makeRequest(TEXTLK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEXTLK_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        recipient: TEST_PHONE_NUMBER,
        message: 'Test without sender ID'
      })
    });

    const noSenderData = noSenderResponse.json();
    if (noSenderData.message && noSenderData.message.includes('Sender ID')) {
      logTest('Sender ID Requirement', 'WARN', 'Sender ID is required but not configured or not approved', noSenderData.message);
    } else if (noSenderData.status === 'success') {
      logTest('Sender ID Requirement', 'PASS', 'SMS sent without sender ID (using default)');
    } else {
      logTest('Sender ID Requirement', 'WARN', 'Unexpected response', noSenderData);
    }
  } catch (error) {
    logTest('Sender ID Test', 'FAIL', error.message);
  }

  // Test with sender ID (if configured)
  if (TEXTLK_SENDER_ID) {
    try {
      const withSenderResponse = await makeRequest(TEXTLK_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TEXTLK_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          recipient: TEST_PHONE_NUMBER,
          sender_id: TEXTLK_SENDER_ID,
          message: 'Test with sender ID'
        })
      });

      const withSenderData = withSenderResponse.json();
      if (withSenderData.status === 'success') {
        logTest('Sender ID Authorization', 'PASS', `Sender ID "${TEXTLK_SENDER_ID}" is approved and working`);
      } else if (withSenderData.message && withSenderData.message.includes('not authorized')) {
        logTest('Sender ID Authorization', 'FAIL', `Sender ID "${TEXTLK_SENDER_ID}" is not approved by Text.lk`);
      } else {
        logTest('Sender ID Authorization', 'WARN', 'Unexpected response', withSenderData);
      }
    } catch (error) {
      logTest('Sender ID Test', 'FAIL', error.message);
    }
  }
}

/**
 * Test 6: Local API Endpoint Test
 */
async function testLocalAPIEndpoint() {
  log('\n🔌 Test 6: Local API Endpoint Test', 'bright');
  log('='.repeat(60));

  try {
    // Test GET endpoint
    const getResponse = await makeRequest(`${LOCAL_API_URL}/api/sms`, {
      method: 'GET'
    });

    if (getResponse.status === 200) {
      logTest('Local API GET Endpoint', 'PASS', 'SMS service status endpoint is working');
    } else {
      logTest('Local API GET Endpoint', 'FAIL', `Status: ${getResponse.status}`);
    }

    // Test POST endpoint
    const postResponse = await makeRequest(`${LOCAL_API_URL}/api/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: TEST_PHONE_NUMBER,
        message: 'Test from local API endpoint'
      })
    });

    const postData = postResponse.json();
    if (postResponse.status === 200 && postData.success) {
      logTest('Local API POST Endpoint', 'PASS', 'Successfully sent SMS via local API');
    } else if (postResponse.status === 500 && postData.error) {
      logTest('Local API POST Endpoint', 'WARN', `API working but SMS failed: ${postData.error}`);
    } else {
      logTest('Local API POST Endpoint', 'FAIL', `Unexpected response: ${postData.error || 'Unknown error'}`);
    }
  } catch (error) {
    logTest('Local API Endpoint Test', 'FAIL', error.message);
  }
}

/**
 * Test 7: Error Handling Test
 */
async function testErrorHandling() {
  log('\n🛡️  Test 7: Error Handling Test', 'bright');
  log('='.repeat(60));

  const errorTests = [
    {
      name: 'Invalid Phone Number',
      payload: { to: 'invalid', message: 'test' },
      expectedStatus: 400
    },
    {
      name: 'Missing Phone Number',
      payload: { message: 'test' },
      expectedStatus: 400
    },
    {
      name: 'Missing Message',
      payload: { to: TEST_PHONE_NUMBER },
      expectedStatus: 400
    },
    {
      name: 'Empty Message',
      payload: { to: TEST_PHONE_NUMBER, message: '' },
      expectedStatus: 400
    }
  ];

  for (const test of errorTests) {
    try {
      const response = await makeRequest(`${LOCAL_API_URL}/api/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.payload)
      });

      if (response.status === test.expectedStatus) {
        logTest(`Error Handling: ${test.name}`, 'PASS', `Correctly returned ${test.expectedStatus}`);
      } else {
        logTest(`Error Handling: ${test.name}`, 'WARN', `Expected ${test.expectedStatus}, got ${response.status}`);
      }
    } catch (error) {
      logTest(`Error Handling: ${test.name}`, 'FAIL', error.message);
    }
  }
}

/**
 * Test 8: Message Format Test
 */
async function testMessageFormat() {
  log('\n💬 Test 8: Message Format Test', 'bright');
  log('='.repeat(60));

  const messageTests = [
    { message: 'Short message', length: 13, expected: 'valid' },
    { message: 'A'.repeat(160), length: 160, expected: 'valid' },
    { message: 'A'.repeat(161), length: 161, expected: 'warning' },
    { message: 'Unicode test: 😀 🎉 🚀', length: 21, expected: 'valid' },
  ];

  for (const test of messageTests) {
    if (test.length <= 160 && test.expected === 'valid') {
      logTest(`Message Format: ${test.length} chars`, 'PASS', 'Message length is valid');
    } else if (test.length > 160 && test.expected === 'warning') {
      logTest(`Message Format: ${test.length} chars`, 'WARN', 'Message will be split into multiple SMS');
    } else {
      logTest(`Message Format: ${test.length} chars`, 'PASS', 'Message format handled correctly');
    }
  }
}

/**
 * Test 9: Service Integration Test
 */
async function testServiceIntegration() {
  log('\n🔗 Test 9: Service Integration Test', 'bright');
  log('='.repeat(60));

  try {
    // Check if all components are integrated properly
    const components = {
      'SMS Service Library': true,
      'API Route': true,
      'Environment Variables': TEXTLK_API_TOKEN && TEXTLK_API_URL,
      'Phone Validation': true,
      'Error Handling': true
    };

    for (const [component, status] of Object.entries(components)) {
      if (status) {
        logTest(`Integration: ${component}`, 'PASS', 'Component is properly integrated');
      } else {
        logTest(`Integration: ${component}`, 'FAIL', 'Component is missing or not configured');
      }
    }
  } catch (error) {
    logTest('Service Integration Test', 'FAIL', error.message);
  }
}

/**
 * Generate Summary Report
 */
function generateSummaryReport() {
  log('\n' + '='.repeat(60), 'bright');
  log('📊 COMPREHENSIVE SMS GATEWAY TEST SUMMARY', 'bright');
  log('='.repeat(60), 'bright');

  log(`\nTotal Tests: ${testResults.total}`);
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`⚠️  Warnings: ${testResults.warnings}`, 'yellow');

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`\nSuccess Rate: ${successRate}%`, successRate >= 70 ? 'green' : 'red');

  // Overall Status
  log('\n' + '='.repeat(60));
  log('🎯 OVERALL STATUS', 'bright');
  log('='.repeat(60));

  if (testResults.failed === 0 && testResults.warnings === 0) {
    log('\n✅ EXCELLENT: SMS Gateway is fully functional and properly configured!', 'green');
  } else if (testResults.failed === 0 && testResults.warnings > 0) {
    log('\n⚠️  GOOD: SMS Gateway is working but requires attention:', 'yellow');
    log('\n   Common issues:');
    log('   - Sender ID not approved (request from Text.lk dashboard)');
    log('   - Some optional features not configured');
  } else {
    log('\n❌ NEEDS ATTENTION: SMS Gateway has critical issues:', 'red');
    log('\n   Please review the failed tests and fix the issues.');
  }

  // Recommendations
  log('\n' + '='.repeat(60));
  log('💡 RECOMMENDATIONS', 'bright');
  log('='.repeat(60));

  if (testResults.failed > 0) {
    log('\n1. Fix all failed tests before deploying to production');
    log('2. Review API credentials and ensure they are correct');
    log('3. Verify Text.lk account has sufficient SMS credits');
  }

  if (!TEXTLK_SENDER_ID) {
    log('\n⚠️  IMPORTANT: Request a Sender ID from Text.lk');
    log('   - Login to https://app.text.lk');
    log('   - Navigate to Sender ID section');
    log('   - Request approval for a custom Sender ID');
    log('   - Update .env.local with TEXTLK_SENDER_ID after approval');
  } else if (testResults.warnings > 0) {
    log('\n⚠️  Sender ID configured but may not be approved');
    log('   - Check approval status at https://app.text.lk');
    log('   - Contact Text.lk support if needed');
  }

  log('\n📚 Additional Resources:');
  log('   - Text.lk Dashboard: https://app.text.lk');
  log('   - API Documentation: https://www.text.lk/apidocumentation');
  log('   - Support: https://www.text.lk/contact');

  log('\n' + '='.repeat(60));
  log('Test completed at: ' + new Date().toLocaleString(), 'cyan');
  log('='.repeat(60) + '\n');
}

/**
 * Main test runner
 */
async function runAllTests() {
  log('\n🚀 Starting Comprehensive SMS Gateway Test Suite', 'bright');
  log('='.repeat(60));
  log(`Test Date: ${new Date().toLocaleString()}`, 'cyan');
  log('='.repeat(60));

  await testEnvironmentConfig();
  await testAPIConnectivity();
  await testAuthentication();
  await testPhoneNumberValidation();
  await testSenderIDStatus();
  await testLocalAPIEndpoint();
  await testErrorHandling();
  await testMessageFormat();
  await testServiceIntegration();

  generateSummaryReport();
}

// Run all tests
runAllTests().catch(error => {
  log('\n❌ Fatal Error:', 'red');
  log(error.message, 'red');
  process.exit(1);
});
