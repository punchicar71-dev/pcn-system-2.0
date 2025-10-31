'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase-client'
import { saveImage, deleteImage } from '@/lib/hybrid-storage'
import Image from 'next/image'

interface VehicleImageUploadModalProps {
  vehicleId: string | null
  vehicleInfo: {
    brand: string
    model: string
    year: number
    vehicleNumber: string
  } | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface VehicleImage {
  id: string
  vehicle_id: string
  image_url: string
  s3_key: string | null
  image_type: 'gallery' | 'image_360' | 'cr_paper'
  is_primary: boolean
  display_order: number
  created_at: string
}

interface UploadProgress {
  type: 'gallery' | 'image_360' | 'cr_paper'
  fileName: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export default function VehicleImageUploadModal({
  vehicleId,
  vehicleInfo,
  isOpen,
  onClose,
  onSuccess,
}: VehicleImageUploadModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [galleryImages, setGalleryImages] = useState<VehicleImage[]>([])
  const [image360s, setImage360s] = useState<VehicleImage[]>([])
  const [crPapers, setCrPapers] = useState<VehicleImage[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [s3Status, setS3Status] = useState<{ configured: boolean; checked: boolean }>({ 
    configured: false, 
    checked: false 
  })

  // Check S3 status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkS3Configuration()
    }
  }, [isOpen])

  const checkS3Configuration = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${API_URL}/api/upload/status`)
      const data = await response.json()
      console.log('🔍 S3 Configuration Status:', data)
      setS3Status({ configured: data.s3Configured, checked: true })
      
      if (!data.s3Configured) {
        console.warn('⚠️ AWS S3 is not configured on the server!')
      }
    } catch (error) {
      console.error('❌ Error checking S3 status:', error)
      setS3Status({ configured: false, checked: true })
    }
  }

  // Fetch images when modal opens
  useEffect(() => {
    if (isOpen && vehicleId) {
      fetchImages()
    }
  }, [isOpen, vehicleId])

  const fetchImages = async () => {
    if (!vehicleId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('vehicle_images')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('display_order', { ascending: true })

      if (error) throw error

      if (data) {
        const gallery = data.filter((img) => img.image_type === 'gallery')
        const img360 = data.filter((img) => img.image_type === 'image_360')
        const cr = data.filter((img) => img.image_type === 'cr_paper')

        setGalleryImages(gallery)
        setImage360s(img360)
        setCrPapers(cr)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (
    files: FileList | null,
    imageType: 'gallery' | 'image_360' | 'cr_paper'
  ) => {
    if (!files || !vehicleId) {
      console.error('❌ No files or vehicleId:', { files: !!files, vehicleId });
      return
    }

    const fileArray = Array.from(files)

    for (const file of fileArray) {
      // Add to upload progress
      const progressItem: UploadProgress = {
        type: imageType,
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      }
      setUploadProgress((prev) => [...prev, progressItem])

      try {
        // Get current count for display order
        let currentCount = 0
        if (imageType === 'gallery') currentCount = galleryImages.length
        else if (imageType === 'image_360') currentCount = image360s.length
        else if (imageType === 'cr_paper') currentCount = crPapers.length

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('🔄 Starting upload process')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('File:', file.name)
        console.log('Type:', imageType)
        console.log('Vehicle ID:', vehicleId)
        console.log('Display Order:', currentCount)

        // Upload to S3 via hybrid storage
        const storageImage = await saveImage(
          file,
          vehicleId,
          imageType,
          currentCount,
          currentCount === 0 && imageType === 'gallery'
        )

        if (!storageImage) {
          throw new Error('Failed to upload image to S3 - No storage image returned')
        }

        console.log('✅ S3 upload successful:', storageImage.url)
        console.log('🔑 S3 Key:', storageImage.s3Key)

        // Save to database
        console.log('💾 Saving to database...')
        const { data, error } = await supabase
          .from('vehicle_images')
          .insert({
            vehicle_id: vehicleId,
            file_name: storageImage.fileName,
            image_url: storageImage.url,
            s3_key: storageImage.s3Key,
            image_type: imageType,
            is_primary: storageImage.isPrimary,
            display_order: storageImage.displayOrder,
          })
          .select()
          .single()

        if (error) {
          console.error('❌ Database error:', error)
          throw new Error(`Database error: ${error.message}`)
        }

        console.log('✅ Database save successful')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        // Update state with new image
        if (imageType === 'gallery') {
          setGalleryImages((prev) => [...prev, data])
        } else if (imageType === 'image_360') {
          setImage360s((prev) => [...prev, data])
        } else if (imageType === 'cr_paper') {
          setCrPapers((prev) => [...prev, data])
        }

        // Update progress to success
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileName === file.name && p.type === imageType
              ? { ...p, progress: 100, status: 'success' }
              : p
          )
        )
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ UPLOAD FAILED')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('File:', file.name)
        console.error('Error:', error)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        console.error('Error message:', errorMessage)
        
        // Update progress to error
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileName === file.name && p.type === imageType
              ? {
                  ...p,
                  status: 'error',
                  error: errorMessage,
                }
              : p
          )
        )
      }
    }

    // Don't clear progress immediately - let user see the results
    setTimeout(() => {
      setUploadProgress((prev) => prev.filter(p => p.status === 'uploading'))
    }, 5000)
  }

  const handleDeleteImage = async (image: VehicleImage) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    setDeleteLoading(image.id)
    try {
      // Delete from S3 if s3_key exists
      if (image.s3_key && vehicleId) {
        await deleteImage(vehicleId, image.id, image.image_type, image.s3_key)
      }

      // Delete from database
      const { error } = await supabase
        .from('vehicle_images')
        .delete()
        .eq('id', image.id)

      if (error) throw error

      // Update state
      if (image.image_type === 'gallery') {
        setGalleryImages((prev) => prev.filter((img) => img.id !== image.id))
      } else if (image.image_type === 'image_360') {
        setImage360s((prev) => prev.filter((img) => img.id !== image.id))
      } else if (image.image_type === 'cr_paper') {
        setCrPapers((prev) => prev.filter((img) => img.id !== image.id))
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image. Please try again.')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleClose = () => {
    onClose()
    onSuccess()
  }

  if (!vehicleInfo) return null

  if (!vehicleInfo) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Vehicle Image Uploader</DialogTitle>
        </DialogHeader>

        {/* Vehicle Info */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="text-gray-700 font-medium">
            {vehicleInfo.brand} {vehicleInfo.model} {vehicleInfo.year} - {vehicleInfo.vehicleNumber}
          </p>
        </div>

        {/* S3 Configuration Warning */}
        {s3Status.checked && !s3Status.configured && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">AWS S3 Not Configured</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Image uploads require AWS S3 to be configured. Please set the following environment variables in your API server:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>AWS_REGION</li>
                    <li>AWS_ACCESS_KEY_ID</li>
                    <li>AWS_SECRET_ACCESS_KEY</li>
                    <li>AWS_S3_BUCKET_NAME</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Vehicle Image Upload */}
            <div>
              <h3 className="text-base font-semibold mb-3">Vehicle Image Upload</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <div className="space-y-2">
                  <p className="text-gray-600">Drop file here</p>
                  <p className="text-gray-400 text-sm">Or</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Choose files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        handleFileUpload(e.target.files, 'gallery')
                        e.target.value = '' // Reset input
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Current Gallery Images */}
              {galleryImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {galleryImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={image.image_url}
                            alt="Vehicle"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteImage(image)}
                          disabled={deleteLoading === image.id}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleteLoading === image.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 360 Image Upload */}
            <div>
              <h3 className="text-base font-semibold mb-3">360 Image Upload</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <div className="space-y-2">
                  <p className="text-gray-600">Drop file here</p>
                  <p className="text-gray-400 text-sm">Or</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Choose files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        handleFileUpload(e.target.files, 'image_360')
                        e.target.value = '' // Reset input
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Current 360 Images */}
              {image360s.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {image360s.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={image.image_url}
                            alt="360 View"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteImage(image)}
                          disabled={deleteLoading === image.id}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleteLoading === image.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CR Image / Vehicle Papers */}
            <div>
              <h3 className="text-base font-semibold mb-3">CR Image / Vehicle Pepars</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <div className="space-y-2">
                  <p className="text-gray-600">Drop file here</p>
                  <p className="text-gray-400 text-sm">Or</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Choose files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        handleFileUpload(e.target.files, 'cr_paper')
                        e.target.value = '' // Reset input
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Current CR Papers */}
              {crPapers.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {crPapers.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={image.image_url}
                            alt="CR Paper"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteImage(image)}
                          disabled={deleteLoading === image.id}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleteLoading === image.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">Upload Progress</h4>
                  {uploadProgress.some(p => p.status === 'error') && (
                    <button
                      onClick={() => setUploadProgress(prev => prev.filter(p => p.status !== 'error'))}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear Failed
                    </button>
                  )}
                </div>
                {uploadProgress.map((progress, index) => (
                  <div
                    key={`${progress.type}-${progress.fileName}-${index}`}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      progress.status === 'error' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{progress.fileName}</p>
                      <p className="text-xs text-gray-500 capitalize">{progress.type.replace('_', ' ')}</p>
                      {progress.status === 'error' && progress.error && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{progress.error}</p>
                      )}
                    </div>
                    {progress.status === 'uploading' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Uploading...</span>
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {progress.status === 'success' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-medium">Success</span>
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                    {progress.status === 'error' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600 font-medium">Failed</span>
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Update
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
