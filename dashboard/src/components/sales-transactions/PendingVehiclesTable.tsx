'use client';

import { Search, Eye, Trash2, ChevronLeft, ChevronRight, Printer, Undo2, DollarSign, ImageIcon, StickyNote, X, Loader2, RotateCcw, CalendarIcon, NotepadText } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';
import { format, isWithinInterval, startOfDay, endOfDay, differenceInMilliseconds } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface PendingVehiclesTableProps {
  onViewDetail: (saleId: string) => void;
  onSoldOut: (saleId: string) => void;
  onDelete: (saleId: string) => void;
  onPrintDocument: (saleId: string) => void;
  onPaymentMethod: (saleId: string) => void;
  refreshKey?: number;
}

interface Brand {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
  brand_id: string;
}

interface Country {
  id: string;
  name: string;
}

export default function PendingVehiclesTable({ 
  onViewDetail, 
  onSoldOut, 
  onDelete,
  onPrintDocument,
  onPaymentMethod,
  refreshKey = 0
}: PendingVehiclesTableProps) {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [brandFilter, setBrandFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Filter Options
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  
  // Tag Notes Modal State
  const [isTagNotesModalOpen, setIsTagNotesModalOpen] = useState(false);
  const [selectedSaleForNotes, setSelectedSaleForNotes] = useState<any>(null);
  const [tagNotesValue, setTagNotesValue] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch pending sales
  useEffect(() => {
    fetchPendingSales();
  }, [refreshKey]);

  const fetchFilterOptions = async () => {
    try {
      const supabase = createClient();
      
      // Fetch brands, models, and countries in parallel
      const [brandsResult, modelsResult, countriesResult] = await Promise.all([
        supabase
          .from('vehicle_brands')
          .select('id, name')
          .eq('is_active', true)
          .order('name', { ascending: true }),
        supabase
          .from('vehicle_models')
          .select('id, name, brand_id')
          .eq('is_active', true)
          .order('name', { ascending: true }),
        supabase
          .from('countries')
          .select('id, name')
          .eq('is_active', true)
          .order('name', { ascending: true })
      ]);

      if (brandsResult.data) setBrands(brandsResult.data);
      if (modelsResult.data) setModels(modelsResult.data);
      if (countriesResult.data) setCountries(countriesResult.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchPendingSales = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      // Fetch advance paid sales with vehicle details including new fields
      const { data: pendingSales, error } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles:vehicle_id (
            id,
            vehicle_number,
            brand_id,
            model_id,
            manufacture_year,
            registered_year,
            mileage,
            transmission,
            country_id,
            vehicle_brands:brand_id (
              id,
              name
            ),
            vehicle_models:model_id (
              id,
              name
            ),
            countries:country_id (
              id,
              name
            ),
            vehicle_images (
              id,
              image_url,
              is_primary,
              display_order
            )
          ),
          sales_agents:sales_agent_id (
            id,
            name
          )
        `)
        .eq('status', 'advance_paid')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching advance paid sales:', error);
        return;
      }

      // Fetch seller information for each vehicle
      const vehicleIds = pendingSales?.map((sale: any) => sale.vehicle_id).filter(Boolean) || [];
      let sellersMap: { [key: string]: { name: string; mobile: string; nic: string } } = {};
      
      if (vehicleIds.length > 0) {
        const { data: sellersData } = await supabase
          .from('sellers')
          .select('vehicle_id, first_name, last_name, mobile_number, nic_number')
          .in('vehicle_id', vehicleIds);
        
        if (sellersData) {
          sellersData.forEach((seller: any) => {
            sellersMap[seller.vehicle_id] = {
              name: `${seller.first_name || ''} ${seller.last_name || ''}`.trim(),
              mobile: seller.mobile_number || '',
              nic: seller.nic_number || ''
            };
          });
        }
      }

      // Transform data for display
      // Priority: Use stored vehicle snapshot, fallback to joined vehicle data for backwards compatibility
      const transformedData = pendingSales?.map((sale: any) => {
        // Get primary image or first image from vehicle
        let imageUrl = sale.image_url; // First check snapshot
        if (!imageUrl && sale.vehicles?.vehicle_images?.length > 0) {
          const primaryImage = sale.vehicles.vehicle_images.find((img: any) => img.is_primary);
          imageUrl = primaryImage?.image_url || sale.vehicles.vehicle_images[0]?.image_url;
        }

        return {
          id: sale.id,
          vehicle_id: sale.vehicle_id, // Needed for tag_notes update
          // Image
          image_url: imageUrl || null,
          // Use stored snapshot first (preserves data), fallback to joined data
          vehicle_number: sale.vehicle_number || sale.vehicles?.vehicle_number || 'N/A',
          brand_name: sale.brand_name || sale.vehicles?.vehicle_brands?.name || 'N/A',
          model_name: sale.model_name || sale.vehicles?.vehicle_models?.name || 'N/A',
          manufacture_year: sale.manufacture_year || sale.vehicles?.manufacture_year || 'N/A',
          registered_year: sale.registered_year || sale.vehicles?.registered_year || '-',
          mileage: sale.mileage || sale.vehicles?.mileage || '-',
          country_name: sale.country_name || sale.vehicles?.countries?.name || '-',
          transmission: sale.transmission || sale.vehicles?.transmission || '-',
          payment_type: sale.payment_type,
          sales_agent_name: sale.sales_agents?.name || sale.third_party_agent || 'N/A',
          customer_name: sale.customer_name || 'N/A',
          seller_name: sellersMap[sale.vehicle_id]?.name || '',
          seller_mobile: sellersMap[sale.vehicle_id]?.mobile || '',
          seller_nic: sellersMap[sale.vehicle_id]?.nic || '',
          selling_price: sale.sale_price || sale.selling_price || sale.selling_amount || 0,
          created_at: sale.created_at,
        };
      }) || [];

      setSalesData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error('Error fetching advance paid sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get filtered models based on selected brand
  const filteredModels = useMemo(() => {
    if (brandFilter === 'all') return models;
    const selectedBrand = brands.find(b => b.name === brandFilter);
    if (!selectedBrand) return models;
    return models.filter(m => m.brand_id === selectedBrand.id);
  }, [brandFilter, brands, models]);

  // Filter data based on search query and filters
  useEffect(() => {
    let filtered = salesData;

    // Brand filter
    if (brandFilter !== 'all') {
      filtered = filtered.filter((sale) => 
        sale.brand_name.toLowerCase() === brandFilter.toLowerCase()
      );
    }

    // Model filter
    if (modelFilter !== 'all') {
      filtered = filtered.filter((sale) => 
        sale.model_name.toLowerCase() === modelFilter.toLowerCase()
      );
    }

    // Country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter((sale) => 
        sale.country_name.toLowerCase() === countryFilter.toLowerCase()
      );
    }

    // Date range filter
    if (dateRange?.from || dateRange?.to) {
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.created_at);
        
        if (dateRange.from && dateRange.to) {
          return isWithinInterval(saleDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to)
          });
        } else if (dateRange.from) {
          return saleDate >= startOfDay(dateRange.from);
        } else if (dateRange.to) {
          return saleDate <= endOfDay(dateRange.to);
        }
        return true;
      });
    }

    // Search filter - search by seller name, customer name, vehicle number, brand, model, country, seller mobile, seller NIC
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((sale) =>
        sale.vehicle_number.toLowerCase().includes(query) ||
        sale.brand_name.toLowerCase().includes(query) ||
        sale.model_name.toLowerCase().includes(query) ||
        sale.country_name.toLowerCase().includes(query) ||
        sale.customer_name.toLowerCase().includes(query) ||
        (sale.seller_name && sale.seller_name.toLowerCase().includes(query)) ||
        (sale.seller_mobile && sale.seller_mobile.toLowerCase().includes(query)) ||
        (sale.seller_nic && sale.seller_nic.toLowerCase().includes(query))
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchQuery, salesData, brandFilter, modelFilter, countryFilter, dateRange]);

  // Reset model filter when brand changes
  useEffect(() => {
    setModelFilter('all');
  }, [brandFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setBrandFilter('all');
    setModelFilter('all');
    setCountryFilter('all');
    setDateRange(undefined);
  };

  // Check if any filter is active
  const hasActiveFilters = searchQuery || brandFilter !== 'all' || modelFilter !== 'all' || countryFilter !== 'all' || dateRange?.from || dateRange?.to;

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'Cash':
        return 'bg-green-100 text-green-800';
      case 'Bank Transfer':
        return 'bg-yellow-100 text-yellow-800';
      case 'Check':
        return 'bg-purple-100 text-purple-800';
      case 'Leasing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // State for countdown timer refresh
  const [, setCountdownTick] = useState(0);

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTick(tick => tick + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate countdown status and display for "To Complete" column
  const getCompletionCountdown = (createdAt: string) => {
    const reserveDate = new Date(createdAt);
    const deadlineDate = new Date(reserveDate.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from reserve
    const now = new Date();
    
    const diffMs = differenceInMilliseconds(deadlineDate, now);
    
    if (diffMs <= 0) {
      // Overdue - calculate how much time has passed since deadline
      const overdueMs = Math.abs(diffMs);
      const overdueDays = Math.floor(overdueMs / (24 * 60 * 60 * 1000));
      const overdueHours = Math.floor((overdueMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      
      return {
        isOverdue: true,
        display: overdueDays > 0 
          ? `${overdueDays}d ${overdueHours}h overdue`
          : `${overdueHours}h overdue`,
        shortDisplay: overdueDays > 0 ? `${overdueDays}d ${overdueHours}h` : `${overdueHours}h`,
      };
    } else {
      // Within time - countdown remaining
      const remainingDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const remainingHours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      
      return {
        isOverdue: false,
        display: remainingDays > 0 
          ? `${remainingDays}d ${remainingHours}h left`
          : `${remainingHours}h left`,
        shortDisplay: remainingDays > 0 ? `${remainingDays}d ${remainingHours}h` : `${remainingHours}h`,
      };
    }
  };

  // Tag Notes Modal Functions
  const openTagNotesModal = async (sale: any) => {
    setSelectedSaleForNotes(sale);
    setIsTagNotesModalOpen(true);
    setIsLoadingNotes(true);
    
    try {
      const supabase = createClient();
      
      // Fetch current tag_notes from vehicles table
      if (sale.vehicle_id) {
        const { data, error } = await supabase
          .from('vehicles')
          .select('tag_notes')
          .eq('id', sale.vehicle_id)
          .single();
        
        if (error) {
          console.error('Error fetching tag notes:', error);
          setTagNotesValue('');
        } else {
          setTagNotesValue(data?.tag_notes || '');
        }
      } else {
        setTagNotesValue('');
      }
    } catch (error) {
      console.error('Error fetching tag notes:', error);
      setTagNotesValue('');
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const closeTagNotesModal = () => {
    setIsTagNotesModalOpen(false);
    setSelectedSaleForNotes(null);
    setTagNotesValue('');
  };

  const saveTagNotes = async () => {
    if (!selectedSaleForNotes?.vehicle_id) {
      alert('Cannot save notes: Vehicle not found');
      return;
    }
    
    setIsSavingNotes(true);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('vehicles')
        .update({ 
          tag_notes: tagNotesValue || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSaleForNotes.vehicle_id);
      
      if (error) {
        console.error('Error saving tag notes:', error);
        alert('Failed to save notes: ' + error.message);
        return;
      }
      
      // Close modal on success
      closeTagNotesModal();
    } catch (error) {
      console.error('Error saving tag notes:', error);
      alert('An error occurred while saving notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Loading...</div>
    </div>;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Section */}
      <div className="bg-slate-100 rounded-lg border p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search Field */}
          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Vehicle No, Brand, Model, Seller, Mobile, NIC, Country..."
                className="w-full h-9 shadow-sm text-sm pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div className="w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.name}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Filter */}
          <div className="w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {filteredModels.map((model) => (
                  <SelectItem key={model.id} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country Filter */}
          <div className="w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Countries" />
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

          {/* Date Range Filter */}
          <div className="w-[280px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-9 justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-9 px-3 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Active filters info */}
        {hasActiveFilters && (
          <p className="mt-3 text-sm text-gray-600">
            Found {filteredData.length} vehicle{filteredData.length !== 1 ? 's' : ''} matching your filters
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle No.
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  M.Year
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reg.Year
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mileage
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trans.
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Complete
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.length > 0 ? (
                currentData.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="w-[80px] h-[50px] relative rounded overflow-hidden bg-gray-100">
                        {sale.image_url ? (
                          <Image
                            src={sale.image_url}
                            alt={sale.vehicle_number}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sale.vehicle_number}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.brand_name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.model_name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.manufacture_year}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.registered_year}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sale.mileage !== '-' ? `${Number(sale.mileage).toLocaleString()} km` : '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.country_name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.transmission}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Rs. {Number(sale.selling_price).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentTypeColor(sale.payment_type)}`}>
                        {sale.payment_type}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {(() => {
                        const countdown = getCompletionCountdown(sale.created_at);
                        return (
                          <div
                            className={` inline-flex items-center text-xs font-semibold rounded-md ${
                              countdown.isOverdue
                                ? 'text-red-600 '
                                : ' text-blue-600 '
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              countdown.isOverdue ? 'bg-red-500' : 'bg-blue-500'
                            }`}></span>
                            {countdown.display}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetail(sale.id)}
                          className="p-2 text-[12px] font-medium text-black hover:text-white border border-gray-300 hover:bg-black rounded-md transition-colors"
                        >
            
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => openTagNotesModal(sale)}
                          className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 border border-gray-300 rounded-md transition-colors"
                          title="View/Edit Tag Notes"
                        >
                          <NotepadText className="w-4 h-4"/>
                          
                        </button>
                        <button
                          onClick={() => onPaymentMethod(sale.id)}
                          className="p-2 text-green-700 hover:text-white hover:bg-green-600 border border-gray-300 rounded-md transition-colors"
                          title="Set Payment Method"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPrintDocument(sale.id)}
                          className="p-2 text-gray-700 hover:text-white hover:bg-gray-700 border border-gray-300 rounded-md transition-colors"
                          title="Print Documents"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSoldOut(sale.id)}
                          className="px-3 py-2 text-[12px] font-medium text-white bg-green-600 hover:text-white border  hover:bg-green-700 rounded-md transition-colors"
                        >
                          Sold Out
                        </button>
                        <button
                          onClick={() => onDelete(sale.id)}
                          className="px-2 py-2 text-red-600 border border-red-300 hover:text-white hover:bg-red-500 rounded-md transition-colors"
                          title="Return to Inventory"
                        >
                          <Undo2 className="w-4 h-4" /> 
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                    No advance paid sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1">
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-gray-900 text-white'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 py-1 text-gray-500">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 text-gray-700"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tag Notes Modal */}
      {isTagNotesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tag Notes</h3>
                {selectedSaleForNotes && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedSaleForNotes.brand_name} {selectedSaleForNotes.model_name} - {selectedSaleForNotes.vehicle_number}
                  </p>
                )}
              </div>
              <button
                onClick={closeTagNotesModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              {isLoadingNotes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-500">Loading notes...</span>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={tagNotesValue}
                    onChange={(e) => setTagNotesValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={5}
                    placeholder="Add internal notes about this vehicle..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {tagNotesValue.length} characters • Notes are saved to the vehicle record
                  </p>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={closeTagNotesModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSavingNotes}
              >
                Cancel
              </button>
              <button
                onClick={saveTagNotes}
                disabled={isSavingNotes || isLoadingNotes || !selectedSaleForNotes?.vehicle_id}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingNotes ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Notes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
