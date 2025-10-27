'use client';

import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
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
    const { vehicleImages, crImages } = formState.vehicleDetails;
    const uploadPromises: Promise<any>[] = [];

    // Upload vehicle images
    for (let i = 0; i < vehicleImages.length; i++) {
      const file = vehicleImages[i];
      const fileName = `${vehicleId}/vehicle-${Date.now()}-${i}-${file.name}`;
      
      const uploadPromise = supabase.storage
        .from('vehicle-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })
        .then(async (result) => {
          if (result.error) throw result.error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('vehicle-images')
            .getPublicUrl(fileName);

          // Insert image record
          await supabase.from('vehicle_images').insert({
            vehicle_id: vehicleId,
            image_url: publicUrl,
            image_type: 'gallery',
            storage_path: fileName,
            file_name: file.name,
            file_size: file.size,
            is_primary: i === 0,
            display_order: i,
          });
        });

      uploadPromises.push(uploadPromise);
    }

    // Upload CR images
    for (let i = 0; i < crImages.length; i++) {
      const file = crImages[i];
      const fileName = `${vehicleId}/cr-${Date.now()}-${i}-${file.name}`;
      
      const uploadPromise = supabase.storage
        .from('vehicle-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })
        .then(async (result) => {
          if (result.error) throw result.error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('vehicle-images')
            .getPublicUrl(fileName);

          // Insert image record
          await supabase.from('vehicle_images').insert({
            vehicle_id: vehicleId,
            image_url: publicUrl,
            image_type: 'cr_paper',
            storage_path: fileName,
            file_name: file.name,
            file_size: file.size,
            is_primary: false,
            display_order: i,
          });
        });

      uploadPromises.push(uploadPromise);
    }

    await Promise.all(uploadPromises);
  };

  const handlePublish = async () => {
    try {
      const { vehicleDetails, sellerDetails, vehicleOptions, sellingDetails, specialNotes } = formState;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      console.log('Starting vehicle insertion...');
      console.log('User:', user?.id);

      // Insert vehicle
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          vehicle_number: vehicleDetails.vehicleNumber,
          brand_id: vehicleDetails.brandId,
          model_id: vehicleDetails.modelId,
          model_number_other: vehicleDetails.modelNumberOther || null,
          manufacture_year: vehicleDetails.manufactureYear!,
          country_id: vehicleDetails.countryId,
          body_type: vehicleDetails.bodyType,
          fuel_type: vehicleDetails.fuelType,
          transmission: vehicleDetails.transmission,
          engine_capacity: vehicleDetails.engineCapacity || null,
          exterior_color: vehicleDetails.exteriorColor || null,
          registered_year: vehicleDetails.registeredYear || null,
          selling_amount: parseFloat(sellingDetails.sellingAmount.replace(/,/g, '')),
          mileage: sellingDetails.mileage ? parseFloat(sellingDetails.mileage.replace(/,/g, '')) : null,
          entry_type: sellingDetails.entryType,
          entry_date: sellingDetails.entryDate,
          status: sellingDetails.status,
          tag_notes: specialNotes.tagNotes || null,
          special_note_print: specialNotes.specialNotePrint || null,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (vehicleError) {
        console.error('Vehicle insertion error:', vehicleError);
        
        // Provide helpful error messages
        if (vehicleError.code === '42P01') {
          alert('Database Error: The "vehicles" table does not exist.\n\nPlease run the database migration first:\n1. Open Supabase SQL Editor\n2. Run vehicle-inventory-migration.sql\n3. Try again');
          throw new Error('Database table "vehicles" not found. Please run migration first.');
        } else if (vehicleError.code === '23503') {
          alert('Database Error: Referenced table (brands, models, or countries) does not exist or has no data.\n\nPlease:\n1. Run the complete migration\n2. Add sample brands, models, and countries\n3. Try again');
          throw new Error('Foreign key constraint failed. Master data may be missing.');
        }
        
        throw vehicleError;
      }
      
      if (!vehicle) throw new Error('Failed to create vehicle');

      console.log('Vehicle created successfully:', vehicle.id);

      // Insert seller
      const { error: sellerError } = await supabase.from('sellers').insert({
        vehicle_id: vehicle.id,
        first_name: sellerDetails.firstName,
        last_name: sellerDetails.lastName,
        address: sellerDetails.address || null,
        city: sellerDetails.city || null,
        nic_number: sellerDetails.nicNumber || null,
        mobile_number: sellerDetails.mobileNumber,
        land_phone_number: sellerDetails.landPhoneNumber || null,
        email_address: sellerDetails.emailAddress || null,
      });

      if (sellerError) {
        console.error('Seller insertion error:', sellerError);
      }

      console.log('Seller created successfully');

      // Insert vehicle options
      const standardOptions = Object.entries(vehicleOptions.standardOptions)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);
      
      const specialOptions = Object.entries(vehicleOptions.specialOptions)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);

      // Get option IDs from master and insert
      for (const optionName of standardOptions) {
        const { data: optionData } = await supabase
          .from('vehicle_options_master')
          .select('id')
          .eq('option_name', optionName)
          .eq('option_type', 'standard')
          .single();

        if (optionData) {
          await supabase.from('vehicle_options').insert({
            vehicle_id: vehicle.id,
            option_id: optionData.id,
            option_type: 'standard',
            is_enabled: true,
          });
        }
      }

      for (const optionName of specialOptions) {
        const { data: optionData } = await supabase
          .from('vehicle_options_master')
          .select('id')
          .eq('option_name', optionName)
          .eq('option_type', 'special')
          .single();

        if (optionData) {
          await supabase.from('vehicle_options').insert({
            vehicle_id: vehicle.id,
            option_id: optionData.id,
            option_type: 'special',
            is_enabled: true,
          });
        }
      }

      console.log('Options inserted successfully');

      // Insert custom options
      if (vehicleOptions.customOptions.length > 0) {
        for (const customOption of vehicleOptions.customOptions) {
          await supabase.from('vehicle_custom_options').insert({
            vehicle_id: vehicle.id,
            option_name: customOption,
          });
        }
        console.log('Custom options inserted successfully');
      }

      // Upload images
      if (vehicleDetails.vehicleImages.length > 0 || vehicleDetails.crImages.length > 0) {
        await uploadImages(vehicle.id);
        console.log('Images uploaded successfully');
      }

      console.log('✅ Vehicle published successfully!');
      setPublishedVehicleId(vehicle.id);
      nextStep(); // Go to success screen
    } catch (error: any) {
      console.error('❌ Error publishing vehicle:', error);
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to publish vehicle:\n\n${errorMessage}\n\nCheck the browser console for more details.`);
      
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
    <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <PlusCircle className="w-8 h-8 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
          <p className="text-gray-600">Complete all steps to add vehicle to inventory</p>
        </div>
      </div>

      {/* Step Indicator */}
      {formState.currentStep < 7 && (
        <StepIndicator currentStep={formState.currentStep} completedSteps={completedSteps} />
      )}

      {/* Step Content */}
      <div className="mt-6">
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
          />
        )}
      </div>
    </div>
  );
}
