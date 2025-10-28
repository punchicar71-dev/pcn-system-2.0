'use client';

import { Search, Eye, Printer, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { format } from 'date-fns';

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
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch sold out sales
  useEffect(() => {
    fetchSoldOutSales();
  }, [refreshKey]);

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
            vehicle_brands:brand_id (
              id,
              name
            ),
            vehicle_models:model_id (
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

      // Transform data for display
      const transformedData = soldSales?.map((sale: any) => ({
        id: sale.id,
        vehicle_number: sale.vehicles?.vehicle_number || 'N/A',
        brand_name: sale.vehicles?.vehicle_brands?.name || 'N/A',
        model_name: sale.vehicles?.vehicle_models?.name || 'N/A',
        manufacture_year: sale.vehicles?.manufacture_year || 'N/A',
        payment_type: sale.payment_type,
        sales_agent_name: sale.sales_agents?.name || sale.third_party_agent || 'N/A',
        customer_name: `${sale.customer_first_name} ${sale.customer_last_name}`,
        selling_amount: sale.selling_amount,
        sold_date: sale.updated_at, // When status changed to 'sold'
        created_at: sale.created_at,
      })) || [];

      setSalesData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error('Error fetching sold out sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search query and date
  useEffect(() => {
    let filtered = salesData;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((sale) =>
        sale.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.model_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter((sale) => {
        const saleDate = format(new Date(sale.sold_date), 'yyyy-MM-dd');
        return saleDate === dateFilter;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchQuery, dateFilter, salesData]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Vehicle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Vehicle
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Brand, Number, Model"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Filter
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
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
                  Payment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Agent
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentTypeBadgeColor(sale.payment_type)}`}>
                        {sale.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {sale.sales_agent_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(sale.sold_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetail(sale.id)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                        <button
                          onClick={() => onPrintInvoice(sale.id)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs font-medium flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-gray-300" />
                      <p className="text-sm">No sold vehicles found</p>
                      {(searchQuery || dateFilter) && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setDateFilter('');
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
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        ? 'bg-blue-600 text-white'
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
    </div>
  );
}
