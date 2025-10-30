'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Cloud } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { saveImage, getAllVehicleImages, deleteImage, isS3Enabled, type StorageImage } from '@/lib/hybrid-storage'

interface VehicleImageUploadModalProps {
  vehicleId: string
  vehicleName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ImageState {
  current: string | null
  preview: string | null
  selectedFile: File | null
}

export default function VehicleImageUploadModal({
  vehicleId,
  vehicleName,
  isOpen,
  onClose,
  onSuccess,
}: VehicleImageUploadModalProps) {
  const [vehicleImages, setVehicleImages] = useState<ImageState>({
    current: null,
    preview: null,
    selectedFile: null,
  })

  const [images360, setImages360] = useState<ImageState>({
    current: null,
    preview: null,
    selectedFile: null,
  })

  const [crPaperImages, setCrPaperImages] = useState<ImageState>({
    current: null,
    preview: null,
    selectedFile: null,
  })

  const [loading, setLoading] = useState(false)
  const [s3Enabled, setS3Enabled] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState<'vehicle' | '360' | 'cr' | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadImagesFromStorage()
      checkS3Status()
    }
  }, [isOpen, vehicleId])

  const checkS3Status = async () => {
    const enabled = await isS3Enabled()
    setS3Enabled(enabled)
  }

  const loadImagesFromStorage = async () => {
    try {
      const images = await getAllVehicleImages(vehicleId)
      
      // Load gallery image (primary one)
      if (images.gallery && images.gallery.length > 0) {
        const primaryImage = images.gallery.find(img => img.isPrimary) || images.gallery[0]
        setVehicleImages({
          current: primaryImage.url,
          preview: null,
          selectedFile: null,
        })
      }

      // Load 360 image
      if (images.image360 && images.image360.length > 0) {
        setImages360({
          current: images.image360[0].url,
          preview: null,
          selectedFile: null,
        })
      }

      // Load CR paper image
      if (images.crPaper && images.crPaper.length > 0) {
        setCrPaperImages({
          current: images.crPaper[0].url,
          preview: null,
          selectedFile: null,
        })
      }
    } catch (error) {
      console.error('Error loading images from storage:', error)
    }
  }

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'vehicle' | '360' | 'cr'
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const previewUrl = reader.result as string
        if (type === 'vehicle') {
          setVehicleImages(prev => ({
            ...prev,
            preview: previewUrl,
            selectedFile: file,
          }))
        } else if (type === '360') {
          setImages360(prev => ({
            ...prev,
            preview: previewUrl,
            selectedFile: file,
          }))
        } else {
          setCrPaperImages(prev => ({
            ...prev,
            preview: previewUrl,
            selectedFile: file,
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async (type: 'vehicle' | '360' | 'cr') => {
    const imageState = type === 'vehicle' ? vehicleImages : type === '360' ? images360 : crPaperImages

    if (!imageState.selectedFile) {
      alert('Please select an image first')
      return
    }

    try {
      setLoading(true)

      // Map type to imageType
      const imageType = type === 'vehicle' ? 'gallery' : type === '360' ? 'image_360' : 'cr_paper'
      
      // Use hybrid storage (automatically uses S3 if available, otherwise localStorage)
      const result = await saveImage(
        imageState.selectedFile,
        vehicleId,
        imageType,
        0,
        type === 'vehicle' // Only gallery images can be primary
      )

      if (result) {
        // Update UI with uploaded image
        if (type === 'vehicle') {
          setVehicleImages({
            current: result.url,
            preview: null,
            selectedFile: null,
          })
        } else if (type === '360') {
          setImages360({
            current: result.url,
            preview: null,
            selectedFile: null,
          })
        } else {
          setCrPaperImages({
            current: result.url,
            preview: null,
            selectedFile: null,
          })
        }

        alert(`Image uploaded successfully to S3 ☁️`)
        onSuccess?.()
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image to S3';
      alert(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveImage = async (type: 'vehicle' | '360' | 'cr') => {
    try {
      setLoading(true)
      
      // Map type to imageType
      const imageType = type === 'vehicle' ? 'gallery' : type === '360' ? 'image_360' : 'cr_paper'
      
      // Get all images and find the one to delete
      const images = await getAllVehicleImages(vehicleId)
      const imageArray = imageType === 'gallery' ? images.gallery : 
                        imageType === 'image_360' ? images.image360 : 
                        images.crPaper
      
      if (imageArray && imageArray.length > 0) {
        // Delete all images of this type for the vehicle
        for (const img of imageArray) {
          await deleteImage(vehicleId, img.id, imageType)
        }
      }

      // Clear UI
      if (type === 'vehicle') {
        setVehicleImages({ current: null, preview: null, selectedFile: null })
      } else if (type === '360') {
        setImages360({ current: null, preview: null, selectedFile: null })
      } else {
        setCrPaperImages({ current: null, preview: null, selectedFile: null })
      }

      setRemoveConfirm(null)
      alert('Image removed successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error removing image:', error)
      alert('Failed to remove image')
    } finally {
      setLoading(false)
    }
  }

  const renderImageSection = (
    title: string,
    type: 'vehicle' | '360' | 'cr',
    imageState: ImageState
  ) => {
    const inputId = `image-upload-${type}`

    return (
      <div className="space-y-3 border-b pb-6 last:border-b-0">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>

        {imageState.current && !imageState.preview && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600">Current Images</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden group">
                <img
                  src={imageState.current}
                  alt="Current"
                  className="w-full h-24 object-cover"
                />
                <button
                  onClick={() => setRemoveConfirm(type)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {imageState.preview ? (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">Preview</p>
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={imageState.preview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (type === 'vehicle') {
                    setVehicleImages({ ...vehicleImages, preview: null, selectedFile: null })
                  } else if (type === '360') {
                    setImages360({ ...images360, preview: null, selectedFile: null })
                  } else {
                    setCrPaperImages({ ...crPaperImages, preview: null, selectedFile: null })
                  }
                }}
                className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Choose Different
              </button>
              <button
                onClick={() => handleUpload(type)}
                disabled={loading}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-black rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Uploading...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, type)}
              className="hidden"
              id={inputId}
            />
            <label htmlFor={inputId} className="cursor-pointer space-y-2 block">
              <Upload className="w-6 h-6 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">Drop file here</p>
              <p className="text-xs text-gray-500">Or</p>
            </label>
            <button
              type="button"
              onClick={() => document.getElementById(inputId)?.click()}
              className="mt-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Choose files
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle>Vehicle Image Uploader</DialogTitle>
              <p className="text-sm text-gray-600 mt-2 bg-gray-100 px-3 py-2 rounded w-fit">
                {vehicleName}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Storage Status Indicator */}
        <div className="flex items-center gap-2 px-6 py-2 bg-blue-50 border-b border-blue-100">
          <Cloud className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Cloud Storage (AWS S3)</span>
          {s3Enabled ? (
            <span className="ml-auto text-xs text-green-600 font-medium">● Active</span>
          ) : (
            <span className="ml-auto text-xs text-red-600 font-medium">● Not Configured</span>
          )}
        </div>

        <div className="space-y-6 py-4">
          {renderImageSection('Vehicle Image Upload', 'vehicle', vehicleImages)}
          {renderImageSection('360 Image Upload', '360', images360)}
          {renderImageSection('CR Image / Vehicle Pepars', 'cr', crPaperImages)}
        </div>

        {removeConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Image?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this image? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRemoveConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveImage(removeConfirm)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
          >
            Update
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
