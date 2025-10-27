'use client';

import { DollarSign } from 'lucide-react';
import { useState } from 'react';
import SellVehicleStepIndicator from '@/components/sell-vehicle/SellVehicleStepIndicator';
import CustomerDetails from '@/components/sell-vehicle/CustomerDetails';
import SellingInfo from '@/components/sell-vehicle/SellingInfo';
import Confirmation from '@/components/sell-vehicle/Confirmation';
import { createClient } from '@/lib/supabase-client';

export default function SellVehiclePage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    nicNumber: '',
    mobileNumber: '',
    landPhoneNumber: '',
    emailAddress: '',
  });

  const [sellingData, setSellingData] = useState({
    searchVehicle: '',
    selectedVehicle: null as any,
    sellingAmount: '',
    advanceAmount: '',
    paymentType: '',
    inHouseSalesAgent: '',
    thirdPartySalesAgent: '',
  });

  const handleCustomerDataChange = (field: string, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSellingDataChange = (field: string, value: any) => {
    setSellingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextFromCustomerDetails = () => {
    setCompletedSteps([1]);
    setCurrentStep(2);
  };

  const handleBackFromSellingInfo = () => {
    setCurrentStep(1);
  };

  const handleSubmitSale = async () => {
    try {
      const supabase = createClient();
      
      const saleData = {
        vehicle_id: sellingData.selectedVehicle?.id,
        customer_first_name: customerData.firstName,
        customer_last_name: customerData.lastName,
        customer_address: customerData.address || null,
        customer_city: customerData.city || null,
        customer_nic: customerData.nicNumber || null,
        customer_mobile: customerData.mobileNumber,
        customer_landphone: customerData.landPhoneNumber || null,
        customer_email: customerData.emailAddress || null,
        selling_amount: parseFloat(sellingData.sellingAmount),
        advance_amount: sellingData.advanceAmount ? parseFloat(sellingData.advanceAmount) : 0,
        payment_type: sellingData.paymentType,
        sales_agent_id: sellingData.inHouseSalesAgent || null,
        third_party_agent: sellingData.thirdPartySalesAgent || null,
        status: 'pending',
      };

      // Insert into pending_vehicle_sales table
      const { data, error } = await supabase
        .from('pending_vehicle_sales')
        .insert([saleData])
        .select()
        .single();

      if (error) {
        console.error('Error creating sale:', error);
        alert('Failed to create sale: ' + error.message);
        return;
      }

      // Update vehicle status to 'Pending Sale' so it disappears from inventory
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ status: 'Pending Sale' })
        .eq('id', sellingData.selectedVehicle?.id);

      if (updateError) {
        console.error('Error updating vehicle status:', updateError);
        // Continue anyway - sale was recorded
      }

      // Success - move to confirmation step
      setCompletedSteps([1, 2]);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      

      <SellVehicleStepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      <div className="max-w-7xl mx-auto ">
        {currentStep === 1 && (
          <CustomerDetails
            formData={customerData}
            onChange={handleCustomerDataChange}
            onNext={handleNextFromCustomerDetails}
          />
        )}

        {currentStep === 2 && (
          <SellingInfo
            formData={sellingData}
            onChange={handleSellingDataChange}
            onBack={handleBackFromSellingInfo}
            onSubmit={handleSubmitSale}
          />
        )}

        {currentStep === 3 && sellingData.selectedVehicle && (
          <Confirmation
            vehicleData={{
              brand: sellingData.selectedVehicle.brand_name,
              model: sellingData.selectedVehicle.model_name,
              year: sellingData.selectedVehicle.manufacture_year,
              vehicleNumber: sellingData.selectedVehicle.vehicle_number,
            }}
          />
        )}
      </div>
    </div>
  );
}
