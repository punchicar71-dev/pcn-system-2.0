'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { VehicleCardData } from '@/lib/types';
import { Separator } from "@/components/ui/separator"

interface VehicleCardProps {
  vehicle: VehicleCardData;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Get all images from vehicle object
  const allImages = vehicle.images && vehicle.images.length > 0
    ? vehicle.images.map(img => img.image_url)
    : (vehicle.imageUrl ? [vehicle.imageUrl] : []);

  // Auto-play functionality
  useEffect(() => {
    if (allImages.length <= 1 || isHovering) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [allImages.length, isHovering]);

  const formatPrice = (price: number) => {
    // Format like "Rs. 5 490 000" with spaces
    return `Rs. ${price.toLocaleString().replace(/,/g, ' ')}`;
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  return (
    <div className="bg-white rounded-[12px] border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 relative">
      {/* Vehicle Card with horizontal layout on desktop/tablet, vertical on mobile */}
      <div className="flex flex-col lg:flex-row">
        {/* Image Section with Auto-play Slider */}
        <div 
          className="relative w-full lg:w-[340px] h-[250px] lg:h-[240px] bg-gray-50 flex-shrink-0 overflow-hidden group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Image Carousel */}
          <div className="relative w-full h-full p-3 lg:p-3">
            {allImages.length > 0 ? (
              <>
                {/* Images Container */}
                <div className="w-full h-full relative">
                  {allImages.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`${vehicle.name} - Image ${index + 1}`}
                      className={`absolute w-full h-full object-cover rounded-[10px] transition-opacity duration-500 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              // Placeholder car image
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-[10px]">
                <svg
                  className="w-20 h-20 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v7c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-7l-1.92-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
            )}
          </div>
          
          {/* Dot Indicators at bottom - Only show if multiple images */}
          {allImages.length > 1 && (
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-yellow-400 w-4'
                      : 'bg-white w-2 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Single Image Indicator */}
          {allImages.length === 1 && (
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 lg:p-5 flex flex-col justify-between">
          {/* Top section with title and days ago */}
          <div className="flex justify-between items-start mb-3 lg:mb-3">
            <div className="flex-1">
              <h3 className="text-[22px] lg:text-[24px] font-semibold text-gray-900 mb-1.5 lg:mb-2 leading-tight">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-base lg:text-[16px] text-gray-600">{vehicle.year}</p>
            </div>
            {vehicle.daysAgo && (
              <span className="text-gray-400 text-sm lg:text-base whitespace-nowrap ml-3">
                {vehicle.daysAgo} day{vehicle.daysAgo !== 1 ? 's' : ''} ago
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mb-5 lg:mb-6">
            <p className="text-2xl lg:text-[24px] font-semibold text-green-600">
              {formatPrice(vehicle.price)}
            </p>
          </div>

          {/* Bottom section with specs and button */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-6 mt-auto">
            {/* Vehicle Specifications */}
            <div className="flex items-center gap-6 lg:gap-8">
              <div>
                <p className="text-gray-500 text-sm lg:text-[14px] mb-1.5">Fuel Type</p>
                <p className="text-[#C2185B] text-[16px] lg:text-[16px] font-semibold">{vehicle.fuelType}</p>
              </div>
              <Separator orientation="vertical" className="h-12 hidden lg:block" />
              <div>
                <p className="text-gray-500 text-sm lg:text-[14px] mb-1.5">Transmission</p>
                <p className="text-[#C2185B] text-[16px] lg:text-[16px] font-semibold">{vehicle.transmission}</p>
              </div>
            </div>
            
            {/* View Details Button */}
            <Link
              href={`/vehicles/${vehicle.id}`}
              className="px-4 lg:px-4 py-3 lg:py-3 flex lg:w-auto sm:w-[150px] justify-center bg-[#E4002B] items-center text-white font-semibold rounded-[8px] hover:bg-red-700 transition-colors duration-200 text-base lg:text-[16px] shadow-md hover:shadow-lg active:shadow-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}