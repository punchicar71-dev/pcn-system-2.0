import Link from 'next/link';
import { VehicleCardData } from '@/lib/types';

interface VehicleCardProps {
  vehicle: VehicleCardData;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const formatPrice = (price: number) => {
    // Format like "Rs. 5 490 000" with spaces
    return `Rs. ${price.toLocaleString().replace(/,/g, ' ')}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200">
      {/* Vehicle Card with horizontal layout */}
      <div className="flex">
        {/* Image Section */}
        <div className="relative w-52 h-36 bg-gray-50 flex-shrink-0">
          {vehicle.imageUrl ? (
            <img
              src={vehicle.imageUrl}
              alt={vehicle.name}
              className="w-full h-full object-cover"
            />
          ) : (
            // Placeholder car image
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <svg
                className="w-20 h-20 text-gray-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v7c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-7l-1.92-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
          )}
          
          {/* Dot indicators at bottom */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
            <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
            <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Top section with title and days ago */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-gray-600">{vehicle.year}</p>
            </div>
            {vehicle.daysAgo && (
              <span className="text-gray-400 text-sm">
                {vehicle.daysAgo} day{vehicle.daysAgo !== 1 ? 's' : ''} ago
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mb-3">
            <p className="text-2xl font-bold text-green-600">
              {formatPrice(vehicle.price)}
            </p>
          </div>

          {/* Bottom section with specs and button */}
          <div className="flex justify-between items-end">
            {/* Vehicle Specifications */}
            <div className="flex gap-8">
              <div>
                <p className="text-gray-500 text-xs mb-1">Fuel Type</p>
                <p className="text-red-600 font-semibold">{vehicle.fuelType}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Transmission</p>
                <p className="text-red-600 font-semibold">{vehicle.transmission}</p>
              </div>
            </div>
            
            {/* View Details Button */}
            <Link
              href={`/vehicles/${vehicle.id}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}