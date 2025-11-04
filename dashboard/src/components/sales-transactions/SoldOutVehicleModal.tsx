'use client';

import { X, User, MapPin, Phone, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase-client';
import { format } from 'date-fns';

interface SoldOutVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
}

export default function SoldOutVehicleModal({ isOpen, onClose, saleId }: SoldOutVehicleModalProps) {
  const [saleData, setSaleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && saleId) {
      fetchSaleDetails();
    }
  }, [isOpen, saleId]);

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data: sale, error } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles:vehicle_id (
            *,
            vehicle_brands:brand_id (name),
            vehicle_models:model_id (name)
          ),
          sales_agents:sales_agent_id (
            name
          )
        `)
        .eq('id', saleId)
        .single();

      if (error) {
        console.error('Error fetching sale details:', error);
        return;
      }

      const vehicle = sale.vehicles;

      if (vehicle?.country_id) {
        const { data: countryData } = await supabase
          .from('countries')
          .select('name')
          .eq('id', vehicle.country_id)
          .single();

        if (countryData) {
          vehicle.country_name = countryData.name;
        }
      }

      if (vehicle?.id) {
        const { data: sellerData } = await supabase
          .from('sellers')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .maybeSingle();

        if (sellerData) {
          vehicle.seller = sellerData;
        }
      }

      if (vehicle?.id) {
        const { data: optionsData } = await supabase
          .from('vehicle_options')
          .select('option_id')
          .eq('vehicle_id', vehicle.id);

        if (optionsData && optionsData.length > 0) {
          const optionIds = optionsData.map(opt => opt.option_id);
          const { data: masterOptions } = await supabase
            .from('vehicle_options_master')
            .select('id, option_name')
            .in('id', optionIds);

          vehicle.vehicle_options = masterOptions || [];
        }
      }

      setSaleData(sale);
    } catch (error) {
      console.error('Error fetching sale details:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!saleData) return;

    const vehicle = saleData.vehicles;

    const csvData = [
      ['Field', 'Value'],
      ['Vehicle Number', vehicle?.vehicle_number || 'N/A'],
      ['Brand', vehicle?.vehicle_brands?.name || 'N/A'],
      ['Model', vehicle?.vehicle_models?.name || 'N/A'],
      ['Manufacture Year', vehicle?.manufacture_year || 'N/A'],
      ['Registered Year', vehicle?.registered_year || 'N/A'],
      ['Engine Capacity', vehicle?.engine_capacity ? `${vehicle.engine_capacity}cc` : 'N/A'],
      ['Fuel Type', vehicle?.fuel_type || 'N/A'],
      ['Transmission', vehicle?.transmission || 'N/A'],
      ['Exterior Color', vehicle?.exterior_color || 'N/A'],
      ['Country', vehicle?.country_name || 'N/A'],
      [''],
      ['Selling Information', ''],
      ['Selling Price', `Rs. ${saleData.selling_amount?.toLocaleString() || 0}`],
      ['Customer Price', `Rs. ${saleData.selling_amount?.toLocaleString() || 0}`],
      ['Down Payment', `Rs. ${saleData.advance_amount?.toLocaleString() || 0}`],
      ['Payment Type', saleData.payment_type || 'N/A'],
      ['Sales Agent', saleData.sales_agents?.name || saleData.third_party_agent || 'N/A'],
      ['Status', saleData.status || 'N/A'],
      ['Sold Date', saleData.updated_at ? format(new Date(saleData.updated_at), 'yyyy-MM-dd') : 'N/A'],
      [''],
      ['Seller Information', ''],
      ['Seller Name', vehicle?.seller ? `${vehicle.seller.first_name} ${vehicle.seller.last_name}` : 'N/A'],
      ['Seller Address', vehicle?.seller?.address || 'N/A'],
      ['Seller Mobile', vehicle?.seller?.mobile_number || 'N/A'],
      [''],
      ['Buyer Information', ''],
      ['Buyer Name', `${saleData.customer_first_name} ${saleData.customer_last_name}`],
      ['Buyer Address', saleData.customer_address && saleData.customer_city ? `${saleData.customer_address}, ${saleData.customer_city}` : saleData.customer_address || saleData.customer_city || 'N/A'],
      ['Buyer Mobile', saleData.customer_mobile || 'N/A'],
      ['Buyer NIC', saleData.customer_nic || 'N/A'],
      ['Buyer Email', saleData.customer_email || 'N/A'],
    ];

    if (vehicle?.vehicle_options && vehicle.vehicle_options.length > 0) {
      csvData.push(['']);
      csvData.push(['Vehicle Options', '']);
      vehicle.vehicle_options.forEach((option: any) => {
        csvData.push(['', option.option_name || option]);
      });
    }

    const csvContent = csvData
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `vehicle_${vehicle?.vehicle_number || 'export'}_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!saleData) return null;

  const vehicle = saleData.vehicles;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[70%] max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between  pb-4">
              <h2 className="text-xl font-bold text-gray-900">Sold Out Vehicle Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex bg-gray-100 rounded-lg items-center justify-between p-4 ">
                <h2 className="text-lg font-semibold text-gray-600">
                  {vehicle?.vehicle_brands?.name} {vehicle?.vehicle_models?.name} {vehicle?.manufacture_year}{' '}
                  <span className="text-gray-900">- {vehicle?.vehicle_number}</span>
                </h2>

                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>

              {/* Note: Images are NOT displayed for sold out vehicles as they are automatically deleted */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Vehicle images have been automatically removed after sale completion.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Selling Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[140px]">Selling Price</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">Rs. {saleData.selling_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[140px]">Payment Type</span>
                      <span className="text-gray-900">:</span>
                      <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-800 rounded-md text-sm">
                        {saleData.payment_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 min-w-[140px]">Showroom Agent</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">
                        {(() => {
                          console.log('🏢 Rendering Vehicle Showroom Agent:', saleData.third_party_agent);
                          return saleData.third_party_agent || 'N/A';
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 min-w-[140px]">Office Agent</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">
                        {(() => {
                          console.log('👔 Rendering Office Sales Agent:', saleData.sales_agents?.name);
                          return saleData.sales_agents?.name || 'N/A';
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[140px]">Customer Price</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">Rs. {saleData.selling_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[140px]">Down Payment</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">Rs. {saleData.advance_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[140px]">Sold Out Date</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">
                        {saleData.updated_at ? format(new Date(saleData.updated_at), 'MM/dd/yyyy') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      
                      <div className="flex items-start gap-3">
                        <p className="text-gray-600 min-w-[75px]">Name</p>
                        <span className="text-gray-900">:</span>
                        <p className="font-medium text-gray-900">
                          {vehicle?.seller ? `${vehicle.seller.first_name} ${vehicle.seller.last_name}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                     
                      <div className="flex items-start gap-3">
                        <p className="text-gray-600 min-w-[75px]">Address</p>
                        <span className="text-gray-900">:</span>
                        <p className="font-medium text-gray-900">
                          {vehicle?.seller?.address || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      
                      <div className="flex items-start gap-3">
                        <p className="text-gray-600 min-w-[75px]">Mobile</p>
                        <span className="text-gray-900">:</span>
                        <p className="font-medium text-gray-900">
                          {vehicle?.seller?.mobile_number || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Buyer Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                   
                      <div className="flex items-start gap-3">
                        <p className="text-gray-600 min-w-[75px]">Name</p>
                        <span className="text-gray-900">:</span>
                        <p className="font-medium text-gray-900">
                          {saleData.customer_first_name} {saleData.customer_last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      
                      <div className="flex items-start gap-3">
                        <p className="text-gray-600 min-w-[75px]">Address</p>
                        <span className="text-gray-900">:</span>
                        <p className="font-medium text-gray-900">
                          {saleData.customer_address && saleData.customer_city
                            ? `${saleData.customer_address}, ${saleData.customer_city}`
                            : saleData.customer_address || saleData.customer_city || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                     
                      <div className="flex items-start gap-3">
                        <p className="text-gray-600 min-w-[75px]">Mobile</p>
                        <span className="text-gray-900">:</span>
                        <p className="font-medium text-gray-900">
                          {saleData.customer_mobile}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[160px]">Manufacture Year</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">{vehicle?.manufacture_year}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[160px]">Country</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">{vehicle?.country_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[160px]">Fuel type</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">{vehicle?.fuel_type}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[160px]">Transmission</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">{vehicle?.transmission}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[160px]">Engine Capacity</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">{vehicle?.engine_capacity}cc</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[160px]">Exterior Color</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">{vehicle?.exterior_color}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 min-w-[160px]">Registered Year</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">{vehicle?.registered_year || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {vehicle?.vehicle_options && vehicle.vehicle_options.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Options</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {vehicle.vehicle_options.map((option: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 text-xs">✓</span>
                        </div>
                        <span className="text-gray-700">{option.option_name || option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
