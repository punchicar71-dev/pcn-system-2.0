'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { RotateCw, Maximize2, Minimize2, Play, Pause, Info } from 'lucide-react'

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
        setLoadedImages(prev => new Set([...prev, index]))
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
    if (isAutoRotating && !isDragging) {
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
    if (!isDragging) return

    const deltaX = e.clientX - dragStartX.current
    const imagesToRotate = Math.floor(Math.abs(deltaX) / sensitivity)

    if (imagesToRotate > 0) {
      if (deltaX > 0) {
        setCurrentImageIndex((prev) => (prev + imagesToRotate) % images.length)
      } else {
        setCurrentImageIndex((prev) => (prev - imagesToRotate + images.length) % images.length)
      }
      dragStartX.current = e.clientX
    }
  }, [isDragging, images.length, sensitivity])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return

    const deltaX = e.touches[0].clientX - dragStartX.current
    const imagesToRotate = Math.floor(Math.abs(deltaX) / sensitivity)

    if (imagesToRotate > 0) {
      if (deltaX > 0) {
        setCurrentImageIndex((prev) => (prev + imagesToRotate) % images.length)
      } else {
        setCurrentImageIndex((prev) => (prev - imagesToRotate + images.length) % images.length)
      }
      dragStartX.current = e.touches[0].clientX
    }
  }, [isDragging, images.length, sensitivity])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove])

  const toggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating)
  }

  const resetRotation = () => {
    setCurrentImageIndex(0)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <p className="text-gray-500">No images available for 360° view</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${className} ${
        isFullscreen ? 'w-screen h-screen' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-sm">
            Loading 360° view... {loadedImages.size}/{images.length}
          </p>
        </div>
      )}

      {/* Help Overlay */}
      {showHelp && !isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg z-20 flex items-center gap-2 animate-pulse">
          <Info className="w-4 h-4" />
          <span className="text-sm">Drag to rotate • Click controls to auto-rotate</span>
        </div>
      )}

      {/* 360° Image */}
      <div
        className={`relative w-full h-full flex items-center justify-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ userSelect: 'none' }}
      >
        <Image
          src={images[currentImageIndex]}
          alt={`360° view - frame ${currentImageIndex + 1}`}
          fill
          className="object-contain"
          draggable={false}
          priority={currentImageIndex === 0}
        />
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
        {currentImageIndex + 1} / {images.length}
      </div>

      {/* 360° Badge */}
      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1">
        <RotateCw className="w-3 h-3" />
        360° VIEW
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
          <button
            onClick={toggleAutoRotate}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
            title={isAutoRotating ? 'Pause rotation' : 'Auto rotate'}
          >
            {isAutoRotating ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={resetRotation}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
            title="Reset to first image"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-white/30 mx-1" />

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div
          className="h-full bg-blue-600 transition-all duration-100"
          style={{ width: `${((currentImageIndex + 1) / images.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
