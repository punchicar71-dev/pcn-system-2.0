'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { RotateCw, Maximize2, Minimize2, Play, Pause } from 'lucide-react'

interface Image360ViewerProps {
  images: string[]
  autoRotate?: boolean
  autoRotateSpeed?: number
  sensitivity?: number
  className?: string
  showControls?: boolean
  height?: string
}

export default function Image360Viewer({
  images,
  autoRotate = false,
  autoRotateSpeed = 50,
  sensitivity = 5,
  className = '',
  showControls = true,
  height = '500px'
}: Image360ViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHelp, setShowHelp] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const autoRotateInterval = useRef<NodeJS.Timeout | null>(null)

  // Preload images
  useEffect(() => {
    images.forEach((src, index) => {
      const img = new window.Image()
      img.src = src
      img.onload = () => {
        setLoadedImages(prev => {
          const newSet = new Set(prev)
          newSet.add(index)
          return newSet
        })
      }
      img.onerror = () => {
        console.error(`Failed to load image ${index}: ${src}`)
        setLoadedImages(prev => {
          const newSet = new Set(prev)
          newSet.add(index)
          return newSet
        })
      }
    })
  }, [images])

  // Check if all images are loaded
  useEffect(() => {
    if (loadedImages.size === images.length && images.length > 0) {
      setIsLoading(false)
    }
  }, [loadedImages, images.length])

  // Hide help message after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelp(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-rotate functionality
  useEffect(() => {
    if (isAutoRotating && !isDragging && images.length > 0) {
      autoRotateInterval.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      }, autoRotateSpeed)
    } else if (autoRotateInterval.current) {
      clearInterval(autoRotateInterval.current)
      autoRotateInterval.current = null
    }

    return () => {
      if (autoRotateInterval.current) {
        clearInterval(autoRotateInterval.current)
      }
    }
  }, [isAutoRotating, isDragging, images.length, autoRotateSpeed])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragStartX.current = e.clientX
    setIsAutoRotating(false)
    setShowHelp(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    dragStartX.current = e.touches[0].clientX
    setIsAutoRotating(false)
    setShowHelp(false)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || images.length === 0) return

    const deltaX = e.clientX - dragStartX.current
    const imagesToRotate = Math.floor(Math.abs(deltaX) / sensitivity)

    if (imagesToRotate > 0) {
      const direction = deltaX > 0 ? 1 : -1
      setCurrentImageIndex(
        (prev) => (prev + direction * imagesToRotate + images.length * 100) % images.length
      )
      dragStartX.current = e.clientX
    }
  }, [isDragging, images.length, sensitivity])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || images.length === 0) return

    const deltaX = e.touches[0].clientX - dragStartX.current
    const imagesToRotate = Math.floor(Math.abs(deltaX) / sensitivity)

    if (imagesToRotate > 0) {
      const direction = deltaX > 0 ? 1 : -1
      setCurrentImageIndex(
        (prev) => (prev + direction * imagesToRotate + images.length * 100) % images.length
      )
      dragStartX.current = e.touches[0].clientX
    }
  }, [isDragging, images.length, sensitivity])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleMouseMove, handleTouchMove])

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true)
        })
      } else {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false)
        })
      }
    }
  }

  if (images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <RotateCw className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No 360° images available</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden select-none ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Main Image Display */}
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900 cursor-grab active:cursor-grabbing">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white text-sm">Loading 360° view...</p>
          </div>
        ) : (
          <img
            src={images[currentImageIndex]}
            alt={`360 View ${currentImageIndex + 1} of ${images.length}`}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-car.jpg'
            }}
          />
        )}

        {/* Help Text */}
        {showHelp && !isLoading && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm pointer-events-none animate-pulse">
            Drag to rotate 🖱️
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-medium">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          {/* Auto Rotate Button */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded transition-all"
            title={isAutoRotating ? 'Pause auto-rotate' : 'Start auto-rotate'}
          >
            {isAutoRotating ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={() => setCurrentImageIndex(0)}
            className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded transition-all"
            title="Reset to first image"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded transition-all"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      )}

      {/* Thumbnail Strip (Optional - commented for now) */}
      {/* Show image grid indicator */}
      <div className="absolute bottom-16 left-4 right-4 flex justify-center gap-1 flex-wrap max-w-[200px]">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              index === currentImageIndex ? 'bg-yellow-400 scale-125' : 'bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
