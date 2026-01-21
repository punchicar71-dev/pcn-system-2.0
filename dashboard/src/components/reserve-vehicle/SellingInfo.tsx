'use client';

import { Search, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SalesCommission {
  id: string;
  name: string;
  min_price: number;
  max_price: number;
  commission_amount: number;
  is_active: boolean;
}

interface SellingInfoProps {
  formData: {
    searchVehicle: string;
    selectedVehicle: any | null;
    sellingAmount: string;
    salesCommissionId: string;
    leasingCompany: string;
    inHouseSalesAgent: string;
    thirdPartySalesAgent: string;
    tagNotes: string; // Internal notes - recalled from vehicle
  };
  onChange: (field: string, value: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  disabled?: boolean; // 🔒 New: Disable form when vehicle is locked
  isSubmitting?: boolean; // Show spinner during submission
}

export default function SellingInfo({ formData, onChange, onBack, onSubmit, disabled = false, isSubmitting = false }: SellingInfoProps) {
  const [salesAgents, setSalesAgents] = useState<any[]>([]);
  const [leasingCompanies, setLeasingCompanies] = useState<any[]>([]);
  const [salesCommissions, setSalesCommissions] = useState<SalesCommission[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Refs for debouncing and request cancellation
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchRequestIdRef = useRef<number>(0);

  // Fetch sales agents, leasing companies, and sales commissions on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsInitialLoading(true);
        const supabase = createClient();
        
        // Fetch sales agents, leasing companies, and sales commissions in parallel
        const [agentsResult, companiesResult, commissionsResult] = await Promise.all([
          supabase
            .from('sales_agents')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true }),
          supabase
            .from('leasing_companies')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true }),
          supabase
            .from('sales_commissions')
            .select('*')
            .eq('is_active', true)
            .order('min_price', { ascending: true })
        ]);

        if (agentsResult.error) {
          console.error('Error fetching sales agents:', agentsResult.error);
        } else {
          setSalesAgents(agentsResult.data || []);
        }

        if (companiesResult.error) {
          console.error('Error fetching leasing companies:', companiesResult.error);
        } else {
          setLeasingCompanies(companiesResult.data || []);
        }

        if (commissionsResult.error) {
          console.error('Error fetching sales commissions:', commissionsResult.error);
        } else {
          setSalesCommissions(commissionsResult.data || []);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Auto-select sales commission based on selling amount - Real-time detection
  const findMatchingSalesCommission = useCallback((amount: number): string | undefined => {
    if (!salesCommissions.length || amount <= 0) return undefined;
    
    // First, try to find exact match within a range
    const exactMatch = salesCommissions.find(
      commission => amount >= commission.min_price && amount <= commission.max_price
    );
    
    if (exactMatch) {
      return exactMatch.id;
    }
    
    // If amount exceeds all ranges, select the highest category
    const sortedByMaxPrice = [...salesCommissions].sort((a, b) => b.max_price - a.max_price);
    const highestCategory = sortedByMaxPrice[0];
    
    if (highestCategory && amount > highestCategory.max_price) {
      return highestCategory.id;
    }
    
    // If amount is below all ranges, select the lowest category
    const sortedByMinPrice = [...salesCommissions].sort((a, b) => a.min_price - b.min_price);
    const lowestCategory = sortedByMinPrice[0];
    
    if (lowestCategory && amount < lowestCategory.min_price) {
      return lowestCategory.id;
    }
    
    return undefined;
  }, [salesCommissions]);

  // Handle selling amount change with auto-selection logic
  const handleSellingAmountChange = (value: string) => {
    const numericAmount = parseFloat(value) || 0;
    
    onChange('sellingAmount', value);
    
    // Auto-select sales commission based on amount - Real-time update
    if (numericAmount > 0) {
      const matchingCommissionId = findMatchingSalesCommission(numericAmount);
      if (matchingCommissionId) {
        onChange('salesCommissionId', matchingCommissionId);
      }
    } else {
      // Clear selection if amount is 0 or empty
      onChange('salesCommissionId', '');
    }
  };

  // Get the matched commission for display
  const matchedCommission = salesCommissions.find(c => c.id === formData.salesCommissionId);

  // Debounced server-side vehicle search - Multi-field search
  const searchVehicles = useCallback(async (searchTerm: string, requestId: number) => {
    if (!searchTerm || searchTerm.length < 2) {
      setFilteredVehicles([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const supabase = createClient();
      
      // Server-side search with OR conditions for multiple fields:
      // - Vehicle Number
      // - Seller Name
      // - Seller Mobile (Phone Number)
      // - Seller NIC (ID Number)
      // - Brand Name
      // - Model Name
      // Using Supabase OR filter for case-insensitive matching
      const searchPattern = `%${searchTerm}%`;
      
      const { data, error } = await supabase
        .from('vehicle_inventory_view')
        .select('id, vehicle_number, brand_name, model_name, manufacture_year, selling_amount, status, body_type, engine_capacity, exterior_color, fuel_type, transmission, mileage, entry_type, seller_name, seller_mobile, seller_nic')
        .eq('status', 'In Sale')
        .or(`vehicle_number.ilike.${searchPattern},seller_name.ilike.${searchPattern},seller_mobile.ilike.${searchPattern},seller_nic.ilike.${searchPattern},brand_name.ilike.${searchPattern},model_name.ilike.${searchPattern}`)
        .order('vehicle_number', { ascending: true })
        .limit(15); // Limit results for performance

      // Check if this is still the latest request (prevent race conditions)
      if (requestId !== searchRequestIdRef.current) {
        return; // Stale request, ignore results
      }

      if (error) {
        console.error('Error searching vehicles:', error);
        setFilteredVehicles([]);
      } else {
        setFilteredVehicles(data || []);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Error searching vehicles:', error);
      setFilteredVehicles([]);
    } finally {
      // Only update loading state if this is still the latest request
      if (requestId === searchRequestIdRef.current) {
        setIsSearching(false);
      }
    }
  }, []);

  // Handle search input change with debouncing
  useEffect(() => {
    // Don't search if vehicle is already selected
    if (formData.selectedVehicle) {
      setFilteredVehicles([]);
      setShowDropdown(false);
      return;
    }

    // Clear previous timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const searchTerm = formData.searchVehicle.trim();
    
    // If search is empty or too short, clear results immediately
    if (!searchTerm || searchTerm.length < 2) {
      setFilteredVehicles([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    // Show loading indicator immediately
    setIsSearching(true);
    
    // Increment request ID to track latest request
    const requestId = ++searchRequestIdRef.current;

    // Debounce the search by 300ms
    searchDebounceRef.current = setTimeout(() => {
      searchVehicles(searchTerm, requestId);
    }, 300);

    // Cleanup on unmount or when search term changes
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [formData.searchVehicle, formData.selectedVehicle, searchVehicles]);

  const [isSelectingVehicle, setIsSelectingVehicle] = useState(false);

  const handleVehicleSelect = async (vehicle: any) => {
    try {
      setIsSelectingVehicle(true);
      setShowDropdown(false); // Hide dropdown immediately for better UX
      
      const supabase = createClient();
      
      // Fetch vehicle images, seller details, and tag notes in parallel for faster loading
      const [imagesResult, sellerResult, vehicleResult] = await Promise.all([
        supabase
          .from('vehicle_images')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .eq('image_type', 'gallery')
          .order('display_order', { ascending: true }),
        supabase
          .from('sellers')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .maybeSingle(), // Use maybeSingle to avoid error when no seller exists
        supabase
          .from('vehicles')
          .select('tag_notes, country_id, countries:country_id(name), registered_year')
          .eq('id', vehicle.id)
          .single()
      ]);

      if (imagesResult.error) {
        console.error('Error fetching vehicle images:', imagesResult.error);
      }

      if (sellerResult.error) {
        console.error('Error fetching seller details:', sellerResult.error);
      }

      const images = imagesResult.data;
      const seller = sellerResult.data;
      const vehicleDetails = vehicleResult.data;

      // Combine all data
      const completeVehicleData = {
        ...vehicle,
        images: images || [],
        seller_name: seller ? `${seller.title || ''} ${seller.first_name} ${seller.last_name}`.trim() : 'N/A',
        seller_mobile: seller?.mobile_number || 'N/A',
        seller_address: seller?.address || '',
        seller_city: seller?.city || '',
        tag_notes: vehicleDetails?.tag_notes || '',
        country_name: (vehicleDetails?.countries as any)?.name || '',
        registered_year: vehicleDetails?.registered_year || vehicle.registered_year || null,
      };

      onChange('selectedVehicle', completeVehicleData);
      onChange('searchVehicle', vehicle.vehicle_number);
      // Recall tag notes from vehicle to the form
      onChange('tagNotes', vehicleDetails?.tag_notes || '');
    } catch (error) {
      console.error('Error selecting vehicle:', error);
    } finally {
      setIsSelectingVehicle(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-slate-50 z-10 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Setup Selling information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column - Form Fields */}
          <div className="space-y-6 w-full lg:w-[500px] flex-shrink-0">
            {/* Search Vehicle */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Vehicle <span className="text-red-500">*</span>
                {formData.searchVehicle.length > 0 && formData.searchVehicle.length < 2 && (
                  <span className="text-xs text-gray-400 ml-2">(type at least 2 characters)</span>
                )}
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
                  className="pl-10 pr-10"
                  placeholder="Search by Vehicle No, Seller, Phone, Brand or Model"
                  required
                  disabled={disabled || isSelectingVehicle}
                />
                {(isSearching || isSelectingVehicle) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                  </div>
                )}
              </div>
              
              {/* Dropdown for vehicle search results */}
              {showDropdown && !isSelectingVehicle && filteredVehicles.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => handleVehicleSelect(vehicle)}
                      className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-gray-900">{vehicle.vehicle_number}</div>
                        {vehicle.seller_mobile && (
                          <span className="text-xs text-gray-400">{vehicle.seller_mobile}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {vehicle.brand_name} {vehicle.model_name} - {vehicle.manufacture_year}
                      </div>
                      {vehicle.seller_name && vehicle.seller_name !== 'N/A' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Seller: {vehicle.seller_name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Loading message while searching */}
              {showDropdown && isSearching && filteredVehicles.length === 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                    <p className="text-sm text-gray-500">Searching vehicles...</p>
                  </div>
                </div>
              )}
              
              {/* No results message */}
              {showDropdown && formData.searchVehicle.length >= 2 && filteredVehicles.length === 0 && !isSearching && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
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
                onChange={(e) => handleSellingAmountChange(e.target.value)}
                placeholder="Rs"
                required
                disabled={disabled}
              />
            </div>

            {/* Sales Commission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Commission
                <span className="text-xs font-normal text-gray-500 ml-1">(Auto-detected based on amount)</span>
              </label>
              <Select 
                value={formData.salesCommissionId} 
                onValueChange={(value) => onChange('salesCommissionId', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sales commission" />
                </SelectTrigger>
                <SelectContent>
                  {salesCommissions.map((commission) => (
                    <SelectItem key={commission.id} value={commission.id}>
                      {commission.name} (Rs. {commission.min_price.toLocaleString()} - Rs. {commission.max_price.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {matchedCommission && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Matched: {matchedCommission.name} | Commission: Rs. {matchedCommission.commission_amount.toLocaleString()}
                </p>
              )}
            </div>

            {/* Office Sales Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office Sales Agent
              </label>
              <Select
                value={formData.inHouseSalesAgent}
                onValueChange={(value) => onChange('inHouseSalesAgent', value)}
                disabled={disabled}
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
                disabled={disabled}
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

            {/* Tag Notes - Internal Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internal Notes (Tag Notes)
                {formData.selectedVehicle?.tag_notes && (
                  <span className="text-xs text-blue-500 ml-2">(Recalled from vehicle)</span>
                )}
              </label>
              <textarea
                value={formData.tagNotes}
                onChange={(e) => onChange('tagNotes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Add internal notes about this sale..."
                disabled={disabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.tagNotes.length} characters • These notes will be saved with the vehicle
              </p>
            </div>
          </div>

          {/* Right Column - Vehicle Details Card */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            {formData.selectedVehicle ? (
              <div className="bg-gray-100 rounded-lg p-4 sticky top-32">
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
            ) : isSelectingVehicle ? (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 text-center">
                    Loading vehicle details...
                  </p>
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
            disabled={disabled}
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="default"
            className="px-8 py-3 font-medium"
            disabled={!formData.selectedVehicle || disabled || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Reserve Vehicle'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
