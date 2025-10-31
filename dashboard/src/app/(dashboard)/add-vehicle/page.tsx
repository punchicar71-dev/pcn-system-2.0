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
            // Step 1: Get presigned URL from API
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
              throw new Error('No authentication token available');
            }

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
            });

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
            });

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
            });

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

      // Validation: Check if required fields are filled
      if (!vehicleDetails.vehicleNumber.trim()) {
        alert('Please enter a vehicle number');
        return;
      }

      if (!vehicleDetails.brandId) {
        alert('Please select a vehicle brand');
        return;
      }

      if (!vehicleDetails.modelId) {
        alert('Please select a vehicle model');
        return;
      }

      if (!vehicleDetails.manufactureYear) {
        alert('Please select manufacture year');
        return;
      }

      if (!vehicleDetails.countryId) {
        alert('Please select country');
        return;
      }

      if (!sellerDetails.firstName.trim() || !sellerDetails.lastName.trim()) {
        alert('Please enter seller name');
        return;
      }

      if (!sellerDetails.mobileNumber.trim()) {
        alert('Please enter seller mobile number');
        return;
      }

      if (!sellingDetails.sellingAmount.trim()) {
        alert('Please enter selling amount');
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
          body_type: vehicleDetails.bodyType || null,
          fuel_type: vehicleDetails.fuelType || null,
          transmission: vehicleDetails.transmission || null,
          engine_capacity: vehicleDetails.engineCapacity?.trim() || null,
          exterior_color: vehicleDetails.exteriorColor?.trim() || null,
          registered_year: vehicleDetails.registeredYear || null,
          selling_amount: parseFloat(sellingDetails.sellingAmount.replace(/,/g, '')) || 0,
          mileage: sellingDetails.mileage ? parseFloat(sellingDetails.mileage.replace(/,/g, '')) : null,
          entry_type: sellingDetails.entryType || null,
          entry_date: sellingDetails.entryDate || new Date().toISOString().split('T')[0],
          status: sellingDetails.status || 'active',
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
        }
        
        throw vehicleError;
      }
      
      if (!vehicle) {
        throw new Error('Failed to create vehicle');
      }

      console.log('✅ Vehicle created successfully:', vehicle.id);

      // Insert seller (TEXT DATA - goes to Supabase)
      const { error: sellerError } = await supabase.from('sellers').insert({
        vehicle_id: vehicle.id,
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
      console.log('Standard options:', standardOptions);
      console.log('Special options:', specialOptions);

      // Get option IDs from master and insert
      let standardInsertCount = 0;
      for (const optionName of standardOptions) {
        const { data: optionData, error: lookupError } = await supabase
          .from('vehicle_options_master')
          .select('id')
          .eq('option_name', optionName)
          .eq('option_type', 'standard')
          .single();

        if (lookupError) {
          console.warn(`⚠️  Standard option "${optionName}" not found in master table:`, lookupError);
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
          .single();

        if (lookupError) {
          console.warn(`⚠️  Special option "${optionName}" not found in master table:`, lookupError);
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
          } else {
            specialInsertCount++;
            console.log(`✅ Inserted special option: ${optionName}`);
          }
        }
      }

      console.log(`✅ Options inserted: ${standardInsertCount} standard, ${specialInsertCount} special`);

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
      <div className="max-w-7xl mx-auto">
        {/* Step Indicator */}
        {formState.currentStep < 7 && (
          <StepIndicator currentStep={formState.currentStep} completedSteps={completedSteps} />
        )}

        {/* Step Content */}
        <div className="">
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
            sellerDetails={{
              firstName: formState.sellerDetails.firstName,
              lastName: formState.sellerDetails.lastName,
              address: formState.sellerDetails.address,
              city: formState.sellerDetails.city,
              nicNumber: formState.sellerDetails.nicNumber,
              mobileNumber: formState.sellerDetails.mobileNumber,
            }}
          />
        )}
      </div>
      </div>
    </div>
  );
}
