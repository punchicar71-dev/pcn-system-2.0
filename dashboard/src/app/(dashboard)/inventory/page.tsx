/**
 * MIGRATING: Supabase Auth has been removed.
 * This file will be updated to work with Better Auth in Step 2.
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Package, Search, Eye, Pencil, Trash2, Plus, ChevronLeft, ChevronRight, X, Download, Play, Pause, ImageIcon, Printer, Filter, RotateCcw, StickyNote, ArrowLeftRight } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EditVehicleModal from '@/components/inventory/EditVehicleModal'
import VehicleImageUploadModal from '@/components/inventory/VehicleImageUploadModal'
import VehicleNotesModal from '@/components/inventory/VehicleNotesModal'
import TakenOutModal from '@/components/inventory/TakenOutModal'
import VehicleImageViewer from '@/components/vehicle/VehicleImageViewer'
import VehicleDetailModal from '@/components/inventory/VehicleDetailModal'
import PrintDocumentsModal from '@/components/inventory/PrintDocumentsModal'
import SuccessPopup from '@/components/ui/SuccessPopup'

interface Vehicle {
  id: string
  vehicle_number: string
  brand_name: string
  model_name: string
  manufacture_year: number
  selling_amount: number
  mileage: number
  country_name: string
  transmission: string
  fuel_type: string
  status: string
  created_at: string
  body_type?: string
  engine_capacity?: string
  exterior_color?: string
  registered_year?: number
  entry_type?: string
  entry_date?: string
  seller_name?: string
  seller_mobile?: string
  seller_email?: string
  seller_nic?: string
  primary_image_url?: string
  vehicle_type?: string
  ownership?: string
  taken_out_person_name?: string
  taken_out_person_nic?: string
  taken_out_at?: string
}

interface Country {
  id: string
  name: string
}

interface VehicleImage {
  id: string
  image_url: string
  is_primary: boolean
  display_order: number
  image_type?: string
}

interface VehicleOption {
  option_name: string
}

export default function InventoryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter States
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [transmissionFilter, setTransmissionFilter] = useState('all')
  const [ownershipFilter, setOwnershipFilter] = useState('all')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [countries, setCountries] = useState<Country[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [vehicleImages, setVehicleImages] = useState<VehicleImage[]>([])
  const [documentImages, setDocumentImages] = useState<VehicleImage[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [sellerDetails, setSellerDetails] = useState<any>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editVehicleId, setEditVehicleId] = useState<string | null>(null)
  
  // Image Upload Modal States
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false)
  const [imageUploadVehicleId, setImageUploadVehicleId] = useState<string | null>(null)
  const [imageUploadVehicleInfo, setImageUploadVehicleInfo] = useState<{
    brand: string
    model: string
    year: number
    vehicleNumber: string
  } | null>(null)
  
  // Detail Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailVehicleData, setDetailVehicleData] = useState<any>(null)

  // Print Modal States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [printVehicleData, setPrintVehicleData] = useState<any>(null)
  const [printSellerDetails, setPrintSellerDetails] = useState<any>(null)
  const [printVehicleOptions, setPrintVehicleOptions] = useState<Array<{ option_name: string }>>([])

  // Notes Modal States
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const [notesVehicleId, setNotesVehicleId] = useState<string | null>(null)
  const [notesVehicleInfo, setNotesVehicleInfo] = useState<{
    brand: string
    model: string
    year: number
    vehicleNumber: string
  } | null>(null)

  // Taken Out Modal States
  const [isTakenOutModalOpen, setIsTakenOutModalOpen] = useState(false)
  const [takenOutVehicleId, setTakenOutVehicleId] = useState<string | null>(null)
  const [takenOutVehicleInfo, setTakenOutVehicleInfo] = useState<{
    brand: string
    model: string
    year: number
    vehicleNumber: string
  } | null>(null)

  // Success Popup State
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false)
  const [successVehicleInfo, setSuccessVehicleInfo] = useState({ brand: '', model: '', year: '', vehicleNumber: '' })

  // Delete Success Popup State
  const [isDeleteSuccessPopupOpen, setIsDeleteSuccessPopupOpen] = useState(false)
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('')

  // Active Tab State
  const [activeTab, setActiveTab] = useState('all')

  // Fetch vehicles from database
  useEffect(() => {
    fetchVehicles()
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('countries')
        .select('id, name')
        .order('name', { ascending: true })
      
      if (!error && data) {
        setCountries(data)
      }
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('vehicle_inventory_view')
        .select('*')
        .in('status', ['In Sale', 'Taken Out'])  // Fetch both In Sale and Taken Out vehicles
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching vehicles:', error)
        alert('Failed to load vehicles. Please refresh the page.')
        return
      }

      // Fetch primary images for all vehicles
      if (data && data.length > 0) {
        const vehicleIds = data.map(v => v.id)
        
        // Fetch images
        const { data: imagesData } = await supabase
          .from('vehicle_images')
          .select('vehicle_id, image_url, is_primary, display_order, image_type')
          .in('vehicle_id', vehicleIds)
          .eq('image_type', 'gallery')
          .order('display_order', { ascending: true })

        // Fetch vehicle_type and ownership from vehicles table
        const { data: vehicleDetailsData } = await supabase
          .from('vehicles')
          .select('id, vehicle_type, ownership')
          .in('id', vehicleIds)

        // Create maps
        const imageMap: { [key: string]: string } = {}
        if (imagesData) {
          imagesData.forEach(img => {
            // Use first image or primary image for each vehicle
            if (!imageMap[img.vehicle_id] || img.is_primary) {
              imageMap[img.vehicle_id] = img.image_url
            }
          })
        }

        const detailsMap: { [key: string]: { vehicle_type?: string, ownership?: string } } = {}
        if (vehicleDetailsData) {
          vehicleDetailsData.forEach(v => {
            detailsMap[v.id] = { vehicle_type: v.vehicle_type, ownership: v.ownership }
          })
        }

        // Attach primary image and details to each vehicle
        const vehiclesWithImages = data.map(vehicle => ({
          ...vehicle,
          primary_image_url: imageMap[vehicle.id] || null,
          vehicle_type: detailsMap[vehicle.id]?.vehicle_type || null,
          ownership: detailsMap[vehicle.id]?.ownership || null
        }))

        setVehicles(vehiclesWithImages)
      } else {
        setVehicles(data || [])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      alert('An error occurred while loading vehicles.')
    } finally {
      setLoading(false)
    }
  }

  // Open detail modal with vehicle data
  const openDetailModal = async (vehicleId: string) => {
    try {
      // Fetch complete vehicle data including images
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single()

      if (vehicleError) throw vehicleError

      // Fetch images
      const { data: imagesData } = await supabase
        .from('vehicle_images')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('display_order', { ascending: true })

      // Separate images by type
      const galleryImages = imagesData?.filter(img => img.image_type === 'gallery').map(img => img.image_url) || []
      const image360 = imagesData?.filter(img => img.image_type === 'image_360').map(img => img.image_url) || []
      const crImages = imagesData?.filter(img => img.image_type === 'cr_paper').map(img => img.image_url) || []

      // Get vehicle from list for additional data
      const vehicleFromList = vehicles.find(v => v.id === vehicleId)

      setDetailVehicleData({
        ...vehicleData,
        brand_name: vehicleFromList?.brand_name || '',
        model_name: vehicleFromList?.model_name || '',
        country_name: vehicleFromList?.country_name || '',
        images: galleryImages,
        image_360: image360,
        cr_images: crImages,
      })
      setIsDetailModalOpen(true)
    } catch (error) {
      console.error('Error loading vehicle details:', error)
      alert('Failed to load vehicle details')
    }
  }

  // Fetch vehicle details for modal
  const fetchVehicleDetails = async (vehicleId: string) => {
    try {
      setModalLoading(true)
      setIsModalOpen(true)
      
      // Fetch vehicle details from the view first (which already has all the data)
      const vehicleFromList = vehicles.find(v => v.id === vehicleId)
      
      // Fetch complete vehicle record
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single()

      if (vehicleError) {
        console.error('Vehicle fetch error:', vehicleError)
        throw vehicleError
      }

      // Fetch brand
      const { data: brandData } = await supabase
        .from('vehicle_brands')
        .select('name')
        .eq('id', vehicleData.brand_id)
        .single()

      // Fetch model
      const { data: modelData } = await supabase
        .from('vehicle_models')
        .select('name')
        .eq('id', vehicleData.model_id)
        .single()

      // Fetch country
      const { data: countryData } = await supabase
        .from('countries')
        .select('name')
        .eq('id', vehicleData.country_id)
        .single()

      // Fetch seller details - sellers table has vehicle_id foreign key
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .maybeSingle()

      if (sellerError) {
        console.error('Seller fetch error:', sellerError)
      }
      if (sellerData) {
        console.log('Seller data fetched:', sellerData)
      } else {
        console.log('No seller found for vehicle:', vehicleId)
      }

      // Fetch vehicle images
      const { data: imagesData } = await supabase
        .from('vehicle_images')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('display_order', { ascending: true })

      // Separate vehicle images from document images
      // Only show 'gallery' images in slideshow
      const vehiclePhotos = imagesData?.filter(img => 
        img.image_type === 'gallery'
      ) || []
      
      // CR Paper and Documents for download
      const documentPhotos = imagesData?.filter(img => 
        img.image_type === 'cr_paper' || img.image_type === 'document'
      ) || []

      console.log('All images:', imagesData)
      console.log('Vehicle photos (gallery):', vehiclePhotos)
      console.log('Document photos:', documentPhotos)

      // Fetch vehicle options
      const { data: optionsData } = await supabase
        .from('vehicle_options')
        .select('option_id')
        .eq('vehicle_id', vehicleId)

      // Fetch option names
      let optionNames: VehicleOption[] = []
      if (optionsData && optionsData.length > 0) {
        const optionIds = optionsData.map(opt => opt.option_id)
        const { data: masterOptions } = await supabase
          .from('vehicle_options_master')
          .select('id, option_name')
          .in('id', optionIds)
        
        optionNames = masterOptions?.map(opt => ({ option_name: opt.option_name })) || []
      }

      // Transform the data
      const transformedVehicle = {
        ...vehicleData,
        brand_name: brandData?.name || vehicleFromList?.brand_name || '',
        model_name: modelData?.name || vehicleFromList?.model_name || '',
        country_name: countryData?.name || vehicleFromList?.country_name || '',
      }

      setSelectedVehicle(transformedVehicle)
      setSellerDetails(sellerData)
      setVehicleImages(vehiclePhotos)
      setDocumentImages(documentPhotos)
      setVehicleOptions(optionNames)
      setCurrentImageIndex(0)
      setIsAutoPlaying(true)
      
      console.log('Final state - Seller Details:', sellerData)
      console.log('Final state - Selected Vehicle:', transformedVehicle)
    } catch (error: any) {
      console.error('Error fetching vehicle details:', error)
      alert(`Failed to load vehicle details: ${error.message || 'Unknown error'}`)
      setIsModalOpen(false)
    } finally {
      setModalLoading(false)
    }
  }

  // Autoplay effect for image carousel - disabled as we're using manual navigation
  useEffect(() => {
    // Autoplay disabled for manual navigation with arrows
    return
  }, [isModalOpen, isAutoPlaying, vehicleImages.length])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedVehicle(null)
    setVehicleImages([])
    setDocumentImages([])
    setVehicleOptions([])
    setSellerDetails(null)
    setCurrentImageIndex(0)
    setIsAutoPlaying(false)
  }

  const nextImage = () => {
    if (vehicleImages.length > 3) {
      setCurrentImageIndex((prev) => {
        if (prev >= vehicleImages.length - 3) {
          return 0 // Loop back to start
        }
        return prev + 1
      })
    }
  }

  const prevImage = () => {
    if (vehicleImages.length > 3) {
      setCurrentImageIndex((prev) => {
        if (prev === 0) {
          return Math.max(0, vehicleImages.length - 3) // Go to last view
        }
        return prev - 1
      })
    }
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  const downloadDocument = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
      })
      .catch(error => {
        console.error('Error downloading document:', error)
        alert('Failed to download document')
      })
  }

  // Open print modal
  const openPrintModal = async (vehicleId: string) => {
    try {
      // Get vehicle from list
      const vehicleFromList = vehicles.find(v => v.id === vehicleId)
      if (!vehicleFromList) {
        alert('Vehicle not found')
        return
      }

      // Fetch complete vehicle data
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single()

      if (vehicleError) {
        console.error('Vehicle fetch error:', vehicleError)
        throw vehicleError
      }

      // Fetch seller details
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .maybeSingle()

      if (sellerError) {
        console.error('Seller fetch error:', sellerError)
      }

      // Fetch vehicle options
      const { data: optionsData } = await supabase
        .from('vehicle_options')
        .select('option_id')
        .eq('vehicle_id', vehicleId)

      let optionNames: Array<{ option_name: string }> = []
      if (optionsData && optionsData.length > 0) {
        const optionIds = optionsData.map(opt => opt.option_id)
        const { data: masterOptions } = await supabase
          .from('vehicle_options_master')
          .select('id, option_name')
          .in('id', optionIds)
        
        optionNames = masterOptions?.map(opt => ({ option_name: opt.option_name })) || []
      }

      // Prepare vehicle data for print modal
      setPrintVehicleData({
        vehicleNumber: vehicleFromList.vehicle_number,
        brandName: vehicleFromList.brand_name,
        modelName: vehicleFromList.model_name,
        year: vehicleData.manufacture_year,
        registeredYear: vehicleData.registered_year || vehicleData.manufacture_year,
        engineCapacity: vehicleData.engine_capacity || 'N/A',
        exteriorColor: vehicleData.exterior_color || 'N/A',
        sellingAmount: vehicleFromList.selling_amount,
        specialNotePrint: vehicleData.special_note_print || '', // Special notes for price tag
      })
      setPrintSellerDetails(sellerData)
      setPrintVehicleOptions(optionNames)
      setIsPrintModalOpen(true)
    } catch (error) {
      console.error('Error loading print data:', error)
      alert('Failed to load vehicle data for printing')
    }
  }

  // Real-time search and filter
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Tab-based status filter
      if (activeTab === 'in-sale' && vehicle.status !== 'In Sale') {
        return false
      }
      if (activeTab === 'taken-out' && vehicle.status !== 'Taken Out') {
        return false
      }
      // 'all' tab shows all vehicles (In Sale + Taken Out)

      // Text search filter - Search by Vehicle Number, Brand, Model, Seller name, Mobile number, Seller ID (NIC), Country
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const vehicleNumber = vehicle.vehicle_number?.toLowerCase() || ''
        const brandName = vehicle.brand_name?.toLowerCase() || ''
        const modelName = vehicle.model_name?.toLowerCase() || ''
        const sellerName = vehicle.seller_name?.toLowerCase() || ''
        const sellerMobile = vehicle.seller_mobile?.toLowerCase() || ''
        const sellerNic = vehicle.seller_nic?.toLowerCase() || ''
        const countryName = vehicle.country_name?.toLowerCase() || ''
        
        const matchesSearch = vehicleNumber.includes(query) ||
               brandName.includes(query) ||
               modelName.includes(query) ||
               sellerName.includes(query) ||
               sellerMobile.includes(query) ||
               sellerNic.includes(query) ||
               countryName.includes(query)
        
        if (!matchesSearch) return false
      }

      // Price range filter
      if (priceMin && vehicle.selling_amount < parseFloat(priceMin)) {
        return false
      }
      if (priceMax && vehicle.selling_amount > parseFloat(priceMax)) {
        return false
      }

      // Transmission filter
      if (transmissionFilter !== 'all' && vehicle.transmission !== transmissionFilter) {
        return false
      }

      // Ownership filter (Open Papers / Registered Owner)
      if (ownershipFilter !== 'all' && vehicle.ownership !== ownershipFilter) {
        return false
      }

      // Vehicle type filter (Registered / Unregistered)
      if (vehicleTypeFilter !== 'all' && vehicle.vehicle_type !== vehicleTypeFilter) {
        return false
      }

      // Country filter
      if (countryFilter !== 'all' && vehicle.country_name !== countryFilter) {
        return false
      }

      return true
    })
  }, [vehicles, searchQuery, priceMin, priceMax, transmissionFilter, ownershipFilter, vehicleTypeFilter, countryFilter, activeTab])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setPriceMin('')
    setPriceMax('')
    setTransmissionFilter('all')
    setOwnershipFilter('all')
    setVehicleTypeFilter('all')
    setCountryFilter('all')
  }

  // Check if any filter is active
  const hasActiveFilters = searchQuery || priceMin || priceMax || 
    transmissionFilter !== 'all' || ownershipFilter !== 'all' || 
    vehicleTypeFilter !== 'all' || countryFilter !== 'all'

  // Vehicle counts for tabs
  const allVehiclesCount = vehicles.length
  const inSaleVehiclesCount = vehicles.filter(v => v.status === 'In Sale').length
  const takenOutVehiclesCount = vehicles.filter(v => v.status === 'Taken Out').length

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage)
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredVehicles.slice(startIndex, endIndex)
  }, [filteredVehicles, currentPage, rowsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, rowsPerPage, priceMin, priceMax, transmissionFilter, ownershipFilter, vehicleTypeFilter, countryFilter, activeTab])

  // Handle delete - show confirmation dialog
  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      const supabase = createClient()
      
      // First, fetch all S3 keys for this vehicle's images
      const { data: imageRecords, error: fetchError } = await supabase
        .from('vehicle_images')
        .select('s3_key')
        .eq('vehicle_id', deleteId)

      if (fetchError) {
        // Continue with deletion even if we can't fetch images
      }

      // Extract S3 keys (filter out null/undefined)
      const s3Keys = imageRecords
        ?.map(record => record.s3_key)
        .filter(key => key !== null && key !== undefined && key.trim() !== '') || []

      // Delete images from S3 if we have any keys
      let s3DeletionSuccess = false
      if (s3Keys.length > 0) {
        // MIGRATION: Using localStorage instead of Supabase Auth - S3 deletion doesn't need auth token
        const storedUser = localStorage.getItem('pcn-user')
        
        if (!storedUser) {
          // No user, skip S3 deletion
        } else {
          try {
            // Call Next.js API route (which proxies to backend)
            const s3Response = await fetch(`/api/upload/delete-vehicle/${deleteId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ s3Keys }),
            })

            if (!s3Response.ok) {
              // S3 deletion failed, continue with database deletion
            } else {
              const result = await s3Response.json()
              if (result.success) {
                s3DeletionSuccess = true
              }
            }
          } catch (s3Error) {
            // S3 deletion error, continue with database deletion
          }
        }
      } else {
        s3DeletionSuccess = true // No images to delete counts as success
      }

      // Historical sold-out records in pending_vehicle_sales are preserved automatically
      // because vehicle details are stored directly in the sale record
      // (vehicle_number, brand_name, model_name, manufacture_year columns)
      // No need to set vehicle_id to NULL anymore
      console.log('✅ Historical sold-out records preserved via vehicle snapshot columns');

      // Delete from database (this will cascade to vehicle_images, sellers, vehicle_options, etc.)
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', deleteId)

      if (error) {
        setDeleteSuccessMessage('Failed to delete vehicle from database. Please try again.')
        setIsDeleteSuccessPopupOpen(true)
        return
      }

      // Create notification for vehicle deletion
      try {
        const deletedVehicle = vehicles.find(v => v.id === deleteId)
        if (deletedVehicle) {
          // MIGRATION: Using localStorage instead of Supabase Auth
          const storedUserForNotif = localStorage.getItem('pcn-user')
          if (storedUserForNotif) {
            const userData = JSON.parse(storedUserForNotif)

            if (userData) {
              // Handle both camelCase and snake_case formats
              const firstName = userData.firstName || userData.first_name || ''
              const lastName = userData.lastName || userData.last_name || ''
              const userName = `${firstName} ${lastName}`.trim() || 'Unknown User'
              const vehicleInfo = `${deletedVehicle.brand_name} ${deletedVehicle.model_name} (${deletedVehicle.vehicle_number})`

              await supabase.from('notifications').insert({
                user_id: userData.id,
                type: 'deleted',
                title: 'Vehicle Deleted',
                message: `${userName} deleted ${vehicleInfo} from the Inventory.`,
                vehicle_number: deletedVehicle.vehicle_number,
                vehicle_brand: deletedVehicle.brand_name,
                vehicle_model: deletedVehicle.model_name,
                is_read: false
              })
            }
          }
        }
      } catch (notifError) {
        // Don't block deletion if notification fails
      }

      // Show appropriate success message
      if (s3Keys.length > 0) {
        if (s3DeletionSuccess) {
          setDeleteSuccessMessage('Vehicle and all associated images deleted successfully!')
        } else {
          setDeleteSuccessMessage('Vehicle deleted from database, but some images may remain in S3.')
        }
      } else {
        setDeleteSuccessMessage('Vehicle deleted successfully!')
      }
      setIsDeleteSuccessPopupOpen(true)

      fetchVehicles() // Refresh list
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    } catch (error) {
      setDeleteSuccessMessage(`An error occurred while deleting the vehicle: ${error}`)
      setIsDeleteSuccessPopupOpen(true)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setDeleteId(null)
  }

  // Export to CSV
  const exportToCSV = () => {
    try {
      // Define CSV headers
      const headers = [
        'Vehicle Number',
        'Brand',
        'Model',
        'Manufacture Year',
        'Registered Year',
        'Selling Amount (LKR)',
        'Mileage (km)',
        'Country',
        'Transmission',
        'Fuel Type',
        'Body Type',
        'Engine Capacity',
        'Exterior Color',
        'Status',
        'Entry Type',
        'Entry Date',
        'Seller Name',
        'Seller Mobile',
        'Seller Email'
      ]

      // Prepare CSV rows
      const rows = filteredVehicles.map(vehicle => [
        vehicle.vehicle_number || '',
        vehicle.brand_name || '',
        vehicle.model_name || '',
        vehicle.manufacture_year || '',
        vehicle.registered_year || '',
        vehicle.selling_amount || '',
        vehicle.mileage || '',
        vehicle.country_name || '',
        vehicle.transmission || '',
        vehicle.fuel_type || '',
        vehicle.body_type || '',
        vehicle.engine_capacity || '',
        vehicle.exterior_color || '',
        vehicle.status || '',
        vehicle.entry_type || '',
        vehicle.entry_date || '',
        vehicle.seller_name || '',
        vehicle.seller_mobile || '',
        vehicle.seller_email || ''
      ])

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(','))
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `inventory-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting to CSV:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  // Move vehicle back to In Sale status
  const handleMoveToInSale = async (vehicleId: string) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('vehicles')
        .update({
          status: 'In Sale',
          taken_out_person_name: null,
          taken_out_person_nic: null,
          taken_out_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)

      if (error) {
        console.error('Error updating vehicle:', error)
        alert('Failed to update vehicle status. Please try again.')
        return
      }

      fetchVehicles() // Refresh the vehicle list
    } catch (error) {
      console.error('Error updating vehicle:', error)
      alert('An error occurred while updating vehicle status.')
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format mileage
  const formatMileage = (km: number) => {
    return `${new Intl.NumberFormat('en-US').format(km)} km`
  }

  // Get fuel type badge color
  const getFuelTypeBadge = (fuelType: string) => {
    const colors: Record<string, string> = {
      'Petrol': 'bg-blue-100 text-blue-800',
      'Diesel': 'bg-yellow-100 text-yellow-800',
      'Petrol Hybrid': 'bg-green-100 text-green-800',
      'Diesel Hybrid': 'bg-green-100 text-green-800',
      'Petrol + Hybrid': 'bg-green-100 text-green-800',
      'Diesel + Hybrid': 'bg-green-100 text-green-800',
      'EV': 'bg-purple-100 text-purple-800'
    }
    return colors[fuelType] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6 p-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
        
          <div className=''>
            <h1 className="text-[20px] font-bold text-gray-900 pb-2">Vehicle Inventory</h1>
            
          </div>
        </div>
        
        <Button 
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
          size="default"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 mb-4 h-12">
          <TabsTrigger value="all" className="flex items-center gap-2 h-10 text-sm">
            All Vehicles
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
              {allVehiclesCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="in-sale" className="flex items-center gap-2 h-10 text-sm">
            In Sale
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-green-600 text-green-100">
              {inSaleVehiclesCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="taken-out" className="flex items-center gap-2 h-10 text-sm">
            Taken Out
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-orange-600 text-orange-100">
              {takenOutVehiclesCount}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Shared content for all tabs */}
        <div className="space-y-4">
          {/* Search */}
          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300 shadow-sm">
        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-4 ">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Vehicle No, Brand, Model, Seller, Mobile, NIC, Country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3 max-w-7xl">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Filters:</span>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min Price"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-28 h-9 text-sm"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max Price"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-28 h-9 text-sm"
            />
          </div>

          <Separator orientation="vertical" className='h-8 mx-1' />

          {/* Transmission Filter */}
          <Select value={transmissionFilter} onValueChange={setTransmissionFilter} >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transmission</SelectItem>
              <SelectItem value="Auto">Auto</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>

           <Separator orientation="vertical" className='h-8 mx-1'  />

          {/* Ownership Filter (Open Papers / Registered Owner) */}
          <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Ownership" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ownership</SelectItem>
              <SelectItem value="Open Papers">Open Papers</SelectItem>
              <SelectItem value="Registered Owner">Registered Owner</SelectItem>
            </SelectContent>
          </Select>

           <Separator orientation="vertical" className='h-8 mx-1'  />

          {/* Vehicle Type Filter (Registered / Unregistered) */}
          <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Registration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Registered">Registered</SelectItem>
              <SelectItem value="Unregistered">Unregistered</SelectItem>
            </SelectContent>
          </Select>

           <Separator orientation="vertical" className='h-8 mx-1' />

          {/* Country Filter */}
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.name}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filters info */}
        {hasActiveFilters && (
          <p className="mt-3 text-sm text-gray-600">
            Found {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} matching your filters
          </p>
        )}
      </div>

      {/* Vehicle Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle No
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  M Year
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reg Year
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mileage
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transmission
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Type
                </th>
                {activeTab === 'all' && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                )}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'all' ? 14 : 13} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading vehicles...
                    </div>
                  </td>
                </tr>
              ) : paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'all' ? 14 : 13} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? 'No vehicles found matching your search.' : 
                      activeTab === 'in-sale' ? 'No vehicles currently in sale.' :
                      activeTab === 'taken-out' ? 'No taken out vehicles.' :
                      'No vehicles in inventory. Add your first vehicle!'}
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <div className="w-[80px] h-[50px] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        {vehicle.primary_image_url ? (
                          <Image
                            src={vehicle.primary_image_url}
                            alt={`${vehicle.brand_name} ${vehicle.model_name}`}
                            width={80}
                            height={50}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon className="w-5 h-5" />
                            <span className="text-[8px] mt-0.5">No Image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 font-medium">
                      {vehicle.vehicle_number}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900">
                      {vehicle.brand_name}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900">
                      {vehicle.model_name}
                    </td>
                    <td className="px-2 py-3 text-sm text-gray-900">
                      {vehicle.manufacture_year}
                    </td>
                    <td className="px-2 py-3 text-sm text-gray-900">
                      {vehicle.registered_year || '-'}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900">
                      {vehicle.exterior_color || '-'}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 font-semibold">
                      {formatCurrency(vehicle.selling_amount)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900">
                      {vehicle.mileage ? formatMileage(vehicle.mileage) : '-'}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900">
                      {vehicle.country_name}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900">
                      {vehicle.transmission}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFuelTypeBadge(vehicle.fuel_type)}`}>
                        {vehicle.fuel_type}
                      </span>
                    </td>
                    {activeTab === 'all' && (
                      <td className="px-3 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === 'In Sale' 
                            ? 'bg-white border border-green-300 text-green-700' 
                            : 'bg-white border border-orange-300 text-orange-600'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(vehicle.id)}
                          className="p-1 text-gray-800 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openPrintModal(vehicle.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Print Documents"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setImageUploadVehicleId(vehicle.id)
                            setImageUploadVehicleInfo({
                              brand: vehicle.brand_name,
                              model: vehicle.model_name,
                              year: vehicle.manufacture_year,
                              vehicleNumber: vehicle.vehicle_number,
                            })
                            setIsImageUploadModalOpen(true)
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Images"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setNotesVehicleId(vehicle.id)
                            setNotesVehicleInfo({
                              brand: vehicle.brand_name,
                              model: vehicle.model_name,
                              year: vehicle.manufacture_year,
                              vehicleNumber: vehicle.vehicle_number,
                            })
                            setIsNotesModalOpen(true)
                          }}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                          title="Vehicle Notes"
                        >
                          <StickyNote className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditVehicleId(vehicle.id)
                            setIsEditModalOpen(true)
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(vehicle.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        {/* Status Toggle Button - Only show on In Sale and Taken Out tabs */}
                        {activeTab === 'in-sale' && (
                          <button
                            onClick={() => {
                              setTakenOutVehicleId(vehicle.id)
                              setTakenOutVehicleInfo({
                                brand: vehicle.brand_name,
                                model: vehicle.model_name,
                                year: vehicle.manufacture_year,
                                vehicleNumber: vehicle.vehicle_number,
                              })
                              setIsTakenOutModalOpen(true)
                            }}
                            className="px-3 py-2 text-xs font-medium text-red-600  bg-white border border-red-300 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                            title="Move to Taken Out"
                          >
                            Taken Out
                          </button>
                        )}
                        {activeTab === 'taken-out' && (
                          <button
                            onClick={() => handleMoveToInSale(vehicle.id)}
                            className="px-3 py-2 text-xs font-medium text-green-700 bg-white border border-green-500 hover:bg-green-700 hover:text-white rounded-md transition-colors"
                            title="Move to In Sale"
                          >
                           Move In Sale
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredVehicles.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded text-sm ${
                          currentPage === pageNum
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 py-1 text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-1 rounded text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
        {/* End of shared content */}
      </Tabs>

      {/* Vehicle Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-[70%] max-h-[90vh] overflow-y-auto">
          {modalLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : selectedVehicle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">Vehicle Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 ">
                {/* Vehicle Image Viewer with 360° capability */}
                {vehicleImages.length > 0 && (
                  <VehicleImageViewer
                    images={vehicleImages}
                    vehicleName={`${selectedVehicle.brand_name} ${selectedVehicle.model_name}`}
                  />
                )}

                {/* Vehicle Title and Download Button */}
                <div className="flex items-center py-4 justify-between">
                  <h2 className="text-lg font-semibold text-gray-600">
                    {selectedVehicle.brand_name} {selectedVehicle.model_name} {selectedVehicle.manufacture_year} <span className="text-gray-900">- {selectedVehicle.vehicle_number}</span>
                  </h2>
                  
                  {/* Download CR Paper Button */}
                  {documentImages.length > 0 && (
                    <button
                      onClick={() => {
                        const crPaper = documentImages.find(doc => doc.image_type === 'cr_paper')
                        if (crPaper) {
                          downloadDocument(crPaper.image_url, `${selectedVehicle.vehicle_number}_CR_Paper.jpg`)
                        }
                      }}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded transition-colors"
                    >
                      Download CR Paper
                    </button>
                  )}
                </div>

                {/* Selling Information */}
                <div className='p-3 border rounded-lg bg-gray-50'>
                  <h3 className="text-base font-semibold mb-3 text-gray-900">Selling Information</h3>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-28">Selling Price</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedVehicle.selling_amount)}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-28">Entry Date</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedVehicle.entry_date ? new Date(selectedVehicle.entry_date).toLocaleDateString('en-GB').replace(/\//g, '.') : '-'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-28">Mileage</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.mileage ? `Km. ${selectedVehicle.mileage.toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-28">Status</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.status}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-28">Entry Type</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.entry_type || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Seller Details - Always show section */}
                <div className='p-3 border rounded-lg bg-gray-50'>
                  <h3 className="text-base font-semibold mb-3 text-gray-900">Seller Details</h3>
                  {sellerDetails ? (
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div className="flex min-w-0">
                          <span className="text-sm text-gray-600 w-20 flex-shrink-0">Name</span>
                          <span className="text-sm font-medium text-gray-900 ml-2">{sellerDetails.full_name || '-'}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex min-w-0">
                          <span className="text-sm text-gray-600 w-20 flex-shrink-0">Address</span>
                          <span className="text-sm font-medium text-gray-900 ml-2">{sellerDetails.address || '-'}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div className="flex min-w-0">
                          <span className="text-sm text-gray-600 w-20 flex-shrink-0">Mobile</span>
                          <span className="text-sm font-medium text-gray-900 ml-2">{sellerDetails.mobile_number || '-'}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div className="flex min-w-0">
                          <span className="text-sm text-gray-600 w-20 flex-shrink-0">Telephone</span>
                          <span className="text-sm font-medium text-gray-900 ml-2">{sellerDetails.land_phone_number || '-'}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        <div className="flex min-w-0">
                          <span className="text-sm text-gray-600 w-20 flex-shrink-0">NIC</span>
                          <span className="text-sm font-medium text-gray-900 ml-2">{sellerDetails.nic_number || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No seller information available for this vehicle.</p>
                  )}
                </div>

                {/* Vehicle Detail */}
                <div className='p-3 border rounded-lg bg-gray-50'>
                  <h3 className="text-base font-semibold mb-3 text-gray-900">Vehicle Detail</h3>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-36">Manufacture Year</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.manufacture_year}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-36">Engine Capacity</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.engine_capacity || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-36">Country</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.country_name}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-36">Exterior Color</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.exterior_color || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-36">Fuel type</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.fuel_type}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-36">Registered Year</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.registered_year || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-36">Transmission</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.transmission}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-36">Body Type</span>
                      <span className="text-sm text-gray-600 mx-2">:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedVehicle.body_type || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Options */}
                {vehicleOptions.length > 0 && (
                  <div className='p-3 border rounded-lg bg-gray-50'>
                    <h3 className="text-base font-semibold mb-3 text-gray-900">Vehicle Options</h3>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                      {vehicleOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{option.option_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Delete Vehicle Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Are you sure delete this?</h3>
            <p className="text-gray-600">
              Are you sure you want to permanently delete this Vehicle Details? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        vehicleId={editVehicleId}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditVehicleId(null)
        }}
        onSuccess={() => {
          // Get vehicle info for success popup
          const vehicle = vehicles.find(v => v.id === editVehicleId)
          if (vehicle) {
            setSuccessVehicleInfo({
              brand: vehicle.brand_name,
              model: vehicle.model_name,
              year: vehicle.manufacture_year.toString(),
              vehicleNumber: vehicle.vehicle_number
            })
          }
          fetchVehicles() // Refresh the vehicle list
          setIsSuccessPopupOpen(true) // Show success popup
        }}
      />

      {/* Vehicle Image Upload Modal */}
      <VehicleImageUploadModal
        vehicleId={imageUploadVehicleId}
        vehicleInfo={imageUploadVehicleInfo}
        isOpen={isImageUploadModalOpen}
        onClose={() => {
          setIsImageUploadModalOpen(false)
          setImageUploadVehicleId(null)
          setImageUploadVehicleInfo(null)
        }}
        onSuccess={() => {
          fetchVehicles() // Refresh the vehicle list
        }}
      />

      {/* Vehicle Detail Modal with 360 View */}
      {detailVehicleData && (
        <VehicleDetailModal
          open={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setDetailVehicleData(null)
          }}
          vehicle={detailVehicleData}
        />
      )}

      {/* Print Documents Modal */}
      {printVehicleData && (
        <PrintDocumentsModal
          isOpen={isPrintModalOpen}
          onClose={() => {
            setIsPrintModalOpen(false)
            setPrintVehicleData(null)
            setPrintSellerDetails(null)
            setPrintVehicleOptions([])
          }}
          vehicleData={printVehicleData}
          sellerDetails={printSellerDetails}
          vehicleOptions={printVehicleOptions}
        />
      )}

      {/* Vehicle Notes Modal */}
      <VehicleNotesModal
        vehicleId={notesVehicleId}
        vehicleInfo={notesVehicleInfo}
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false)
          setNotesVehicleId(null)
          setNotesVehicleInfo(null)
        }}
        onSuccess={() => {
          fetchVehicles() // Refresh the vehicle list
        }}
      />

      {/* Taken Out Modal */}
      <TakenOutModal
        vehicleId={takenOutVehicleId}
        vehicleInfo={takenOutVehicleInfo}
        isOpen={isTakenOutModalOpen}
        onClose={() => {
          setIsTakenOutModalOpen(false)
          setTakenOutVehicleId(null)
          setTakenOutVehicleInfo(null)
        }}
        onSuccess={() => {
          fetchVehicles() // Refresh the vehicle list
        }}
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={isSuccessPopupOpen}
        onClose={() => setIsSuccessPopupOpen(false)}
        title={`${successVehicleInfo.brand} ${successVehicleInfo.model} ${successVehicleInfo.year} - ${successVehicleInfo.vehicleNumber}`}
        message="Vehicle details successful updated"
        autoCloseDuration={3000}
      />

      {/* Delete Success Popup */}
      <SuccessPopup
        isOpen={isDeleteSuccessPopupOpen}
        onClose={() => setIsDeleteSuccessPopupOpen(false)}
        title="Vehicle Deleted"
        message={deleteSuccessMessage}
        autoCloseDuration={3000}
      />
    </div>
  )
}
