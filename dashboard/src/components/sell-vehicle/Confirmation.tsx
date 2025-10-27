'use client';

import { useRouter } from 'next/navigation';

interface ConfirmationProps {
  vehicleData: {
    brand: string;
    model: string;
    year: number;
    vehicleNumber: string;
  };
}

export default function Confirmation({ vehicleData }: ConfirmationProps) {
  const router = useRouter();

  const handlePrintInvoice = () => {
    // TODO: Implement print invoice functionality
    window.print();
  };

  const handlePendingList = () => {
    router.push('/sales-transactions');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Vehicle Details */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {vehicleData.brand} {vehicleData.model} {vehicleData.year} -{' '}
            <span className="text-green-600">{vehicleData.vehicleNumber}</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Vehicle Selling conformation successful
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <button
            onClick={handlePrintInvoice}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Print Invoice
          </button>
          <button
            onClick={handlePendingList}
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Pending List
          </button>
        </div>
      </div>
    </div>
  );
}
