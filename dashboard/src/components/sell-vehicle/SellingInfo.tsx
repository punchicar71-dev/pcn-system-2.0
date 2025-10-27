'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';

interface SellingInfoProps {
  formData: {
    searchVehicle: string;
    selectedVehicle: any | null;
    sellingAmount: string;
    advanceAmount: string;
    paymentType: string;
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

    fetchVehicles();
    fetchSalesAgents();
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
        seller_name: seller ? `${seller.first_name} ${seller.last_name}` : 'N/A',
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.searchVehicle}
                  onChange={(e) => {
                    onChange('searchVehicle', e.target.value);
                    if (!e.target.value) {
                      onChange('selectedVehicle', null);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <input
                type="number"
                value={formData.sellingAmount}
                onChange={(e) => onChange('sellingAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Rs"
                required
              />
            </div>

            {/* Advance Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance Amount
              </label>
              <input
                type="number"
                value={formData.advanceAmount}
                onChange={(e) => onChange('advanceAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Rs"
              />
            </div>

            {/* Payment Type */}
            <div>
              <label className="block  w-[400px]  text-sm font-medium text-gray-700 mb-1">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentType}
                onChange={(e) => onChange('paymentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select option...</option>
                <option value="Cash">Cash</option>
                <option value="Leasing">Leasing</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
              </select>
            </div>

            {/* In-House Sales Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                In-House Sales Agent
              </label>
              <select
                value={formData.inHouseSalesAgent}
                onChange={(e) => onChange('inHouseSalesAgent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select option...</option>
                {salesAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Third Party Sales Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Third Party Sales Agent
              </label>
              <input
                type="text"
                value={formData.thirdPartySalesAgent}
                onChange={(e) => onChange('thirdPartySalesAgent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: John Doe"
              />
            </div>
          </div>

          {/* Right Column - Vehicle Details Card */}
          <div>
            {formData.selectedVehicle ? (
              <div className="bg-gray-50  w-[400px] rounded-lg p-4 border border-gray-200 sticky top-32">
                {/* Vehicle Image */}
                {formData.selectedVehicle.images?.length > 0 && formData.selectedVehicle.images[0].image_url ? (
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
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
                
                {/* Vehicle Number */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {formData.selectedVehicle.vehicle_number}
                </h3>
                
                {/* Brand and Model */}
                <p className="text-lg text-gray-700 mb-4">
                  {formData.selectedVehicle.brand_name} {formData.selectedVehicle.model_name}{' '}
                  {formData.selectedVehicle.manufacture_year}
                </p>

                {/* Seller Details */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Seller Details</span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-medium">{formData.selectedVehicle.seller_name || 'N/A'}</p>
                    {formData.selectedVehicle.seller_address && (
                      <p>{formData.selectedVehicle.seller_address}</p>
                    )}
                    {formData.selectedVehicle.seller_city && (
                      <p>{formData.selectedVehicle.seller_city}</p>
                    )}
                    <p className="text-blue-600">{formData.selectedVehicle.seller_mobile || 'N/A'}</p>
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
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            disabled={!formData.selectedVehicle}
          >
            Sell Vehicle
          </button>
        </div>
      </form>
    </div>
  );
}
