'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase-client'
import { Loader2 } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartDataPoint {
  day: number
  date: string
  inventory: number
  sold: number
  displayDate?: string
}

interface VehicleBreakdown {
  type: string
  count: number
}

interface AgentPerformance {
  name: string
  type: 'Office Sales Agent' | 'Vehicle Showroom Agent'
  sales: number
  typeColor: string
}

interface BrandSales {
  name: string
  value: number
  color: string
}

const brandColors = [
  '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', 
  '#8b5cf6', '#6366f1', '#a855f7', '#14b8a6', '#84cc16',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'
]

const chartConfig = {
  inventory: {
    label: "Inventory Available",
    color: "hsl(217, 91%, 60%)",
  },
  sold: {
    label: "Sold-Out Vehicles",
    color: "hsl(142, 76%, 36%)",
  },
} satisfies ChartConfig

interface SalesAreaChartProps {
  data: ChartDataPoint[]
  timeRange: string
}

const SalesAreaChart = ({ data, timeRange }: SalesAreaChartProps) => {
  if (data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-gray-500">No data available</div>
  }

  // Format data for the chart with proper date formatting
  const formattedData = data.map(point => ({
    date: point.date,
    inventory: point.inventory,
    sold: point.sold,
  }))

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'last7days': return 'last 7 days'
      case 'last30days': return 'last 30 days'
      case 'last90days': return 'last 90 days'
      case 'last365days': return 'last 365 days'
      default: return 'selected period'
    }
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={formattedData}>
        <defs>
          <linearGradient id="fillInventory" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-inventory)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-inventory)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillSold" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-sold)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-sold)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }}
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="sold"
          type="natural"
          fill="url(#fillSold)"
          stroke="var(--color-sold)"
          stackId="a"
        />
        <Area
          dataKey="inventory"
          type="natural"
          fill="url(#fillInventory)"
          stroke="var(--color-inventory)"
          stackId="a"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  )
}

interface DoughnutChartProps {
  data: BrandSales[]
}

const DoughnutChart = ({ data }: DoughnutChartProps) => {
  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-gray-500">No sales data</div>
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = -90

  const slices = data.map(item => {
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const innerRadius = 60
    const outerRadius = 100

    const x1 = 100 + innerRadius * Math.cos(startRad)
    const y1 = 100 + innerRadius * Math.sin(startRad)
    const x2 = 100 + outerRadius * Math.cos(startRad)
    const y2 = 100 + outerRadius * Math.sin(startRad)
    const x3 = 100 + outerRadius * Math.cos(endRad)
    const y3 = 100 + outerRadius * Math.sin(endRad)
    const x4 = 100 + innerRadius * Math.cos(endRad)
    const y4 = 100 + innerRadius * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0
    const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1} Z`

    return { ...item, pathData }
  })

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500">Total Sale</div>
          <div className="text-3xl font-bold">{total}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6 text-sm max-h-48 overflow-y-auto">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
            <span className="text-gray-600 truncate">{item.name}</span>
            <span className="font-semibold ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InventoryReportsTab() {
  const [dateRange, setDateRange] = useState('last30days')
  const [loading, setLoading] = useState(true)
  
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [vehicleBreakdown, setVehicleBreakdown] = useState<VehicleBreakdown[]>([])
  const [totalVehicles, setTotalVehicles] = useState(0)
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([])
  const [brandSales, setBrandSales] = useState<BrandSales[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange])

  const getDaysCount = (range: string): number => {
    switch (range) {
      case 'last7days': return 7
      case 'last30days': return 30
      case 'last90days': return 90
      case 'last365days': return 365
      default: return 30
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const daysCount = getDaysCount(dateRange)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysCount)
      const startDateStr = startDate.toISOString().split('T')[0]

      await Promise.all([
        fetchChartData(startDateStr, daysCount),
        fetchVehicleBreakdown(),
        fetchAgentPerformance(startDateStr),
        fetchBrandSales(startDateStr)
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async (startDateStr: string, daysCount: number) => {
    try {
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('entry_date, status')
        .gte('entry_date', startDateStr)

      const { data: soldSales, error: salesError } = await supabase
        .from('pending_vehicle_sales')
        .select('updated_at, status')
        .eq('status', 'sold')
        .gte('updated_at', startDateStr)

      if (vehiclesError) throw vehiclesError
      if (salesError) throw salesError

      const dataPoints: ChartDataPoint[] = []
      for (let i = 0; i < daysCount; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (daysCount - i - 1))
        const dateStr = date.toISOString().split('T')[0]

        const inventoryCount = vehicles?.filter(v => 
          v.entry_date <= dateStr && (v.status === 'In Sale' || v.status === 'Reserved')
        ).length || 0

        const soldCount = soldSales?.filter(s => 
          s.updated_at.split('T')[0] === dateStr
        ).length || 0

        dataPoints.push({
          day: i + 1,
          date: new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          inventory: inventoryCount,
          sold: soldCount
        })
      }

      setChartData(dataPoints)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      setChartData([])
    }
  }

  const fetchVehicleBreakdown = async () => {
    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('body_type')
        .in('status', ['In Sale', 'Reserved'])

      if (error) throw error

      const bodyTypes = ['SUV', 'Sedan', 'Hatchback', 'Wagon', 'Coupe', 'Convertible', 'Van', 'Truck']
      const breakdown: VehicleBreakdown[] = bodyTypes.map(type => ({
        type,
        count: vehicles?.filter(v => v.body_type === type).length || 0
      }))

      setVehicleBreakdown(breakdown)
      setTotalVehicles(vehicles?.length || 0)
    } catch (error) {
      console.error('Error fetching vehicle breakdown:', error)
      setVehicleBreakdown([])
      setTotalVehicles(0)
    }
  }

  const fetchAgentPerformance = async (startDateStr: string) => {
    try {
      const { data: soldSales, error } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          sales_agents:sales_agent_id (
            id,
            name,
            agent_type
          )
        `)
        .eq('status', 'sold')
        .gte('updated_at', startDateStr)

      if (error) throw error

      const agentSalesMap = new Map<string, { name: string, type: 'Office Sales Agent' | 'Vehicle Showroom Agent', count: number }>()

      soldSales?.forEach((sale: any) => {
        if (sale.sales_agent_id && sale.sales_agents) {
          const agentId = sale.sales_agent_id
          const agentName = sale.sales_agents.name
          const agentType = sale.sales_agents.agent_type

          if (!agentSalesMap.has(agentId)) {
            agentSalesMap.set(agentId, { name: agentName, type: agentType, count: 0 })
          }
          agentSalesMap.get(agentId)!.count++
        }

        if (sale.third_party_agent) {
          const showroomAgentName = sale.third_party_agent
          const showroomKey = `showroom_${showroomAgentName}`
          
          if (!agentSalesMap.has(showroomKey)) {
            agentSalesMap.set(showroomKey, { 
              name: showroomAgentName, 
              type: 'Vehicle Showroom Agent', 
              count: 0 
            })
          }
          agentSalesMap.get(showroomKey)!.count++
        }
      })

      const performance: AgentPerformance[] = Array.from(agentSalesMap.values())
        .map(agent => ({
          name: agent.name,
          type: agent.type,
          sales: agent.count,
          typeColor: agent.type === 'Office Sales Agent' ? 'text-purple-600' : 'text-green-600'
        }))
        .sort((a, b) => b.sales - a.sales)

      setAgentPerformance(performance)
    } catch (error) {
      console.error('Error fetching agent performance:', error)
      setAgentPerformance([])
    }
  }

  const fetchBrandSales = async (startDateStr: string) => {
    try {
      const { data: soldSales, error } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles:vehicle_id (
            brand_id,
            vehicle_brands:brand_id (
              name
            )
          )
        `)
        .eq('status', 'sold')
        .gte('updated_at', startDateStr)

      if (error) throw error

      const brandSalesMap = new Map<string, number>()

      soldSales?.forEach((sale: any) => {
        // Use stored snapshot first (brand_name), fallback to joined vehicle data
        const brandName = sale.brand_name || sale.vehicles?.vehicle_brands?.name
        if (brandName) {
          brandSalesMap.set(brandName, (brandSalesMap.get(brandName) || 0) + 1)
        }
      })

      const brandSalesData: BrandSales[] = Array.from(brandSalesMap.entries())
        .map(([name, value], index) => ({
          name,
          value,
          color: brandColors[index % brandColors.length]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

      setBrandSales(brandSalesData)
    } catch (error) {
      console.error('Error fetching brand sales:', error)
      setBrandSales([])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-[18px] font-bold text-gray-900">Total Summary</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Select Date Range</span>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="last365days">Last 365 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className=" bg-gray-50 pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0  py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle className="text-[16px] font-semibold">Sales Performance Summary</CardTitle>
                <CardDescription>
                  Showing inventory and sold vehicles for the selected period
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <SalesAreaChart data={chartData} timeRange={dateRange} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className=" bg-gray-50 h-full">
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Showroom Available Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-green-600 mb-6">{totalVehicles}</div>
              <div className="space-y-3">
                {vehicleBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.type}:</span>
                    <span className="font-semibold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-0  h-full">
            <CardHeader>
              <CardTitle className="text-[16px]  font-semibold">Sales Agent Performance</CardTitle>
            </CardHeader>
            <CardContent className=''>
              {agentPerformance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No sales data available</div>
              ) : (
                <div className="rounded-md bg-white border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className=' bg-gray-50'>
                        <TableHead className="font-semibold p-4">Agent Name</TableHead>
                        <TableHead className="font-semibold p-4">Type</TableHead>
                        <TableHead className="font-semibold text-right pr-4">Sales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agentPerformance.map((agent, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium p-4">{agent.name}</TableCell>
                          <TableCell>
                            {agent.type === 'Office Sales Agent' ? (
                              <Badge className="bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 border-purple-200">
                                Office Sales Agent
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 rounded-full hover:bg-green-200 border-green-200">
                                Vehicle Showroom Agent
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold pr-4">{agent.sales}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-0 bg-gray-50 h-full">
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Most Selling Brands</CardTitle>
            </CardHeader>
            <CardContent>
              <DoughnutChart data={brandSales} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
