'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import StepIndicator from '@/components/vehicle/StepIndicator';
import Step1VehicleDetails from '@/components/vehicle/Step1VehicleDetails';
import Step2SellerDetails from '@/components/vehicle/Step2SellerDetails';
import Step3VehicleOptions from '@/components/vehicle/Step3VehicleOptions';
import Step4SellingDetails from '@/components/vehicle/Step4SellingDetails';
import Step5SpecialNotes from '@/components/vehicle/Step5SpecialNotes';
import Step6Summary from '@/components/vehicle/Step6Summary';
import Step7Success from '@/components/vehicle/Step7Success';
import {
  FormStep,
  VehicleFormState,
  initialFormState,
  VehicleDetailsData,
  SellerDetailsData,
  VehicleOptionsData,
  SellingDetailsData,
  SpecialNotesData,
} from '@/types/vehicle-form.types';
import { VehicleBrand, VehicleModel, Country } from '@/lib/database.types';

export default function AddVehiclePage() {
  const [formState, setFormState] = useState<VehicleFormState>(initialFormState);
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [publishedVehicleId, setPublishedVehicleId] = useState<string>('');

  const supabase = createClient();

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      // Fetch brands
      const { data: brandsData } = await supabase
        .from('vehicle_brands')
        .select('*')
        .order('name');
      if (brandsData) setBrands(brandsData);

      // Fetch countries
      const { data: countriesData } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (countriesData) setCountries(countriesData);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  useEffect(() => {
    if (formState.vehicleDetails.brandId) {
      fetchModels(formState.vehicleDetails.brandId);
    }
  }, [formState.vehicleDetails.brandId]);

  const fetchModels = async (brandId: string) => {
    try {
      const { data } = await supabase
        .from('vehicle_models')
        .select('*')
        .eq('brand_id', brandId)
        .order('name');
      if (data) setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const updateVehicleDetails = (data: Partial<VehicleDetailsData>) => {
    setFormState((prev) => ({
      ...prev,
      vehicleDetails: { ...prev.vehicleDetails, ...data },
    }));
  };

  const updateSellerDetails = (data: Partial<SellerDetailsData>) => {
    setFormState((prev) => ({
      ...prev,
      sellerDetails: { ...prev.sellerDetails, ...data },
    }));
  };

  const updateVehicleOptions = (data: Partial<VehicleOptionsData>) => {
    setFormState((prev) => ({
      ...prev,
      vehicleOptions: { ...prev.vehicleOptions, ...data },
    }));
  };

  const updateSellingDetails = (data: Partial<SellingDetailsData>) => {
    setFormState((prev) => ({
      ...prev,
      sellingDetails: { ...prev.sellingDetails, ...data },
    }));
  };

  const updateSpecialNotes = (data: Partial<SpecialNotesData>) => {
    setFormState((prev) => ({
      ...prev,
      specialNotes: { ...prev.specialNotes, ...data },
    }));
  };

  const goToStep = (step: FormStep) => {
    setFormState((prev) => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    const currentStep = formState.currentStep;
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < 7) {
      goToStep((currentStep + 1) as FormStep);
    }
  };

  const prevStep = () => {
    const currentStep = formState.currentStep;
    if (currentStep > 1) {
      goToStep((currentStep - 1) as FormStep);
    }
  };

  const uploadImages = async (vehicleId: string) => {
    const { vehicleImages, image360Files, crImages } = formState.vehicleDetails;
    const uploadPromises: Promise<any>[] = [];

    try {
      // Upload vehicle gallery images to S3
      for (let i = 0; i < vehicleImages.length; i++) {
        const file = vehicleImages[i];
        
        const uploadPromise = (async () => {
          try {
            // Step 1: Get presigned URL from API with timeout
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
              throw new Error('No authentication token available');
            }

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const presignedResponse = await fetch('/api/upload/presigned-url', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                vehicleId,
                imageType: 'gallery',
                fileName: file.name,
                mimeType: file.type,
              }),
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));

            if (!presignedResponse.ok) {
              const error = await presignedResponse.json();
              throw new Error(error.error || 'Failed to get presigned URL');
            }

            const { presignedUrl, publicUrl, key } = await presignedResponse.json();

            // Step 2: Upload directly to S3 using presigned URL
            const uploadResponse = await fetch(presignedUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': file.type,
              },
              body: file,
            });

            if (!uploadResponse.ok) {
              throw new Error('Failed to upload image to S3');
            }

            // Step 3: Store image metadata in Supabase
            const { error: dbError } = await supabase.from('vehicle_images').insert({
              vehicle_id: vehicleId,
              image_url: publicUrl,
              image_type: 'gallery',
              s3_key: key,
              storage_path: key, // S3 key serves as storage path
              file_name: file.name,
              file_size: file.size,
              is_primary: i === 0,
              display_order: i,
            });

            if (dbError) {
              console.error('Error saving image metadata:', dbError);
              throw new Error(`Failed to save image metadata: ${dbError.message}`);
            }
          } catch (error) {
            console.error('Error uploading gallery image:', error);
            throw error;
          }
        })();

        uploadPromises.push(uploadPromise);
      }

      // Upload 360 images to S3
      for (let i = 0; i < image360Files.length; i++) {
        const file = image360Files[i];
        
        const uploadPromise = (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
              throw new Error('No authentication token available');
            }

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const presignedResponse = await fetch('/api/upload/presigned-url', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                vehicleId,
                imageType: 'image_360',
                fileName: file.name,
                mimeType: file.type,
              }),
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));

            if (!presignedResponse.ok) {
              const error = await presignedResponse.json();
              throw new Error(error.error || 'Failed to get presigned URL');
            }

            const { presignedUrl, publicUrl, key } = await presignedResponse.json();

            const uploadResponse = await fetch(presignedUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': file.type,
              },
              body: file,
            });

            if (!uploadResponse.ok) {
              throw new Error('Failed to upload 360 image to S3');
            }

            const { error: dbError } = await supabase.from('vehicle_images').insert({
              vehicle_id: vehicleId,
              image_url: publicUrl,
              image_type: 'image_360',
              s3_key: key,
              storage_path: key, // S3 key serves as storage path
              file_name: file.name,
              file_size: file.size,
              is_primary: false,
              display_order: i,
            });

            if (dbError) {
              console.error('Error saving 360 image metadata:', dbError);
              throw new Error(`Failed to save 360 image metadata: ${dbError.message}`);
            }
          } catch (error) {
            console.error('Error uploading 360 image:', error);
            throw error;
          }
        })();

        uploadPromises.push(uploadPromise);
      }

      // Upload CR images to S3
      for (let i = 0; i < crImages.length; i++) {
        const file = crImages[i];
        
        const uploadPromise = (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
              throw new Error('No authentication token available');
            }

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const presignedResponse = await fetch('/api/upload/presigned-url', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                vehicleId,
                imageType: 'cr_paper',
                fileName: file.name,
                mimeType: file.type,
              }),
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));

            if (!presignedResponse.ok) {
              const error = await presignedResponse.json();
              throw new Error(error.error || 'Failed to get presigned URL');
            }

            const { presignedUrl, publicUrl, key } = await presignedResponse.json();

            const uploadResponse = await fetch(presignedUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': file.type,
              },
              body: file,
            });

            if (!uploadResponse.ok) {
              throw new Error('Failed to upload CR image to S3');
            }

            const { error: dbError } = await supabase.from('vehicle_images').insert({
              vehicle_id: vehicleId,
              image_url: publicUrl,
              image_type: 'cr_paper',
              s3_key: key,
              storage_path: key, // S3 key serves as storage path
              file_name: file.name,
              file_size: file.size,
              is_primary: false,
              display_order: i,
            });

            if (dbError) {
              console.error('Error saving CR image metadata:', dbError);
              throw new Error(`Failed to save CR image metadata: ${dbError.message}`);
            }
          } catch (error) {
            console.error('Error uploading CR image:', error);
            throw error;
          }
        })();

        uploadPromises.push(uploadPromise);
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      console.log('✅ All images uploaded successfully');
    } catch (error) {
      console.error('❌ Error during image uploads:', error);
      throw error;
    }
  };

  const handlePublish = async () => {
    try {
      const { vehicleDetails, sellerDetails, vehicleOptions, sellingDetails, specialNotes } = formState;

      // Comprehensive Validation: Check if required fields are filled
      const validationErrors: string[] = [];
      
      if (!vehicleDetails.vehicleNumber.trim()) validationErrors.push('Vehicle Number');
      if (!vehicleDetails.brandId) validationErrors.push('Vehicle Brand');
      if (!vehicleDetails.modelId) validationErrors.push('Vehicle Model');
      if (!vehicleDetails.manufactureYear) validationErrors.push('Manufacture Year');
      if (!vehicleDetails.countryId) validationErrors.push('Country');
      if (!vehicleDetails.bodyType) validationErrors.push('Body Type');
      if (!vehicleDetails.fuelType) validationErrors.push('Fuel Type');
      if (!vehicleDetails.transmission) validationErrors.push('Transmission');
      
      if (!sellerDetails.firstName.trim()) validationErrors.push('Seller First Name');
      if (!sellerDetails.lastName.trim()) validationErrors.push('Seller Last Name');
      if (!sellerDetails.mobileNumber.trim()) validationErrors.push('Seller Mobile Number');
      
      if (!sellingDetails.sellingAmount.trim()) validationErrors.push('Selling Amount');
      if (!sellingDetails.entryType) validationErrors.push('Entry Type');
      
      if (validationErrors.length > 0) {
        alert(`❌ Please complete the following required fields:\n\n${validationErrors.join('\n')}\n\nGo back to the relevant steps to fill in the missing information.`);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to add a vehicle');
        return;
      }

      console.log('Starting vehicle insertion...');
      console.log('User:', user.id);
      console.log('Vehicle Details:', {
        vehicleNumber: vehicleDetails.vehicleNumber,
        brandId: vehicleDetails.brandId,
        modelId: vehicleDetails.modelId,
        bodyType: vehicleDetails.bodyType,
        fuelType: vehicleDetails.fuelType,
        transmission: vehicleDetails.transmission,
      });

      // Insert vehicle (TEXT DATA - goes to Supabase)
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          vehicle_number: vehicleDetails.vehicleNumber.trim(),
          brand_id: vehicleDetails.brandId,
          model_id: vehicleDetails.modelId,
          model_number_other: vehicleDetails.modelNumberOther?.trim() || null,
          manufacture_year: vehicleDetails.manufactureYear,
          country_id: vehicleDetails.countryId,
          body_type: vehicleDetails.bodyType, // Required - validated above
          fuel_type: vehicleDetails.fuelType, // Required - validated above
          transmission: vehicleDetails.transmission, // Required - validated above
          engine_capacity: vehicleDetails.engineCapacity?.trim() || null,
          exterior_color: vehicleDetails.exteriorColor?.trim() || null,
          registered_year: vehicleDetails.registeredYear || null,
          selling_amount: parseFloat(sellingDetails.sellingAmount.replace(/,/g, '')) || 0,
          mileage: sellingDetails.mileage ? parseFloat(sellingDetails.mileage.replace(/,/g, '')) : null,
          entry_type: sellingDetails.entryType, // Required - validated above
          entry_date: sellingDetails.entryDate || new Date().toISOString().split('T')[0],
          status: sellingDetails.status || 'In Sale',
          tag_notes: specialNotes.tagNotes?.trim() || null,
          special_note_print: specialNotes.specialNotePrint?.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (vehicleError) {
        console.error('Vehicle insertion error:', vehicleError);
        
        // Provide helpful error messages
        if (vehicleError.code === '42P01') {
          alert('❌ Database Error: The "vehicles" table does not exist.\n\nPlease run the database migration:\n1. Open Supabase SQL Editor\n2. Run vehicle-inventory-migration.sql\n3. Try again');
          throw new Error('Database table "vehicles" not found');
        } else if (vehicleError.code === '23503') {
          alert('❌ Database Error: Invalid brand, model, or country.\n\nPlease ensure:\n1. Master data is properly set up\n2. Selected IDs exist in the database\n3. Try again');
          throw new Error('Foreign key constraint failed');
        } else if (vehicleError.code === '23505') {
          alert('❌ Vehicle number already exists. Please use a different number.');
          throw new Error('Duplicate vehicle number');
        } else if (vehicleError.code === '23502') {
          // NOT NULL constraint violation
          const match = vehicleError.message.match(/column "(\w+)"/);
          const columnName = match ? match[1] : 'unknown field';
          const fieldMap: { [key: string]: string } = {
            'body_type': 'Body Type',
            'fuel_type': 'Fuel Type',
            'transmission': 'Transmission',
            'entry_type': 'Entry Type',
            'vehicle_number': 'Vehicle Number',
            'brand_id': 'Brand',
            'model_id': 'Model',
            'manufacture_year': 'Manufacture Year',
            'country_id': 'Country',
            'selling_amount': 'Selling Amount'
          };
          const friendlyName = fieldMap[columnName] || columnName;
          alert(`❌ Required Field Missing: ${friendlyName}\n\nPlease go back and fill in the ${friendlyName} field in Step 1 or Step 4.\n\nTechnical Details: Column "${columnName}" cannot be null.`);
          throw new Error(`NOT NULL constraint violation: ${columnName}`);
        } else if (vehicleError.code === '23514') {
          // CHECK constraint violation
          alert('❌ Invalid Value: One of the selected values does not match the allowed options.\n\nPlease check:\n- Body Type (SUV, Sedan, Hatchback, Wagon, Coupe, Convertible, Van, Truck)\n- Fuel Type (Petrol, Diesel, Petrol + Hybrid, Diesel + Hybrid, EV)\n- Transmission (Auto, Manual)\n- Status (In Sale, Out of Sale, Reserved)');
          throw new Error('CHECK constraint violation');
        }
        
        throw vehicleError;
      }
      
      if (!vehicle) {
        throw new Error('Failed to create vehicle');
      }

      console.log('✅ Vehicle created successfully:', vehicle.id);

      // Create notification for vehicle addition
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
            const brandName = brands.find(b => b.id === vehicleDetails.brandId)?.name || ''
            const modelName = models.find(m => m.id === vehicleDetails.modelId)?.name || ''
            const vehicleInfo = `${brandName} ${modelName} (${vehicleDetails.vehicleNumber})`

            await supabase.from('notifications').insert({
              user_id: userData.id,
              type: 'added',
              title: 'Vehicle Added',
              message: `${userName} added ${vehicleInfo} to the Inventory.`,
              vehicle_number: vehicleDetails.vehicleNumber,
              vehicle_brand: brandName,
              vehicle_model: modelName,
              is_read: false
            })
            console.log('✅ Notification created for vehicle addition')
          }
        }
      } catch (notifError) {
        console.error('⚠️  Failed to create notification:', notifError)
        // Don't block vehicle creation if notification fails
      }

      // Insert seller (TEXT DATA - goes to Supabase)
      const { error: sellerError } = await supabase.from('sellers').insert({
        vehicle_id: vehicle.id,
        title: sellerDetails.title || 'Mr.',
        first_name: sellerDetails.firstName.trim(),
        last_name: sellerDetails.lastName.trim(),
        address: sellerDetails.address?.trim() || null,
        city: sellerDetails.city?.trim() || null,
        nic_number: sellerDetails.nicNumber?.trim() || null,
        mobile_number: sellerDetails.mobileNumber.trim(),
        land_phone_number: sellerDetails.landPhoneNumber?.trim() || null,
        email_address: sellerDetails.emailAddress?.trim() || null,
      });

      if (sellerError) {
        console.error('Seller insertion error:', sellerError);
        alert('Warning: Seller information could not be saved.');
      } else {
        console.log('✅ Seller created successfully');
      }

      // Insert vehicle options (TEXT DATA - goes to Supabase)
      const standardOptions = Object.entries(vehicleOptions.standardOptions)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);
      
      const specialOptions = Object.entries(vehicleOptions.specialOptions)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);

      console.log('📝 Inserting vehicle options...');
      console.log('Standard options selected:', standardOptions);
      console.log('Special options selected:', specialOptions);
      console.log('Custom options selected:', vehicleOptions.customOptions);

      // Track failed options for reporting
      const failedStandardOptions: string[] = [];
      const failedSpecialOptions: string[] = [];

      // Get option IDs from master and insert
      let standardInsertCount = 0;
      for (const optionName of standardOptions) {
        const { data: optionData, error: lookupError } = await supabase
          .from('vehicle_options_master')
          .select('id')
          .eq('option_name', optionName)
          .eq('option_type', 'standard')
          .eq('is_active', true)
          .single();

        if (lookupError || !optionData) {
          console.error(`❌ Standard option "${optionName}" not found in master table:`, lookupError);
          failedStandardOptions.push(optionName);
          continue;
        }

        if (optionData) {
          const { error: insertError } = await supabase.from('vehicle_options').insert({
            vehicle_id: vehicle.id,
            option_id: optionData.id,
            option_type: 'standard',
            is_enabled: true,
          });

          if (insertError) {
            console.error(`❌ Failed to insert standard option "${optionName}":`, insertError);
            failedStandardOptions.push(optionName);
          } else {
            standardInsertCount++;
            console.log(`✅ Inserted standard option: ${optionName}`);
          }
        }
      }

      let specialInsertCount = 0;
      for (const optionName of specialOptions) {
        const { data: optionData, error: lookupError } = await supabase
          .from('vehicle_options_master')
          .select('id')
          .eq('option_name', optionName)
          .eq('option_type', 'special')
          .eq('is_active', true)
          .single();

        if (lookupError || !optionData) {
          console.error(`❌ Special option "${optionName}" not found in master table:`, lookupError);
          failedSpecialOptions.push(optionName);
          continue;
        }

        if (optionData) {
          const { error: insertError } = await supabase.from('vehicle_options').insert({
            vehicle_id: vehicle.id,
            option_id: optionData.id,
            option_type: 'special',
            is_enabled: true,
          });

          if (insertError) {
            console.error(`❌ Failed to insert special option "${optionName}":`, insertError);
            failedSpecialOptions.push(optionName);
          } else {
            specialInsertCount++;
            console.log(`✅ Inserted special option: ${optionName}`);
          }
        }
      }

      // Report results
      console.log(`✅ Options inserted: ${standardInsertCount}/${standardOptions.length} standard, ${specialInsertCount}/${specialOptions.length} special`);
      
      if (failedStandardOptions.length > 0 || failedSpecialOptions.length > 0) {
        console.warn(`⚠️  Failed to save some options:`);
        if (failedStandardOptions.length > 0) {
          console.warn(`   Standard: ${failedStandardOptions.join(', ')}`);
        }
        if (failedSpecialOptions.length > 0) {
          console.warn(`   Special: ${failedSpecialOptions.join(', ')}`);
        }
        console.warn(`   Please run the SQL migration: dashboard/migrations/insert_all_vehicle_options.sql`);
      }

      // Insert custom options (TEXT DATA - goes to Supabase)
      if (vehicleOptions.customOptions.length > 0) {
        console.log('📝 Inserting custom options:', vehicleOptions.customOptions);
        let customInsertCount = 0;
        
        for (const customOption of vehicleOptions.customOptions) {
          const { error: customError } = await supabase.from('vehicle_custom_options').insert({
            vehicle_id: vehicle.id,
            option_name: customOption.trim(),
          });

          if (customError) {
            console.error(`❌ Failed to insert custom option "${customOption}":`, customError);
          } else {
            customInsertCount++;
            console.log(`✅ Inserted custom option: ${customOption}`);
          }
        }
        console.log(`✅ Custom options inserted: ${customInsertCount}/${vehicleOptions.customOptions.length}`);
      } else {
        console.log('ℹ️  No custom options to insert');
      }

      // Upload images to S3 (IMAGE DATA - goes to AWS S3)
      if (vehicleDetails.vehicleImages.length > 0 || vehicleDetails.image360Files.length > 0 || vehicleDetails.crImages.length > 0) {
        console.log('🖼️  Starting image uploads to AWS S3...');
        await uploadImages(vehicle.id);
        console.log('✅ All images uploaded to AWS S3 successfully');
      } else {
        console.log('ℹ️  No images to upload');
      }

      console.log('✅✅ Vehicle published successfully!');
      setPublishedVehicleId(vehicle.id);
      nextStep(); // Go to success screen
    } catch (error: any) {
      console.error('❌ Error publishing vehicle:', error);
      
      if (error.message !== 'Upload failed') {
        const errorMessage = error?.message || 'Unknown error occurred';
        alert(`Failed to publish vehicle:\n\n${errorMessage}\n\nCheck the browser console for more details.`);
      }
      
      throw error;
    }
  };

  const getBrandName = () => {
    return brands.find((b) => b.id === formState.vehicleDetails.brandId)?.name || '';
  };

  const getModelName = () => {
    return models.find((m) => m.id === formState.vehicleDetails.modelId)?.name || '';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full mx-auto">
        {/* Step Indicator */}
        {formState.currentStep < 7 && (
          <StepIndicator currentStep={formState.currentStep} completedSteps={completedSteps} />
        )}

        {/* Step Content */}
        <div className=" max-w-7xl ">
        {formState.currentStep === 1 && (
          <Step1VehicleDetails
            data={formState.vehicleDetails}
            onChange={updateVehicleDetails}
            onNext={nextStep}
            onBack={prevStep}
            brands={brands}
            models={models}
            countries={countries}
          />
        )}

        {formState.currentStep === 2 && (
          <Step2SellerDetails
            data={formState.sellerDetails}
            onChange={updateSellerDetails}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {formState.currentStep === 3 && (
          <Step3VehicleOptions
            data={formState.vehicleOptions}
            onChange={updateVehicleOptions}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {formState.currentStep === 4 && (
          <Step4SellingDetails
            data={formState.sellingDetails}
            onChange={updateSellingDetails}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {formState.currentStep === 5 && (
          <Step5SpecialNotes
            data={formState.specialNotes}
            onChange={updateSpecialNotes}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {formState.currentStep === 6 && (
          <Step6Summary
            formState={formState}
            onPublish={handlePublish}
            onBack={prevStep}
            brands={brands}
            models={models}
            countries={countries}
          />
        )}

        {formState.currentStep === 7 && (
          <Step7Success
            vehicleNumber={formState.vehicleDetails.vehicleNumber}
            brandName={getBrandName()}
            modelName={getModelName()}
            year={formState.vehicleDetails.manufactureYear || 0}
            registeredYear={formState.vehicleDetails.registeredYear || 0}
            engineCapacity={formState.vehicleDetails.engineCapacity}
            exteriorColor={formState.vehicleDetails.exteriorColor}
            sellingAmount={formState.sellingDetails.sellingAmount}
            sellerDetails={{
              title: formState.sellerDetails.title,
              firstName: formState.sellerDetails.firstName,
              lastName: formState.sellerDetails.lastName,
              address: formState.sellerDetails.address,
              city: formState.sellerDetails.city,
              nicNumber: formState.sellerDetails.nicNumber,
              mobileNumber: formState.sellerDetails.mobileNumber,
            }}
            vehicleOptions={{
              standardOptions: formState.vehicleOptions.standardOptions,
              specialOptions: formState.vehicleOptions.specialOptions,
              customOptions: formState.vehicleOptions.customOptions,
            }}
          />
        )}
      </div>
      </div>
    </div>
  );
}
