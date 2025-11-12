// Quick SMS Debug Test
// Run this in browser console on the sell-vehicle page

async function testSMS() {
  console.log('🧪 Testing Sell Vehicle SMS...');
  
  const testData = {
    type: 'sell-vehicle-confirmation',
    seller: {
      title: 'Mr.',
      firstName: 'John',
      lastName: 'Doe',
      mobileNumber: '0771234567'  // ⚠️ CHANGE THIS TO YOUR TEST NUMBER
    },
    vehicle: {
      vehicleNumber: 'TEST-001',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020
    },
    sellingPrice: 3500000
  };
  
  console.log('📤 Sending request:', testData);
  
  try {
    const response = await fetch('/api/vehicles/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    
    const result = await response.json();
    console.log('📊 Response body:', result);
    
    if (result.success) {
      console.log('✅ SMS TEST PASSED');
      console.log(`📱 SMS sent to: ${result.phoneNumber}`);
    } else {
      console.error('❌ SMS TEST FAILED');
      console.error('Error:', result.error);
      console.error('Message:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Request failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testSMS();
