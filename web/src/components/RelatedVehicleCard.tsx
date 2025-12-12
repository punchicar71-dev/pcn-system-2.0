'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export interface RelatedVehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuelType: string;
  transmission: string;
  imageUrl?: string;
  images: Array<{ id: string; image_url: string; display_order: number }>;
  daysAgo: number;
}

interface RelatedVehicleCardProps {
  vehicle: RelatedVehicle;
}

export default function RelatedVehicleCard({ vehicle }: RelatedVehicleCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Get all images
  const allImages = vehicle.images && vehicle.images.length > 0
    ? vehicle.images.map(img => img.image_url)
    : (vehicle.imageUrl ? [vehicle.imageUrl] : []);

  // Auto-play functionality with loop
  useEffect(() => {
    if (allImages.length <= 1 || isHovering) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [allImages.length, isHovering]);

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
    <Link href={`/vehicles/${vehicle.id}`} className="block w-full lg:w-[calc(33.333%-1rem)]">
      <div className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer max-w-md mx-auto lg:max-w-none">
        {/* Image Section with Auto-play Carousel */}
        <div 
          className="relative h-[180px] sm:h-[200px] bg-gray-100 overflow-hidden group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {allImages.length > 0 ? (
            <>
              {/* Time Badge */}
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 bg-gray-100 text-gray-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-medium">
                {vehicle.daysAgo === 0 ? 'Today' : vehicle.daysAgo === 1 ? '1 day a go' : `${vehicle.daysAgo} day a go`}
              </div>

              {/* Images Container */}
              <div className="w-full h-full relative">
                {allImages.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`${vehicle.name} - Image ${index + 1}`}
                    className={`absolute w-full h-full object-cover transition-opacity duration-500 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-car.jpg';
                    }}
                  />
                ))}
              </div>

              {/* Dot Indicators */}
              {allImages.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-1.5 z-20">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-yellow-400 w-5 sm:w-6 h-1.5 sm:h-2'
                          : 'bg-white w-1.5 sm:w-2 h-1.5 sm:h-2'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-sm">Waiting For Images...</span>
            </div>
          )}
        </div>

        {/* Vehicle Details */}
        <div className="p-3 sm:p-4">
          {/* Title and Year */}
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-0.5 sm:mb-1 line-clamp-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">{vehicle.year}</p>

          {/* Price */}
          <p className="text-xl sm:text-2xl font-semibold text-green-600 mb-3 sm:mb-4">
            Rs. {vehicle.price.toLocaleString().replace(/,/g, ' ')}
          </p>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Fuel Type</p>
              <p className="text-xs sm:text-sm font-semibold text-red-500 line-clamp-1">{vehicle.fuelType}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Transmission</p>
              <p className="text-xs sm:text-sm font-semibold text-red-500 line-clamp-1">{vehicle.transmission}</p>
            </div>
          </div>

          {/* View Details Button */}
          <button className="w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-md transition-colors duration-200 text-sm sm:text-base">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}

export function RelatedVehicleCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="h-[180px] sm:h-[200px] w-full" />

      {/* Details Skeleton */}
      <div className="p-3 sm:p-4">
        {/* Title Skeleton */}
        <Skeleton className="h-5 sm:h-6 w-3/4 mb-1 sm:mb-2" />
        
        {/* Year Skeleton */}
        <Skeleton className="h-4 sm:h-5 w-1/4 mb-3 sm:mb-4" />
        
        {/* Price Skeleton */}
        <Skeleton className="h-6 sm:h-7 w-2/3 mb-3 sm:mb-4" />
        
        {/* Fuel Type and Transmission Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-16 mb-1 sm:mb-2" />
            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
          </div>
          <div>
            <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20 mb-1 sm:mb-2" />
            <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
          </div>
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-9 sm:h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
