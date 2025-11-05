'use client'

import { BarChart3 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InventoryReportsTab from '@/components/reports/InventoryReportsTab'
import SalesProfitabilityTab from '@/components/reports/SalesProfitabilityTab'
import FinancialReportsTab from '@/components/reports/FinancialReportsTab'
import CustomerStaffReportsTab from '@/components/reports/CustomerStaffReportsTab'

export default function ReportsPage() {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            View comprehensive reports across inventory, sales, finance, and personnel
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-4xl">
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="sales">Sales & Profitability</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="customer-staff">Customer & Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <InventoryReportsTab />
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <SalesProfitabilityTab />
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <FinancialReportsTab />
        </TabsContent>

        <TabsContent value="customer-staff" className="mt-6">
          <CustomerStaffReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

