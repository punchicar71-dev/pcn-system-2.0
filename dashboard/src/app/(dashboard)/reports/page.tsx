'use client'

import { BarChart3 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InventoryReportsTab from '@/components/reports/InventoryReportsTab'
import FinancialReportsTab from '@/components/reports/FinancialReportsTab'
import SalesAgentsReportTab from '@/components/reports/SalesAgentsReportTab'

export default function ReportsPage() {
  return (
    <div className="space-y-6 bg-white p-6 ">
      {/* Header */}
      

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-4xl">
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="salesAgents">Sales Agents Report</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <InventoryReportsTab />
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <FinancialReportsTab />
        </TabsContent>

        <TabsContent value="salesAgents" className="mt-6">
          <SalesAgentsReportTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

