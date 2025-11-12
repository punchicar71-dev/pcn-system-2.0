#!/usr/bin/env node

/**
 * Test SMS Service - Vehicle Accepting & Sell Vehicle
 * Tests both SMS flows end-to-end
 */

const testVehicleAcceptanceSMS = async () => {
  console.log('\n🧪 Testing Vehicle Acceptance SMS...\n');
  
  const testData = {
    type: 'vehicle-acceptance',
    seller: {
      title: 'Mr.',
      firstName: 'Test',
      lastName: 'Seller',
      mobileNumber: '0771234567' // Replace with your test number
    },
    vehicle: {
      vehicleNumber: 'CAA-1234',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/vehicles/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Vehicle Acceptance SMS: PASSED');
    } else {
      console.log('❌ Vehicle Acceptance SMS: FAILED');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
};

const testSellVehicleConfirmationSMS = async () => {
  console.log('\n🧪 Testing Sell Vehicle Confirmation SMS...\n');
  
  const testData = {
    type: 'sell-vehicle-confirmation',
    seller: {
      title: 'Mrs.',
      firstName: 'Jane',
      lastName: 'Doe',
      mobileNumber: '0771234567' // Replace with your test number
    },
    vehicle: {
      vehicleNumber: 'CAB-5678',
      brand: 'Honda',
      model: 'Civic',
      year: 2019
    },
    sellingPrice: 4500000
  };

  try {
    const response = await fetch('http://localhost:3000/api/vehicles/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Sell Vehicle Confirmation SMS: PASSED');
    } else {
      console.log('❌ Sell Vehicle Confirmation SMS: FAILED');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
};

// Run tests
(async () => {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   SMS Service Test - Both Flows              ║');
  console.log('╚══════════════════════════════════════════════╝');
  
  await testVehicleAcceptanceSMS();
  await testSellVehicleConfirmationSMS();
  
  console.log('\n✅ Tests completed\n');
})();
