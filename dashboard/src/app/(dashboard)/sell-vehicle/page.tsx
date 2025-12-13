'use client';

import { DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import SellVehicleStepIndicator from '@/components/sell-vehicle/SellVehicleStepIndicator';
import CustomerDetails from '@/components/sell-vehicle/CustomerDetails';
import SellingInfo from '@/components/sell-vehicle/SellingInfo';
import Confirmation from '@/components/sell-vehicle/Confirmation';
import { createClient } from '@/lib/supabase-client';
import { sendSellVehicleConfirmationSMS } from '@/lib/vehicle-sms-service';
import { useVehicleLock } from '@/hooks/use-vehicle-lock';
import { VehicleLockWarning } from '@/components/ui/vehicle-lock-warning';

export default function SellVehiclePage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [createdSaleId, setCreatedSaleId] = useState<string>('');  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [customerData, setCustomerData] = useState({
    title: 'Mr.',
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
    leasingCompany: '',
    inHouseSalesAgent: '',
    thirdPartySalesAgent: '',
  });

  // 🔒 Vehicle locking to prevent concurrent edits
  const { isLocked, lockedBy, hasMyLock, acquireLock, releaseLock } = useVehicleLock(
    sellingData.selectedVehicle?.id || null,
    'selling',
    currentStep === 2 // Only enable locking on step 2 (selling info)
  );

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

  // 🔒 Acquire lock when vehicle is selected and we're on step 2
  useEffect(() => {
    if (sellingData.selectedVehicle?.id && currentStep === 2) {
      acquireLock();
    }
  }, [sellingData.selectedVehicle?.id, currentStep, acquireLock]);

  const handleBackFromSellingInfo = () => {
    setCurrentStep(1);
  };

  const handleSubmitSale = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      // Fetch the showroom agent name if an ID is provided
      let showroomAgentName = null;
      if (sellingData.thirdPartySalesAgent) {
        const { data: agentData } = await supabase
          .from('sales_agents')
          .select('name')
          .eq('id', sellingData.thirdPartySalesAgent)
          .single();
        
        if (agentData) {
          showroomAgentName = agentData.name;
        }
      }
      
      // Build sale data - snapshot fields are optional (require migration to be applied)
      const saleData: Record<string, any> = {
        vehicle_id: sellingData.selectedVehicle?.id,
        customer_title: customerData.title || 'Mr.',
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
        leasing_company_id: sellingData.leasingCompany || null,
        sales_agent_id: sellingData.inHouseSalesAgent || null,
        third_party_agent: showroomAgentName || null,
        status: 'pending',
      };
      
      // Try to add vehicle snapshot fields if columns exist (after migration)
      // These fields preserve vehicle info even if vehicle is re-added later
      try {
        const testQuery = await supabase
          .from('pending_vehicle_sales')
          .select('vehicle_number')
          .limit(0);
        
        // If no error, columns exist - add snapshot data
        if (!testQuery.error) {
          saleData.vehicle_number = sellingData.selectedVehicle?.vehicle_number || null;
          saleData.brand_name = sellingData.selectedVehicle?.brand_name || null;
          saleData.model_name = sellingData.selectedVehicle?.model_name || null;
          saleData.manufacture_year = sellingData.selectedVehicle?.manufacture_year || null;
        }
      } catch (e) {
        // Columns don't exist yet, skip snapshot fields
        console.log('Vehicle snapshot columns not available - run migration to enable');
      }

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

      // Store the created sale ID for the confirmation page
      if (data && data.id) {
        setCreatedSaleId(data.id);
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

      // Create notification for moving vehicle to sales
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .eq('auth_id', session.user.id)
            .single()

          if (userData) {
            const userName = `${userData.first_name} ${userData.last_name}`
            const vehicleInfo = `${sellingData.selectedVehicle.brand_name} ${sellingData.selectedVehicle.model_name} (${sellingData.selectedVehicle.vehicle_number})`

            await supabase.from('notifications').insert({
              user_id: userData.id,
              type: 'moved_to_sales',
              title: 'Moved to Sales',
              message: `${userName} moved ${vehicleInfo} to the Selling Process — now listed in Sales Transactions (Pending).`,
              vehicle_number: sellingData.selectedVehicle.vehicle_number,
              vehicle_brand: sellingData.selectedVehicle.brand_name,
              vehicle_model: sellingData.selectedVehicle.model_name,
              is_read: false
            })
            console.log('✅ Notification created for moving vehicle to sales')
          }
        }
      } catch (notifError) {
        console.error('⚠️  Failed to create notification:', notifError)
        // Don't block sale if notification fails
      }

      // 📱 Send SMS confirmation to original vehicle seller
      try {
        console.log('📱 Fetching original vehicle seller information...');
        
        // Get the original seller who gave the vehicle to showroom
        const { data: sellerData, error: sellerError } = await supabase
          .from('sellers')
          .select('title, first_name, last_name, mobile_number')
          .eq('vehicle_id', sellingData.selectedVehicle.id)
          .single();

        if (sellerError || !sellerData) {
          console.warn('⚠️ Could not fetch seller information:', sellerError);
        } else if (!sellerData.mobile_number) {
          console.warn('⚠️ Seller has no mobile number on record');
        } else {
          console.log('📱 Sending SMS confirmation to original vehicle seller...');
          
          const smsResult = await sendSellVehicleConfirmationSMS({
            seller: {
              title: sellerData.title || 'Mr.',
              firstName: sellerData.first_name,
              lastName: sellerData.last_name,
              mobileNumber: sellerData.mobile_number,
            },
            vehicle: {
              vehicleNumber: sellingData.selectedVehicle.vehicle_number,
              brand: sellingData.selectedVehicle.brand_name,
              model: sellingData.selectedVehicle.model_name,
              year: sellingData.selectedVehicle.manufacture_year,
            },
            sellingPrice: parseFloat(sellingData.sellingAmount),
          });

          if (smsResult.success) {
            console.log('✅ SMS sent successfully to vehicle seller:', smsResult.phoneNumber);
          } else {
            console.warn('⚠️ SMS failed to send to vehicle seller:', smsResult.error);
            // Don't block the sale confirmation - SMS failure is not critical
          }
        }
      } catch (smsError) {
        console.error('⚠️ SMS error occurred:', smsError);
        // Don't block the sale confirmation - continue with the flow
      }

      // 🔒 Release lock after successful sale
      if (sellingData.selectedVehicle?.id) {
        await releaseLock();
      }

      // Success - move to confirmation step
      setCompletedSteps([1, 2]);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if form should be disabled (locked by another user)
  const isFormDisabled = isLocked && !hasMyLock;

  return (
    <div className="min-h-screen bg-slte-50">
      

      <SellVehicleStepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      <div className="max-w-7xl  ">
        {/* 🔒 Show lock warning on step 2 if vehicle is locked */}
        {currentStep === 2 && isFormDisabled && (
          <VehicleLockWarning
            isLocked={isLocked}
            lockedBy={lockedBy}
            lockType="selling"
          />
        )}

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
            disabled={isFormDisabled}
            isSubmitting={isSubmitting}
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
            saleId={createdSaleId}
          />
        )}
      </div>
    </div>
  );
}
