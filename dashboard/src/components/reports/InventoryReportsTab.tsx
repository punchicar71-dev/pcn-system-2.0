'use client'

import { useState, useEffect } from 'react'
import { Calendar, Download, Package, TrendingUp, Clock, Car, FileText, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface VehicleStock {
  id: string
  vehicle_number: string
  brand: string
  model: string
  manufacture_year: number
  selling_amount: number
  entry_date: string
  status: string
  body_type: string
  days_in_stock: number
}

interface StockSummary {
  total: number
  pendingToSell: number
  reserved: number
  avgDaysInStock: number
}

interface BrandCount {
  brand: string
  count: number
}

interface TypeCount {
  type: string
  count: number
}

interface AgingBracket {
  bracket: string
  count: number
  percentage: number
}

export default function InventoryReportsTab() {
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'overview' | 'aging' | 'turnover' | 'brand' | 'type'>('overview')
  
  // Data states
  const [stockList, setStockList] = useState<VehicleStock[]>([])
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    total: 0,
    pendingToSell: 0,
    reserved: 0,
    avgDaysInStock: 0
  })
  const [brandCounts, setBrandCounts] = useState<BrandCount[]>([])
  const [typeCounts, setTypeCounts] = useState<TypeCount[]>([])
  const [agingData, setAgingData] = useState<AgingBracket[]>([])
  const [turnoverRate, setTurnoverRate] = useState<number>(0)

  const supabase = createClient()

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    setLoading(true)
    try {
      // Fetch all vehicles with brand and model information
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select(`
          id,
          vehicle_number,
          vehicle_brands (name),
          vehicle_models (name),
          manufacture_year,
          selling_amount,
          entry_date,
          status,
          body_type
        `)
        .in('status', ['In Sale', 'Reserved'])
        .order('entry_date', { ascending: false })

      if (error) throw error

      // Process vehicle data
      const processedVehicles: VehicleStock[] = vehicles?.map((v: any) => {
        const entryDate = new Date(v.entry_date)
        const today = new Date()
        const daysInStock = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

        return {
          id: v.id,
          vehicle_number: v.vehicle_number,
          brand: v.vehicle_brands?.name || 'Unknown',
          model: v.vehicle_models?.name || 'Unknown',
          manufacture_year: v.manufacture_year,
          selling_amount: v.selling_amount,
          entry_date: v.entry_date,
          status: v.status,
          body_type: v.body_type,
          days_in_stock: daysInStock
        }
      }) || []

      setStockList(processedVehicles)

      // Fetch pending to sell vehicles from pending_vehicle_sales
      const { data: pendingVehicles, error: pendingError } = await supabase
        .from('pending_vehicle_sales')
        .select('id')
        .eq('status', 'pending')

      if (pendingError) {
        console.error('Error fetching pending vehicles:', pendingError)
      }

      const pendingCount = pendingVehicles?.length || 0

      // Calculate summary statistics
      const total = processedVehicles.length
      const reserved = processedVehicles.filter(v => v.status === 'Reserved').length
      const avgDays = total > 0 
        ? Math.round(processedVehicles.reduce((sum, v) => sum + v.days_in_stock, 0) / total)
        : 0

      setStockSummary({
        total,
        pendingToSell: pendingCount,
        reserved,
        avgDaysInStock: avgDays
      })

      // Calculate brand counts
      const brandMap = new Map<string, number>()
      processedVehicles.forEach(v => {
        brandMap.set(v.brand, (brandMap.get(v.brand) || 0) + 1)
      })
      const brands = Array.from(brandMap.entries())
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => b.count - a.count)
      setBrandCounts(brands)

      // Calculate type counts
      const typeMap = new Map<string, number>()
      processedVehicles.forEach(v => {
        typeMap.set(v.body_type, (typeMap.get(v.body_type) || 0) + 1)
      })
      const types = Array.from(typeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
      setTypeCounts(types)

      // Calculate aging brackets
      const aging = {
        '0-30 days': 0,
        '31-60 days': 0,
        '61-90 days': 0,
        '90+ days': 0
      }
      
      processedVehicles.forEach(v => {
        if (v.days_in_stock <= 30) aging['0-30 days']++
        else if (v.days_in_stock <= 60) aging['31-60 days']++
        else if (v.days_in_stock <= 90) aging['61-90 days']++
        else aging['90+ days']++
      })

      const agingBrackets = Object.entries(aging).map(([bracket, count]) => ({
        bracket,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      setAgingData(agingBrackets)

      // Calculate turnover rate (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: soldVehicles } = await supabase
        .from('pending_vehicle_sales')
        .select('id')
        .eq('status', 'sold')
        .gte('updated_at', thirtyDaysAgo.toISOString())

      const soldCount = soldVehicles?.length || 0
      const avgInventory = total + soldCount / 2
      const turnover = avgInventory > 0 ? (soldCount / avgInventory) * 12 : 0
      setTurnoverRate(Math.round(turnover * 10) / 10)

    } catch (error) {
      console.error('Error fetching inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = () => {
    // Create CSV content
    const headers = ['Stock Number', 'Brand', 'Model', 'Year', 'List Price', 'Status', 'Days in Stock']
    const csvContent = [
      headers.join(','),
      ...stockList.map(v => [
        v.vehicle_number,
        v.brand,
        v.model,
        v.manufacture_year,
        v.selling_amount.toFixed(2),
        v.status,
        v.days_in_stock
      ].join(','))
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading inventory data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-10 rounded-[15px] p-4 border ">
          <div className="">
            <div className='flex items-center justify-between'>
              <p className="text-[16px] text-gray-600 font-medium">Total Stock</p>
              <p className="text-[16px] px-3 py-2 bg-blue-100 rounded-full font-bold text-blue-600 mt-1">{stockSummary.total}</p>
            </div>
            </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Pending to Sell</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stockSummary.pendingToSell}</p>
            </div>
            <Car className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Avg Days in Stock</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{stockSummary.avgDaysInStock}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Turnover Rate</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{turnoverRate}x</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveView('overview')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeView === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Current Stock List
          </button>
          <button
            onClick={() => setActiveView('aging')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeView === 'aging'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Inventory Aging
          </button>
          <button
            onClick={() => setActiveView('brand')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeView === 'brand'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock by Brand
          </button>
          <button
            onClick={() => setActiveView('type')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeView === 'type'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock by Type
          </button>
        </div>
      </div>

      {/* Content Views */}
      {activeView === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Current Stock List</h3>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">List Price</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Days in Stock</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockList.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{vehicle.vehicle_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vehicle.brand}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vehicle.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vehicle.manufacture_year}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vehicle.body_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        Rs. {vehicle.selling_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.days_in_stock <= 30 ? 'bg-green-100 text-green-800' :
                          vehicle.days_in_stock <= 60 ? 'bg-yellow-100 text-yellow-800' :
                          vehicle.days_in_stock <= 90 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.days_in_stock} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.status === 'In Sale' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === 'aging' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Inventory Aging Report</h3>
            <p className="text-sm text-gray-500">Shows how long vehicles have been in stock</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Aging Distribution</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="bracket" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
              {agingData.map((bracket, index) => (
                <div key={bracket.bracket} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{bracket.bracket}</h4>
                    <span className="text-2xl font-bold text-blue-600">{bracket.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-yellow-500' :
                        index === 2 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${bracket.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{bracket.percentage}% of inventory</p>
                </div>
              ))}
            </div>
          </div>

          {/* Slow-moving vehicles alert */}
          {agingData[3]?.count > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-red-900">Slow-Moving Inventory Alert</h4>
                  <p className="text-sm text-red-700 mt-1">
                    You have {agingData[3].count} vehicle(s) in stock for over 90 days. Consider promotional pricing or special offers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === 'brand' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Stock by Brand</h3>
            <p className="text-sm text-gray-500">Distribution of inventory across vehicle brands</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Brand Distribution</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={brandCounts}
                      dataKey="count"
                      nameKey="brand"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ brand, count }) => `${brand}: ${count}`}
                    >
                      {brandCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Brand List */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Brand Breakdown</h4>
              <div className="space-y-3">
                {brandCounts.map((brand, index) => (
                  <div key={brand.brand} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium text-gray-900">{brand.brand}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{brand.count}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({Math.round((brand.count / stockSummary.total) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'type' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Stock by Vehicle Type</h3>
            <p className="text-sm text-gray-500">Distribution of inventory by vehicle body type</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Type Distribution</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeCounts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Type List */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Type Breakdown</h4>
              <div className="space-y-3">
                {typeCounts.map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{type.count}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({Math.round((type.count / stockSummary.total) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
