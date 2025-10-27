'use client';

import { CheckCircle, Plus, Printer, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Step7SuccessProps {
  vehicleNumber: string;
  brandName: string;
  modelName: string;
  year: number;
}

export default function Step7Success({ vehicleNumber, brandName, modelName, year }: Step7SuccessProps) {
  const router = useRouter();

  const handleAddNewVehicle = () => {
    router.push('/add-vehicle');
    // Refresh the page to reset form
    router.refresh();
  };

  const handlePrintDetails = () => {
    // TODO: Implement print functionality
    window.print();
  };

  const handleGoToInventory = () => {
    router.push('/inventory');
  };

  return (
    <div className="bg-white  p-8 text-center">
      {/* Success Animation */}
      <div className="mb-6 relative">
        <div className="inline-block">
          {/* Animated dots around checkmark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 relative">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-green-500 rounded-full animate-ping"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translate(50px) rotate(-${i * 45}deg)`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '2s',
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Main checkmark */}
          <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        {brandName} {modelName} {year} - <span className="text-green-600">{vehicleNumber}</span>
      </h2>
      <p className="text-lg text-gray-600 mb-8">Vehicle acceptance successful</p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleAddNewVehicle}
          className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Vehicle
        </button>

        <button
          onClick={handlePrintDetails}
          className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Details
        </button>

        <button
          onClick={handleGoToInventory}
          className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" />
          Go to Inventory
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Vehicle Added</h4>
              <p className="text-sm text-gray-600">Successfully added to inventory</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Images Uploaded</h4>
              <p className="text-sm text-gray-600">All images saved successfully</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Ready for Sale</h4>
              <p className="text-sm text-gray-600">Vehicle is now visible in listings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
