'use client'

import { useState, useEffect } from 'react'
import { Calendar, Download, DollarSign, TrendingUp, Users, BarChart3, Clock, Tag } from 'lucide-react'
import { AreaChart, Area, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { createClient } from '@/lib/supabase-client'

interface SalesData {
  period: string
  units: number
  revenue: number
}

interface SalespersonData {
  name: string
  units: number
  revenue: number
  avgDiscount: number
}

interface BrandData {
  brand: string
  units: number
  revenue: number
  avgPrice: number
}

interface VehicleSale {
  id: string
  vehicle_number: string
  brand: string
  model: string
  list_price: number
  sale_price: number
  discount: number
  discount_percentage: number
  days_to_sell: number
  salesperson: string
  sale_date: string
}

export default function SalesProfitabilityTab() {
  const [dateRange, setDateRange] = useState('Past Month')
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'period' | 'salesperson' | 'brand' | 'time-to-sell' | 'discount'>('period')
  
  // Data states
  const [salesByPeriod, setSalesByPeriod] = useState<SalesData[]>([])
  const [salespersonData, setSalespersonData] = useState<SalespersonData[]>([])
  const [brandData, setBrandData] = useState<BrandData[]>([])
  const [vehicleSales, setVehicleSales] = useState<VehicleSale[]>([])
  
  // Summary stats
  const [totalUnits, setTotalUnits] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [avgTimeToSell, setAvgTimeToSell] = useState(0)
  const [totalDiscount, setTotalDiscount] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchSalesData()
  }, [dateRange])

  const fetchSalesData = async () => {
    setLoading(true)
    try {
      // Calculate date range
      let daysAgo = 30
      if (dateRange === 'Past Week') daysAgo = 7
      if (dateRange === 'Past Year') daysAgo = 365

      const endDateObj = new Date()
      const startDateObj = new Date()
      startDateObj.setDate(startDateObj.getDate() - daysAgo)
      startDateObj.setHours(0, 0, 0, 0)

      setStartDate(startDateObj.toLocaleDateString('en-GB').replace(/\//g, '-'))
      setEndDate(endDateObj.toLocaleDateString('en-GB').replace(/\//g, '-'))

      // Fetch sold vehicles with full details
      const { data: salesRecords, error } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles (
            vehicle_number,
            selling_amount,
            entry_date,
            vehicle_brands (name),
            vehicle_models (name)
          ),
          sales_agents (name)
        `)
        .eq('status', 'sold')
        .gte('updated_at', startDateObj.toISOString())
        .order('updated_at', { ascending: true })

      if (error) throw error

      // Process all data
      if (salesRecords && salesRecords.length > 0) {
        processVehicleSalesData(salesRecords)
        processSalesByPeriod(salesRecords)
        processSalespersonData(salesRecords)
        processBrandData(salesRecords)
        calculateSummaryStats(salesRecords)
      } else {
        // Reset all data if no sales
        setVehicleSales([])
        setSalesByPeriod([])
        setSalespersonData([])
        setBrandData([])
        setTotalUnits(0)
        setTotalRevenue(0)
        setAvgTimeToSell(0)
        setTotalDiscount(0)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processVehicleSalesData = (records: any[]) => {
    const sales: VehicleSale[] = records.map((sale: any) => {
      const listPrice = sale.vehicles?.selling_amount || 0
      const salePrice = sale.selling_amount || 0
      const discount = listPrice - salePrice
      const discountPercentage = listPrice > 0 ? (discount / listPrice) * 100 : 0
      
      const entryDate = new Date(sale.vehicles?.entry_date || sale.created_at)
      const saleDate = new Date(sale.updated_at)
      const daysToSell = Math.floor((saleDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      const salesperson = sale.sales_agents?.name || sale.third_party_agent || 'Unknown'

      return {
        id: sale.id,
        vehicle_number: sale.vehicles?.vehicle_number || 'N/A',
        brand: sale.vehicles?.vehicle_brands?.name || 'Unknown',
        model: sale.vehicles?.vehicle_models?.name || 'Unknown',
        list_price: listPrice,
        sale_price: salePrice,
        discount,
        discount_percentage: discountPercentage,
        days_to_sell: daysToSell,
        salesperson,
        sale_date: sale.updated_at
      }
    })

    setVehicleSales(sales)
  }

  const processSalesByPeriod = (records: any[]) => {
    const periodMap = new Map<string, { units: number; revenue: number }>()

    records.forEach((sale: any) => {
      const date = new Date(sale.updated_at)
      let periodKey: string

      if (dateRange === 'Past Week') {
        periodKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      } else if (dateRange === 'Past Year') {
        periodKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      } else {
        periodKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }

      const existing = periodMap.get(periodKey) || { units: 0, revenue: 0 }
      periodMap.set(periodKey, {
        units: existing.units + 1,
        revenue: existing.revenue + (sale.selling_amount || 0)
      })
    })

    const chartData = Array.from(periodMap.entries()).map(([period, data]) => ({
      period,
      units: data.units,
      revenue: data.revenue
    }))

    setSalesByPeriod(chartData)
  }

  const processSalespersonData = (records: any[]) => {
    const salespersonMap = new Map<string, { units: number; revenue: number; totalDiscount: number }>()

    records.forEach((sale: any) => {
      const name = sale.sales_agents?.name || sale.third_party_agent || 'Unknown'
      const listPrice = sale.vehicles?.selling_amount || 0
      const salePrice = sale.selling_amount || 0
      const discount = listPrice - salePrice

      const existing = salespersonMap.get(name) || { units: 0, revenue: 0, totalDiscount: 0 }
      salespersonMap.set(name, {
        units: existing.units + 1,
        revenue: existing.revenue + salePrice,
        totalDiscount: existing.totalDiscount + discount
      })
    })

    const data = Array.from(salespersonMap.entries())
      .map(([name, stats]) => ({
        name,
        units: stats.units,
        revenue: stats.revenue,
        avgDiscount: stats.units > 0 ? stats.totalDiscount / stats.units : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)

    setSalespersonData(data)
  }

  const processBrandData = (records: any[]) => {
    const brandMap = new Map<string, { units: number; revenue: number }>()

    records.forEach((sale: any) => {
      const brand = sale.vehicles?.vehicle_brands?.name || 'Unknown'
      const salePrice = sale.selling_amount || 0

      const existing = brandMap.get(brand) || { units: 0, revenue: 0 }
      brandMap.set(brand, {
        units: existing.units + 1,
        revenue: existing.revenue + salePrice
      })
    })

    const data = Array.from(brandMap.entries())
      .map(([brand, stats]) => ({
        brand,
        units: stats.units,
        revenue: stats.revenue,
        avgPrice: stats.units > 0 ? stats.revenue / stats.units : 0
      }))
      .sort((a, b) => b.units - a.units)

    setBrandData(data)
  }

  const calculateSummaryStats = (records: any[]) => {
    const units = records.length
    const revenue = records.reduce((sum, sale) => sum + (sale.selling_amount || 0), 0)
    
    const totalDays = records.reduce((sum, sale) => {
      const entryDate = new Date(sale.vehicles?.entry_date || sale.created_at)
      const saleDate = new Date(sale.updated_at)
      const days = Math.floor((saleDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0)
    const avgDays = units > 0 ? Math.round(totalDays / units) : 0

    const totalDiscountAmount = records.reduce((sum, sale) => {
      const listPrice = sale.vehicles?.selling_amount || 0
      const salePrice = sale.selling_amount || 0
      return sum + (listPrice - salePrice)
    }, 0)

    setTotalUnits(units)
    setTotalRevenue(revenue)
    setAvgTimeToSell(avgDays)
    setTotalDiscount(totalDiscountAmount)
  }

  const handleDownloadReport = () => {
    let csvContent = ''
    let filename = ''

    if (activeView === 'period') {
      csvContent = [
        ['Period', 'Units Sold', 'Revenue'].join(','),
        ...salesByPeriod.map(d => [d.period, d.units, d.revenue.toFixed(2)].join(','))
      ].join('\n')
      filename = 'sales-by-period'
    } else if (activeView === 'salesperson') {
      csvContent = [
        ['Salesperson', 'Units Sold', 'Revenue', 'Avg Discount'].join(','),
        ...salespersonData.map(d => [d.name, d.units, d.revenue.toFixed(2), d.avgDiscount.toFixed(2)].join(','))
      ].join('\n')
      filename = 'sales-by-salesperson'
    } else if (activeView === 'brand') {
      csvContent = [
        ['Brand', 'Units Sold', 'Revenue', 'Avg Price'].join(','),
        ...brandData.map(d => [d.brand, d.units, d.revenue.toFixed(2), d.avgPrice.toFixed(2)].join(','))
      ].join('\n')
      filename = 'sales-by-brand'
    } else if (activeView === 'discount') {
      csvContent = [
        ['Vehicle Number', 'Brand', 'Model', 'List Price', 'Sale Price', 'Discount', 'Discount %', 'Salesperson'].join(','),
        ...vehicleSales.map(v => [
          v.vehicle_number,
          v.brand,
          v.model,
          v.list_price.toFixed(2),
          v.sale_price.toFixed(2),
          v.discount.toFixed(2),
          v.discount_percentage.toFixed(2),
          v.salesperson
        ].join(','))
      ].join('\n')
      filename = 'discount-report'
    } else {
      csvContent = [
        ['Vehicle Number', 'Brand', 'Model', 'Days to Sell', 'Sale Price', 'Salesperson'].join(','),
        ...vehicleSales.map(v => [
          v.vehicle_number,
          v.brand,
          v.model,
          v.days_to_sell,
          v.sale_price.toFixed(2),
          v.salesperson
        ].join(','))
      ].join('\n')
      filename = 'time-to-sell-report'
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading sales data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Units Sold</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalUnits}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                Rs. {(totalRevenue / 1000000).toFixed(2)}M
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Avg Time to Sell</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{avgTimeToSell} days</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total Discount</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                Rs. {(totalDiscount / 1000000).toFixed(2)}M
              </p>
            </div>
            <Tag className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex items-center justify-between">
        <div className="border-b border-gray-200 flex-1">
          <div className="flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveView('period')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeView === 'period'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sales by Period
            </button>
            <button
              onClick={() => setActiveView('salesperson')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeView === 'salesperson'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sales by Salesperson
            </button>
            <button
              onClick={() => setActiveView('brand')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeView === 'brand'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sales by Brand
            </button>
            <button
              onClick={() => setActiveView('time-to-sell')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeView === 'time-to-sell'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Time to Sell
            </button>
            <button
              onClick={() => setActiveView('discount')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeView === 'discount'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Discount Report
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-gray-600">Date Range</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option>Past Week</option>
            <option>Past Month</option>
            <option>Past Year</option>
          </select>
        </div>
      </div>

      {/* Content Views */}
      {activeView === 'period' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales by Period</h3>
              <p className="text-sm text-gray-500">Units sold and revenue over time</p>
            </div>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Units Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Units Sold</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={salesByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip />
                    <Bar dataKey="units" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Revenue (Rs.)</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesByPeriod}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip formatter={(value: number) => `Rs. ${value.toLocaleString()}`} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'salesperson' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales by Salesperson</h3>
              <p className="text-sm text-gray-500">Performance leaderboard</p>
            </div>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salesperson</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Discount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salespersonData.map((person, index) => (
                  <tr key={person.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{person.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{person.units}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      Rs. {person.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      Rs. {person.avgDiscount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(person.revenue / Math.max(...salespersonData.map(p => p.revenue))) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'brand' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales by Brand</h3>
              <p className="text-sm text-gray-500">Best sellers and most profitable brands</p>
            </div>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Units Distribution</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={brandData}
                      dataKey="units"
                      nameKey="brand"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ brand, units }) => `${brand}: ${units}`}
                    >
                      {brandData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Brand Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Brand Performance</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {brandData.map((brand, index) => (
                  <div key={brand.brand} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">{brand.brand}</p>
                        <p className="text-xs text-gray-500">Avg Price: Rs. {brand.avgPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{brand.units}</p>
                      <p className="text-xs text-gray-500">Rs. {(brand.revenue / 1000000).toFixed(2)}M</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'time-to-sell' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Average Time to Sell</h3>
              <p className="text-sm text-gray-500">Days vehicles sit in inventory before being sold</p>
            </div>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">Average: {avgTimeToSell} days</p>
                <p className="text-sm text-amber-700">Time from entry to sale across all vehicles</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Days to Sell</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salesperson</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicleSales
                    .sort((a, b) => a.days_to_sell - b.days_to_sell)
                    .map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{vehicle.vehicle_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{vehicle.brand}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{vehicle.model}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vehicle.days_to_sell <= 7 ? 'bg-green-100 text-green-800' :
                            vehicle.days_to_sell <= 30 ? 'bg-yellow-100 text-yellow-800' :
                            vehicle.days_to_sell <= 60 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.days_to_sell} days
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          Rs. {vehicle.sale_price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{vehicle.salesperson}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === 'discount' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Discounting Report</h3>
              <p className="text-sm text-gray-500">Difference between list price and final sale price</p>
            </div>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand/Model</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">List Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Discount %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salesperson</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicleSales
                  .sort((a, b) => b.discount_percentage - a.discount_percentage)
                  .map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{vehicle.vehicle_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vehicle.brand} {vehicle.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        Rs. {vehicle.list_price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        Rs. {vehicle.sale_price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-medium ${vehicle.discount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          Rs. {vehicle.discount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.discount_percentage === 0 ? 'bg-gray-100 text-gray-800' :
                          vehicle.discount_percentage <= 5 ? 'bg-green-100 text-green-800' :
                          vehicle.discount_percentage <= 10 ? 'bg-yellow-100 text-yellow-800' :
                          vehicle.discount_percentage <= 15 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.discount_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vehicle.salesperson}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Date Range: {startDate} - {endDate}</span>
        </div>
      </div>
    </div>
  )
}
