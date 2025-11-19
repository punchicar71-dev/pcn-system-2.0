'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase-client'
import { SalesAgent, SoldVehicle } from '@/lib/database.types'
import { format } from 'date-fns'

interface AgentStats {
  agentType: 'Office Sales Agent' | 'Vehicle Showroom Agent'
  name: string
  activeCount: number
}

interface SaleRecord {
  id: string
  vehicle_number: string
  brand_name: string
  model_name: string
  manufacture_year: number
  selling_amount: number
  payment_type: string
  office_sales_agent: string
  showroom_agent: string
  sold_date: string
}

export default function SalesAgentsReportTab() {
  const [loading, setLoading] = useState(true)
  const [agentType, setAgentType] = useState<'Office Sales Agent' | 'Vehicle Showroom Agent' | 'all'>('all')
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  
  // Data states
  const [agents, setAgents] = useState<SalesAgent[]>([])
  const [agentStats, setAgentStats] = useState<AgentStats[]>([])
  const [salesData, setSalesData] = useState<SaleRecord[]>([])
  const [filteredSalesData, setFilteredSalesData] = useState<SaleRecord[]>([])
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const supabase = createClient()

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    filterSalesData()
  }, [agentType, selectedAgent, dateRange, salesData])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      // Fetch all agents from settings (sync with SalesAgentTab)
      const { data: agentsData, error: agentsError } = await supabase
        .from('sales_agents')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (agentsError) throw agentsError
      setAgents(agentsData || [])

      // Fetch sold out sales with full vehicle and agent details
      const { data: soldOutSalesData, error: soldOutError } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles:vehicle_id (
            id,
            vehicle_number,
            brand_id,
            model_id,
            manufacture_year,
            selling_amount,
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
            name,
            agent_type
          )
        `)
        .eq('status', 'sold')
        .order('updated_at', { ascending: false })

      if (soldOutError) {
        console.error('Error fetching sold out sales:', soldOutError)
        throw soldOutError
      }

      console.log('Total sold out sales records:', soldOutSalesData?.length || 0)

      if (!soldOutSalesData || soldOutSalesData.length === 0) {
        setSalesData([])
        setAgentStats([])
        setLoading(false)
        return
      }

      // Process sold out sales data - every sale has both an Office Sales Agent AND a Vehicle Showroom Agent
      const processedSales: SaleRecord[] = soldOutSalesData
        .map((sale: any) => {
          const vehicle = sale.vehicles
          
          // Office Sales Agent - from sales_agent_id
          let officeSalesAgent = 'N/A'
          if (sale.sales_agent_id && sale.sales_agents) {
            officeSalesAgent = sale.sales_agents.name
          }

          // Vehicle Showroom Agent - from third_party_agent
          let showroomAgent = 'N/A'
          if (sale.third_party_agent) {
            showroomAgent = sale.third_party_agent
          }

          return {
            id: sale.id,
            vehicle_number: vehicle?.vehicle_number || 'N/A',
            brand_name: vehicle?.vehicle_brands?.name || 'Unknown',
            model_name: vehicle?.vehicle_models?.name || 'Unknown',
            manufacture_year: vehicle?.manufacture_year || 0,
            selling_amount: sale.selling_amount,
            payment_type: sale.payment_type,
            office_sales_agent: officeSalesAgent,
            showroom_agent: showroomAgent,
            sold_date: sale.updated_at, // Date when status changed to 'sold'
          }
        })
        .filter((sale: SaleRecord) => 
          sale.office_sales_agent !== 'N/A' || sale.showroom_agent !== 'N/A'
        )

      console.log('Processed sales:', processedSales.length)

      setSalesData(processedSales)

      // Calculate agent statistics - count unique active agents
      const officeAgentCount = new Set(
        processedSales
          .filter(sale => sale.office_sales_agent !== 'N/A')
          .map(sale => sale.office_sales_agent)
      ).size

      const showroomAgentCount = new Set(
        processedSales
          .filter(sale => sale.showroom_agent !== 'N/A')
          .map(sale => sale.showroom_agent)
      ).size

      const stats: AgentStats[] = [
        {
          name: 'Office Sales Agents',
          activeCount: officeAgentCount,
          agentType: 'Office Sales Agent'
        },
        {
          name: 'Vehicle Showroom Agents',
          activeCount: showroomAgentCount,
          agentType: 'Vehicle Showroom Agent'
        }
      ]

      setAgentStats(stats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSalesData = () => {
    let filtered = [...salesData]

    // Filter by agent type and specific agent
    if (agentType !== 'all') {
      if (agentType === 'Office Sales Agent') {
        // Show sales where this is the Office Sales Agent
        if (selectedAgent !== 'all') {
          filtered = filtered.filter(sale => sale.office_sales_agent === selectedAgent)
        } else {
          // Show all sales (since every sale has an Office Sales Agent)
          filtered = filtered.filter(sale => sale.office_sales_agent !== 'N/A')
        }
      } else if (agentType === 'Vehicle Showroom Agent') {
        // Show sales where this is the Vehicle Showroom Agent
        if (selectedAgent !== 'all') {
          filtered = filtered.filter(sale => sale.showroom_agent === selectedAgent)
        } else {
          // Show all sales (since every sale has a Vehicle Showroom Agent)
          filtered = filtered.filter(sale => sale.showroom_agent !== 'N/A')
        }
      }
    } else {
      // When 'all' agent types selected
      if (selectedAgent !== 'all') {
        // Show sales where the selected agent is either Office or Showroom agent
        filtered = filtered.filter(sale => 
          sale.office_sales_agent === selectedAgent || 
          sale.showroom_agent === selectedAgent
        )
      }
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)

      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.sold_date)
        return saleDate >= fromDate && saleDate <= toDate
      })
    }

    setFilteredSalesData(filtered)
    setCurrentPage(1)
  }

  const getAgentsForType = () => {
    console.log('Getting agents for type:', agentType)
    console.log('Total sales data:', salesData.length)
    
    if (agentType === 'all') {
      // Get all unique agents from both Office Sales Agent and Vehicle Showroom Agent
      const allAgentNames = new Set<string>()
      const agentMap = new Map<string, SalesAgent>()

      // Add all Office Sales Agents
      salesData.forEach(sale => {
        if (sale.office_sales_agent !== 'N/A' && !allAgentNames.has(sale.office_sales_agent)) {
          allAgentNames.add(sale.office_sales_agent)
          const settingsAgent = agents.find(a => a.name === sale.office_sales_agent && a.agent_type === 'Office Sales Agent')
          
          if (settingsAgent) {
            agentMap.set(sale.office_sales_agent, settingsAgent)
          } else {
            agentMap.set(sale.office_sales_agent, {
              id: `virtual-office-${sale.office_sales_agent}`,
              user_id: '',
              name: sale.office_sales_agent,
              email: undefined,
              agent_type: 'Office Sales Agent',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
        }
      })

      // Add all Vehicle Showroom Agents
      salesData.forEach(sale => {
        if (sale.showroom_agent !== 'N/A' && !allAgentNames.has(sale.showroom_agent)) {
          allAgentNames.add(sale.showroom_agent)
          const settingsAgent = agents.find(a => a.name === sale.showroom_agent && a.agent_type === 'Vehicle Showroom Agent')
          
          if (settingsAgent) {
            agentMap.set(sale.showroom_agent, settingsAgent)
          } else {
            agentMap.set(sale.showroom_agent, {
              id: `virtual-showroom-${sale.showroom_agent}`,
              user_id: '',
              name: sale.showroom_agent,
              email: undefined,
              agent_type: 'Vehicle Showroom Agent',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
        }
      })

      const result = Array.from(agentMap.values())
      console.log('All agents:', result.map(a => `${a.name} (${a.agent_type})`))
      return result
    }

    if (agentType === 'Office Sales Agent') {
      // Get unique Office Sales Agents from sales data
      const officeAgentNames = new Set(
        salesData
          .filter(sale => sale.office_sales_agent !== 'N/A')
          .map(sale => sale.office_sales_agent)
      )
      console.log('Office agent names:', Array.from(officeAgentNames))

      const agentList: SalesAgent[] = []
      
      officeAgentNames.forEach(name => {
        const settingsAgent = agents.find(a => a.name === name && a.agent_type === 'Office Sales Agent')
        if (settingsAgent) {
          agentList.push(settingsAgent)
        } else {
          agentList.push({
            id: `virtual-office-${name}`,
            user_id: '',
            name,
            email: undefined,
            agent_type: 'Office Sales Agent',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      })

      console.log('Office agents for dropdown:', agentList.map(a => a.name))
      return agentList
    } else {
      // Get unique Vehicle Showroom Agents from sales data
      const showroomAgentNames = new Set(
        salesData
          .filter(sale => sale.showroom_agent !== 'N/A')
          .map(sale => sale.showroom_agent)
      )
      console.log('Showroom agent names:', Array.from(showroomAgentNames))

      const agentList: SalesAgent[] = []
      
      showroomAgentNames.forEach(name => {
        const settingsAgent = agents.find(a => a.name === name && a.agent_type === 'Vehicle Showroom Agent')
        if (settingsAgent) {
          agentList.push(settingsAgent)
        } else {
          agentList.push({
            id: `virtual-showroom-${name}`,
            user_id: '',
            name,
            email: undefined,
            agent_type: 'Vehicle Showroom Agent',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      })

      console.log('Showroom agents for dropdown:', agentList.map(a => a.name))
      return agentList
    }
  }

  const getOfficeAgentStats = () => {
    // Count active Office Sales Agents from Settings Sales Agent Tab
    return agents.filter(agent => agent.agent_type === 'Office Sales Agent' && agent.is_active).length
  }

  const getShowroomAgentStats = () => {
    // Count active Vehicle Showroom Agents from Settings Sales Agent Tab
    return agents.filter(agent => agent.agent_type === 'Vehicle Showroom Agent' && agent.is_active).length
  }

  // Pagination
  const totalPages = Math.ceil(filteredSalesData.length / rowsPerPage)
  const startIdx = (currentPage - 1) * rowsPerPage
  const endIdx = startIdx + rowsPerPage
  const paginatedData = filteredSalesData.slice(startIdx, endIdx)

  const handleExportCSV = () => {
    if (filteredSalesData.length === 0) {
      alert('No data to export')
      return
    }

    const headers = [
      'Vehicle Number',
      'Brand',
      'Model',
      'Year',
      'Sales Price',
      'Payment Type',
      'Office Sales Agent',
      'Vehicle Showroom Agent',
      'Sold Out Date',
    ]

    const rows = filteredSalesData.map(record => [
      record.vehicle_number,
      record.brand_name,
      record.model_name,
      record.manufacture_year,
      `Rs. ${record.selling_amount.toLocaleString()}`,
      record.payment_type,
      record.office_sales_agent,
      record.showroom_agent,
      format(new Date(record.sold_date), 'yyyy.MM.dd'),
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sales-agents-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Loading report data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Agent Stats Cards */}
      <div className="flex  gap-4">
        <div className=" flex w-[380px] bg-gray-50 items-center justify-between border gap-4 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-600 ">Office Sale Agent</p>
          <p className="text-[12px] font-semibold  px-4 py-1 rounded-full text-green-600   bg-green-100">{getOfficeAgentStats()} Active</p>
        </div>
        <div className=" flex w-[380px] bg-gray-50 items-center justify-between border gap-4 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-600 ">Vehicle Showroom Agent</p>
          <p className="text-[12px] font-semibold px-4 py-1 rounded-full text-green-600   bg-green-100">{getShowroomAgentStats()} Active</p>
        </div>
      </div>

    <Separator className="my-4" />

      {/* Agents Report Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Sales Agents Report</h2>

        {/* Filters */}
        <div className="bg-white ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Agent Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Sales Agent Type</label>
              <Select value={agentType} onValueChange={(value: any) => {
                setAgentType(value)
                setSelectedAgent('all')
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agent Types</SelectItem>
                  <SelectItem value="Office Sales Agent">Office Sales Agent</SelectItem>
                  <SelectItem value="Vehicle Showroom Agent">Vehicle Showroom Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agent Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {getAgentsForType().map(agent => (
                    <SelectItem key={agent.id} value={agent.name}>
                      {agent.name} {agentType === 'all' ? `(${agent.agent_type})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="md:col-span-1">
              <label className="text-sm font-medium mb-2 block">Select Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "yyyy.MM.dd")} -{" "}
                          {format(dateRange.to, "yyyy.MM.dd")}
                        </>
                      ) : (
                        format(dateRange.from, "yyyy.MM.dd")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                    }}
                    numberOfMonths={2}
                  />
                  <div className="p-3 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setDateRange({ from: undefined, to: undefined })}
                    >
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

       <div className='flex justify-between py-4'>
        {/* Selected Agent Info */}
        {selectedAgent !== 'all' && (
          <div className="mb-4 px-3 py-2 bg-blue-50 h-9 rounded-lg">
            <p className="text-sm">
              <span className="font-semibold">{selectedAgent}</span>
              <span className="text-gray-600"> - Total Sale: <span className='font-bold text-blue-600'>{filteredSalesData.length}</span> </span>
            </p>
          </div>
        )}

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleExportCSV}
            className="bg-gray-800 hover:bg-gray-900 text-white"
            disabled={filteredSalesData.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
       </div> 

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Vehicle Number</TableHead>
                <TableHead className="text-xs font-semibold">Brand</TableHead>
                <TableHead className="text-xs font-semibold">Model</TableHead>
                <TableHead className="text-xs font-semibold">Year</TableHead>
                <TableHead className="text-xs font-semibold">Sales Price</TableHead>
                <TableHead className="text-xs font-semibold">Payment Type</TableHead>
                <TableHead className="text-xs font-semibold">Office Sales Agent</TableHead>
                <TableHead className="text-xs font-semibold">Vehicle Showroom Agent</TableHead>
                <TableHead className="text-xs font-semibold">Sold Out Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map(record => (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm">{record.vehicle_number}</TableCell>
                    <TableCell className="text-sm">{record.brand_name}</TableCell>
                    <TableCell className="text-sm">{record.model_name}</TableCell>
                    <TableCell className="text-sm">{record.manufacture_year}</TableCell>
                    <TableCell className="text-sm font-medium">Rs. {record.selling_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        record.payment_type === 'Cash'
                          ? 'bg-green-100 text-green-800'
                          : record.payment_type === 'Leasing'
                          ? 'bg-blue-100 text-blue-800'
                          : record.payment_type === 'Bank Transfer'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.payment_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{record.office_sales_agent}</TableCell>
                    <TableCell className="text-sm">{record.showroom_agent}</TableCell>
                    <TableCell className="text-sm">{format(new Date(record.sold_date), 'yyyy.MM.dd')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No sales records found for the selected filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredSalesData.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Rows per page</label>
              <Select value={String(rowsPerPage)} onValueChange={(value) => {
                setRowsPerPage(Number(value))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {startIdx + 1} to {Math.min(endIdx, filteredSalesData.length)} of {filteredSalesData.length}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? 'bg-gray-800 text-white' : ''}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
