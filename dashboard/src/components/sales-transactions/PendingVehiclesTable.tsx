'use client';

import { Search, Eye, Trash2, ChevronLeft, ChevronRight, Printer, Undo2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

interface PendingVehiclesTableProps {
  onViewDetail: (saleId: string) => void;
  onSoldOut: (saleId: string) => void;
  onDelete: (saleId: string) => void;
  onPrintDocument: (saleId: string) => void;
  refreshKey?: number;
}

export default function PendingVehiclesTable({ 
  onViewDetail, 
  onSoldOut, 
  onDelete,
  onPrintDocument,
  refreshKey = 0
}: PendingVehiclesTableProps) {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pending sales
  useEffect(() => {
    fetchPendingSales();
  }, [refreshKey]);

  const fetchPendingSales = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      // Fetch pending sales with vehicle details
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
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending sales:', error);
        return;
      }

      // Transform data for display
      const transformedData = pendingSales?.map((sale: any) => ({
        id: sale.id,
        vehicle_number: sale.vehicles?.vehicle_number || 'N/A',
        brand_name: sale.vehicles?.vehicle_brands?.name || 'N/A',
        model_name: sale.vehicles?.vehicle_models?.name || 'N/A',
        manufacture_year: sale.vehicles?.manufacture_year || 'N/A',
        payment_type: sale.payment_type,
        sales_agent_name: sale.sales_agents?.name || sale.third_party_agent || 'N/A',
        customer_name: `${sale.customer_first_name} ${sale.customer_last_name}`,
        selling_amount: sale.selling_amount,
        created_at: sale.created_at,
      })) || [];

      setSalesData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error('Error fetching pending sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = salesData.filter((sale) =>
        sale.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.model_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    } else {
      setFilteredData(salesData);
    }
  }, [searchQuery, salesData]);

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Loading...</div>
    </div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Field */}
      
      <div className="bg-white w-[400px] py-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Vehicle
          </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Brand, Number, Model"
            className="w-[400px] h-9 shadow-sm pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.length > 0 ? (
                currentData.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sale.vehicle_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.brand_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.model_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.manufacture_year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentTypeColor(sale.payment_type)}`}>
                        {sale.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetail(sale.id)}
                          className="px-3 py-1.5 text-[13px] font-medium text-black hover:text-white border border-gray-300 hover:bg-black rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => onSoldOut(sale.id)}
                          className="px-3 py-1.5 text-[13px] font-medium text-green-600 hover:text-white border border-green-600 hover:bg-green-600 rounded-lg transition-colors"
                        >
                          Sold out
                        </button>
                        <button
                          onClick={() => onPrintDocument(sale.id)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Print Documents"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDelete(sale.id)}
                          className="p-1.5 text-red-600 border border-red-300 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Undo2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No pending sales found
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
    </div>
  );
}
