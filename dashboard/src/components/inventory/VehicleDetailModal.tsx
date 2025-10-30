'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Image as ImageIcon, Check, User, Phone, MapPin, Mail, CreditCard, Download } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import Image360Viewer from '@/components/ui/360-viewer'

interface VehicleImage {
  id: string
  image_url: string
  image_type: string
  display_order: number
  file_name: string
}

interface SellerData {
  first_name: string
  last_name: string
  full_name: string
  address: string
  city: string
  nic_number: string
  mobile_number: string
  land_phone_number: string
  email_address: string
}

interface VehicleOption {
  option_name: string
}

interface VehicleDetailModalProps {
  open: boolean
  onClose: () => void
  vehicle: {
    id: string
    vehicle_number: string
    brand_name?: string
    model_name?: string
    manufacture_year?: number
    registered_year?: number
    body_type?: string
    fuel_type?: string
    transmission?: string
    engine_capacity?: string
    exterior_color?: string
    country_name?: string
    mileage?: string | number
    selling_amount?: string | number
    status?: string
    entry_date?: string
    entry_type?: string
  }
}

export default function VehicleDetailModal({ open, onClose, vehicle }: VehicleDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'gallery' | '360'>('gallery')
  const [galleryImages, setGalleryImages] = useState<VehicleImage[]>([])
  const [image360, setImage360] = useState<VehicleImage[]>([])
  const [crImages, setCrImages] = useState<VehicleImage[]>([])
  const [sellerData, setSellerData] = useState<SellerData | null>(null)
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    if (open && vehicle?.id) {
      fetchVehicleData()
    }
  }, [open, vehicle?.id])

  const fetchVehicleData = async () => {
    if (!vehicle?.id) return

    try {
      setLoading(true)

      // Fetch all images
      const { data: imagesData } = await supabase
        .from('vehicle_images')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .order('display_order', { ascending: true })

      const gallery = imagesData?.filter(img => img.image_type === 'gallery') || []
      const img360 = imagesData?.filter(img => img.image_type === 'image_360') || []
      const cr = imagesData?.filter(img => img.image_type === 'cr_paper' || img.image_type === 'document') || []

      setGalleryImages(gallery)
      setImage360(img360)
      setCrImages(cr)

      // Fetch seller data
      const { data: sellerInfo } = await supabase
        .from('sellers')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .maybeSingle()

      if (sellerInfo) setSellerData(sellerInfo)

      // Fetch vehicle options
      const { data: optionsData } = await supabase
        .from('vehicle_options')
        .select('option_id')
        .eq('vehicle_id', vehicle.id)

      if (optionsData) {
        const optionIds = optionsData.map(opt => opt.option_id)
        const { data: optionNames } = await supabase
          .from('vehicle_options_master')
          .select('option_name')
          .in('id', optionIds)

        if (optionNames) setVehicleOptions(optionNames)
      }

    } catch (error) {
      console.error('Error fetching vehicle data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCR = async () => {
    for (const image of crImages) {
      try {
        const response = await fetch(image.image_url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = image.file_name || `CR_${vehicle.vehicle_number}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Download error:', error)
      }
    }
  }

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return 'N/A'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return `Rs. ${numPrice.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatMileage = (mileage: string | number | undefined) => {
    if (!mileage) return 'N/A'
    const numMileage = typeof mileage === 'string' ? parseFloat(mileage) : mileage
    return `Km. ${numMileage.toLocaleString()}`
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">Vehicle Details</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Viewer Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">View Mode:</span>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'gallery' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('gallery')}
                        className="flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Gallery
                      </Button>
                      <Button
                        variant={viewMode === '360' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('360')}
                        disabled={image360.length === 0}
                        className="flex items-center gap-2"
                      >
                        <span className="text-sm">🔄</span>
                        360° View
                      </Button>
                    </div>
                  </div>
                  {viewMode === 'gallery' && galleryImages.length > 0 && (
                    <span className="text-sm text-gray-600">{galleryImages.length} images</span>
                  )}
                  {viewMode === '360' && image360.length > 0 && (
                    <span className="text-sm text-gray-600">{image360.length} images</span>
                  )}
                </div>

                {/* Image Display */}
                {viewMode === 'gallery' && galleryImages.length > 0 ? (
                  <div className="relative bg-gray-50 rounded-lg p-4">
                    <Carousel
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      className="w-full"
                    >
                      <CarouselContent>
                        {galleryImages.map((img, index) => (
                          <CarouselItem key={img.id} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                              <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-0 overflow-hidden">
                                  <Image
                                    src={img.image_url}
                                    alt={`Vehicle ${index + 1}`}
                                    width={400}
                                    height={400}
                                    className="object-cover w-full h-full"
                                  />
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                ) : viewMode === '360' && image360.length > 0 ? (
                  <div className="rounded-lg overflow-hidden border">
                    <Image360Viewer
                      images={image360.map(img => img.image_url)}
                      autoRotate={false}
                      height="400px"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Title */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {vehicle.brand_name} {vehicle.model_name} {vehicle.manufacture_year}
                  </h2>
                  <p className="text-lg text-gray-600 mt-1">{vehicle.vehicle_number}</p>
                </div>
                {crImages.length > 0 && (
                  <Button
                    onClick={handleDownloadCR}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download CR Paper
                  </Button>
                )}
              </div>

              {/* Selling Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Selling Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Selling Price</p>
                    <p className="text-base font-semibold">: {formatPrice(vehicle.selling_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Entry Date</p>
                    <p className="text-base font-semibold">: {vehicle.entry_date || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mileage</p>
                    <p className="text-base font-semibold">: {formatMileage(vehicle.mileage)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-base font-semibold">
                      : <span className={`inline-block px-2 py-0.5 rounded text-sm ${
                        vehicle.status === 'In sale' ? 'bg-green-100 text-green-800' :
                        vehicle.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{vehicle.status || 'N/A'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Entry Type</p>
                    <p className="text-base font-semibold">: {vehicle.entry_type || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Seller Details */}
              {sellerData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Seller Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{sellerData.full_name || `${sellerData.first_name} ${sellerData.last_name}`}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{sellerData.address || 'N/A'}</p>
                        {sellerData.city && <p className="text-sm text-gray-500">{sellerData.city}</p>}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Mobile</p>
                        <p className="font-medium">{sellerData.mobile_number || 'N/A'}</p>
                      </div>
                    </div>
                    {sellerData.land_phone_number && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Telephone</p>
                          <p className="font-medium">{sellerData.land_phone_number}</p>
                        </div>
                      </div>
                    )}
                    {sellerData.nic_number && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">ID</p>
                          <p className="font-medium">{sellerData.nic_number}</p>
                        </div>
                      </div>
                    )}
                    {sellerData.email_address && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{sellerData.email_address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicle Detail */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Vehicle Detail</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Manufacture Year</p>
                    <p className="text-base font-semibold">: {vehicle.manufacture_year || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Engine Capacity</p>
                    <p className="text-base font-semibold">: {vehicle.engine_capacity || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Country</p>
                    <p className="text-base font-semibold">: {vehicle.country_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Exterior Color</p>
                    <p className="text-base font-semibold">: {vehicle.exterior_color || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fuel type</p>
                    <p className="text-base font-semibold">: {vehicle.fuel_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registered Year</p>
                    <p className="text-base font-semibold">: {vehicle.registered_year || vehicle.exterior_color || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transmission</p>
                    <p className="text-base font-semibold">: {vehicle.transmission || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Options */}
              {vehicleOptions.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Vehicle Options</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {vehicleOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{option.option_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
