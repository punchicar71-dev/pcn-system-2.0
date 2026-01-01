'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from "@/components/ui/separator"
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase-client'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface FinancialReportData {
  id: string
  vehicle_number: string
  brand_name: string
  model_name: string
  seller_price: number
  sales_price: number
  down_payment: number
  pcn_advance: number
  payment_type: string
  sold_out_date: string
}

export default function FinancialReportsTab() {
  // Get current month's date range
  const today = new Date()
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  })

  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<FinancialReportData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const supabase = createClient()

  useEffect(() => {
    fetchFinancialData()
  }, [dateRange])

  const fetchFinancialData = async () => {
    if (!dateRange.from || !dateRange.to) return

    setLoading(true)
    try {
      // Fetch sold vehicles with all necessary joins
      // Using select(*) to get all columns including both selling_price and sale_price for compatibility
      // Also fetch stored snapshot columns (vehicle_number, brand_name, model_name, manufacture_year)
      const { data: soldSales, error } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles:vehicle_id (
            id,
            vehicle_number,
            selling_amount,
            brand_id,
            model_id,
            vehicle_brands:brand_id (
              id,
              name
            ),
            vehicle_models:model_id (
              id,
              name
            )
          )
        `)
        .eq('status', 'sold')
        .gte('updated_at', dateRange.from.toISOString())
        .lte('updated_at', dateRange.to.toISOString())
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Fetch all price categories
      const { data: priceCategories, error: categoriesError } = await supabase
        .from('price_categories')
        .select('*')
        .eq('is_active', true)
        .order('min_price')

      if (categoriesError) throw categoriesError

      // Process the data
      // Use stored snapshot first, fallback to joined vehicle data for backwards compatibility
      // Handle both sale_price (new) and selling_price (old) field names
      const processedData: FinancialReportData[] = (soldSales || []).map((sale: any) => {
        const vehicle = sale.vehicles
        // Support both field names: sale_price (from sell-vehicle page) and selling_price (DB schema)
        const sellingAmount = sale.sale_price ?? sale.selling_price ?? sale.selling_amount ?? 0
        
        // Find matching price category to get PCN advance
        let pcnAdvance = 0
        if (priceCategories && priceCategories.length > 0) {
          const matchingCategory = priceCategories.find(
            (cat: any) => 
              sellingAmount >= cat.min_price && 
              sellingAmount <= cat.max_price
          )
          if (matchingCategory) {
            pcnAdvance = matchingCategory.pcn_advance_amount || 0
          }
        }

        return {
          id: sale.id,
          // Use stored snapshot first, fallback to joined data
          vehicle_number: sale.vehicle_number || vehicle?.vehicle_number || 'N/A',
          brand_name: sale.brand_name || vehicle?.vehicle_brands?.name || 'N/A',
          model_name: sale.model_name || vehicle?.vehicle_models?.name || 'N/A',
          seller_price: vehicle?.selling_amount || 0,
          sales_price: sellingAmount,
          down_payment: sale.advance_amount || 0,
          pcn_advance: pcnAdvance,
          payment_type: sale.payment_type || 'N/A',
          sold_out_date: sale.updated_at || '',
        }
      })

      setReportData(processedData)
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary statistics
  const totalVehiclesSold = reportData.length
  const totalSalesAmount = reportData.reduce((sum, item) => sum + item.sales_price, 0)
  const totalPcnAdvance = reportData.reduce((sum, item) => sum + item.pcn_advance, 0)

  // Pagination
  const totalPages = Math.ceil(reportData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentData = reportData.slice(startIndex, endIndex)

  // Export to CSV
  const handleExportCSV = () => {
    if (reportData.length === 0) return

    const headers = [
      'Vehicle Number',
      'Brand',
      'Model',
      'Seller Price',
      'Sales Price',
      'Down Payment',
      'PCN Advance',
      'Payment Type',
      'Sold Out Date',
    ]

    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        row.vehicle_number,
        row.brand_name,
        row.model_name,
        row.seller_price,
        row.sales_price,
        row.down_payment,
        row.pcn_advance,
        row.payment_type,
        format(new Date(row.sold_out_date), 'yyyy-MM-dd'),
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `financial_report_${format(dateRange.from!, 'yyyy-MM-dd')}_to_${format(dateRange.to!, 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[18px] font-bold">Financial Report Generate</h2>
        </div>
      </div>

      {/* Date Range Picker and Export Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="">
          <label className="text-sm font-medium mb-2 block">Select Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[380px] justify-start text-left font-normal",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "yyyy. MM. dd")} - {format(dateRange.to, "yyyy. MM. dd")}
                    </>
                  ) : (
                    format(dateRange.from, "yyyy. MM. dd")
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
            </PopoverContent>
          </Popover>
        </div>

        <Button 
          onClick={handleExportCSV}
          disabled={reportData.length === 0}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    
      {/* Summary Cards */}
      <div className="flex gap-4">
        {/* Total Sale Card */}
        <div className="bg-gray-50 w-[380px] h-16 border flex items-center shadow-sm rounded-md " >
              <div className="flex justify-between w-full px-4">
                <p className="text-sm font-semibold text-gray-600 ">Total Sale</p>
                <p className="text-[12px] font-semibold px-4 py-1 rounded-full text-green-600   bg-green-100">
                  {totalVehiclesSold} Vehicles
                </p>
              </div>
            </div>
        
      

        {/* Total Transaction Card */}
            <div className="bg-gray-50 w-[380px] h-16 border flex items-center shadow-sm rounded-md ">
              <div className='flex justify-between w-full px-4'>
                <p className="text-sm font-semibold text-gray-600">Total Transaction</p>
                <p className="text-[12px] font-semibold px-4 py-1 rounded-full text-green-600   bg-green-100">
                  {formatCurrency(totalSalesAmount)}
                </p>
              </div>
            </div>

       

        {/* PCN Profit Card */}
        <div className="bg-gray-50 w-[380px] h-16 border flex items-center shadow-sm rounded-md ">
              <div className='flex justify-between w-full px-4'>
                <p className="text-sm font-semibold text-gray-600">PCN Profit</p>
                <p className="text-[12px] font-semibold px-4 py-1 rounded-full text-blue-600   bg-blue-100">
                  {formatCurrency(totalPcnAdvance)}
                </p>
              </div>
            </div>
        
      </div>

          <Separator className="my-4" />

      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 text-[13px] font-medium">
              <TableHead className="font-semibold">Vehicle Number</TableHead>
              <TableHead className="font-semibold">Brand</TableHead>
              <TableHead className="font-semibold">Model</TableHead>
              <TableHead className="font-semibold">Seller Price</TableHead>
              <TableHead className="font-semibold">Sales Price</TableHead>
              <TableHead className="font-semibold">Down Payment</TableHead>
              <TableHead className="font-semibold">PCN Advance</TableHead>
              <TableHead className="font-semibold">Payment Type</TableHead>
              <TableHead className="font-semibold">Sold Out Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No data available for the selected date range
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.vehicle_number}</TableCell>
                  <TableCell>{row.brand_name}</TableCell>
                  <TableCell>{row.model_name}</TableCell>
                  <TableCell>{formatCurrency(row.seller_price)}</TableCell>
                  <TableCell>{formatCurrency(row.sales_price)}</TableCell>
                  <TableCell>{formatCurrency(row.down_payment)}</TableCell>
                  <TableCell>{formatCurrency(row.pcn_advance)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      row.payment_type === 'Cash' && "bg-green-100 text-green-700",
                      row.payment_type === 'Leasing' && "bg-blue-100 text-blue-700",
                      row.payment_type === 'Bank Transfer' && "bg-purple-100 text-purple-700",
                      row.payment_type === 'Check' && "bg-orange-100 text-orange-700"
                    )}>
                      {row.payment_type}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(row.sold_out_date), 'yyyy.MM.dd')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {reportData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => {
                setRowsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
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
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  return page === 1 || 
                         page === totalPages || 
                         (page >= currentPage - 1 && page <= currentPage + 1)
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1
                  
                  return (
                    <>
                      {showEllipsisBefore && (
                        <span key={`ellipsis-${page}`} className="px-2">...</span>
                      )}
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          currentPage === page && "bg-black text-white hover:bg-gray-800"
                        )}
                      >
                        {page}
                      </Button>
                    </>
                  )
                })}
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
  )
}
