'use client';

import { X, ChevronLeft, ChevronRight, User, MapPin, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase-client';

interface ViewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
}

export default function ViewDetailModal({ isOpen, onClose, saleId }: ViewDetailModalProps) {
  const [saleData, setSaleData] = useState<any>(null);
  const [vehicleImages, setVehicleImages] = useState<any[]>([]);
  const [documentImages, setDocumentImages] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

      // Fetch sale with vehicle, seller, and buyer details
      const { data: sale, error } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles:vehicle_id (
            *,
            vehicle_brands:brand_id (name),
            vehicle_models:model_id (name),
            vehicle_images (image_url, image_type, id)
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

      // Fetch country name
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

      // Fetch seller details using vehicle_id
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

      // Fetch vehicle options
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
      
      // Separate vehicle images from document images
      if (sale.vehicles?.vehicle_images) {
        // Only gallery images for carousel
        const galleryImages = sale.vehicles.vehicle_images.filter(
          (img: any) => img.image_type === 'gallery'
        );
        
        // CR Paper and Documents
        const documents = sale.vehicles.vehicle_images.filter(
          (img: any) => img.image_type === 'cr_paper' || img.image_type === 'document'
        );
        
        setVehicleImages(galleryImages);
        setDocumentImages(documents);
      }
    } catch (error) {
      console.error('Error fetching sale details:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % vehicleImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + vehicleImages.length) % vehicleImages.length);
  };

  const downloadDocument = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch(error => {
        console.error('Error downloading document:', error);
        alert('Failed to download document');
      });
  };

  if (!saleData) return null;

  const vehicle = saleData.vehicles;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
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
              {/* Image Carousel with Navigation Arrows */}
              {vehicleImages.length > 0 && (
                <div className="relative w-full">
                  <div className="flex items-center p-3 border rounded-lg bg-gray-50 gap-2">
                    {/* Left Arrow */}
                    <button
                      onClick={prevImage}
                      className="flex-shrink-0 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors border border-gray-300"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    
                    {/* Images Container - Show 3 images */}
                    <div className="flex-1 overflow-hidden">
                      <div className="flex gap-3">
                        {vehicleImages.slice(currentImageIndex, currentImageIndex + 3).map((image, index) => (
                          <div
                            key={image.id}
                            className="flex-shrink-0 w-[240px] h-[140px] bg-gray-100 rounded-md overflow-hidden border border-gray-200"
                          >
                            <Image
                              src={image.image_url || '/placeholder-car.jpg'}
                              alt={`Vehicle image ${currentImageIndex + index + 1}`}
                              width={240}
                              height={140}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Arrow */}
                    <button
                      onClick={nextImage}
                      className="flex-shrink-0 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors border border-gray-300"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              )}

              {/* Vehicle Title and Download Button */}
              <div className="flex items-center justify-between py-4">
                <h2 className="text-lg font-semibold text-gray-600">
                  {vehicle?.vehicle_brands?.name} {vehicle?.vehicle_models?.name} {vehicle?.manufacture_year} <span className="text-gray-900">- {vehicle?.vehicle_number}</span>
                </h2>
                
                {/* Download CR Paper Button */}
                {documentImages.length > 0 && (
                  <button
                    onClick={() => {
                      const crPaper = documentImages.find(doc => doc.image_type === 'cr_paper');
                      if (crPaper) {
                        downloadDocument(crPaper.image_url, `${vehicle?.vehicle_number}_CR_Paper.jpg`);
                      } else if (documentImages[0]) {
                        downloadDocument(documentImages[0].image_url, `${vehicle?.vehicle_number}_Document.jpg`);
                      }
                    }}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded transition-colors"
                  >
                    Download CR Paper
                  </button>
                )}
              </div>

              {/* Selling Information */}
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
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 min-w-[140px]">Sales Agent</span>
                    <span className="text-gray-900">:</span>
                    <span className="font-semibold text-gray-900">
                      {saleData.sales_agents?.name || saleData.third_party_agent || 'N/A'}
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
                    <span className="font-semibold text-gray-900">Rs.{saleData.advance_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 min-w-[140px]">Status</span>
                    <span className="text-gray-900">:</span>
                    <span className="font-semibold text-gray-900 capitalize">{saleData.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller and Buyer Details */}
            <div className="grid grid-cols-2 gap-6">
              {/* Seller Details */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">
                        {vehicle?.seller?.first_name} {vehicle?.seller?.last_name}
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

              {/* Buyer Details */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Buyer Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">
                        {saleData.customer_first_name} {saleData.customer_last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">
                        {saleData.customer_address && saleData.customer_city 
                          ? `${saleData.customer_address}, ${saleData.customer_city}`
                          : saleData.customer_address || saleData.customer_city || 'N/A'}
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

            {/* Vehicle Detail */}
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
                    <span className="font-semibold text-gray-900">{vehicle?.registered_year || vehicle?.exterior_color}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Options */}
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button className="px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Move to Sold Out
              </button>
              <button className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
