'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VehicleDetailsData, BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, getYearRange } from '@/types/vehicle-form.types';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase-client';

interface Step1VehicleDetailsProps {
  data: VehicleDetailsData;
  onChange: (data: Partial<VehicleDetailsData>) => void;
  onNext: () => void;
  onBack: () => void;
  brands: Array<{ id: string; name: string }>;
  models: Array<{ id: string; name: string }>;
  countries: Array<{ id: string; name: string }>;
}

export default function Step1VehicleDetails({ data, onChange, onNext, onBack, brands, models, countries }: Step1VehicleDetailsProps) {
  const years = getYearRange(1980);
  
  // State for duplicate vehicle number check
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [hasCheckedVehicle, setHasCheckedVehicle] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to check if vehicle number exists in database
  // Only checks: 1) Inventory (vehicles not sold), 2) Pending sales (not sold-out)
  // Does NOT block: Sold-out vehicles can be added again
  const checkVehicleNumberExists = async (vehicleNumber: string): Promise<boolean> => {
    if (!vehicleNumber || vehicleNumber.trim() === '') {
      return false;
    }

    try {
      const supabase = createClient();
      const normalizedVehicleNumber = vehicleNumber.trim().toUpperCase();

      // Check 1: Inventory table - only vehicles that are NOT sold
      const { data: inventoryVehicles, error: inventoryError } = await supabase
        .from('vehicles')
        .select('id, vehicle_number, status')
        .eq('vehicle_number', normalizedVehicleNumber)
        .neq('status', 'Sold')
        .limit(1);

      if (inventoryError) {
        console.error('Error checking vehicle number in inventory:', inventoryError);
        return false;
      }

      // If found in inventory (not sold), block the duplicate
      if (inventoryVehicles && inventoryVehicles.length > 0) {
        return true;
      }

      // Check 2: Pending vehicle sales - only vehicles with 'pending' status (not 'sold')
      const { data: pendingSales, error: pendingError } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          id,
          status,
          vehicles:vehicle_id (
            vehicle_number
          )
        `)
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error checking vehicle number in pending sales:', pendingError);
        return false;
      }

      // Check if any pending sale has matching vehicle number
      if (pendingSales && pendingSales.length > 0) {
        const matchingPendingSale = pendingSales.find(
          (sale: any) => sale.vehicles?.vehicle_number?.toUpperCase() === normalizedVehicleNumber
        );
        if (matchingPendingSale) {
          return true;
        }
      }

      // Not found in active inventory or pending sales - allow adding
      return false;
    } catch (error) {
      console.error('Error checking vehicle number:', error);
      return false;
    }
  };

  // Debounced duplicate check function
  const debouncedCheckDuplicate = useCallback((vehicleNumber: string) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset states
    setDuplicateError(null);
    setHasCheckedVehicle(false);

    if (!vehicleNumber || vehicleNumber.trim() === '') {
      setIsCheckingDuplicate(false);
      return;
    }

    setIsCheckingDuplicate(true);

    // Set new timer for 500ms debounce
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const exists = await checkVehicleNumberExists(vehicleNumber);
        
        if (exists) {
          setDuplicateError('This vehicle number is already added by another user.');
        } else {
          setDuplicateError(null);
        }
        setHasCheckedVehicle(true);
      } catch (error) {
        console.error('Error during duplicate check:', error);
        setDuplicateError(null);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 500);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Check duplicate when component mounts with existing vehicle number
  useEffect(() => {
    if (data.vehicleNumber && data.vehicleNumber.trim() !== '') {
      debouncedCheckDuplicate(data.vehicleNumber);
    }
  }, []); // Only on mount

  const handleVehicleNumberChange = (value: string) => {
    // Convert to uppercase and format
    const formatted = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    onChange({ vehicleNumber: formatted });
    
    // Trigger duplicate check
    debouncedCheckDuplicate(formatted);
  };

  // Handle blur - immediate check if not already checked
  const handleVehicleNumberBlur = async () => {
    if (data.vehicleNumber && !hasCheckedVehicle && !isCheckingDuplicate) {
      // Cancel any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      setIsCheckingDuplicate(true);
      
      try {
        const exists = await checkVehicleNumberExists(data.vehicleNumber);
        
        if (exists) {
          setDuplicateError('This vehicle number is already added by another user.');
        } else {
          setDuplicateError(null);
        }
        setHasCheckedVehicle(true);
      } catch (error) {
        console.error('Error during blur check:', error);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }
  };

  const handleVehicleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...data.vehicleImages, ...files];
      const newPreviews = files.map(file => URL.createObjectURL(file));
      onChange({
        vehicleImages: newImages,
        vehicleImagePreviews: [...data.vehicleImagePreviews, ...newPreviews],
      });
    }
  };

  const handle360ImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...data.image360Files, ...files];
      const newPreviews = files.map(file => URL.createObjectURL(file));
      onChange({
        image360Files: newImages,
        image360Previews: [...data.image360Previews, ...newPreviews],
      });
    }
  };

  const handleCRImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...data.crImages, ...files];
      const newPreviews = files.map(file => URL.createObjectURL(file));
      onChange({
        crImages: newImages,
        crImagePreviews: [...data.crImagePreviews, ...newPreviews],
      });
    }
  };

  const removeVehicleImage = (index: number) => {
    const newImages = data.vehicleImages.filter((_, i) => i !== index);
    const newPreviews = data.vehicleImagePreviews.filter((_, i) => i !== index);
    onChange({
      vehicleImages: newImages,
      vehicleImagePreviews: newPreviews,
    });
  };

  const remove360Image = (index: number) => {
    const newImages = data.image360Files.filter((_, i) => i !== index);
    const newPreviews = data.image360Previews.filter((_, i) => i !== index);
    onChange({
      image360Files: newImages,
      image360Previews: newPreviews,
    });
  };

  const removeCRImage = (index: number) => {
    const newImages = data.crImages.filter((_, i) => i !== index);
    const newPreviews = data.crImagePreviews.filter((_, i) => i !== index);
    onChange({
      crImages: newImages,
      crImagePreviews: newPreviews,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate vehicle number first
    if (duplicateError) {
      alert('Please resolve the duplicate vehicle number issue before proceeding.');
      return;
    }
    
    // If still checking, wait for it to complete
    if (isCheckingDuplicate) {
      alert('Please wait while we verify the vehicle number.');
      return;
    }
    
    // If vehicle number entered but not yet checked, do a final check
    if (data.vehicleNumber?.trim() && !hasCheckedVehicle) {
      setIsCheckingDuplicate(true);
      try {
        const exists = await checkVehicleNumberExists(data.vehicleNumber);
        if (exists) {
          setDuplicateError('This vehicle number is already added by another user.');
          setHasCheckedVehicle(true);
          setIsCheckingDuplicate(false);
          alert('This vehicle number already exists in the system. Please enter a different vehicle number.');
          return;
        }
        setHasCheckedVehicle(true);
      } catch (error) {
        console.error('Error during final check:', error);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }
    
    // Comprehensive Validation
    const missingFields: string[] = [];
    
    if (!data.vehicleNumber?.trim()) missingFields.push('Vehicle Number');
    if (!data.brandId) missingFields.push('Vehicle Brand');
    if (!data.modelId) missingFields.push('Model Name');
    if (!data.manufactureYear) missingFields.push('Manufacture Year');
    if (!data.countryId) missingFields.push('Country');
    if (!data.bodyType) missingFields.push('Body Type');
    if (!data.fuelType) missingFields.push('Fuel Type');
    if (!data.transmission) missingFields.push('Transmission');
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n\n${missingFields.join('\n')}`);
      return;
    }
    
    onNext();
  };

  return (
    <div className="bg-slate-50 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicle Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="vehicleNumber">
              Vehicle Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="vehicleNumber"
                value={data.vehicleNumber}
                onChange={(e) => handleVehicleNumberChange(e.target.value)}
                onBlur={handleVehicleNumberBlur}
                placeholder="Ex: CBA-3214"
                className={`uppercase pr-10 ${
                  duplicateError 
                    ? 'border-red-500 focus:ring-red-500 focus-visible:ring-red-500 bg-red-50' 
                    : hasCheckedVehicle && !isCheckingDuplicate && data.vehicleNumber
                      ? 'border-green-500 focus:ring-green-500 focus-visible:ring-green-500'
                      : ''
                }`}
                required
              />
              
              {/* Status indicators */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingDuplicate && (
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                )}
                {hasCheckedVehicle && !isCheckingDuplicate && !duplicateError && data.vehicleNumber && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {duplicateError && !isCheckingDuplicate && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            {/* Error message */}
            {duplicateError && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {duplicateError}
              </p>
            )}
            
            {/* Checking message */}
            {isCheckingDuplicate && (
              <p className="mt-1.5 text-sm text-gray-500">Checking availability...</p>
            )}
          </div>

          <div>
            <Label htmlFor="brandId">
              Vehicle Brand <span className="text-red-500">*</span>
            </Label>
            <Select value={data.brandId} onValueChange={(value) => onChange({ brandId: value, modelId: '' })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="modelId">
              Model Name <span className="text-red-500">*</span>
            </Label>
            <Select value={data.modelId} onValueChange={(value) => onChange({ modelId: value })} disabled={!data.brandId}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="modelNumberOther">Model Number (Other Name)</Label>
            <Input
              id="modelNumberOther"
              value={data.modelNumberOther}
              onChange={(e) => onChange({ modelNumberOther: e.target.value })}
              placeholder="Ex: Nissan FB15"
            />
          </div>

          <div>
            <Label htmlFor="manufactureYear">
              Manufacture Year <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.manufactureYear?.toString() || ''}
              onValueChange={(value) => onChange({ manufactureYear: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="countryId">
              Country <span className="text-red-500">*</span>
            </Label>
            <Select value={data.countryId} onValueChange={(value) => onChange({ countryId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bodyType">
              Body Type <span className="text-red-500">*</span>
            </Label>
            <Select value={data.bodyType} onValueChange={(value) => onChange({ bodyType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {BODY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fuelType">
              Fuel <span className="text-red-500">*</span>
            </Label>
            <Select value={data.fuelType} onValueChange={(value) => onChange({ fuelType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {FUEL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transmission">
              Transmission <span className="text-red-500">*</span>
            </Label>
            <Select value={data.transmission} onValueChange={(value) => onChange({ transmission: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {TRANSMISSIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="engineCapacity">Engine Capacity</Label>
            <Input
              id="engineCapacity"
              value={data.engineCapacity}
              onChange={(e) => onChange({ engineCapacity: e.target.value })}
              placeholder="Ex: 1000cc"
            />
          </div>

          <div>
            <Label htmlFor="exteriorColor">Exterior Color</Label>
            <Input
              id="exteriorColor"
              value={data.exteriorColor}
              onChange={(e) => onChange({ exteriorColor: e.target.value })}
              placeholder="Ex: Red"
            />
          </div>

          <div>
            <Label htmlFor="registeredYear">Registered Year</Label>
            <Input
              id="registeredYear"
              type="number"
              value={data.registeredYear || ''}
              onChange={(e) => onChange({ registeredYear: parseInt(e.target.value) || null })}
              placeholder="Ex: 2024"
            />
          </div>
        </div>

        {/* Image Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vehicle Images */}
          <div>
            <Label>Upload Vehicle Images</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleVehicleImageUpload}
                className="hidden"
                id="vehicle-images"
              />
              <label htmlFor="vehicle-images" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Drop file here</p>
                <p className="text-xs text-gray-500 mt-1">Or</p>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => document.getElementById('vehicle-images')?.click()}
                >
                  Choose files
                </button>
              </label>
            </div>

            {/* Image Previews */}
            {data.vehicleImagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {data.vehicleImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`Vehicle ${index + 1}`} className="w-full h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeVehicleImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {data.vehicleImages[index] && (
                      <div className="mt-1">
                        <div className="h-1 bg-green-500 rounded" style={{ width: '100%' }} />
                        <p className="text-xs text-gray-500 mt-1 truncate">{data.vehicleImages[index].name}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 360 Images */}
          <div>
            <Label>Upload 360° Images</Label>
            <div className="mt-2 border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-blue-50/30">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handle360ImageUpload}
                className="hidden"
                id="image-360"
              />
              <label htmlFor="image-360" className="cursor-pointer">
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Drop 360° images here</p>
                <p className="text-xs text-gray-500 mt-1">Or</p>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => document.getElementById('image-360')?.click()}
                >
                  Choose files
                </button>
              </label>
            </div>

            {/* 360 Image Previews */}
            {data.image360Previews.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-blue-600 font-medium">{data.image360Previews.length} images for 360° view</p>
                <div className="grid grid-cols-3 gap-2">
                  {data.image360Previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`360 ${index + 1}`} className="w-full h-20 object-cover rounded border-2 border-blue-200" />
                      <button
                        type="button"
                        onClick={() => remove360Image(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CR Images / Vehicle Papers */}
          <div>
            <Label>CR Image / Vehicle Papers</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleCRImageUpload}
                className="hidden"
                id="cr-images"
              />
              <label htmlFor="cr-images" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Drop file here</p>
                <p className="text-xs text-gray-500 mt-1">Or</p>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => document.getElementById('cr-images')?.click()}
                >
                  Choose files
                </button>
              </label>
            </div>

            {/* CR Image Previews */}
            {data.crImagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {data.crImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`CR ${index + 1}`} className="w-full h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeCRImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-start gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!!duplicateError || isCheckingDuplicate}
            className={`px-6 py-2 rounded-lg transition-colors ${
              duplicateError || isCheckingDuplicate
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isCheckingDuplicate ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </span>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
