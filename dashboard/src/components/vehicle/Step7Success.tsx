'use client';

import { Plus, Printer, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
      <div className="mb-6 flex justify-center">
        <Image 
          src="/done_animation.png" 
          alt="Success" 
          width={200} 
          height={200}
          className="object-contain"
        />
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
    </div>
  );
}
