'use client';

import { FileText } from 'lucide-react';
import { useState } from 'react';
import PendingVehiclesTable from '@/components/sales-transactions/PendingVehiclesTable';
import SoldOutVehiclesTable from '@/components/sales-transactions/SoldOutVehiclesTable';
import PendingVehicleModal from '@/components/sales-transactions/PendingVehicleModal';
import SoldOutVehicleModal from '@/components/sales-transactions/SoldOutVehicleModal';
import DeleteConfirmModal from '@/components/sales-transactions/DeleteConfirmModal';
import SoldOutConfirmModal from '@/components/sales-transactions/SoldOutConfirmModal';
import { createClient } from '@/lib/supabase-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SalesTransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSoldOutModalOpen, setIsSoldOutModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSoldOutProcessing, setIsSoldOutProcessing] = useState(false);
  const [currentTab, setCurrentTab] = useState<'pending' | 'sold'>('pending');

  const handleViewDetail = (saleId: string) => {
    setSelectedSaleId(saleId);
    setIsViewModalOpen(true);
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value as 'pending' | 'sold');
  };

  const handleSoldOut = (saleId: string) => {
    setSelectedSaleId(saleId);
    setIsSoldOutModalOpen(true);
  };

  const handleConfirmSoldOut = async () => {
    try {
      setIsSoldOutProcessing(true);
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

      // Update pending_vehicle_sales status to 'sold'
      const { error: updateError } = await supabase
        .from('pending_vehicle_sales')
        .update({ status: 'sold' })
        .eq('id', selectedSaleId);

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

      // Create notification for vehicle sold out
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .eq('auth_id', session.user.id)
            .single()

          if (userData) {
            // Get vehicle details for notification
            const { data: vehicleData } = await supabase
              .from('vehicle_inventory_view')
              .select('vehicle_number, brand_name, model_name')
              .eq('id', saleData.vehicle_id)
              .single()

            if (vehicleData) {
              const userName = `${userData.first_name} ${userData.last_name}`
              const vehicleInfo = `${vehicleData.brand_name} ${vehicleData.model_name} (${vehicleData.vehicle_number})`

              await supabase.from('notifications').insert({
                user_id: userData.id,
                type: 'sold',
                title: 'Vehicle Sold',
                message: `${userName} completed the sale of ${vehicleInfo} — vehicle moved to Sold Out.`,
                vehicle_number: vehicleData.vehicle_number,
                vehicle_brand: vehicleData.brand_name,
                vehicle_model: vehicleData.model_name,
                is_read: false
              })
              console.log('✅ Notification created for vehicle sold out')
            }
          }
        }
      } catch (notifError) {
        console.error('⚠️  Failed to create notification:', notifError)
        // Don't block sold out process if notification fails
      }

      alert('Vehicle marked as sold successfully');
      setIsSoldOutModalOpen(false);
      // Trigger refresh
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error marking vehicle as sold:', error);
      alert('An error occurred');
    } finally {
      setIsSoldOutProcessing(false);
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

  const handlePrintInvoice = async (saleId: string) => {
    try {
      const supabase = createClient();
      
      // Fetch sale details for printing
      const { data: saleData, error } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles:vehicle_id (
            vehicle_number,
            brand_id,
            model_id,
            manufacture_year,
            vehicle_brands:brand_id (
              name
            ),
            vehicle_models:model_id (
              name
            )
          ),
          sales_agents:sales_agent_id (
            name
          )
        `)
        .eq('id', saleId)
        .single();

      if (error || !saleData) {
        console.error('Error fetching sale data:', error);
        alert('Failed to fetch sale data');
        return;
      }

      // Create a simple invoice format
      const invoiceContent = `
        ======================================
        PUNCHI CAR NIWASA - SALES INVOICE
        ======================================
        
        Invoice Date: ${new Date().toLocaleDateString()}
        
        VEHICLE DETAILS:
        ----------------
        Vehicle Number: ${saleData.vehicles?.vehicle_number}
        Brand: ${saleData.vehicles?.vehicle_brands?.name}
        Model: ${saleData.vehicles?.vehicle_models?.name}
        Year: ${saleData.vehicles?.manufacture_year}
        
        CUSTOMER DETAILS:
        -----------------
        Name: ${saleData.customer_first_name} ${saleData.customer_last_name}
        NIC: ${saleData.customer_nic}
        Mobile: ${saleData.customer_mobile}
        Address: ${saleData.customer_address}, ${saleData.customer_city}
        ${saleData.customer_email ? `Email: ${saleData.customer_email}` : ''}
        
        PAYMENT DETAILS:
        ----------------
        Selling Amount: Rs. ${saleData.selling_amount.toLocaleString()}
        Advance Amount: Rs. ${saleData.advance_amount.toLocaleString()}
        Balance: Rs. ${(saleData.selling_amount - saleData.advance_amount).toLocaleString()}
        Payment Type: ${saleData.payment_type}
        
        Sales Agent: ${saleData.sales_agents?.name || saleData.third_party_agent || 'N/A'}
        
        ======================================
        Thank you for your business!
        ======================================
      `;

      // Print using browser's print dialog
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Sales Invoice</title>');
        printWindow.document.write('<style>body { font-family: monospace; white-space: pre; padding: 20px; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(invoiceContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('An error occurred while printing the invoice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      

      {/* Tabs using shadcn - same style as Settings page */}
      <div className="bg-white p-6 ">
        <Tabs defaultValue="pending" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-[400px] grid-cols-2 max-w-md">
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
            <SoldOutVehiclesTable
              onViewDetail={handleViewDetail}
              onPrintInvoice={handlePrintInvoice}
              refreshKey={refreshKey}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Pending Vehicle Modal - shows images */}
      <PendingVehicleModal
        isOpen={isViewModalOpen && currentTab === 'pending'}
        onClose={() => setIsViewModalOpen(false)}
        saleId={selectedSaleId}
      />

      {/* Sold Out Vehicle Modal - no images (deleted) */}
      <SoldOutVehicleModal
        isOpen={isViewModalOpen && currentTab === 'sold'}
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

      {/* Sold Out Confirmation Modal */}
      <SoldOutConfirmModal
        isOpen={isSoldOutModalOpen}
        onClose={() => setIsSoldOutModalOpen(false)}
        onConfirm={handleConfirmSoldOut}
        isLoading={isSoldOutProcessing}
      />
    </div>
  );
}

