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
    <div className="bg-gray-50 rounded-[15px]  border border-gray-300 overflow-hidden hover:shadow-lg transition-shadow duration-200 relative">
      {/* Availability Badge */}
      <div className="absolute top-3 right-3 z-10 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ">
        Available
      </div>

      {/* Vehicle Card with horizontal layout */}
      <div className="flex">
        {/* Image Section with Auto-play Slider */}
        <div 
          className="relative w-72 h-52 bg-gray-50 flex-shrink-0 p-2  overflow-hidden group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Image Carousel */}
          <div className="relative w-full h-full">
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

                {/* Navigation Arrows - Show on hover */}
                {allImages.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                      aria-label="Previous image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                      aria-label="Next image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </>
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
          </div>
          
          {/* Dot Indicators at bottom - Only show if multiple images */}
          {allImages.length > 1 && (
            <div className="absolute bottom-2 pb-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-yellow-400 w-4'
                      : 'bg-white opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Single Image Indicator */}
          {allImages.length === 1 && (
            <div className="absolute bottom-2 left-1/2  transform -translate-x-1/2 flex space-x-1 z-20">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            </div>
          )}

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute top-3  left-3 z-20 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Top section with title and days ago */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[24px] font-semibold text-gray-900 mb-1">
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
            <p className="text-[18px] font-semibold text-green-600">
              {formatPrice(vehicle.price)}
            </p>
          </div>

          {/* Bottom section with specs and button */}
          <div className="flex justify-between ">
            {/* Vehicle Specifications */}
            <div className="flex gap-8 ">
              <div>
                <p className="text-gray-500 text-xs mb-1">Fuel Type:</p>
                <p className="text-blue-600 text-[16px] font-medium">{vehicle.fuelType}</p>
              </div>
              <Separator orientation="vertical" />
              <div>
                <p className="text-gray-500 text-xs mb-1">Mileage:</p>
                <p className="text-blue-600 text-[16px] font-medium">{vehicle.mileage?.toLocaleString()} km</p>
              </div>
            </div>
            
            {/* View Details Button */}
            <Link
              href={`/vehicles/${vehicle.id}`}
              className="px-4 py-3 flex bg-gray-900 item-center text-white font-medium rounded-full  hover:bg-yellow-500 hover:text-black transition-colors duration-200 text-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}