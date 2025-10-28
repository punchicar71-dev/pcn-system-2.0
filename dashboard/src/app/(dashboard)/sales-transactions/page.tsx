'use client';

import { FileText } from 'lucide-react';
import { useState } from 'react';
import PendingVehiclesTable from '@/components/sales-transactions/PendingVehiclesTable';
import ViewDetailModal from '@/components/sales-transactions/ViewDetailModal';
import DeleteConfirmModal from '@/components/sales-transactions/DeleteConfirmModal';
import { createClient } from '@/lib/supabase-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SalesTransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetail = (saleId: string) => {
    setSelectedSaleId(saleId);
    setIsViewModalOpen(true);
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

  const handleDelete = (saleId: string) => {
    setSelectedSaleId(saleId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const supabase = createClient();
      
      // First, get the vehicle_id from the pending sale
      const { data: saleData, error: fetchError } = await supabase
        .from('pending_vehicle_sales')
        .select('vehicle_id')
        .eq('id', selectedSaleId)
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
        .eq('id', selectedSaleId);

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
      setIsDeleteModalOpen(false);
      // Trigger refresh
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      

      {/* Tabs using shadcn - same style as Settings page */}
      <div className="bg-white p-6 ">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="pending">Pending Vehicles</TabsTrigger>
            <TabsTrigger value="sold">Sold out Vehicle</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <PendingVehiclesTable
              onViewDetail={handleViewDetail}
              onSoldOut={handleSoldOut}
              onDelete={handleDelete}
              refreshKey={refreshKey}
            />
          </TabsContent>

          <TabsContent value="sold" className="mt-6">
            <div className="text-center py-12 text-gray-500">
              <p>Sold vehicles table coming soon...</p>
              <p className="text-sm mt-2">This will display all completed vehicle sales</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Detail Modal */}
      <ViewDetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        saleId={selectedSaleId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

