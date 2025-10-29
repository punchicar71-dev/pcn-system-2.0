'use client'

import React, { useState } from 'react'
import Image360Viewer from '@/components/ui/360-viewer'
import { Upload, X, Plus } from 'lucide-react'

export default function Test360ViewerPage() {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [autoRotate, setAutoRotate] = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(50)
  const [sensitivity, setSensitivity] = useState(8)

  // Demo images (you can replace these with your own)
  const demoImages = [
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=800',
  ]

  const handleAddUrl = () => {
    if (newUrl.trim()) {
      setImageUrls([...imageUrls, newUrl.trim()])
      setNewUrl('')
    }
  }

  const handleLoadDemo = () => {
    setImageUrls(demoImages)
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    setImageUrls([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            360° Image Viewer - Test Page
          </h1>
          <p className="text-gray-600">
            Test and configure the 360° image viewer component with your own images
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Management */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Image Management
              </h2>

              <div className="space-y-4">
                {/* Add Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={handleAddUrl}
                      disabled={!newUrl.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Demo Images Button */}
                <button
                  onClick={handleLoadDemo}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  Load Demo Images
                </button>

                {/* Image List */}
                {imageUrls.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Images ({imageUrls.length})
                      </label>
                      <button
                        onClick={handleClearAll}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                      {imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                        >
                          <span className="text-xs text-gray-500 font-mono w-6">
                            {index + 1}
                          </span>
                          <span className="flex-1 text-sm text-gray-700 truncate">
                            {url}
                          </span>
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Viewer Settings
              </h2>

              <div className="space-y-4">
                {/* Auto Rotate */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRotate}
                      onChange={(e) => setAutoRotate(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Auto Rotate
                    </span>
                  </label>
                </div>

                {/* Rotation Speed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation Speed: {rotationSpeed}ms
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={rotationSpeed}
                    onChange={(e) => setRotationSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>

                {/* Drag Sensitivity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drag Sensitivity: {sensitivity}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>High</span>
                    <span>Low</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Quick Tips
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Add multiple image URLs to test 360° rotation</li>
                <li>• Drag the image left/right to rotate</li>
                <li>• Use controls to auto-rotate and fullscreen</li>
                <li>• Best with 24-36 images for smooth rotation</li>
              </ul>
            </div>
          </div>

          {/* Viewer Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Preview
              </h2>

              {imageUrls.length > 0 ? (
                <Image360Viewer
                  images={imageUrls}
                  autoRotate={autoRotate}
                  autoRotateSpeed={rotationSpeed}
                  sensitivity={sensitivity}
                  showControls={true}
                  height="600px"
                />
              ) : (
                <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-12 min-h-[600px]">
                  <Upload className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No Images Added
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-md">
                    Add image URLs above or click "Load Demo Images" to test the 360° viewer.
                    You need at least one image to start.
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            {imageUrls.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {imageUrls.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Images</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(360 / imageUrls.length)}°
                  </div>
                  <div className="text-sm text-gray-600">Per Image</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {autoRotate ? `${(1000 / rotationSpeed).toFixed(1)}` : '0'}
                  </div>
                  <div className="text-sm text-gray-600">Frames/Second</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
