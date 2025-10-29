'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { RotateCw, Grid3x3, ChevronLeft, ChevronRight } from 'lucide-react'
import Image360Viewer from '@/components/ui/360-viewer'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

interface VehicleImage {
  id: string
  image_url: string
  is_primary?: boolean
  display_order?: number
  image_type?: string
}

interface VehicleImageViewerProps {
  images: VehicleImage[]
  vehicleName?: string
  className?: string
}

type ViewMode = 'carousel' | '360'

export default function VehicleImageViewer({
  images,
  vehicleName = 'Vehicle',
  className = ''
}: VehicleImageViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('carousel')

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg p-12 ${className}`}>
        <div className="text-center">
          <svg
            className="w-24 h-24 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">No images available</p>
        </div>
      </div>
    )
  }

  // Sort images by display order
  const sortedImages = [...images].sort((a, b) => {
    const orderA = a.display_order ?? 999
    const orderB = b.display_order ?? 999
    return orderA - orderB
  })

  const imageUrls = sortedImages.map(img => img.image_url)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">View Mode:</span>
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('carousel')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'carousel'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Gallery
            </button>
            <button
              onClick={() => setViewMode('360')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === '360'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RotateCw className="w-4 h-4" />
              360° View
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </div>
      </div>

      {/* Image Display Area */}
      {viewMode === 'carousel' ? (
        <div className="relative w-full bg-gray-100 p-4 rounded-lg">
          <Carousel className="w-full">
            <CarouselContent className="-ml-3">
              {sortedImages.map((image, index) => (
                <CarouselItem key={image.id} className="pl-3 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-video rounded-lg items-center justify-center p-0 overflow-hidden relative group">
                        <Image
                          src={image.image_url || '/placeholder-car.jpg'}
                          alt={`${vehicleName} - Image ${index + 1}`}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {image.is_primary && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            Primary
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                          {index + 1} / {images.length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-4 mt-4">
              <CarouselPrevious className="relative inset-0 translate-y-0" />
              <CarouselNext className="relative inset-0 translate-y-0" />
            </div>
          </Carousel>
        </div>
      ) : (
        <Image360Viewer
          images={imageUrls}
          autoRotate={false}
          autoRotateSpeed={100}
          sensitivity={8}
          showControls={true}
          height="500px"
        />
      )}

      {/* Additional Info */}
      {viewMode === '360' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How to use 360° View:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• <strong>Drag</strong> left or right to rotate the vehicle</li>
                <li>• Click <strong>Play</strong> button for automatic rotation</li>
                <li>• Use <strong>Fullscreen</strong> for better viewing experience</li>
                <li>• <strong>Reset</strong> button returns to the first image</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
