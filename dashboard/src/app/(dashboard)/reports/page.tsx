'use client'

import { BarChart3 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SummaryReportsTab from '@/components/reports/SummaryReportsTab'
import FinancialReportsTab from '@/components/reports/FinancialReportsTab'
import SalesAgentsReportTab from '@/components/reports/SalesAgentsReportTab'

export default function ReportsPage() {
  return (
    <div className="space-y-6 bg-white p-6 ">
      {/* Header */}
      

      {/* Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className=" ">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="salesAgents">Sales Agents Report</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <SummaryReportsTab />
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

