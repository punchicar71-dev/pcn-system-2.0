'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { VehicleCardData } from '@/lib/types';
import { Separator } from "@/components/ui/separator"

interface LatestVehicleCardProps {
  vehicle: VehicleCardData;
}

export default function LatestVehicleCard({ vehicle }: LatestVehicleCardProps) {
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
    }, 3000);

    return () => clearInterval(interval);
  }, [allImages.length, isHovering]);

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString().replace(/,/g, ' ')}`;
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const getTimeAgo = (daysAgo?: number) => {
    if (!daysAgo) return '';
    if (daysAgo === 0) return 'today';
    if (daysAgo === 1) return '1 day a go';
    if (daysAgo < 7) return `${daysAgo} day a go`;
    const weeks = Math.floor(daysAgo / 7);
    return weeks === 1 ? '1 week a go' : `${weeks} week a go`;
  };

  return (
    <Link href={`/vehicles/${vehicle.id}`}>
      <div className="bg-white rounded-[12px] border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image Section */}
        <div 
          className="relative w-full h-[160px] bg-gray-50 overflow-hidden group"
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
                  />
                ))}
              </div>

              {/* Dot Indicators */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleDotClick(e, index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-yellow-400 w-4'
                        : 'bg-white opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <svg className="w-20 h-20 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v7c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-7l-1.92-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3">
          {/* Vehicle Name and Year */}
          <div className="mb-3">
            <h3 className="text-[20px] font-semibold text-gray-900 mb-1">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-gray-600 text-[16px]">{vehicle.year}</p>
          </div>

          {/* Time Ago */}
          {vehicle.daysAgo !== undefined && (
            <p className="text-gray-400 text-sm mb-3">
              {getTimeAgo(vehicle.daysAgo)}
            </p>
          )}

          {/* Price */}
          <div className="mb-4">
            <p className="text-[24px] font-semibold text-green-600">
              {formatPrice(vehicle.price)}
            </p>
          </div>

          {/* Specifications */}
          <div className="flex gap-1">
            <div className='bg-gray-100 p-2 rounded w-1/2'>
              <p className="text-gray-500 text-xs mb-1">Fuel Type</p>
              <p className="text-[#E4002B] text-[14px] font-medium">{vehicle.fuelType}</p>
            </div>
            <Separator orientation="vertical" className='' />
            <div className='bg-gray-100 p-2 rounded w-1/2'>
              <p className="text-gray-500 text-xs mb-1">Transmission</p>
              <p className="text-[#E4002B] text-[14px] font-medium">{vehicle.transmission}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
