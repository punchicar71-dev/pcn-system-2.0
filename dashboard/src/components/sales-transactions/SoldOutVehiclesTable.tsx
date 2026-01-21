'use client';

import { Search, Eye, Printer, ChevronLeft, ChevronRight, Undo2, Download, Trash2, StickyNote, X, Loader2, CalendarIcon, RotateCcw } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase-client';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import DeleteConfirmModal from './DeleteConfirmModal';
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

interface SoldOutVehiclesTableProps {
  onViewDetail: (saleId: string) => void;
  onPrintInvoice: (saleId: string) => void;
  refreshKey?: number;
}

export default function SoldOutVehiclesTable({ 
  onViewDetail, 
  onPrintInvoice,
  refreshKey = 0
}: SoldOutVehiclesTableProps) {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedSaleForDelete, setSelectedSaleForDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter States
  const [brandFilter, setBrandFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  
  // Filter Options
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  
  // Tag Notes Modal State
  const [isTagNotesModalOpen, setIsTagNotesModalOpen] = useState(false);
  const [selectedSaleForNotes, setSelectedSaleForNotes] = useState<any>(null);
  const [tagNotesValue, setTagNotesValue] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch sold out sales
  useEffect(() => {
    fetchSoldOutSales();
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

  const fetchSoldOutSales = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      // Fetch sold out sales with vehicle details
      const { data: soldSales, error } = await supabase
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
            )
          ),
          sales_agents:sales_agent_id (
            id,
            name
          )
        `)
        .eq('status', 'sold')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching sold out sales:', error);
        return;
      }

      // Fetch seller information for each vehicle
      const vehicleIds = soldSales?.map((sale: any) => sale.vehicle_id).filter(Boolean) || [];
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
      const transformedData = soldSales?.map((sale: any) => {
        const sellerInfo = sellersMap[sale.vehicle_id] || { name: '', mobile: '', nic: '' };
        return {
          id: sale.id,
          vehicle_id: sale.vehicle_id, // Needed for tag_notes
          // Use stored snapshot first (preserves data even if vehicle is re-added), fallback to joined data
          vehicle_number: sale.vehicle_number || sale.vehicles?.vehicle_number || 'N/A',
          brand_name: sale.brand_name || sale.vehicles?.vehicle_brands?.name || 'N/A',
          model_name: sale.model_name || sale.vehicles?.vehicle_models?.name || 'N/A',
          manufacture_year: sale.manufacture_year || sale.vehicles?.manufacture_year || 'N/A',
          registered_year: sale.registered_year || sale.vehicles?.registered_year || '-',
          country_name: sale.country_name || sale.vehicles?.countries?.name || '-',
          payment_type: sale.payment_type,
          sales_agent_name: sale.sales_agents?.name || sale.third_party_agent || 'N/A',
          customer_name: sale.customer_name || 'N/A',
          customer_mobile: sale.customer_mobile || '',
          customer_nic: sale.customer_nic || '',
          seller_name: sellerInfo.name,
          seller_mobile: sellerInfo.mobile,
          seller_nic: sellerInfo.nic,
          selling_amount: sale.sale_price ?? sale.selling_amount ?? 0,
          sold_date: sale.updated_at, // When status changed to 'sold'
          created_at: sale.created_at,
        };
      }) || [];

      setSalesData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error('Error fetching sold out sales:', error);
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

  // Filter data based on search query, filters, and date range
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
        const saleDate = new Date(sale.sold_date);
        
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

    // Enhanced search filter - search by vehicle number, brand, model, year, buyer name, seller name, ID, mobile, country
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((sale) =>
        sale.vehicle_number.toLowerCase().includes(query) ||
        sale.brand_name.toLowerCase().includes(query) ||
        sale.model_name.toLowerCase().includes(query) ||
        String(sale.manufacture_year).includes(query) ||
        sale.country_name.toLowerCase().includes(query) ||
        sale.customer_name.toLowerCase().includes(query) ||
        (sale.customer_mobile && sale.customer_mobile.toLowerCase().includes(query)) ||
        (sale.customer_nic && sale.customer_nic.toLowerCase().includes(query)) ||
        (sale.seller_name && sale.seller_name.toLowerCase().includes(query)) ||
        (sale.seller_mobile && sale.seller_mobile.toLowerCase().includes(query)) ||
        (sale.seller_nic && sale.seller_nic.toLowerCase().includes(query))
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy.MM.dd');
  };

  const handleDeleteClick = (saleId: string) => {
    setSelectedSaleForDelete(saleId);
    setDeleteConfirmOpen(true);
  };

  // Export to CSV function
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    // Define CSV headers
    const headers = [
      'Vehicle Number',
      'Brand',
      'Model',
      'Year',
      'Customer Name',
      'Sales Agent',
      'Payment Type',
      'Selling Amount (Rs)',
      'Sold Out Date',
      'Created Date'
    ];

    // Convert data to CSV rows
    const csvRows = filteredData.map(sale => [
      sale.vehicle_number,
      sale.brand_name,
      sale.model_name,
      sale.manufacture_year,
      sale.customer_name,
      sale.sales_agent_name,
      sale.payment_type,
      sale.selling_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      formatDate(sale.sold_date),
      formatDate(sale.created_at)
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => {
        // Escape cells containing commas or quotes
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with current date
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
    const filename = `sold_out_vehicles_${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSaleForDelete) return;

    try {
      setIsDeleting(true);
      const supabase = createClient();

      // Delete the sale record from pending_vehicle_sales
      const { error } = await supabase
        .from('pending_vehicle_sales')
        .delete()
        .eq('id', selectedSaleForDelete);

      if (error) {
        console.error('Error deleting sale:', error);
        alert('Error deleting sale: ' + error.message);
        return;
      }

      // Update the local state to remove the deleted record
      setSalesData((prevData) => prevData.filter((sale) => sale.id !== selectedSaleForDelete));
      setDeleteConfirmOpen(false);
      setSelectedSaleForDelete(null);
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Error deleting sale');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPaymentTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Cash':
        return 'bg-green-100 text-green-700';
      case 'Leasing':
        return 'bg-blue-100 text-blue-700';
      case 'Bank Transfer':
        return 'bg-purple-100 text-purple-700';
      case 'Check':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
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

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            className="h-9 px-4 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Active filters info */}
        {hasActiveFilters && (
          <p className="mt-3 text-sm text-gray-600">
            Found {filteredData.length} vehicle{filteredData.length !== 1 ? 's' : ''} matching your filters
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reg.Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sold Out Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.length > 0 ? (
                currentData.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.vehicle_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {sale.brand_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {sale.model_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {sale.manufacture_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {sale.registered_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {sale.country_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs. {Number(sale.selling_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentTypeBadgeColor(sale.payment_type)}`}>
                        {sale.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(sale.sold_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetail(sale.id)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-[13px] font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => openTagNotesModal(sale)}
                          className="p-2 bg-white border border-gray-300 text-blue-600 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          title="View Tag Notes"
                        >
                          <StickyNote className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPrintInvoice(sale.id)}
                          className="p-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          title="Print Document"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sale.id)}
                          className="p-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                          title="Delete Sale"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-gray-300" />
                      <p className="text-sm">No sold vehicles found</p>
                      {(searchQuery || dateRange) && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setDateRange(undefined);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageClick(page)}
                    disabled={page === '...'}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-gray-900 text-white'
                        : page === '...'
                        ? 'cursor-default text-gray-400'
                        : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setSelectedSaleForDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Tag Notes Modal (View Only) */}
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
                  <div className="w-full px-3 py-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[120px]">
                    {tagNotesValue ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{tagNotesValue}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No notes available for this vehicle</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={closeTagNotesModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
