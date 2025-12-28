/**
 * MIGRATING: Supabase Auth has been removed.
 * This file will be updated to work with Better Auth in Step 2.
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */
'use client';

import { FileText } from 'lucide-react';
import { useState } from 'react';
import PendingVehiclesTable from '@/components/sales-transactions/PendingVehiclesTable';
import SoldOutVehiclesTable from '@/components/sales-transactions/SoldOutVehiclesTable';
import PendingVehicleModal from '@/components/sales-transactions/PendingVehicleModal';
import SoldOutVehicleModal from '@/components/sales-transactions/SoldOutVehicleModal';
import ReturnToInventoryModal from '@/components/sales-transactions/ReturnToInventoryModal';
import SoldOutConfirmModal from '@/components/sales-transactions/SoldOutConfirmModal';
import PrintDocumentModal from '@/components/sales-transactions/PrintDocumentModal';
import { createClient } from '@/lib/supabase-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SalesTransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSoldOutModalOpen, setIsSoldOutModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
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
      
      // First, get the basic sale data
      const { data: basicSaleData, error: fetchError } = await supabase
        .from('pending_vehicle_sales')
        .select('vehicle_id, vehicle_number, brand_name, model_name, manufacture_year, body_type')
        .eq('id', selectedSaleId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching sale data:', fetchError);
        alert('Failed to fetch sale data: ' + fetchError.message);
        setIsSoldOutProcessing(false);
        return;
      }

      if (!basicSaleData) {
        console.error('❌ No sale data found');
        alert('Failed to fetch sale data: No record found');
        setIsSoldOutProcessing(false);
        return;
      }

      console.log('🚗 Moving vehicle to sold out, vehicle_id:', basicSaleData.vehicle_id);
      
      // Only process vehicle data if vehicle_id exists (not null)
      if (!basicSaleData.vehicle_id) {
        console.warn('⚠️ Vehicle ID is null - this sale was for a vehicle that was previously deleted');
        console.warn('⚠️ Make sure snapshot columns are populated');
        
        // Check if snapshot columns are populated
        if (!basicSaleData.vehicle_number || !basicSaleData.brand_name) {
          alert('Cannot complete sale: Vehicle data is missing. This vehicle may have been deleted. Please contact support.');
          setIsSoldOutProcessing(false);
          return;
        }
      }
      
      // Try to populate snapshot columns if they're missing AND vehicle still exists
      const snapshotUpdate: any = {};
      
      if (basicSaleData.vehicle_id && (!basicSaleData.vehicle_number || !basicSaleData.brand_name || !basicSaleData.model_name || !basicSaleData.manufacture_year || !basicSaleData.body_type)) {
        console.log('📸 Fetching vehicle details to populate snapshot columns...');
        
        try {
          // Fetch vehicle data with proper error handling
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select(`
              vehicle_number,
              manufacture_year,
              body_type,
              vehicle_brands:brand_id (name),
              vehicle_models:model_id (name)
            `)
            .eq('id', basicSaleData.vehicle_id)
            .maybeSingle();

          if (vehicleError) {
            console.error('⚠️ Error fetching vehicle data:', vehicleError);
          } else if (vehicleData) {
            if (!basicSaleData.vehicle_number) snapshotUpdate.vehicle_number = vehicleData.vehicle_number;
            if (!basicSaleData.brand_name && vehicleData.vehicle_brands) {
              const brandData = vehicleData.vehicle_brands as unknown as { name: string } | null;
              if (brandData) snapshotUpdate.brand_name = brandData.name;
            }
            if (!basicSaleData.model_name && vehicleData.vehicle_models) {
              const modelData = vehicleData.vehicle_models as unknown as { name: string } | null;
              if (modelData) snapshotUpdate.model_name = modelData.name;
            }
            if (!basicSaleData.manufacture_year) snapshotUpdate.manufacture_year = vehicleData.manufacture_year;
            if (!basicSaleData.body_type) snapshotUpdate.body_type = vehicleData.body_type;
          } else {
            console.warn('⚠️ Vehicle not found in database - it may have been deleted');
          }
        } catch (vehicleErr) {
          console.error('⚠️ Exception fetching vehicle data:', vehicleErr);
        }
      }
      
      // Update snapshot columns if we have data to update
      if (Object.keys(snapshotUpdate).length > 0) {
        console.log('📸 Populating vehicle snapshot columns:', snapshotUpdate);
        try {
          await supabase
            .from('pending_vehicle_sales')
            .update(snapshotUpdate)
            .eq('id', selectedSaleId);
          console.log('✅ Snapshot columns updated');
        } catch (updateErr) {
          console.error('⚠️ Failed to update snapshot columns:', updateErr);
        }
      } else {
        console.log('✅ Vehicle snapshot columns already populated or vehicle data unavailable');
      }

      const saleData = basicSaleData;

      // Delete S3 images before marking as sold (only if vehicle_id exists)
      let imageRecords = null;
      let imagesFetchError = null;
      
      if (saleData.vehicle_id) {
        const result = await supabase
          .from('vehicle_images')
          .select('s3_key')
          .eq('vehicle_id', saleData.vehicle_id);
        
        imageRecords = result.data;
        imagesFetchError = result.error;
      } else {
        console.log('ℹ️ Skipping image deletion - vehicle_id is null');
      }

      if (imagesFetchError) {
        console.error('❌ Error fetching image records:', imagesFetchError);
        // Continue with sold out process even if we can't fetch images
      }

      // Extract S3 keys (filter out null/undefined)
      const s3Keys = imageRecords
        ?.map(record => record.s3_key)
        .filter(key => key !== null && key !== undefined && key.trim() !== '') || [];

      console.log(`📸 Found ${s3Keys.length} images to delete from S3:`, s3Keys);

      // Delete images from S3 if we have any keys
      if (s3Keys.length > 0) {
        // MIGRATION: Using localStorage instead of Supabase Auth - S3 deletion doesn't need auth token
        const storedUser = localStorage.getItem('pcn-user');
        
        if (storedUser) {
          try {
            console.log('🌐 Calling S3 deletion API for sold out vehicle...');
            const s3Response = await fetch(`/api/upload/delete-vehicle/${saleData.vehicle_id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ s3Keys }),
            });

            if (!s3Response.ok) {
              const errorText = await s3Response.text();
              console.error('❌ Failed to delete S3 images:', errorText);
              // Don't alert, just log - we'll continue with the sold out process
            } else {
              const result = await s3Response.json();
              console.log('✅ S3 deletion result:', result);
              if (result.success) {
                console.log(`✅ Successfully deleted ${s3Keys.length} images from S3`);
              }
            }
          } catch (s3Error) {
            console.error('❌ Exception during S3 deletion:', s3Error);
            // Continue with sold out process
          }
        } else {
          console.warn('⚠️ No valid session token, skipping S3 deletion');
        }
      } else {
        console.log('ℹ️ No S3 images to delete for this vehicle');
      }

      // Update pending_vehicle_sales status to 'sold'
      const { error: updateError } = await supabase
        .from('pending_vehicle_sales')
        .update({ status: 'sold' })
        .eq('id', selectedSaleId);

      if (updateError) {
        console.error('❌ Error marking vehicle as sold:', updateError);
        alert('Failed to mark vehicle as sold: ' + updateError.message);
        setIsSoldOutProcessing(false);
        return;
      }

      console.log('✅ Pending sale marked as sold');

      // Update vehicle status to 'Sold' in vehicles table (only if vehicle_id exists)
      if (saleData.vehicle_id) {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({ status: 'Sold' })
          .eq('id', saleData.vehicle_id);

        if (vehicleError) {
          console.error('⚠️ Error updating vehicle status:', vehicleError);
          // Continue anyway - sale status was updated
        } else {
          console.log('✅ Vehicle status updated to Sold');
        }

        // Delete vehicle images from database (after S3 deletion)
        const { error: deleteImagesError } = await supabase
          .from('vehicle_images')
          .delete()
          .eq('vehicle_id', saleData.vehicle_id);

        if (deleteImagesError) {
          console.error('⚠️ Error deleting vehicle images from database:', deleteImagesError);
          // Continue anyway - images will be handled by the system
        } else {
          console.log('✅ Vehicle images deleted from database');
        }
      } else {
        console.log('ℹ️ Skipping vehicle table update - vehicle_id is null (vehicle was previously deleted)');
      }

      // Create notification for vehicle sold out
      try {
        // MIGRATION: Using localStorage instead of Supabase Auth
        const storedUserForNotif = localStorage.getItem('pcn-user')
        if (storedUserForNotif) {
          const userData = JSON.parse(storedUserForNotif)

          if (userData) {
            // Get vehicle details for notification - use snapshot data if vehicle_id is null
            let vehicleNumber = basicSaleData.vehicle_number || 'N/A';
            let brandName = basicSaleData.brand_name || 'N/A';
            let modelName = basicSaleData.model_name || 'N/A';
            
            // Try to get from view if vehicle still exists
            if (saleData.vehicle_id) {
              const { data: vehicleData } = await supabase
                .from('vehicle_inventory_view')
                .select('vehicle_number, brand_name, model_name')
                .eq('id', saleData.vehicle_id)
                .maybeSingle()

              if (vehicleData) {
                vehicleNumber = vehicleData.vehicle_number;
                brandName = vehicleData.brand_name;
                modelName = vehicleData.model_name;
              }
            }

            const userName = `${userData.first_name} ${userData.last_name}`
            const vehicleInfo = `${brandName} ${modelName} (${vehicleNumber})`

            await supabase.from('notifications').insert({
              user_id: userData.id,
              type: 'sold',
              title: 'Vehicle Sold',
              message: `${userName} completed the sale of ${vehicleInfo} — vehicle moved to Sold Out.`,
              vehicle_number: vehicleNumber,
              vehicle_brand: brandName,
              vehicle_model: modelName,
              is_read: false
            })
            console.log('✅ Notification created for vehicle sold out')
          }
        }
      } catch (notifError) {
        console.error('⚠️  Failed to create notification:', notifError)
        // Don't block sold out process if notification fails
      }

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

  const handlePrintDocument = (saleId: string) => {
    setSelectedSaleId(saleId);
    setIsPrintModalOpen(true);
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

  const handlePrintInvoice = (saleId: string) => {
    // Open PrintDocumentModal with the sale ID
    setSelectedSaleId(saleId);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      

      {/* Tabs using shadcn - same style as Settings page */}
      <div className="bg-slate-50 p-6 ">
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
              onPrintDocument={handlePrintDocument}
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

      {/* Return To Inventory Confirmation Modal - for Pending tab */}
      <ReturnToInventoryModal
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

      {/* Print Document Modal */}
      <PrintDocumentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        saleId={selectedSaleId}
      />
    </div>
  );
}

