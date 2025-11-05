'use client'

import { useState, useEffect } from 'react'
import { Calendar, Download, Users, TrendingUp, BarChart3, Filter } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { createClient } from '@/lib/supabase-client'

interface CustomerData {
  id: string
  name: string
  phone: string
  email: string
  agentName: string
  agentType: string
  saleDate: string
  vehicleNumber: string
  brand: string
  salePrice: number
}

interface AgentPerformance {
  id: string
  name: string
  type: 'Office Sales Agent' | 'Vehicle Showroom Agent'
  unitsSold: number
  totalRevenue: number
  totalProfit: number
  avgProfitPerVehicle: number
  avgTimeToSell: number
}

interface TeamStats {
  officeUnits: number
  officeRevenue: number
  showroomUnits: number
  showroomRevenue: number
}

interface CommissionData {
  agentName: string
  agentType: string
  totalSales: number
  totalRevenue: number
  commissionRate: number
  commissionAmount: number
}

interface LeadMetrics {
  agentType: string
  leadsHandled: number
  leadsSold: number
  conversionRate: number
}

export default function CustomerStaffReportsTab() {
  const [dateRange, setDateRange] = useState('Past Month')
  const [agentTypeFilter, setAgentTypeFilter] = useState<'all' | 'office' | 'showroom'>('all')
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'customers' | 'team' | 'individual' | 'leaderboard' | 'leads' | 'commission' | 'activity'>('customers')

  // Data states
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats>({ officeUnits: 0, officeRevenue: 0, showroomUnits: 0, showroomRevenue: 0 })
  const [commissions, setCommissions] = useState<CommissionData[]>([])
  const [leadMetrics, setLeadMetrics] = useState<LeadMetrics[]>([])

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

      // Fetch sold vehicles with all related data
      const { data: salesRecords } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles:vehicle_id (
            vehicle_number,
            selling_amount,
            brand_id
          ),
          vehicle_brands:vehicles!inner (
            name
          ),
          sales_agents:sales_agent_id (
            id,
            name,
            agent_type
          )
        `)
        .eq('status', 'sold')
        .gte('updated_at', startDateStr)
        .lte('updated_at', endDateStr)
        .order('updated_at', { ascending: false })

      if (salesRecords) {
        processCustomerData(salesRecords)
        processAgentPerformance(salesRecords)
        processTeamStats(salesRecords)
        processCommissions(salesRecords)
        processLeadMetrics(salesRecords)
      }
    } catch (error) {
      console.error('Error fetching customer & staff data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processCustomerData = (records: any[]) => {
    const customersList: CustomerData[] = records.map(r => ({
      id: r.id,
      name: `${r.customer_first_name} ${r.customer_last_name}`,
      phone: r.customer_phone || 'N/A',
      email: r.customer_email || 'N/A',
      agentName: r.sales_agents?.name || 'Unknown',
      agentType: r.sales_agents?.agent_type || 'Unknown',
      saleDate: new Date(r.updated_at).toLocaleDateString(),
      vehicleNumber: r.vehicles?.vehicle_number || 'N/A',
      brand: r.vehicle_brands?.name || 'Unknown',
      salePrice: r.sale_price || 0,
    }))
    setCustomers(customersList)
  }

  const processAgentPerformance = (records: any[]) => {
    const agentMap: { [key: string]: any } = {}

    records.forEach(record => {
      const agentId = record.sales_agents?.id
      const agentName = record.sales_agents?.name || 'Unknown'
      const agentType = record.sales_agents?.agent_type || 'Unknown'
      
      if (!agentMap[agentId]) {
        agentMap[agentId] = {
          id: agentId,
          name: agentName,
          type: agentType,
          units: 0,
          revenue: 0,
          profit: 0,
          daysToSell: [],
        }
      }

      agentMap[agentId].units += 1
      agentMap[agentId].revenue += record.sale_price || 0
      agentMap[agentId].profit += (record.sale_price || 0) - (record.selling_amount || 0)

      const daysToSell = Math.floor((new Date(record.updated_at).getTime() - new Date(record.created_at).getTime()) / (1000 * 60 * 60 * 24))
      agentMap[agentId].daysToSell.push(daysToSell)
    })

    const performance: AgentPerformance[] = Object.values(agentMap).map((agent: any) => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      unitsSold: agent.units,
      totalRevenue: agent.revenue,
      totalProfit: agent.profit,
      avgProfitPerVehicle: agent.units > 0 ? Math.round(agent.profit / agent.units) : 0,
      avgTimeToSell: agent.daysToSell.length > 0 ? Math.round(agent.daysToSell.reduce((a: number, b: number) => a + b, 0) / agent.daysToSell.length) : 0,
    }))

    setAgentPerformance(performance.sort((a, b) => b.unitsSold - a.unitsSold))
  }

  const processTeamStats = (records: any[]) => {
    let officeUnits = 0, officeRevenue = 0, showroomUnits = 0, showroomRevenue = 0

    records.forEach(record => {
      const agentType = record.sales_agents?.agent_type
      const revenue = record.sale_price || 0

      if (agentType === 'Office Sales Agent') {
        officeUnits += 1
        officeRevenue += revenue
      } else if (agentType === 'Vehicle Showroom Agent') {
        showroomUnits += 1
        showroomRevenue += revenue
      }
    })

    setTeamStats({ officeUnits, officeRevenue, showroomUnits, showroomRevenue })
  }

  const processCommissions = (records: any[]) => {
    const agentCommissions: { [key: string]: any } = {}
    const commissionRate = 0.02

    records.forEach(record => {
      const agentId = record.sales_agents?.id
      const agentName = record.sales_agents?.name || 'Unknown'
      const agentType = record.sales_agents?.agent_type || 'Unknown'
      const revenue = record.sale_price || 0

      if (!agentCommissions[agentId]) {
        agentCommissions[agentId] = {
          agentName,
          agentType,
          totalSales: 0,
          totalRevenue: 0,
        }
      }

      agentCommissions[agentId].totalSales += 1
      agentCommissions[agentId].totalRevenue += revenue
    })

    const commissionList: CommissionData[] = Object.values(agentCommissions).map((agent: any) => ({
      agentName: agent.agentName,
      agentType: agent.agentType,
      totalSales: agent.totalSales,
      totalRevenue: agent.totalRevenue,
      commissionRate: commissionRate * 100,
      commissionAmount: Math.round(agent.totalRevenue * commissionRate),
    }))

    setCommissions(commissionList)
  }

  const processLeadMetrics = (records: any[]) => {
    const metrics: { [key: string]: any } = {
      'Office Sales Agent': { handled: 0, sold: 0 },
      'Vehicle Showroom Agent': { handled: 0, sold: 0 },
    }

    records.forEach(record => {
      const agentType = record.sales_agents?.agent_type || 'Vehicle Showroom Agent'
      if (metrics[agentType]) {
        metrics[agentType].handled += 1
        metrics[agentType].sold += 1 // Since we're looking at sold items
      }
    })

    const leadList: LeadMetrics[] = Object.entries(metrics).map(([type, data]: [string, any]) => ({
      agentType: type,
      leadsHandled: data.handled,
      leadsSold: data.sold,
      conversionRate: data.handled > 0 ? Math.round((data.sold / data.handled) * 100) : 0,
    }))

    setLeadMetrics(leadList)
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
        <div className="flex gap-2">
          <select
            value={agentTypeFilter}
            onChange={(e: any) => setAgentTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Agents</option>
            <option value="office">Office Agents Only</option>
            <option value="showroom">Showroom Agents Only</option>
          </select>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'customers', label: 'Customers', icon: '👥' },
          { id: 'team', label: 'Team Performance', icon: '👔' },
          { id: 'individual', label: 'Individual Stats', icon: '📊' },
          { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
          { id: 'leads', label: 'Lead Performance', icon: '📈' },
          { id: 'commission', label: 'Commissions', icon: '💰' },
          { id: 'activity', label: 'Activity Log', icon: '📋' },
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`px-4 py-3 font-medium text-sm transition border-b-2 whitespace-nowrap ${
              activeView === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Loading customer & staff data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Customers View */}
          {activeView === 'customers' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Database</h3>
                  <button
                    onClick={() => exportToCSV(customers, 'customers')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Customer Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Phone</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Sales Agent</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Agent Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Vehicle</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Sale Price</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 font-medium">{customer.name}</td>
                          <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                          <td className="px-4 py-3 text-gray-900">{customer.agentName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              customer.agentType === 'Office Sales Agent' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {customer.agentType === 'Office Sales Agent' ? 'Office' : 'Showroom'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{customer.brand}</td>
                          <td className="px-4 py-3 text-right text-gray-900 font-medium">{formatCurrency(customer.salePrice)}</td>
                          <td className="px-4 py-3 text-gray-600">{customer.saleDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Team Performance View */}
          {activeView === 'team' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 font-medium">Office Agents - Units</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{teamStats.officeUnits}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 font-medium">Office Agents - Revenue</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(teamStats.officeRevenue)}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 font-medium">Showroom Agents - Units</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{teamStats.showroomUnits}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 font-medium">Showroom Agents - Revenue</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(teamStats.showroomRevenue)}</p>
                </div>
              </div>

              {/* Comparison Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Office Agents', units: teamStats.officeUnits, revenue: Math.round(teamStats.officeRevenue / 100000) },
                    { name: 'Showroom Agents', units: teamStats.showroomUnits, revenue: Math.round(teamStats.showroomRevenue / 100000) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="units" fill="#3b82f6" name="Units Sold" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#8b5cf6" name="Revenue (×100K)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Individual Stats View */}
          {activeView === 'individual' && (
            <div className="space-y-6">
              {agentPerformance.map((agent, idx) => (
                <div key={agent.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded inline-block mt-2 ${
                        agent.type === 'Office Sales Agent' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {agent.type === 'Office Sales Agent' ? '👔 Office Agent' : '🏪 Showroom Agent'}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">#{idx + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Units Sold</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{agent.unitsSold}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(agent.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Profit</p>
                      <p className="text-lg font-bold text-blue-600 mt-1">{formatCurrency(agent.totalProfit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Profit/Vehicle</p>
                      <p className="text-lg font-bold text-purple-600 mt-1">{formatCurrency(agent.avgProfitPerVehicle)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Days to Sell</p>
                      <p className="text-lg font-bold text-orange-600 mt-1">{agent.avgTimeToSell} days</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leaderboard View */}
          {activeView === 'leaderboard' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sales Agent Leaderboard</h3>
                  <button
                    onClick={() => exportToCSV(agentPerformance, 'leaderboard')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="space-y-3">
                  {agentPerformance
                    .filter(agent => {
                      if (agentTypeFilter === 'office') return agent.type === 'Office Sales Agent'
                      if (agentTypeFilter === 'showroom') return agent.type === 'Vehicle Showroom Agent'
                      return true
                    })
                    .map((agent, idx) => (
                      <div key={agent.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-200">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">{idx + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{agent.name}</p>
                            <span className="text-xs text-gray-500">
                              {agent.type === 'Office Sales Agent' ? '👔 Office' : '🏪 Showroom'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <p className="text-sm text-gray-600">Units</p>
                            <p className="text-lg font-bold text-gray-900">{agent.unitsSold}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Revenue</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(Math.round(agent.totalRevenue / 1000))}K</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Profit</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(Math.round(agent.totalProfit / 1000))}K</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Lead Performance View */}
          {activeView === 'leads' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {leadMetrics.map((metric) => (
                  <div key={metric.agentType} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {metric.agentType === 'Office Sales Agent' ? '👔 Office Agents' : '🏪 Showroom Agents'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Leads Handled</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{metric.leadsHandled}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Leads Converted to Sale</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">{metric.leadsSold}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Conversion Rate</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{metric.conversionRate}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${metric.conversionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commission View */}
          {activeView === 'commission' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sales Commission Report (2% Rate)</h3>
                  <button
                    onClick={() => exportToCSV(commissions, 'commissions')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Agent Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Sales</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Total Revenue</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Commission Rate</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Commission Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {commissions
                        .filter(comm => {
                          if (agentTypeFilter === 'office') return comm.agentType === 'Office Sales Agent'
                          if (agentTypeFilter === 'showroom') return comm.agentType === 'Vehicle Showroom Agent'
                          return true
                        })
                        .map((comm) => (
                          <tr key={comm.agentName} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900 font-medium">{comm.agentName}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                comm.agentType === 'Office Sales Agent' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {comm.agentType === 'Office Sales Agent' ? 'Office' : 'Showroom'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900">{comm.totalSales}</td>
                            <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(comm.totalRevenue)}</td>
                            <td className="px-4 py-3 text-right text-gray-900">{comm.commissionRate}%</td>
                            <td className="px-4 py-3 text-right text-green-600 font-bold">{formatCurrency(comm.commissionAmount)}</td>
                          </tr>
                        ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={5} className="px-4 py-3 text-right text-gray-900">Total Commission:</td>
                        <td className="px-4 py-3 text-right text-green-600 text-lg">
                          {formatCurrency(commissions.reduce((sum, c) => sum + c.commissionAmount, 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log View */}
          {activeView === 'activity' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Activity Log</h3>
                <div className="space-y-3">
                  {customers.slice(0, 10).map((customer) => (
                    <div key={customer.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-blue-600 text-sm">📝</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Sale recorded by <span className="font-bold">{customer.agentName}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {customer.name} purchased {customer.brand} (Vehicle: {customer.vehicleNumber})
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{customer.saleDate}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            customer.agentType === 'Office Sales Agent' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {customer.agentType === 'Office Sales Agent' ? 'Office' : 'Showroom'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
