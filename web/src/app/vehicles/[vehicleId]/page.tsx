'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Phone, MapPin, Calendar } from 'lucide-react';
import Image360Viewer from '@/components/Image360Viewer';

interface VehicleDetail {
  id: string;
  vehicle_number: string;
  brand: { id: string; name: string; logo_url?: string };
  model: { id: string; name: string };
  model_number_other?: string;
  manufacture_year: number;
  country: { id: string; name: string };
  body_type: string;
  fuel_type: string;
  transmission: string;
  engine_capacity?: string;
  exterior_color?: string;
  registered_year?: number;
  selling_amount: number;
  mileage?: number;
  entry_type: string;
  entry_date: string;
  status: string;
  tag_notes?: string;
  special_note_print?: string;
  created_at: string;
  updated_at: string;
  images: Array<{ id: string; image_url: string; is_primary: boolean; display_order: number; image_type?: string }>;
  image_360?: Array<{ id: string; image_url: string; image_type: string; display_order: number }>;
  options: Array<{ id: string; name: string; type: string }>;
  custom_options: Array<{ id: string; option_name: string }>;
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    address?: string;
    city?: string;
    mobile_number: string;
    land_phone_number?: string;
    email_address?: string;
  };
}

const formatPrice = (price: number) => {
  return `Rs. ${price.toLocaleString().replace(/,/g, ' ')}`;
};

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'gallery' | '360'>('gallery');

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicle');
        }
        
        const data = await response.json();
        setVehicle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading vehicle details...</div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'Vehicle not found'}</div>
          <Link href="/vehicles" className="text-blue-500 hover:underline">
            Back to vehicles
          </Link>
        </div>
      </div>
    );
  }

  const vehicleImages = vehicle.images && vehicle.images.length > 0 
    ? vehicle.images.sort((a, b) => (b.is_primary ? 1 : -1))
    : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Main Container */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header with Back Button */}
        <div className="mb-8 bg-white rounded-lg border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/vehicles"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              
              <div className="border-l border-gray-300 pl-4">
                <span className="text-sm font-medium text-gray-700 mr-3">View Mode:</span>
                <button 
                  onClick={() => setViewMode('gallery')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    viewMode === 'gallery' 
                      ? 'bg-yellow-500 text-black border border-yellow-600' 
                      : 'border border-gray-400 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🖼️ Gallery
                </button>
                <button 
                  onClick={() => setViewMode('360')}
                  disabled={!vehicle.image_360 || vehicle.image_360.length === 0}
                  className={`ml-2 px-3 py-1 rounded text-sm font-medium transition-all ${
                    viewMode === '360' 
                      ? 'bg-blue-500 text-white border border-blue-600' 
                      : !vehicle.image_360 || vehicle.image_360.length === 0
                      ? 'border border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                      : 'border border-gray-400 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🔄 360° View
                </button>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {vehicle.brand.name} {vehicle.model.name} NXT
          </h1>
          <p className="text-lg text-gray-600 mt-1">{vehicle.manufacture_year}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery - Gallery View */}
            {vehicleImages.length > 0 && viewMode === 'gallery' && (
              <div className="bg-white rounded-lg border border-gray-300 overflow-hidden mb-8">
                {/* Main Image */}
                <div className="relative h-80 bg-gray-100 flex items-center justify-center">
                  {vehicleImages[currentImageIndex]?.image_url ? (
                    <img
                      src={vehicleImages[currentImageIndex].image_url}
                      alt={`${vehicle.brand.name} ${vehicle.model.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-car.jpg';
                      }}
                    />
                  ) : (
                    <div className="text-gray-400">No image available</div>
                  )}
                </div>

                {/* Thumbnails */}
                {vehicleImages.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto bg-gray-50">
                    {vehicleImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-24 h-20 rounded overflow-hidden border-2 transition ${
                          currentImageIndex === index ? 'border-yellow-400' : 'border-gray-300'
                        }`}
                      >
                        <img
                          src={image.image_url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-car.jpg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 360 View - 360 Images */}
            {viewMode === '360' && vehicle.image_360 && vehicle.image_360.length > 0 && (
              <div className="mb-8">
                <Image360Viewer 
                  images={vehicle.image_360.map(img => img.image_url)}
                  autoRotate={false}
                  autoRotateSpeed={50}
                  sensitivity={5}
                  height="500px"
                  showControls={true}
                />
              </div>
            )}

            {/* No 360 View Message */}
            {viewMode === '360' && (!vehicle.image_360 || vehicle.image_360.length === 0) && (
              <div className="bg-white rounded-lg border border-gray-300 overflow-hidden mb-8 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4">🔄</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">360° View Not Available</h3>
                  <p className="text-gray-600">No 360-degree images available for this vehicle yet.</p>
                </div>
              </div>
            )}

            {/* Key Specs Grid */}
            <div className="bg-white rounded-lg border border-gray-300 p-6 mb-8">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-red-600 font-semibold text-lg">{vehicle.body_type}</p>
                  <p className="text-gray-600 text-sm">Body</p>
                </div>
                <div>
                  <p className="text-red-600 font-semibold text-lg">{vehicle.fuel_type}</p>
                  <p className="text-gray-600 text-sm">Fuel type</p>
                </div>
                <div>
                  <p className="text-red-600 font-semibold text-lg">{vehicle.engine_capacity || 'N/A'}</p>
                  <p className="text-gray-600 text-sm">Engine</p>
                </div>
                <div>
                  <p className="text-red-600 font-semibold text-lg">{vehicle.transmission}</p>
                  <p className="text-gray-600 text-sm">Transmission</p>
                </div>
              </div>
            </div>

            {/* Additional Specs Grid */}
            <div className="bg-white rounded-lg border border-gray-300 p-6 mb-8">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-gray-900 font-semibold text-lg">{vehicle.manufacture_year}</p>
                  <p className="text-gray-600 text-sm">Year</p>
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-lg">{vehicle.exterior_color || 'N/A'}</p>
                  <p className="text-gray-600 text-sm">Exterior Color</p>
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-lg">{vehicle.country.name}</p>
                  <p className="text-gray-600 text-sm">Country</p>
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-lg">{vehicle.registered_year || 'N/A'}</p>
                  <p className="text-gray-600 text-sm">Registered</p>
                </div>
              </div>
            </div>

            {/* Extra Features Section */}
            {(vehicle.options.length > 0 || vehicle.custom_options.length > 0) && (
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-8">
                <h3 className="text-xl font-bold text-red-600 mb-6">Extra Features</h3>
                <div className="grid grid-cols-3 gap-4">
                  {vehicle.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{option.name}</span>
                    </div>
                  ))}
                  {vehicle.custom_options.map((option) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{option.option_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Our Service Section */}
            {(vehicle.tag_notes || vehicle.special_note_print) && (
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-8">
                <h3 className="text-xl font-bold text-red-600 mb-4">Our Service</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {vehicle.tag_notes || vehicle.special_note_print}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Selling Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-300 p-6 sticky top-6">
              {/* Price */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm font-medium mb-1">Price</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatPrice(vehicle.selling_amount)}
                </p>
              </div>

              {/* Key Specs Vertical */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-300">
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Body</p>
                  <p className="text-red-600 font-semibold">{vehicle.body_type}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Fuel type</p>
                  <p className="text-red-600 font-semibold">{vehicle.fuel_type}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Engine</p>
                  <p className="text-red-600 font-semibold">{vehicle.engine_capacity || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Transmission</p>
                  <p className="text-red-600 font-semibold">{vehicle.transmission}</p>
                </div>
              </div>

              {/* More Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-300">
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Year</p>
                  <p className="text-gray-900 font-semibold">{vehicle.manufacture_year}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Exterior Color</p>
                  <p className="text-gray-900 font-semibold">{vehicle.exterior_color || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Country</p>
                  <p className="text-gray-900 font-semibold">{vehicle.country.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Registered</p>
                  <p className="text-gray-900 font-semibold">{vehicle.registered_year || 'N/A'}</p>
                </div>
              </div>

              {/* Compare Button */}
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded mb-3 transition">
                🔗 Compare
              </button>

              {/* More Info Button */}
              <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded text-sm transition">
                More info 🇱🇰 0117 275 275
              </button>
            </div>
          </div>
        </div>

        {/* Related Vehicles Section - Placeholder */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Related vehicles will be displayed here */}
            <div className="text-gray-500 text-center py-8 col-span-3">
              Related vehicles loading...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
