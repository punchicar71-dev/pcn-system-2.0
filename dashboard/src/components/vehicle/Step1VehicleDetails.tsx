'use client';

import { VehicleDetailsData, BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, getYearRange } from '@/types/vehicle-form.types';
import { Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const handleVehicleNumberChange = (value: string) => {
    // Convert to uppercase and format
    const formatted = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    onChange({ vehicleNumber: formatted });
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

  const removeCRImage = (index: number) => {
    const newImages = data.crImages.filter((_, i) => i !== index);
    const newPreviews = data.crImagePreviews.filter((_, i) => i !== index);
    onChange({
      crImages: newImages,
      crImagePreviews: newPreviews,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!data.vehicleNumber || !data.brandId || !data.modelId || !data.manufactureYear) {
      alert('Please fill in all required fields');
      return;
    }
    onNext();
  };

  return (
    <div className="bg-white p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicle Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="vehicleNumber">
              Vehicle Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vehicleNumber"
              value={data.vehicleNumber}
              onChange={(e) => handleVehicleNumberChange(e.target.value)}
              placeholder="Ex: CBA-3214"
              className="uppercase"
              required
            />
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
            <Label htmlFor="bodyType">Body Type</Label>
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
            <Label htmlFor="fuelType">Fuel</Label>
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
            <Label htmlFor="transmission">Transmission</Label>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <p className="text-xs text-gray-500 mt-1">{data.vehicleImages[index].name}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CR Images / Vehicle Papers */}
          <div>
            <Label>CR Image / Vehicle Pepars</Label>
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
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
