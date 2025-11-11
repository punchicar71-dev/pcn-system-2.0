'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SellingInfoProps {
  formData: {
    searchVehicle: string;
    selectedVehicle: any | null;
    sellingAmount: string;
    advanceAmount: string;
    paymentType: string;
    leasingCompany: string;
    inHouseSalesAgent: string;
    thirdPartySalesAgent: string;
  };
  onChange: (field: string, value: any) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function SellingInfo({ formData, onChange, onBack, onSubmit }: SellingInfoProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [salesAgents, setSalesAgents] = useState<any[]>([]);
  const [leasingCompanies, setLeasingCompanies] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available vehicles from inventory
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        // Fetch only vehicles with status "In Sale"
        const { data, error } = await supabase
          .from('vehicle_inventory_view')
          .select('*')
          .eq('status', 'In Sale')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching vehicles:', error);
          return;
        }

        setVehicles(data || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSalesAgents = async () => {
      try {
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('sales_agents')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching sales agents:', error);
          return;
        }

        setSalesAgents(data || []);
      } catch (error) {
        console.error('Error fetching sales agents:', error);
      }
    };

    const fetchLeasingCompanies = async () => {
      try {
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('leasing_companies')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching leasing companies:', error);
          return;
        }

        setLeasingCompanies(data || []);
      } catch (error) {
        console.error('Error fetching leasing companies:', error);
      }
    };

    fetchVehicles();
    fetchSalesAgents();
    fetchLeasingCompanies();
  }, []);

  // Filter vehicles based on search input
  useEffect(() => {
    if (formData.searchVehicle && !formData.selectedVehicle) {
      const filtered = vehicles.filter((vehicle) =>
        vehicle.vehicle_number.toLowerCase().includes(formData.searchVehicle.toLowerCase())
      );
      setFilteredVehicles(filtered);
      setShowDropdown(true);
    } else {
      setFilteredVehicles([]);
      setShowDropdown(false);
    }
  }, [formData.searchVehicle, vehicles, formData.selectedVehicle]);

  const handleVehicleSelect = async (vehicle: any) => {
    try {
      const supabase = createClient();
      
      // Fetch vehicle images
      const { data: images, error: imagesError } = await supabase
        .from('vehicle_images')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .eq('image_type', 'gallery')
        .order('display_order', { ascending: true });

      if (imagesError) {
        console.error('Error fetching vehicle images:', imagesError);
      }

      // Fetch seller details
      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .single();

      if (sellerError) {
        console.error('Error fetching seller details:', sellerError);
      }

      // Combine all data
      const completeVehicleData = {
        ...vehicle,
        images: images || [],
        seller_name: seller ? `${seller.title || ''} ${seller.first_name} ${seller.last_name}`.trim() : 'N/A',
        seller_mobile: seller?.mobile_number || 'N/A',
        seller_address: seller?.address || '',
        seller_city: seller?.city || '',
      };

      onChange('selectedVehicle', completeVehicleData);
      onChange('searchVehicle', vehicle.vehicle_number);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error selecting vehicle:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white  p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Setup Selling information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col-2 lg:flex-cols-2 gap-10">
          {/* Left Column - Form Fields */}
          <div className="space-y-6  w-[500px] ">
            {/* Search Vehicle */}
            <div className="relative">
              <label className="block w-[400px] text-sm font-medium text-gray-700 mb-1">
                Search Vehicle <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="text"
                  value={formData.searchVehicle}
                  onChange={(e) => {
                    onChange('searchVehicle', e.target.value);
                    if (!e.target.value) {
                      onChange('selectedVehicle', null);
                    }
                  }}
                  className="pl-10 pr-4"
                  placeholder="Search by Vehicle Number"
                  required
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                  </div>
                )}
              </div>
              
              {/* Dropdown for vehicle search results */}
              {showDropdown && filteredVehicles.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => handleVehicleSelect(vehicle)}
                      className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{vehicle.vehicle_number}</div>
                      <div className="text-sm text-gray-500">
                        {vehicle.brand_name} {vehicle.model_name} - {vehicle.manufacture_year}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No results message */}
              {showDropdown && formData.searchVehicle && filteredVehicles.length === 0 && !isLoading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                  <p className="text-sm text-gray-500 text-center">No vehicles found matching "{formData.searchVehicle}"</p>
                </div>
              )}
            </div>

            {/* Selling Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.sellingAmount}
                onChange={(e) => onChange('sellingAmount', e.target.value)}
                placeholder="Rs"
                required
              />
            </div>

            {/* Advance Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance Amount
              </label>
              <Input
                type="number"
                value={formData.advanceAmount}
                onChange={(e) => onChange('advanceAmount', e.target.value)}
                placeholder="Rs"
              />
            </div>

            {/* To Pay Amount - Calculated */}
            {formData.sellingAmount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  To Pay Amount
                </label>
                <div className="text-[18px] font-bold text-blue-700">
                  Rs. {(
                    parseFloat(formData.sellingAmount || '0') - 
                    parseFloat(formData.advanceAmount || '0')
                  ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            )}

            {/* Payment Type */}
            <div>
              <label className="block w-[400px] text-sm font-medium text-gray-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.paymentType}
                onValueChange={(value) => onChange('paymentType', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Leasing">Leasing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leasing Company - Only show when Payment Type is Leasing */}
            {formData.paymentType === 'Leasing' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Leasing Company <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.leasingCompany}
                  onValueChange={(value) => onChange('leasingCompany', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leasing company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leasingCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Office Sales Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office Sales Agent
              </label>
              <Select
                value={formData.inHouseSalesAgent}
                onValueChange={(value) => onChange('inHouseSalesAgent', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option..." />
                </SelectTrigger>
                <SelectContent>
                  {salesAgents.filter((agent) => agent.agent_type === 'Office Sales Agent').map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Showroom Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Showroom Agent
              </label>
              <Select
                value={formData.thirdPartySalesAgent}
                onValueChange={(value) => onChange('thirdPartySalesAgent', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option..." />
                </SelectTrigger>
                <SelectContent>
                  {salesAgents.filter((agent) => agent.agent_type === 'Vehicle Showroom Agent').map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column - Vehicle Details Card */}
          <div>
            {formData.selectedVehicle ? (
              <div className="bg-gray-100 mt-6 w-[400px] rounded-lg p-4  sticky top-32">
                {/* Vehicle Image */}
                {formData.selectedVehicle.images?.length > 0 && formData.selectedVehicle.images[0].image_url ? (
                  <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden bg-gray-200">
                    <Image
                      src={formData.selectedVehicle.images[0].image_url}
                      alt={formData.selectedVehicle.vehicle_number}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                
                <div className='flex gap-3'>
                {/* Brand and Model */}
                <p className="text-lg text-gray-700 mb-4">
                  {formData.selectedVehicle.brand_name} {formData.selectedVehicle.model_name}{' '}
                  {formData.selectedVehicle.manufacture_year}
                </p>
                <span>:</span>
               {/* Vehicle Number */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {formData.selectedVehicle.vehicle_number}
                </h3>
                </div>
                
                

                {/* Seller Details */}
                <div className="bg-white p-4 rounded-md ">
                  <div className="flex w-full items-center gap-2 border-b mb-5">
                    
                    <span className="text-sm w-full font-medium  mb-3 text-gray-700">Seller Details</span>
                  </div>
                  
                  <div className="space-y-1 ">
                    <p className="font-medium"><span className='text-[14px] font-normal text-gray-500'>Name: </span><span className='text-[14px] font-semibold text-gray-900' >{formData.selectedVehicle.seller_name || 'N/A'}</span></p>
                    {formData.selectedVehicle.seller_address && (
                      <p><span className='text-[14px] font-normal text-gray-500'>Address: </span><span className='text-[14px] font-semibold text-gray-900' >{formData.selectedVehicle.seller_address}</span></p>
                    )}
                    {formData.selectedVehicle.seller_city && (
                      <p><span className='text-[14px] font-normal text-gray-500'>City: </span><span className='text-[14px] font-semibold text-gray-900' >{formData.selectedVehicle.seller_city}</span></p>
                    )}
                    <p className="text-blue-600"><span className='text-[14px] font-normal text-gray-500'>Mobile: </span><span className='text-[14px] font-semibold text-gray-900' >{formData.selectedVehicle.seller_mobile || 'N/A'}</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 text-center">
                    Search and select a vehicle to see details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start gap-4 pt-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="px-8 py-3 font-medium"
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="default"
            className="px-8 py-3 font-medium"
            disabled={!formData.selectedVehicle}
          >
            Sell Vehicle
          </Button>
        </div>
      </form>
    </div>
  );
}
