'use client'

import { useState, useEffect } from 'react'
import { Calendar, Download, DollarSign, TrendingUp, PieChart as PieIcon, Users, BarChart3, Percent } from 'lucide-react'
import { AreaChart, Area, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { createClient } from '@/lib/supabase-client'

interface RevenueData {
  period: string
  revenue: number
  profit: number
}

interface PaymentTypeData {
  type: string
  count: number
  revenue: number
}

interface LeasingCompanyData {
  company: string
  units: number
  revenue: number
  avgPrice: number
}

interface CommissionData {
  salesperson: string
  totalSales: number
  totalRevenue: number
  commissionRate: number
  commissionAmount: number
}

interface ExpenseData {
  category: string
  amount: number
}

export default function FinancialReportsTab() {
  const [dateRange, setDateRange] = useState('Past Month')
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'revenue' | 'payment' | 'leasing' | 'commission' | 'expense'>('revenue')
  
  // Data states
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [paymentTypeData, setPaymentTypeData] = useState<PaymentTypeData[]>([])
  const [leasingCompanyData, setLeasingCompanyData] = useState<LeasingCompanyData[]>([])
  const [commissionData, setCommissionData] = useState<CommissionData[]>([])
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  
  // Summary states
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)
  
  // Date range calculation
  const getDateRange = () => {
    const now = new Date()
    const startDate = new Date()
    
    if (dateRange === 'Past Week') {
      startDate.setDate(now.getDate() - 7)
    } else if (dateRange === 'Past Month') {
      startDate.setMonth(now.getMonth() - 1)
    } else if (dateRange === 'Past Quarter') {
      startDate.setMonth(now.getMonth() - 3)
    } else if (dateRange === 'Past Year') {
      startDate.setFullYear(now.getFullYear() - 1)
    }
    
    return { startDate, endDate: now }
  }

  useEffect(() => {
    fetchAllData()
  }, [dateRange])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { startDate, endDate } = getDateRange()
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      // Fetch all sold vehicles with related data
      const { data: salesRecords } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles:vehicle_id (
            id,
            vehicle_number,
            selling_amount,
            brand_id
          ),
          vehicle_brands:vehicles!inner (
            name
          ),
          sales_agents:sales_agent_id (
            id,
            name
          ),
          leasing_companies:leasing_company_id (
            id,
            name
          )
        `)
        .eq('status', 'sold')
        .gte('updated_at', startDateStr)
        .lte('updated_at', endDateStr)
        .order('updated_at', { ascending: false })

      if (salesRecords) {
        processRevenueData(salesRecords)
        processPaymentTypeData(salesRecords)
        processLeasingCompanyData(salesRecords)
        processCommissionData(salesRecords)
      }

      // Mock expense data (since expense table may not exist yet)
      processExpenseData()

    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processRevenueData = (records: any[]) => {
    // Group by month
    const monthlyData: { [key: string]: { revenue: number; profit: number } } = {}
    
    records.forEach(record => {
      const date = new Date(record.updated_at)
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      
      const revenue = record.sale_price || 0
      const profit = (record.sale_price || 0) - (record.selling_amount || 0)
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, profit: 0 }
      }
      
      monthlyData[monthKey].revenue += revenue
      monthlyData[monthKey].profit += profit
    })

    const chartData = Object.entries(monthlyData).map(([period, data]) => ({
      period,
      revenue: Math.round(data.revenue),
      profit: Math.round(data.profit),
    }))

    const totalRev = records.reduce((sum, r) => sum + (r.sale_price || 0), 0)
    const totalProf = records.reduce((sum, r) => sum + ((r.sale_price || 0) - (r.selling_amount || 0)), 0)
    const unitsSold = records.length

    setRevenueData(chartData)
    setTotalRevenue(totalRev)
    setTotalProfit(totalProf)
    setTotalSales(unitsSold)
  }

  const processPaymentTypeData = (records: any[]) => {
    const paymentBreakdown: { [key: string]: { count: number; revenue: number } } = {}

    records.forEach(record => {
      const paymentType = record.payment_type || 'Unknown'
      
      if (!paymentBreakdown[paymentType]) {
        paymentBreakdown[paymentType] = { count: 0, revenue: 0 }
      }
      
      paymentBreakdown[paymentType].count += 1
      paymentBreakdown[paymentType].revenue += record.sale_price || 0
    })

    const chartData = Object.entries(paymentBreakdown).map(([type, data]) => ({
      type,
      count: data.count,
      revenue: Math.round(data.revenue),
    }))

    setPaymentTypeData(chartData)
  }

  const processLeasingCompanyData = (records: any[]) => {
    const leasingBreakdown: { [key: string]: { count: number; revenue: number; totalCost: number } } = {}

    records.forEach(record => {
      // Only include leasing sales
      if (record.payment_type === 'Leasing' && record.leasing_companies?.name) {
        const companyName = record.leasing_companies.name
        
        if (!leasingBreakdown[companyName]) {
          leasingBreakdown[companyName] = { count: 0, revenue: 0, totalCost: 0 }
        }
        
        leasingBreakdown[companyName].count += 1
        leasingBreakdown[companyName].revenue += record.sale_price || 0
        leasingBreakdown[companyName].totalCost += record.selling_amount || 0
      }
    })

    const chartData = Object.entries(leasingBreakdown).map(([company, data]) => ({
      company,
      units: data.count,
      revenue: Math.round(data.revenue),
      avgPrice: data.count > 0 ? Math.round(data.revenue / data.count) : 0,
    }))

    setLeasingCompanyData(chartData)
  }

  const processCommissionData = (records: any[]) => {
    const agentSales: { [key: string]: { count: number; revenue: number } } = {}

    records.forEach(record => {
      const agentName = record.sales_agents?.name || 'Unknown Agent'
      
      if (!agentSales[agentName]) {
        agentSales[agentName] = { count: 0, revenue: 0 }
      }
      
      agentSales[agentName].count += 1
      agentSales[agentName].revenue += record.sale_price || 0
    })

    // Calculate commission (assuming 2% of sale price)
    const commissionRate = 0.02
    const chartData = Object.entries(agentSales)
      .map(([agent, data]) => {
        const commission = data.revenue * commissionRate
        return {
          salesperson: agent,
          totalSales: data.count,
          totalRevenue: Math.round(data.revenue),
          commissionRate: commissionRate * 100,
          commissionAmount: Math.round(commission),
        }
      })
      .sort((a, b) => b.commissionAmount - a.commissionAmount)

    const totalComm = chartData.reduce((sum, c) => sum + c.commissionAmount, 0)
    setCommissionData(chartData)
    setTotalCommission(totalComm)
  }

  const processExpenseData = () => {
    // Mock expense data - in a real system, this would come from an expenses table
    const mockExpenses = [
      { category: 'Reconditioning', amount: 250000 },
      { category: 'Marketing', amount: 150000 },
      { category: 'Parts & Repairs', amount: 120000 },
      { category: 'Staff Salary', amount: 500000 },
      { category: 'Utilities', amount: 80000 },
    ]
    
    const totalExp = mockExpenses.reduce((sum, e) => sum + e.amount, 0)
    setExpenseData(mockExpenses)
    setTotalExpenses(totalExp)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const exportToCSV = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0]),
      ...data.map(row => Object.values(row))
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
  }

  // COLORS FOR CHARTS
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {['Past Week', 'Past Month', 'Past Quarter', 'Past Year'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">{totalSales} units sold</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Gross Profit</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalProfit)}</p>
              <p className="text-xs text-gray-500 mt-1">{((totalProfit / totalRevenue) * 100).toFixed(1)}% margin</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-gray-500 mt-1">Monthly estimate</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow-sm border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Sale Price</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {formatCurrency(totalSales > 0 ? totalRevenue / totalSales : 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per vehicle</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Percent className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-sm border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Commission</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(totalCommission)}</p>
              <p className="text-xs text-gray-500 mt-1">2% commission rate</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'revenue', label: 'Revenue & Profit', icon: '📈' },
          { id: 'payment', label: 'Payment Types', icon: '💳' },
          { id: 'leasing', label: 'Finance & Leasing', icon: '🏢' },
          { id: 'commission', label: 'Commissions', icon: '💰' },
          { id: 'expense', label: 'Expenses', icon: '📊' },
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`px-4 py-3 font-medium text-sm transition border-b-2 ${
              activeView === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Loading financial data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Revenue & Profit View */}
          {activeView === 'revenue' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue & Profit Trend</h3>
                  <button
                    onClick={() => exportToCSV(revenueData, 'revenue_profit')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                      name="Profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Summary Table */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Period</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Revenue</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Profit</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {revenueData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{row.period}</td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                            {formatCurrency(row.revenue)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                            {formatCurrency(row.profit)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                            {row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payment Types View */}
          {activeView === 'payment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Sales by Payment Type</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, count }) => `${type}: ${count}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {paymentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} units`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Revenue by Payment Type */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                  <div className="space-y-3">
                    {paymentTypeData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.type}</p>
                            <p className="text-xs text-gray-500">{item.count} transactions</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Type Table */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Type Details</h3>
                  <button
                    onClick={() => exportToCSV(paymentTypeData, 'payment_types')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Type</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Units</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Revenue</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Avg Price</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentTypeData.map((row, idx) => {
                        const totalUnits = paymentTypeData.reduce((sum, r) => sum + r.count, 0)
                        const percentage = (row.count / totalUnits) * 100
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.type}</td>
                            <td className="px-6 py-4 text-right text-sm text-gray-900">{row.count}</td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(row.revenue)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-900">
                              {formatCurrency(row.revenue / row.count)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                              {percentage.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Finance & Leasing View */}
          {activeView === 'leasing' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Leasing Company Performance</h3>
                  <button
                    onClick={() => exportToCSV(leasingCompanyData, 'leasing_companies')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                {leasingCompanyData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={leasingCompanyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="company" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="units" fill="#3b82f6" name="Units Sold" />
                        <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue" />
                      </RechartsBarChart>
                    </ResponsiveContainer>

                    {/* Leasing Company Table */}
                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                              Leasing Company
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Units</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Revenue</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Avg Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {leasingCompanyData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.company}</td>
                              <td className="px-6 py-4 text-right text-sm text-gray-900">{row.units}</td>
                              <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                {formatCurrency(row.revenue)}
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-gray-900">
                                {formatCurrency(row.avgPrice)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No leasing company data available for this period
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commission View */}
          {activeView === 'commission' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sales Commission Report</h3>
                  <button
                    onClick={() => exportToCSV(commissionData, 'commissions')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Salesperson</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Sales Units</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Revenue</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Commission Rate</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Commission Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {commissionData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.salesperson}</td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">{row.totalSales}</td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">
                            {formatCurrency(row.totalRevenue)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">{row.commissionRate}%</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                            {formatCurrency(row.commissionAmount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-semibold">
                        <td colSpan={4} className="px-6 py-4 text-right text-sm text-gray-900">
                          Total Commission:
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-blue-600">
                          {formatCurrency(totalCommission)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commission Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Top Performer</p>
                  <p className="text-lg font-bold text-gray-900">
                    {commissionData.length > 0 ? commissionData[0].salesperson : 'N/A'}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {commissionData.length > 0 ? formatCurrency(commissionData[0].commissionAmount) : '0'}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Avg Commission</p>
                  <p className="text-lg font-bold text-gray-900">
                    {commissionData.length > 0
                      ? formatCurrency(totalCommission / commissionData.length)
                      : '0'}
                  </p>
                  <p className="text-sm text-green-600 mt-1">Per salesperson</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">Total Salespeople</p>
                  <p className="text-lg font-bold text-gray-900">{commissionData.length}</p>
                  <p className="text-sm text-purple-600 mt-1">Active in period</p>
                </div>
              </div>
            </div>
          )}

          {/* Expense View */}
          {activeView === 'expense' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, amount }) => `${category}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Expense Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Categories</h3>
                  <div className="space-y-3">
                    {expenseData.map((item, idx) => {
                      const percentage = (item.amount / totalExpenses) * 100
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            <p className="text-sm font-medium text-gray-900">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                            <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Expense Table */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Expense Summary</h3>
                  <button
                    onClick={() => exportToCSV(expenseData, 'expenses')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenseData.map((row, idx) => {
                        const percentage = (row.amount / totalExpenses) * 100
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.category}</td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(row.amount)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                              {percentage.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-6 py-4 text-sm text-gray-900">Total Expenses</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">
                          {formatCurrency(totalExpenses)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            Report Period: {getDateRange().startDate.toLocaleDateString()} -{' '}
            {getDateRange().endDate.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}
