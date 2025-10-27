'use client'

import { useState, useEffect, useMemo } from 'react'
import { Package, Search, Eye, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

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
}

export default function InventoryPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch vehicles from database
  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('vehicle_inventory_view')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching vehicles:', error)
        alert('Failed to load vehicles. Please refresh the page.')
        return
      }

      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      alert('An error occurred while loading vehicles.')
    } finally {
      setLoading(false)
    }
  }

  // Real-time search filter
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles

    const query = searchQuery.toLowerCase()
    return vehicles.filter(vehicle => 
      vehicle.vehicle_number?.toLowerCase().includes(query) ||
      vehicle.brand_name?.toLowerCase().includes(query) ||
      vehicle.model_name?.toLowerCase().includes(query) ||
      vehicle.country_name?.toLowerCase().includes(query) ||
      vehicle.fuel_type?.toLowerCase().includes(query) ||
      vehicle.transmission?.toLowerCase().includes(query)
    )
  }, [vehicles, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage)
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredVehicles.slice(startIndex, endIndex)
  }, [filteredVehicles, currentPage, rowsPerPage])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, rowsPerPage])

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return
    }

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting vehicle:', error)
        alert('Failed to delete vehicle. Please try again.')
        return
      }

      alert('Vehicle deleted successfully!')
      fetchVehicles() // Refresh list
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('An error occurred while deleting the vehicle.')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Available Vehicle</h1>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${filteredVehicles.length} vehicle${filteredVehicles.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => router.push('/add-vehicle')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Vehicle
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Brand, Number, Model"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mileage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transmission
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading vehicles...
                    </div>
                  </td>
                </tr>
              ) : paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? 'No vehicles found matching your search.' : 'No vehicles in inventory. Add your first vehicle!'}
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {vehicle.vehicle_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vehicle.brand_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vehicle.model_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vehicle.manufacture_year}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                      {formatCurrency(vehicle.selling_amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vehicle.mileage ? formatMileage(vehicle.mileage) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vehicle.country_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vehicle.transmission}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFuelTypeBadge(vehicle.fuel_type)}`}>
                        {vehicle.fuel_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/inventory/${vehicle.id}`)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/inventory/edit/${vehicle.id}`)}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                            ? 'bg-blue-600 text-white'
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
  )
}
