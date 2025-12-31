'use client';

import { X, User, MapPin, Phone, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase-client';
import { format } from 'date-fns';

interface ViewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
}

export default function ViewDetailModal({ isOpen, onClose, saleId }: ViewDetailModalProps) {
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
            id,
            name,
            agent_type
          )
        `)
        .eq('id', saleId)
        .single();

      if (error) {
        console.error('Error fetching sale details:', error);
        return;
      }

      console.log('📦 Sale data fetched:', {
        id: sale.id,
        third_party_agent: sale.third_party_agent,
        sales_agent_id: sale.sales_agent_id,
        sales_agents: sale.sales_agents,
      });

      const vehicle = sale.vehicles;

      // Fetch vehicle showroom agent name if third_party_agent contains a UUID
      if (sale.third_party_agent) {
        // Check if it's a UUID (pattern: 8-4-4-4-12 hex characters with hyphens)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(sale.third_party_agent)) {
          // It's a UUID, fetch the agent name
          const { data: agentData } = await supabase
            .from('sales_agents')
            .select('id, name, agent_type')
            .eq('id', sale.third_party_agent)
            .maybeSingle();

          if (agentData) {
            sale.vehicle_showroom_agent = agentData;
            sale.third_party_agent = agentData.name;
          }
        }
      }

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
    
    // Use stored snapshot first, fallback to joined vehicle data
    const csvVehicleNumber = saleData.vehicle_number || vehicle?.vehicle_number || 'N/A';
    const csvBrandName = saleData.brand_name || vehicle?.vehicle_brands?.name || 'N/A';
    const csvModelName = saleData.model_name || vehicle?.vehicle_models?.name || 'N/A';
    const csvManufactureYear = saleData.manufacture_year || vehicle?.manufacture_year || 'N/A';

    const csvData = [
      ['Field', 'Value'],
      ['Vehicle Number', csvVehicleNumber],
      ['Brand', csvBrandName],
      ['Model', csvModelName],
      ['Manufacture Year', csvManufactureYear],
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
      ['Office Sales Agent', saleData.sales_agents?.name || 'N/A'],
      ['Showroom Sales Agent', saleData.third_party_agent || 'N/A'],
      ['Status', saleData.status || 'N/A'],
      ['Sold Date', saleData.updated_at ? format(new Date(saleData.updated_at), 'yyyy-MM-dd') : 'N/A'],
      [''],
      ['Seller Information', ''],
      ['Seller Name', vehicle?.seller ? `${vehicle.seller.first_name} ${vehicle.seller.last_name}` : 'N/A'],
      ['Seller Address', vehicle?.seller?.address || 'N/A'],
      ['Seller Mobile', vehicle?.seller?.mobile_number || 'N/A'],
      [''],
      ['Buyer Information', ''],
      ['Buyer Name', saleData.customer_name || 'N/A'],
      ['Buyer Address', saleData.customer_address || 'N/A'],
      ['Buyer Mobile', saleData.customer_mobile || 'N/A'],
      ['Buyer NIC', saleData.customer_nic || 'N/A'],
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
    link.setAttribute('download', `vehicle_${csvVehicleNumber || 'export'}_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!saleData) return null;

  const vehicle = saleData.vehicles;
  
  // Use stored snapshot first, fallback to joined vehicle data for backwards compatibility
  const displayVehicleNumber = saleData.vehicle_number || vehicle?.vehicle_number || 'N/A';
  const displayBrandName = saleData.brand_name || vehicle?.vehicle_brands?.name || 'N/A';
  const displayModelName = saleData.model_name || vehicle?.vehicle_models?.name || 'N/A';
  const displayManufactureYear = saleData.manufacture_year || vehicle?.manufacture_year || 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Vehicle Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-600">
                  {displayBrandName} {displayModelName} {displayManufactureYear}{' '}
                  <span className="text-gray-900">- {displayVehicleNumber}</span>
                </h2>

                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Selling Information</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 min-w-[140px]">Selling Price</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">Rs. {(
                        saleData.sale_price ?? saleData.selling_price ?? saleData.selling_amount ?? ''
                      )?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 min-w-[140px]">Payment Type</span>
                      <span className="text-gray-900">:</span>
                      <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-800 rounded-md text-sm">
                        {saleData.payment_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 min-w-[140px]">Vehicle Showroom Agent</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">
                        {saleData.vehicle_showroom_agent?.name || saleData.third_party_agent || ''}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 min-w-[140px]">Customer Price</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">Rs. {(
                        saleData.sale_price ?? saleData.selling_price ?? saleData.selling_amount ?? ''
                      )?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 min-w-[140px]">Down Payment</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">Rs. {saleData.advance_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 min-w-[140px]">Office Sales Agent</span>
                      <span className="text-gray-900">:</span>
                      <span className="font-semibold text-gray-900">
                        {(() => {
                          console.log('👔 Rendering Office Sales Agent:', saleData.sales_agents?.name);
                          return saleData.sales_agents?.name || 'N/A';
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 min-w-[140px]">Status</span>
                      <span className="text-gray-900">:</span>
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-semibold">
                        {saleData.status || 'N/A'}
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
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">
                          {vehicle?.seller ? `${vehicle.seller.first_name} ${vehicle.seller.last_name}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">
                          {vehicle?.seller?.address || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Mobile</p>
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
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">
                          {saleData.customer_title ? `${saleData.customer_title} ` : ''}{saleData.customer_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">
                          {saleData.customer_address || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Mobile</p>
                        <p className="font-medium text-gray-900">
                          {saleData.customer_mobile}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Detail</h3>
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
