'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Download, Calendar } from 'lucide-react'
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { createClient } from '@/lib/supabase-client'

interface SalesData {
  date: string
  sedan: number
  hatchback: number
  suv: number
}

interface CategoryData {
  name: string
  value: number
}

interface AgentData {
  name: string
  sales: number
}

interface BrandData {
  brand: string
  sales: number
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales-agent' | 'vehicle-brand'>('overview')
  const [dateRange, setDateRange] = useState('Past Month')
  const [loading, setLoading] = useState(true)
  
  // Chart Data
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [agentData, setAgentData] = useState<AgentData[]>([])
  const [brandData, setBrandData] = useState<BrandData[]>([])

  // Date range for selector
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Calculate date range
      let daysAgo = 30 // Default to past month
      if (dateRange === 'Past Week') daysAgo = 7
      if (dateRange === 'Past Year') daysAgo = 365

      const endDateObj = new Date()
      const startDateObj = new Date()
      startDateObj.setDate(startDateObj.getDate() - daysAgo)
      startDateObj.setHours(0, 0, 0, 0)

      setStartDate(startDateObj.toLocaleDateString('en-GB').replace(/\//g, '-'))
      setEndDate(endDateObj.toLocaleDateString('en-GB').replace(/\//g, '-'))

      // Fetch sales data
      const { data: salesRecords, error } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles (
            category,
            brand
          ),
          users (
            first_name,
            last_name
          )
        `)
        .eq('status', 'sold')
        .gte('updated_at', startDateObj.toISOString())

      if (!error && salesRecords) {
        // Process data for charts
        processSalesData(salesRecords)
        processCategoryData(salesRecords)
        processAgentData(salesRecords)
        processBrandData(salesRecords)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processSalesData = (records: any[]) => {
    // Group sales by date and category
    const salesByDate: { [key: string]: { sedan: number; hatchback: number; suv: number } } = {}

    records.forEach((record) => {
      const date = new Date(record.updated_at)
      const dateKey = `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`
      
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { sedan: 0, hatchback: 0, suv: 0 }
      }

      const category = record.vehicles?.category?.toLowerCase() || 'other'
      if (category === 'sedan') salesByDate[dateKey].sedan++
      else if (category === 'hatchback') salesByDate[dateKey].hatchback++
      else if (category === 'suv') salesByDate[dateKey].suv++
    })

    const chartData = Object.entries(salesByDate).map(([date, data]) => ({
      date,
      sedan: data.sedan,
      hatchback: data.hatchback,
      suv: data.suv,
    }))

    setSalesData(chartData)
  }

  const processCategoryData = (records: any[]) => {
    const categoryCount: { [key: string]: number } = {}

    records.forEach((record) => {
      const category = record.vehicles?.category || 'Other'
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    const pieData = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
    }))

    setCategoryData(pieData)
  }

  const processAgentData = (records: any[]) => {
    const agentCount: { [key: string]: number } = {}

    records.forEach((record) => {
      const agentName = record.users 
        ? `${record.users.first_name} ${record.users.last_name}`
        : 'Unknown'
      agentCount[agentName] = (agentCount[agentName] || 0) + 1
    })

    const agents = Object.entries(agentCount)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)

    setAgentData(agents)
  }

  const processBrandData = (records: any[]) => {
    const brandCount: { [key: string]: number } = {}

    records.forEach((record) => {
      const brand = record.vehicles?.brand || 'Unknown'
      brandCount[brand] = (brandCount[brand] || 0) + 1
    })

    const brands = Object.entries(brandCount)
      .map(([brand, sales]) => ({ brand, sales }))
      .sort((a, b) => b.sales - a.sales)

    setBrandData(brands)
  }

  const handleDownloadReport = () => {
    // TODO: Implement download functionality
    console.log('Downloading report...')
  }

  const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444']

  return (
    <div className="space-y-6">
      {/* Header */}
      

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sales-agent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sales-agent'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sales Agent
            </button>
            <button
              onClick={() => setActiveTab('vehicle-brand')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'vehicle-brand'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vehicle Brand
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Total Sale Chart */}
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Sale</h3>
                    <p className="text-sm text-gray-500">
                      This chart displays the total sold-out vehicles for all categories.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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

                {/* Legend */}
                <div className="flex items-center justify-end gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-0.5 bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Sedan {categoryData.find(c => c.name === 'Sedan')?.value || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-0.5 bg-pink-500"></div>
                    <span className="text-sm text-gray-600">Hatchback {categoryData.find(c => c.name === 'Hatchback')?.value || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-0.5 bg-green-500"></div>
                    <span className="text-sm text-gray-600">SUV {categoryData.find(c => c.name === 'SUV')?.value || 0}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Total Sell</span>
                </div>

                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Loading chart data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="colorSedan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="colorHatchback" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="colorSUV" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          stroke="#9ca3af"
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          stroke="#9ca3af"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="sedan"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#colorSedan)"
                        />
                        <Area
                          type="monotone"
                          dataKey="hatchback"
                          stroke="#ec4899"
                          strokeWidth={2}
                          fill="url(#colorHatchback)"
                        />
                        <Area
                          type="monotone"
                          dataKey="suv"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#colorSUV)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Vehicle Category Sale Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Vehicle Category Sale</h3>
                    <div className="flex items-center gap-2">
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

                  <div className="h-[350px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Loading chart data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${value}`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry: any) => `${value} (${entry.payload.value})`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Date Range Selector & Download */}
              <div className="flex items-center gap-4 pt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Select date range</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{startDate} - {endDate}</span>
                </div>
                <button
                  onClick={handleDownloadReport}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sales-agent' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Sales by Agent</h3>
                  <p className="text-sm text-gray-500">
                    Performance overview of all sales agents
                  </p>
                </div>
                <div className="flex items-center gap-2">
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

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Loading data...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agentData.map((agent, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{index + 1}</span>
                        </div>
                        <span className="font-medium text-gray-900">{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(agent.sales / Math.max(...agentData.map(a => a.sales))) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {agent.sales} sales
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Date Range Selector & Download */}
              <div className="flex items-center gap-4 pt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Select date range</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{startDate} - {endDate}</span>
                </div>
                <button
                  onClick={handleDownloadReport}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
          )}

          {activeTab === 'vehicle-brand' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Sales by Vehicle Brand</h3>
                  <p className="text-sm text-gray-500">
                    Performance overview of all vehicle brands
                  </p>
                </div>
                <div className="flex items-center gap-2">
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

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Loading data...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {brandData.map((brand, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">{index + 1}</span>
                        </div>
                        <span className="font-medium text-gray-900">{brand.brand}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${(brand.sales / Math.max(...brandData.map(b => b.sales))) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {brand.sales} sales
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Date Range Selector & Download */}
              <div className="flex items-center gap-4 pt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Select date range</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{startDate} - {endDate}</span>
                </div>
                <button
                  onClick={handleDownloadReport}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
