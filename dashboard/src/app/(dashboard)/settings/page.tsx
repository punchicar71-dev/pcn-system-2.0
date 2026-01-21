'use client'

import { Settings as SettingsIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import VehicleBrandsTab from '@/components/settings/VehicleBrandsTab'
import SalesCommissionTab from '@/components/settings/SalesCommissionTab'
import SalesAgentTab from '@/components/settings/SalesAgentTab'
import CountriesTab from '@/components/settings/CountriesTab'
import LeasingCompanyTab from '@/components/settings/LeasingCompanyTab'

export default function SettingsPage() {
  return (
    <div className="space-y-6 bg-slate-50 p-6 ">
      

      <Tabs defaultValue="brands" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="brands">Vehicle Brands</TabsTrigger>
          <TabsTrigger value="commission">Sales Commission</TabsTrigger>
          <TabsTrigger value="leasing">Leasing Company</TabsTrigger>
          <TabsTrigger value="agents">Sales Agent</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
        </TabsList>

        <TabsContent value="brands" className="mt-6">
          <VehicleBrandsTab />
        </TabsContent>

        <TabsContent value="commission" className="mt-6">
          <SalesCommissionTab />
        </TabsContent>

        <TabsContent value="leasing" className="mt-6">
          <LeasingCompanyTab />
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          <SalesAgentTab />
        </TabsContent>

        <TabsContent value="countries" className="mt-6">
          <CountriesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
