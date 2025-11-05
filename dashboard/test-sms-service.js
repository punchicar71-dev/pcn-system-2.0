/**
 * Test script for Text.lk SMS service integration
 * 
 * Usage:
 * 1. Update the TEST_PHONE_NUMBER with your actual phone number
 * 2. Run: node dashboard/test-sms-service.js
 * 3. Check your phone for the SMS
 */

// Text.lk API Configuration
// Based on Text.lk API documentation, use Bearer token format
const TEXTLK_API_TOKEN = '2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169'

// **IMPORTANT**: Replace with your actual phone number
const TEST_PHONE_NUMBER = '94771234567' // Format: 94XXXXXXXXX

// Test message
const TEST_MESSAGE = 'Test SMS from PCN System. If you receive this, SMS integration is working!'

/**
 * Test different API endpoints
 */
const API_ENDPOINTS = [
  {
    name: 'Text.lk SMS API v3 (Correct Format)',
    url: 'https://app.text.lk/api/v3/sms/send',
    method: 'POST',
    format: 'bearer_json'
  }
]

/**
 * Send test SMS with different endpoint formats
 */
async function testEndpoint(endpoint) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Testing: ${endpoint.name}`)
  console.log(`${'='.repeat(60)}`)
  console.log('URL:', endpoint.url)
  console.log('Method:', endpoint.method)
  console.log('Phone:', TEST_PHONE_NUMBER)
  console.log('\n📤 Sending...\n')

  try {
    let response

    if (endpoint.format === 'bearer_json') {
      // Bearer token with JSON format (correct Text.lk format)
      response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TEXTLK_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          recipient: TEST_PHONE_NUMBER,
          message: TEST_MESSAGE
          // Note: sender_id removed - will use default or add your approved sender ID
        })
      })
    }

    const responseText = await response.text()
    
    console.log('📥 Status:', response.status, response.statusText)
    console.log('📥 Response:', responseText)

    // Parse JSON response
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    // Check if successful based on Text.lk response format
    if (response.ok && responseData.status === 'success') {
      console.log('\n✅ SUCCESS! This endpoint works!')
      console.log('📱 Check your phone for the message.')
      console.log('Response data:', JSON.stringify(responseData, null, 2))
      return true
    } else {
      console.log('\n❌ This endpoint did not work.')
      console.log('Error:', responseData.message || 'Unknown error')
      return false
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message)
    return false
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n🚀 Text.lk SMS Service Integration Test')
  console.log('=' .repeat(60))
  console.log('Configuration:')
  console.log('- API Token:', TEXTLK_API_TOKEN.substring(0, 20) + '...')
  console.log('- Phone:', TEST_PHONE_NUMBER)
  console.log('\n⚠️  IMPORTANT: Update TEST_PHONE_NUMBER with your actual phone number!')
  console.log('=' .repeat(60))

  let successCount = 0

  for (const endpoint of API_ENDPOINTS) {
    const success = await testEndpoint(endpoint)
    if (success) {
      successCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Summary')
  console.log('='.repeat(60))
  console.log(`Tested ${API_ENDPOINTS.length} endpoint(s)`)
  console.log(`Success: ${successCount}`)
  console.log(`Failed: ${API_ENDPOINTS.length - successCount}`)
  
  if (successCount > 0) {
    console.log('\n✅ SMS integration is working!')
    console.log('📱 Check your phone for test message.')
  } else {
    console.log('\n❌ SMS test failed. Possible reasons:')
    console.log('   1. Need to verify sender_id with Text.lk')
    console.log('   2. Insufficient SMS credits')
    console.log('   3. Phone number not in correct format (94XXXXXXXXX)')
    console.log('   4. API might require contact group setup first')
    console.log('\n💡 Next steps:')
    console.log('   - Login to https://app.text.lk')
    console.log('   - Check your SMS credits')
    console.log('   - Verify sender ID approval status')
    console.log('   - Check if you need to create a contact group')
  }
  console.log('='.repeat(60) + '\n')
}

// Run the tests
runTests()
