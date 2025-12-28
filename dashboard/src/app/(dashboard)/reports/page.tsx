'use client'

import { BarChart3, Shield } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SummaryReportsTab from '@/components/reports/SummaryReportsTab'
import FinancialReportsTab from '@/components/reports/FinancialReportsTab'
import SalesAgentsReportTab from '@/components/reports/SalesAgentsReportTab'
import { RouteProtection } from '@/components/auth/RouteProtection'

function ReportsContent() {
  return (
    <div className="space-y-6 bg-slate-50 p-6 ">
      {/* Header with Admin Badge */}
      <div className="flex items-center gap-3">
        <h1 className="text-[18px] font-bold text-gray-900">Reports & Analytics</h1>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <Shield className="w-3 h-3" />
          Admin Only
        </span>
      </div>

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

/**
 * Reports & Analytics Page
 * Protected route - only accessible by admins
 */
export default function ReportsPage() {
  return (
    <RouteProtection adminOnly>
      <ReportsContent />
    </RouteProtection>
  )
}