'use client';

import { FileText } from 'lucide-react';
import { useState } from 'react';
import PendingVehiclesTable from '@/components/sales-transactions/PendingVehiclesTable';
import { createClient } from '@/lib/supabase-client';

export default function SalesTransactionsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'sold'>('pending');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleViewDetail = (saleId: string) => {
    // TODO: Implement view detail modal
    console.log('View detail for sale:', saleId);
  };

  const handleSoldOut = async (saleId: string) => {
    if (confirm('Are you sure you want to mark this vehicle as sold?')) {
      try {
        const supabase = createClient();
        
        // First, get the vehicle_id from the pending sale
        const { data: saleData, error: fetchError } = await supabase
          .from('pending_vehicle_sales')
          .select('vehicle_id')
          .eq('id', saleId)
          .single();

        if (fetchError || !saleData) {
          console.error('Error fetching sale data:', fetchError);
          alert('Failed to fetch sale data');
          return;
        }

        // Update pending_vehicle_sales status to 'sold'
        const { error: updateError } = await supabase
          .from('pending_vehicle_sales')
          .update({ status: 'sold' })
          .eq('id', saleId);

        if (updateError) {
          console.error('Error marking vehicle as sold:', updateError);
          alert('Failed to mark vehicle as sold: ' + updateError.message);
          return;
        }

        // Update vehicle status to 'Sold' in vehicles table
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({ status: 'Sold' })
          .eq('id', saleData.vehicle_id);

        if (vehicleError) {
          console.error('Error updating vehicle status:', vehicleError);
          // Continue anyway - sale status was updated
        }

        alert('Vehicle marked as sold successfully');
        // Trigger refresh
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error marking vehicle as sold:', error);
        alert('An error occurred');
      }
    }
  };

  const handleDelete = async (saleId: string) => {
    if (confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      try {
        const supabase = createClient();
        
        // First, get the vehicle_id from the pending sale
        const { data: saleData, error: fetchError } = await supabase
          .from('pending_vehicle_sales')
          .select('vehicle_id')
          .eq('id', saleId)
          .single();

        if (fetchError || !saleData) {
          console.error('Error fetching sale data:', fetchError);
          alert('Failed to fetch sale data');
          return;
        }

        // Delete the sale record
        const { error } = await supabase
          .from('pending_vehicle_sales')
          .delete()
          .eq('id', saleId);

        if (error) {
          console.error('Error deleting sale:', error);
          alert('Failed to delete sale: ' + error.message);
          return;
        }

        // Restore vehicle status back to 'In Sale'
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({ status: 'In Sale' })
          .eq('id', saleData.vehicle_id);

        if (vehicleError) {
          console.error('Error restoring vehicle status:', vehicleError);
          // Continue anyway - sale was deleted
        }

        alert('Sale deleted successfully');
        // Trigger refresh
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('An error occurred');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Transactions</h1>
            <p className="text-gray-600">View and manage all sales records</p>
          </div>
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Vehicles
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'sold'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sold out Vehicle
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'pending' && (
            <PendingVehiclesTable
              onViewDetail={handleViewDetail}
              onSoldOut={handleSoldOut}
              onDelete={handleDelete}
              refreshKey={refreshKey}
            />
          )}

          {activeTab === 'sold' && (
            <div className="text-center py-12 text-gray-500">
              <p>Sold vehicles table coming soon...</p>
              <p className="text-sm mt-2">This will display all completed vehicle sales</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

