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
    <Link href={`/vehicles/${vehicle.id}`}>
      <div className="flex-1 w-[300px] bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* Image Section with Auto-play Carousel */}
        <div 
          className="relative h-48 bg-gray-200 overflow-hidden group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {allImages.length > 0 ? (
            <>
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

              {/* Navigation Arrows - Show on hover */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                    aria-label="Previous image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

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

              {/* Dot Indicators */}
              {allImages.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
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
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">Waiting For Images... </span>
            </div>
          )}
        </div>

        {/* Vehicle Details */}
        <div className="p-4 ">
          <h3 className="text-[24px] font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</h3>
          <p className="text-[20px] text-gray-600">{vehicle.year}</p>
          <p className="text-[15px] text-gray-400 py-4">
            {vehicle.daysAgo === 1 ? 'Today' : `${vehicle.daysAgo} days ago`}
          </p>
          <p className="text-[24px] font-semibold text-gray-900 mb-3">
            Rs. {vehicle.price.toLocaleString()}
          </p>
          <div className="border-t border-gray-200 pt-3 flex text-sm mb-4">
            <div className='w-[50%] justify-start'>
              <p className="text-gray-600 font-base pb-2 text-xs">Fuel Type</p>
              <p className="font-semibold text-gray-900">{vehicle.fuelType}</p>
            </div>
            
            <div className='w-[50%] justify-start border-l border-gray-200 pl-4'>
              <p className="text-gray-600 pb-2 font-base text-xs">Transmission</p>
              <p className="font-semibold text-gray-900">{vehicle.transmission}</p>
            </div>
          </div>

          {/* View Detail Button */}
          <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            <span>View Details</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}

export function RelatedVehicleCardSkeleton() {
  return (
    <div className="flex-1 w-[300px] bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="h-48 w-full rounded-t-lg" />

      {/* Details Skeleton */}
      <div className="p-4">
        {/* Title Skeleton */}
        <Skeleton className="h-7 w-3/4 mb-2" />
        
        {/* Year Skeleton */}
        <Skeleton className="h-6 w-1/3 mb-4" />
        
        {/* Days Ago Skeleton */}
        <Skeleton className="h-4 w-1/2 mb-4" />
        
        {/* Price Skeleton */}
        <Skeleton className="h-7 w-2/3 mb-3" />
        
        {/* Fuel Type and Transmission Skeleton */}
        <div className="border-t border-gray-200 pt-3 flex text-sm mb-4">
          <div className='w-[50%] justify-start'>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-5 w-20" />
          </div>
          
          <div className='w-[50%] justify-start border-l border-gray-200 pl-4'>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
