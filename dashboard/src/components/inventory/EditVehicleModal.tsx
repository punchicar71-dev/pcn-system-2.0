'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
// Image upload/ui removed from this modal — keep component focused on data edits only
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EditVehicleModalProps {
  vehicleId: string | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface VehicleData {
  id: string
  vehicle_number: string
  brand_id: string
  model_id: string
  manufacture_year: number
  registered_year?: number
  country_id: string
  body_type: string
  fuel_type: string
  transmission: string
  engine_capacity?: string
  exterior_color?: string
  selling_amount: number
  mileage?: number
  entry_type: string
  entry_date: string
  status: string
  tag_notes?: string
  special_note_print?: string
}

interface SellerData {
  id?: string
  vehicle_id: string
  first_name: string
  last_name: string
  full_name?: string
  address?: string
  city?: string
  nic_number?: string
  mobile_number: string
  land_phone_number?: string
  email_address?: string
}


interface Brand {
  id: string
  name: string
}

interface Model {
  id: string
  name: string
}

interface Country {
  id: string
  name: string
}

interface OptionMaster {
  id: string
  option_name: string
  option_type: string
}

export default function EditVehicleModal({ vehicleId, isOpen, onClose, onSuccess }: EditVehicleModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('vehicle')
  
  // Vehicle Data
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [sellerData, setSellerData] = useState<SellerData | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [customOptions, setCustomOptions] = useState<string[]>([])
  // Dropdowns Data
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [allOptions, setAllOptions] = useState<OptionMaster[]>([])
  
  // Fetch all data when modal opens
  useEffect(() => {
    if (isOpen && vehicleId) {
      fetchAllData()
    }
  }, [isOpen, vehicleId])

  // Fetch models when brand changes
  useEffect(() => {
    if (vehicleData?.brand_id) {
      fetchModels(vehicleData.brand_id)
    }
  }, [vehicleData?.brand_id])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
          fetchVehicleData(),
          fetchSellerData(),
          fetchVehicleOptions(),
          fetchBrands(),
          fetchCountries(),
          fetchAllOptionsData()
        ])
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to load vehicle data')
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleData = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single()

    if (error) throw error
    setVehicleData(data)
  }

  const fetchSellerData = async () => {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error
    setSellerData(data)
  }

  const fetchVehicleOptions = async () => {
    const { data, error } = await supabase
      .from('vehicle_options')
      .select('option_id')
      .eq('vehicle_id', vehicleId)

    if (error) throw error
    setSelectedOptions(data?.map(opt => opt.option_id) || [])

    // Fetch custom options
    const { data: customData, error: customError } = await supabase
      .from('vehicle_custom_options')
      .select('option_name')
      .eq('vehicle_id', vehicleId)

    if (customError) throw customError
    setCustomOptions(customData?.map(opt => opt.option_name) || [])
  }

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from('vehicle_brands')
      .select('id, name')
      .order('name')

    if (error) throw error
    setBrands(data || [])
  }

  const fetchModels = async (brandId: string) => {
    const { data, error } = await supabase
      .from('vehicle_models')
      .select('id, name')
      .eq('brand_id', brandId)
      .order('name')

    if (error) throw error
    setModels(data || [])
  }

  const fetchCountries = async () => {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    setCountries(data || [])
  }

  const fetchAllOptionsData = async () => {
    const { data, error } = await supabase
      .from('vehicle_options_master')
      .select('*')
      .eq('is_active', true)
      .order('option_name')

    if (error) throw error
    setAllOptions(data || [])
  }



  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }

  const handleCustomOptionAdd = (optionName: string) => {
    if (optionName.trim() && !customOptions.includes(optionName.trim())) {
      setCustomOptions(prev => [...prev, optionName.trim()])
    }
  }

  const handleCustomOptionRemove = (optionName: string) => {
    setCustomOptions(prev => prev.filter(opt => opt !== optionName))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // 1. Update Vehicle Data
      if (vehicleData) {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({
            vehicle_number: vehicleData.vehicle_number,
            brand_id: vehicleData.brand_id,
            model_id: vehicleData.model_id,
            manufacture_year: vehicleData.manufacture_year,
            registered_year: vehicleData.registered_year,
            country_id: vehicleData.country_id,
            body_type: vehicleData.body_type,
            fuel_type: vehicleData.fuel_type,
            transmission: vehicleData.transmission,
            engine_capacity: vehicleData.engine_capacity,
            exterior_color: vehicleData.exterior_color,
            selling_amount: vehicleData.selling_amount,
            mileage: vehicleData.mileage,
            entry_type: vehicleData.entry_type,
            entry_date: vehicleData.entry_date,
            status: vehicleData.status,
            tag_notes: vehicleData.tag_notes,
            special_note_print: vehicleData.special_note_print,
            updated_at: new Date().toISOString()
          })
          .eq('id', vehicleId)

        if (vehicleError) throw vehicleError
      }

      // 2. Update Seller Data
      if (sellerData) {
        if (sellerData.id) {
          // Update existing seller (full_name is auto-generated, don't include it)
          const { error: sellerError } = await supabase
            .from('sellers')
            .update({
              first_name: sellerData.first_name,
              last_name: sellerData.last_name,
              address: sellerData.address,
              city: sellerData.city,
              nic_number: sellerData.nic_number,
              mobile_number: sellerData.mobile_number,
              land_phone_number: sellerData.land_phone_number,
              email_address: sellerData.email_address,
              updated_at: new Date().toISOString()
            })
            .eq('id', sellerData.id)

          if (sellerError) throw sellerError
        } else {
          // Insert new seller (full_name is auto-generated, don't include it)
          const { error: sellerError } = await supabase
            .from('sellers')
            .insert({
              vehicle_id: vehicleId!,
              first_name: sellerData.first_name,
              last_name: sellerData.last_name,
              address: sellerData.address,
              city: sellerData.city,
              nic_number: sellerData.nic_number,
              mobile_number: sellerData.mobile_number,
              land_phone_number: sellerData.land_phone_number,
              email_address: sellerData.email_address
            })

          if (sellerError) throw sellerError
        }
      }

      // Image upload/deletion removed — this modal only updates data via Supabase

      // 5. Update Vehicle Options
      // Delete existing options
      await supabase
        .from('vehicle_options')
        .delete()
        .eq('vehicle_id', vehicleId)

      // Insert new options
      for (const optionId of selectedOptions) {
        const option = allOptions.find(opt => opt.id === optionId)
        await supabase
          .from('vehicle_options')
          .insert({
            vehicle_id: vehicleId!,
            option_id: optionId,
            option_type: option?.option_type || 'standard',
            is_enabled: true
          })
      }

      // 6. Update Custom Options
      await supabase
        .from('vehicle_custom_options')
        .delete()
        .eq('vehicle_id', vehicleId)

      for (const optionName of customOptions) {
        await supabase
          .from('vehicle_custom_options')
          .insert({
            vehicle_id: vehicleId!,
            option_name: optionName
          })
      }

      // Success - trigger callback to show popup
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error updating vehicle:', error)
      alert(`Failed to update vehicle: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setActiveTab('vehicle')
    // reset any transient state if added later
    onClose()
  }

  if (!isOpen || !vehicleData) return null

  const standardOptions = allOptions.filter(opt => opt.option_type === 'standard')
  const specialOptions = allOptions.filter(opt => opt.option_type === 'special')

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[70%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Vehicle</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vehicle">Vehicle Details</TabsTrigger>
              <TabsTrigger value="seller">Seller Details</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Vehicle Details Tab */}
            <TabsContent value="vehicle" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleData.vehicle_number}
                    onChange={(e) => setVehicleData({ ...vehicleData, vehicle_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Manufacture Year</label>
                  <Select
                    value={vehicleData.manufacture_year?.toString()}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, manufacture_year: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Change Body Type</label>
                  <Select
                    value={vehicleData.body_type}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, body_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Hatchback">Hatchback</SelectItem>
                      <SelectItem value="Wagon">Wagon</SelectItem>
                      <SelectItem value="Coupe">Coupe</SelectItem>
                      <SelectItem value="Convertible">Convertible</SelectItem>
                      <SelectItem value="Van">Van</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Change Country</label>
                  <Select
                    value={vehicleData.country_id}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, country_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <Select
                    value={vehicleData.brand_id}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, brand_id: value, model_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <Select
                    value={vehicleData.model_id}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, model_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fuel Type</label>
                  <Select
                    value={vehicleData.fuel_type}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, fuel_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Petrol Hybrid">Petrol Hybrid</SelectItem>
                      <SelectItem value="Diesel Hybrid">Diesel Hybrid</SelectItem>
                      <SelectItem value="EV">EV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Transmission</label>
                  <Select
                    value={vehicleData.transmission}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, transmission: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Engine Capacity</label>
                  <input
                    type="text"
                    value={vehicleData.engine_capacity || ''}
                    onChange={(e) => setVehicleData({ ...vehicleData, engine_capacity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="e.g., 1500cc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Exterior Color</label>
                  <input
                    type="text"
                    value={vehicleData.exterior_color || ''}
                    onChange={(e) => setVehicleData({ ...vehicleData, exterior_color: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Registered Year</label>
                  <Select
                    value={vehicleData.registered_year?.toString() || ''}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, registered_year: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Selling Amount</label>
                  <input
                    type="number"
                    value={vehicleData.selling_amount}
                    onChange={(e) => setVehicleData({ ...vehicleData, selling_amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mileage (km)</label>
                  <input
                    type="number"
                    value={vehicleData.mileage || ''}
                    onChange={(e) => setVehicleData({ ...vehicleData, mileage: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Entry Type</label>
                  <Select
                    value={vehicleData.entry_type}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, entry_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Auction">Auction</SelectItem>
                      <SelectItem value="Direct Purchase">Direct Purchase</SelectItem>
                      <SelectItem value="Consignment">Consignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Entry Date</label>
                  <input
                    type="date"
                    value={vehicleData.entry_date}
                    onChange={(e) => setVehicleData({ ...vehicleData, entry_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select
                    value={vehicleData.status}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Sale">In Sale</SelectItem>
                      <SelectItem value="Out of Sale">Out of Sale</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image upload and display removed per request */}
            </TabsContent>

            {/* Seller Details Tab */}
            <TabsContent value="seller" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={sellerData?.first_name || ''}
                    onChange={(e) => setSellerData({ 
                      ...sellerData,
                      vehicle_id: vehicleId!,
                      first_name: e.target.value,
                      last_name: sellerData?.last_name || '',
                      mobile_number: sellerData?.mobile_number || ''
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={sellerData?.last_name || ''}
                    onChange={(e) => setSellerData({ 
                      ...sellerData,
                      vehicle_id: vehicleId!,
                      first_name: sellerData?.first_name || '',
                      last_name: e.target.value,
                      mobile_number: sellerData?.mobile_number || ''
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={sellerData?.address || ''}
                    onChange={(e) => setSellerData({ 
                      ...sellerData,
                      vehicle_id: vehicleId!,
                      first_name: sellerData?.first_name || '',
                      last_name: sellerData?.last_name || '',
                      mobile_number: sellerData?.mobile_number || '',
                      address: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={sellerData?.city || ''}
                    onChange={(e) => setSellerData({ 
                      ...sellerData,
                      vehicle_id: vehicleId!,
                      first_name: sellerData?.first_name || '',
                      last_name: sellerData?.last_name || '',
                      mobile_number: sellerData?.mobile_number || '',
                      city: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">NIC Number</label>
                  <input
                    type="text"
                    value={sellerData?.nic_number || ''}
                    onChange={(e) => setSellerData({ 
                      ...sellerData,
                      vehicle_id: vehicleId!,
                      first_name: sellerData?.first_name || '',
                      last_name: sellerData?.last_name || '',
                      mobile_number: sellerData?.mobile_number || '',
                      nic_number: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Number</label>
                  <input
                    type="text"
                    value={sellerData?.mobile_number || ''}
                    onChange={(e) => setSellerData({ 
                      ...sellerData,
                      vehicle_id: vehicleId!,
                      first_name: sellerData?.first_name || '',
                      last_name: sellerData?.last_name || '',
                      mobile_number: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Land Phone Number</label>
                  <input
                    type="text"
                    value={sellerData?.land_phone_number || ''}
                    onChange={(e) => setSellerData({ 
                      ...sellerData,
                      vehicle_id: vehicleId!,
                      first_name: sellerData?.first_name || '',
                      last_name: sellerData?.last_name || '',
                      mobile_number: sellerData?.mobile_number || '',
                      land_phone_number: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={sellerData?.email_address || ''}
                    onChange={(e) => setSellerData({ 
                      ...sellerData,
                      vehicle_id: vehicleId!,
                      first_name: sellerData?.first_name || '',
                      last_name: sellerData?.last_name || '',
                      mobile_number: sellerData?.mobile_number || '',
                      email_address: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Options Tab */}
            <TabsContent value="options" className="space-y-4 mt-6">
              {/* Standard Options */}
              <div>
                <h3 className="font-semibold mb-3">Standard Options</h3>
                <div className="grid grid-cols-3 gap-3">
                  {standardOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => handleOptionToggle(option.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">{option.option_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Options */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Special Options</h3>
                <div className="grid grid-cols-3 gap-3">
                  {specialOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => handleOptionToggle(option.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">{option.option_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Options */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Custom Options</h3>
                <div className="space-y-2">
                  {customOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                      />
                      <button
                        onClick={() => handleCustomOptionRemove(option)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom option"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCustomOptionAdd(e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        handleCustomOptionAdd(input.value)
                        input.value = ''
                      }}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tag Notes</label>
                <textarea
                  value={vehicleData.tag_notes || ''}
                  onChange={(e) => setVehicleData({ ...vehicleData, tag_notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Internal notes (not visible to customers)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Special Notes for Print</label>
                <textarea
                  value={vehicleData.special_note_print || ''}
                  onChange={(e) => setVehicleData({ ...vehicleData, special_note_print: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Notes to be printed on vehicle documents"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 bg-white text-gray-900 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
