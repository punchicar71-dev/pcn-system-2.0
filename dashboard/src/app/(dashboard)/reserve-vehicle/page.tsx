/**
 * MIGRATING: Supabase Auth has been removed.
 * This file will be updated to work with Better Auth in Step 2.
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */
'use client';

import { DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReserveVehicleStepIndicator from '@/components/reserve-vehicle/ReserveVehicleStepIndicator';
import CustomerDetails from '@/components/reserve-vehicle/CustomerDetails';
import SellingInfo from '@/components/reserve-vehicle/SellingInfo';
import Confirmation from '@/components/reserve-vehicle/Confirmation';
import { createClient } from '@/lib/supabase-client';
import { sendReserveVehicleConfirmationSMS } from '@/lib/vehicle-sms-service';
import { useVehicleLock } from '@/hooks/use-vehicle-lock';
import { VehicleLockWarning } from '@/components/ui/vehicle-lock-warning';

export default function ReserveVehiclePage() {
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
    salesCommissionId: '',
    leasingCompany: '',
    inHouseSalesAgent: '',
    thirdPartySalesAgent: '',
    tagNotes: '', // Internal notes - recalled from vehicle and can be updated
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
      // Combine first and last name into customer_name (required by database)
      const customerName = `${customerData.firstName} ${customerData.lastName}`.trim();
      
      // Ensure sale_price is always a valid number
      let salePrice = parseFloat(sellingData.sellingAmount);
      if (isNaN(salePrice) || !isFinite(salePrice)) salePrice = 0;

      const saleData: Record<string, any> = {
        vehicle_id: sellingData.selectedVehicle?.id,
        customer_title: customerData.title || 'Mr.',
        customer_name: customerName, // Database requires single customer_name field
        customer_address: customerData.address || null,
        customer_nic: customerData.nicNumber || null,
        customer_mobile: customerData.mobileNumber || null,
        sale_price: salePrice, // Always a valid number
        leasing_company_id: sellingData.leasingCompany || null,
        sales_agent_id: sellingData.inHouseSalesAgent || null,
        third_party_agent: showroomAgentName || '',
        status: 'advance_paid',
      };
      
      // Try to add sales_commission_id if column exists (after migration)
      try {
        const testCommissionColumn = await supabase
          .from('pending_vehicle_sales')
          .select('sales_commission_id')
          .limit(0);
        
        if (!testCommissionColumn.error && sellingData.salesCommissionId) {
          saleData.sales_commission_id = sellingData.salesCommissionId;
        }
      } catch (e) {
        console.log('sales_commission_id column not available - run migration to enable');
      }
      
      // Try to add basic vehicle snapshot fields if columns exist (after migration)
      // These fields preserve vehicle info even if vehicle is re-added later
      try {
        const testQuery = await supabase
          .from('pending_vehicle_sales')
          .select('vehicle_number')
          .limit(0);
        
        // If no error, basic snapshot columns exist - add snapshot data
        if (!testQuery.error) {
          saleData.vehicle_number = sellingData.selectedVehicle?.vehicle_number || null;
          saleData.brand_name = sellingData.selectedVehicle?.brand_name || null;
          saleData.model_name = sellingData.selectedVehicle?.model_name || null;
          saleData.manufacture_year = sellingData.selectedVehicle?.manufacture_year || null;
          saleData.body_type = sellingData.selectedVehicle?.body_type || null;
        }
      } catch (e) {
        // Basic snapshot columns don't exist yet
        console.log('Basic vehicle snapshot columns not available - run migration to enable');
      }
      
      // Try to add NEW snapshot fields (registered_year, mileage, country_name, transmission, image_url)
      // These require the 2026_01_20_add_vehicle_details_snapshot.sql migration
      try {
        const testNewColumns = await supabase
          .from('pending_vehicle_sales')
          .select('country_name')
          .limit(0);
        
        // If no error, new snapshot columns exist
        if (!testNewColumns.error) {
          saleData.registered_year = sellingData.selectedVehicle?.registered_year || null;
          saleData.mileage = sellingData.selectedVehicle?.mileage || null;
          saleData.country_name = sellingData.selectedVehicle?.country_name || null;
          saleData.transmission = sellingData.selectedVehicle?.transmission || null;
          // Save primary image URL
          if (sellingData.selectedVehicle?.images?.length > 0) {
            const primaryImg = sellingData.selectedVehicle.images.find((img: any) => img.is_primary);
            saleData.image_url = primaryImg?.image_url || sellingData.selectedVehicle.images[0]?.image_url || null;
          }
        }
      } catch (e) {
        // New snapshot columns don't exist yet
        console.log('New vehicle snapshot columns (country_name, etc.) not available - run 2026_01_20_add_vehicle_details_snapshot.sql migration');
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

      // Update vehicle status to 'Reserved' and save updated tag_notes
      const vehicleUpdate: Record<string, any> = { 
        status: 'Reserved',
        updated_at: new Date().toISOString()
      };
      
      // Update tag_notes if changed
      if (sellingData.tagNotes !== undefined) {
        vehicleUpdate.tag_notes = sellingData.tagNotes || null;
      }
      
      const { error: updateError } = await supabase
        .from('vehicles')
        .update(vehicleUpdate)
        .eq('id', sellingData.selectedVehicle?.id);

      if (updateError) {
        console.error('Error updating vehicle status:', updateError);
        // Continue anyway - sale was recorded
      }

      // Create notification for moving vehicle to sales
      try {
        // MIGRATION: Using localStorage instead of Supabase Auth
        const storedUser = localStorage.getItem('pcn-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)

          if (userData) {
            // Handle both camelCase and snake_case formats
            const firstName = userData.firstName || userData.first_name || ''
            const lastName = userData.lastName || userData.last_name || ''
            const userName = `${firstName} ${lastName}`.trim() || 'Unknown User'
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
          
          const smsResult = await sendReserveVehicleConfirmationSMS({
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
    <div className="min-h-screen bg-slate-50">
      

      <ReserveVehicleStepIndicator currentStep={currentStep} completedSteps={completedSteps} />

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
