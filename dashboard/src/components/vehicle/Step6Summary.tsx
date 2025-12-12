'use client';

import { useState } from 'react';
import { VehicleFormState } from '@/types/vehicle-form.types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step6SummaryProps {
  formState: VehicleFormState;
  onPublish: () => Promise<void>;
  onBack: () => void;
  brands: Array<{ id: string; name: string }>;
  models: Array<{ id: string; name: string }>;
  countries: Array<{ id: string; name: string }>;
}

export default function Step6Summary({ formState, onPublish, onBack, brands, models, countries }: Step6SummaryProps) {
  const [isPublishing, setIsPublishing] = useState(false);

  const { vehicleDetails, sellerDetails, vehicleOptions, sellingDetails, specialNotes } = formState;

  const getBrandName = (id: string) => brands.find((b) => b.id === id)?.name || id;
  const getModelName = (id: string) => models.find((m) => m.id === id)?.name || id;
  const getCountryName = (id: string) => countries.find((c) => c.id === id)?.name || id;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish();
    } catch (error) {
      console.error('Error publishing vehicle:', error);
      alert('Failed to publish vehicle. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const getEnabledStandardOptions = () => {
    return Object.entries(vehicleOptions.standardOptions)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name);
  };

  const getEnabledSpecialOptions = () => {
    return Object.entries(vehicleOptions.specialOptions)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name);
  };

  return (
    <div className="bg-slate-50  p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">All Data Summary</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Vehicle Details */}
          <div className="border bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Vehicle Number</dt>
                <dd className="font-semibold text-gray-900">{vehicleDetails.vehicleNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Vehicle Brand</dt>
                <dd className="font-semibold text-gray-900">{getBrandName(vehicleDetails.brandId)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Model Name</dt>
                <dd className="font-semibold text-gray-900">{getModelName(vehicleDetails.modelId)}</dd>
              </div>
              {vehicleDetails.modelNumberOther && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Model Number (Other Name)</dt>
                  <dd className="font-semibold text-gray-900">{vehicleDetails.modelNumberOther}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">Manufacture Year</dt>
                <dd className="font-semibold text-gray-900">{vehicleDetails.manufactureYear}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Country</dt>
                <dd className="font-semibold text-gray-900">{getCountryName(vehicleDetails.countryId)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Body Type</dt>
                <dd className="font-semibold text-gray-900">{vehicleDetails.bodyType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Fule</dt>
                <dd className="font-semibold text-gray-900">{vehicleDetails.fuelType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Transmission</dt>
                <dd className="font-semibold text-gray-900">{vehicleDetails.transmission}</dd>
              </div>
              {vehicleDetails.engineCapacity && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Engine Capacity</dt>
                  <dd className="font-semibold text-gray-900">{vehicleDetails.engineCapacity}</dd>
                </div>
              )}
              {vehicleDetails.exteriorColor && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Exterior Color</dt>
                  <dd className="font-semibold text-gray-900">{vehicleDetails.exteriorColor}</dd>
                </div>
              )}
              {vehicleDetails.registeredYear && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Registered Year</dt>
                  <dd className="font-semibold text-gray-900">{vehicleDetails.registeredYear}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Seller Details */}
          <div className="border bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Seller Full Name</dt>
                <dd className="font-semibold text-gray-900">
                  {sellerDetails.firstName} {sellerDetails.lastName}
                </dd>
              </div>
              {sellerDetails.address && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Address</dt>
                  <dd className="font-semibold text-gray-900">{sellerDetails.address}</dd>
                </div>
              )}
              {sellerDetails.nicNumber && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">NIC Number</dt>
                  <dd className="font-semibold text-gray-900">{sellerDetails.nicNumber}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">Mobile Number</dt>
                <dd className="font-semibold text-gray-900">{sellerDetails.mobileNumber}</dd>
              </div>
              {sellerDetails.landPhoneNumber && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Land Phone Number</dt>
                  <dd className="font-semibold text-gray-900">{sellerDetails.landPhoneNumber}</dd>
                </div>
              )}
              {sellerDetails.emailAddress && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email Address</dt>
                  <dd className="font-semibold text-gray-900">{sellerDetails.emailAddress}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Vehicle Options */}
          <div className="border bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
            <div className="flex flex-wrap gap-2">
              {[...getEnabledStandardOptions(), ...getEnabledSpecialOptions(), ...vehicleOptions.customOptions].map(
                (option, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                  >
                    {option}
                  </span>
                )
              )}
              {getEnabledStandardOptions().length === 0 &&
                getEnabledSpecialOptions().length === 0 &&
                vehicleOptions.customOptions.length === 0 && (
                  <span className="text-sm text-gray-500">No options selected</span>
                )}
            </div>
          </div>

          {/* Vehicle Selling Details */}
          <div className="border bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Selling Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Selling Amount</dt>
                <dd className="font-semibold text-gray-900">Rs. {sellingDetails.sellingAmount}</dd>
              </div>
              {sellingDetails.mileage && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Milage</dt>
                  <dd className="font-semibold text-gray-900">KM. {sellingDetails.mileage}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">Entry Type</dt>
                <dd className="font-semibold text-gray-900">{sellingDetails.entryType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Entry Date</dt>
                <dd className="font-semibold text-gray-900">
                  {new Date(sellingDetails.entryDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Status</dt>
                <dd className="font-semibold text-gray-900">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      sellingDetails.status === 'In Sale'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {sellingDetails.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Special Notes */}
          {(specialNotes.tagNotes || specialNotes.specialNotePrint) && (
            <div className="border bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Notes</h3>
              {specialNotes.tagNotes && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">Tag Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{specialNotes.tagNotes}</p>
                </div>
              )}
              {specialNotes.specialNotePrint && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Special Not for print</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{specialNotes.specialNotePrint}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-start gap-4 pt-6 mt-6 border-t">
        <Button
          type="button"
          onClick={onBack}
          disabled={isPublishing}
          variant="outline"
          size="lg"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          size="lg"
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish'
          )}
        </Button>
      </div>
    </div>
  );
}
