'use client';

import { Search, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  disabled?: boolean; // 🔒 New: Disable form when vehicle is locked
  isSubmitting?: boolean; // Show spinner during submission
}

export default function SellingInfo({ formData, onChange, onBack, onSubmit, disabled = false, isSubmitting = false }: SellingInfoProps) {
  const [salesAgents, setSalesAgents] = useState<any[]>([]);
  const [leasingCompanies, setLeasingCompanies] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Refs for debouncing and request cancellation
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchRequestIdRef = useRef<number>(0);

  // Memoize supabase client for performance
  const supabase = useMemo(() => createClient(), []);

  // Fetch sales agents and leasing companies on mount (these are small lists)
  const fetchInitialData = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      
      // Fetch sales agents and leasing companies in parallel for better performance
      const [agentsResult, companiesResult] = await Promise.all([
        supabase
          .from('sales_agents')
          .select('id, name, agent_type, is_active')
          .eq('is_active', true)
          .order('name', { ascending: true }),
        supabase
          .from('leasing_companies')
          .select('id, name, is_active')
          .eq('is_active', true)
          .order('name', { ascending: true })
      ]);

      if (!agentsResult.error && agentsResult.data) {
        setSalesAgents(agentsResult.data);
      } else if (agentsResult.error) {
        console.error('Error fetching sales agents:', agentsResult.error);
      }

      if (!companiesResult.error && companiesResult.data) {
        setLeasingCompanies(companiesResult.data);
      } else if (companiesResult.error) {
        console.error('Error fetching leasing companies:', companiesResult.error);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Debounced server-side vehicle search with optimized query
  const searchVehicles = useCallback(async (searchTerm: string, requestId: number) => {
    if (!searchTerm || searchTerm.length < 2) {
      setFilteredVehicles([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      
      // Normalize search term for better matching
      const normalizedSearch = searchTerm.trim().toUpperCase();
      
      // Server-side search with ILIKE for case-insensitive matching
      // Using indexed columns for faster search
      const { data, error } = await supabase
        .from('vehicle_inventory_view')
        .select('id, vehicle_number, brand_name, model_name, manufacture_year, selling_amount, status, body_type')
        .eq('status', 'In Sale')
        .or(`vehicle_number.ilike.%${normalizedSearch}%,brand_name.ilike.%${normalizedSearch}%,model_name.ilike.%${normalizedSearch}%`)
        .order('vehicle_number', { ascending: true })
        .limit(15); // Increased limit for better search results

      // Check if this is still the latest request (prevent race conditions)
      if (requestId !== searchRequestIdRef.current) {
        return; // Stale request, ignore results
      }

      if (error) {
        console.error('Error searching vehicles:', error);
        setFilteredVehicles([]);
      } else {
        setFilteredVehicles(data || []);
        setShowDropdown(data && data.length > 0);
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
  }, [supabase]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the search input and dropdown
      if (!target.closest('[data-vehicle-search]')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const [isSelectingVehicle, setIsSelectingVehicle] = useState(false);

  const handleVehicleSelect = useCallback(async (vehicle: any) => {
    try {
      setIsSelectingVehicle(true);
      setShowDropdown(false); // Hide dropdown immediately for better UX
      setFilteredVehicles([]); // Clear search results
      
      // Fetch vehicle images and seller details in parallel for faster loading
      const [imagesResult, sellerResult] = await Promise.all([
        supabase
          .from('vehicle_images')
          .select('image_url, display_order, image_type')
          .eq('vehicle_id', vehicle.id)
          .eq('image_type', 'gallery')
          .order('display_order', { ascending: true })
          .limit(1), // Only need first image for preview
        supabase
          .from('sellers')
          .select('title, first_name, last_name, mobile_number, address, city')
          .eq('vehicle_id', vehicle.id)
          .maybeSingle() // Use maybeSingle to avoid error when no seller exists
      ]);

      if (imagesResult.error) {
        console.error('Error fetching vehicle images:', imagesResult.error);
      }

      if (sellerResult.error) {
        console.error('Error fetching seller details:', sellerResult.error);
      }

      const images = imagesResult.data;
      const seller = sellerResult.data;

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
    } catch (error) {
      console.error('Error selecting vehicle:', error);
      alert('Failed to load vehicle details. Please try again.');
    } finally {
      setIsSelectingVehicle(false);
    }
  }, [supabase, onChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  }, [onSubmit]);

  // Memoize filtered agents by type for better performance
  const officeSalesAgents = useMemo(
    () => salesAgents.filter(agent => agent.agent_type === 'Office Sales Agent'),
    [salesAgents]
  );

  const vehicleShowroomAgents = useMemo(
    () => salesAgents.filter(agent => agent.agent_type === 'Vehicle Showroom Agent'),
    [salesAgents]
  );

  return (
    <div className="bg-slate-50 z-10 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Setup Selling information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column - Form Fields */}
          <div className="space-y-6 w-full lg:w-[500px] flex-shrink-0">
            {/* Search Vehicle */}
            <div className="relative" data-vehicle-search>
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
                  placeholder="Search by Vehicle Number, Brand, or Model"
                  required
                  disabled={disabled || isSelectingVehicle}
                  autoComplete="off"
                />
                {(isSearching || isSelectingVehicle) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                  </div>
                )}
              </div>
              
              {/* Dropdown for vehicle search results */}
              {showDropdown && !isSelectingVehicle && filteredVehicles.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                onChange={(e) => onChange('sellingAmount', e.target.value)}
                placeholder="Rs"
                required
                disabled={disabled}
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
                disabled={disabled}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.paymentType}
                onValueChange={(value) => onChange('paymentType', value)}
                required
                disabled={disabled}
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
                  disabled={disabled}
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
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option..." />
                </SelectTrigger>
                <SelectContent>
                  {officeSalesAgents.map((agent) => (
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
                  {vehicleShowroomAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              'Sell Vehicle'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
