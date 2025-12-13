'use client';

import { X, Printer } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
}

export default function PrintDocumentModal({
  isOpen,
  onClose,
  saleId,
}: PrintDocumentModalProps) {
  const [saleData, setSaleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && saleId) {
      fetchSaleData();
    }
  }, [isOpen, saleId]);

  const fetchSaleData = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      console.log('🔍 Fetching sale ID:', saleId);

      // Simple query first
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
        console.error('❌ Error fetching sale data:', error);
        alert('Error: ' + error.message);
        return;
      }

      // Fetch seller separately
      if (sale?.vehicles?.id) {
        const { data: sellerData } = await supabase
          .from('sellers')
          .select('*')
          .eq('vehicle_id', sale.vehicles.id)
          .maybeSingle();

        if (sellerData) {
          sale.seller = sellerData;
          console.log('👤 Seller data:', sellerData);
          console.log('📋 Seller title:', sellerData.title);
        }
      }

      // Fetch PCN advance amount from price categories based on selling amount
      if (sale?.selling_amount) {
        const { data: priceCategories } = await supabase
          .from('price_categories')
          .select('*')
          .eq('is_active', true)
          .order('min_price');

        if (priceCategories && priceCategories.length > 0) {
          // Find the matching price category
          const matchingCategory = priceCategories.find(
            (cat: any) => 
              sale.selling_amount >= cat.min_price && 
              sale.selling_amount <= cat.max_price
          );

          if (matchingCategory) {
            sale.pcn_advance_amount = matchingCategory.pcn_advance_amount;
            console.log('💰 PCN Advance Amount:', matchingCategory.pcn_advance_amount);
            console.log('📊 Price Category:', matchingCategory.name);
          } else {
            console.log('⚠️ No matching price category found for selling amount:', sale.selling_amount);
            sale.pcn_advance_amount = 0;
          }
        }
      }

      // Fetch leasing company separately if leasing_company_id exists
      if (sale?.leasing_company_id) {
        console.log('📌 Fetching leasing company with ID:', sale.leasing_company_id);
        
        const { data: leasingCompanyData, error: leasingError } = await supabase
          .from('leasing_companies')
          .select('*')
          .eq('id', sale.leasing_company_id)
          .single();

        if (leasingError) {
          console.error('❌ Error fetching leasing company:', leasingError);
        } else if (leasingCompanyData) {
          sale.leasing_company_name = leasingCompanyData.name;
          console.log('🏢 Leasing Company Data:', leasingCompanyData);
          console.log('🏢 Leasing Company Name:', leasingCompanyData.name);
        } else {
          console.log('⚠️ No leasing company data returned');
        }
      } else {
        console.log('⚠️ No leasing_company_id in sale data');
      }

      console.log('✅ Sale data loaded:', sale);
      setSaleData(sale);
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async (documentType: string, templatePath: string) => {
    if (!saleData || !canvasRef.current) {
      alert('No data available');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      console.log('🖨️ Printing:', documentType);
      console.log('📄 Loading template:', templatePath);

      // Load the template image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = templatePath;

      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the template
        ctx.drawImage(img, 0, 0);

        // Set font and color for text
        ctx.font = 'bold 32px Arial ';
        ctx.fillStyle = '#000000ff'; // Red color for data

        // Helper function to draw text
        const drawText = (text: string, x: number, y: number, fontSize: number = 42) => {
          ctx.font = `bold ${fontSize}px Arial `;
          ctx.fillText(text, x, y);
        };

        // Common data - use stored snapshot first, fallback to joined data for backwards compatibility
        const brandName = saleData.brand_name || saleData.vehicles?.vehicle_brands?.name || '';
        const modelName = saleData.model_name || saleData.vehicles?.vehicle_models?.name || '';
        const manufactureYear = saleData.manufacture_year || saleData.vehicles?.manufacture_year || '';
        const vehicleInfo = `${brandName} ${modelName} ${manufactureYear}`.toUpperCase();
        const vehicleNumber = (saleData.vehicle_number || saleData.vehicles?.vehicle_number || '').toUpperCase();
        
        // Customer name with title
        const customerTitle = saleData.customer_title || ''; // Mr, Miss, Mrs, Dr
        const customerFullName = `${saleData.customer_first_name} ${saleData.customer_last_name}`.toUpperCase();
        const customerName = customerTitle ? `${customerTitle} ${customerFullName}` : customerFullName;
        
        const customerAddress = `${saleData.customer_address}, ${saleData.customer_city}`.toUpperCase();
        const sellingAmount = `Rs. ${saleData.selling_amount?.toLocaleString() || '0'}`;
        const advanceAmount = `Rs. ${saleData.advance_amount?.toLocaleString() || '0'}`;
        const pcnAdvanceAmount = saleData.pcn_advance_amount 
          ? `Rs. ${saleData.pcn_advance_amount.toLocaleString()}` 
          : 'Rs. 0';
        const closeDate = new Date(saleData.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const customerMobile = saleData.customer_mobile || '';
        const customerLandphone = saleData.customer_landphone || '';
        const customerNIC = (saleData.customer_nic || '').toUpperCase();
        
        // Seller name with title
        const sellerTitle = saleData.seller?.title || ''; // Mr, Miss, Mrs, Dr
        const sellerFullName = saleData.seller
          ? `${saleData.seller.first_name} ${saleData.seller.last_name}`.toUpperCase()
          : '';
        const sellerName = sellerTitle ? `${sellerTitle} ${sellerFullName}` : sellerFullName;
        
        console.log('👤 Seller Name with title:', sellerName);
        console.log('📋 Seller title value:', saleData.seller?.title);
        const sellerNIC = (saleData.seller?.nic_number || '').toUpperCase();
        const sellerAddress = saleData.seller 
          ? `${saleData.seller.address}, ${saleData.seller.city}`.toUpperCase()
          : '';
        const sellerCity = (saleData.seller?.city || '').toUpperCase();
        const financeCompany = (saleData.finance_company || saleData.leasing_company_name || '').toUpperCase();
        
        // Debug logging for finance company
        console.log('💼 Finance Company Final Value:', financeCompany);
        console.log('💼 Finance Company Type:', typeof financeCompany);
        console.log('💼 Sale Data finance_company:', saleData.finance_company);
        console.log('💼 Sale Data leasing_company_name:', saleData.leasing_company_name);
        console.log('💼 Sale Data leasing_company_id:', saleData.leasing_company_id);
        console.log('💼 Complete Sale Data:', JSON.stringify(saleData, null, 2));

        // Document-specific positioning
        const marginLeft = 120;

        if (documentType === 'CASH_SELLER') {
          // Seller Name (top)
          drawText(sellerName,  150, 260);
          // Seller Address
          drawText(sellerAddress, 150, 328);
          // Seller City
          drawText(sellerCity, 150, 390);
          // Date
          drawText(closeDate,  150, 570);
          // Vehicle Number
          drawText(vehicleNumber, 350, 690);
          // Vehicle Brand/Model
          drawText(vehicleInfo, 420, 925);
          // Customer Address
          drawText(customerAddress, 420, 1050);
          // Customer Name
          drawText(customerName, 650, 1165);
          // Selling Amount
          drawText(sellingAmount, 750, 1295);
          // Seller NIC at bottom
          drawText(sellerNIC, 550, 2330);
          // Customer NIC at bottom
          drawText(customerNIC, 550, 3030);
        } else if (documentType === 'CASH_DEALER') {
          // Vehicle Number (top)
          drawText(vehicleNumber, 720, 630);
          // Date
          drawText(closeDate, 1800, 535);
          // Vehicle Brand/Model
          drawText(vehicleInfo, 1750, 723);
          // Customer Address
          drawText(customerAddress, 720, 810);
          // Customer Name
          drawText(customerName, 720, 896);
          // Selling Amount
          drawText(sellingAmount, 720, 984);
          // Customer Name at bottom
          drawText(customerName, 220, 2530);
          // Customer Mobile
          drawText(customerMobile, 1580, 2640);
          // Customer Landphone
          drawText(customerLandphone, 1580, 2730);
          // Customer NIC
          drawText(customerNIC, 550, 2728);
        } else if (documentType === 'ADVANCE_NOTE') {
          // Date (top right)
          drawText(closeDate, 1700, 500);
          // Vehicle Number
          drawText(vehicleNumber, 1680, 680);
          // Vehicle Brand/Model
          drawText(vehicleInfo, 220, 770);
          // Customer Address
          drawText(customerAddress, 1200, 770);
          // Customer Name
          drawText(customerName, 1150, 852);
          // Selling Amount
          drawText(sellingAmount, 630, 932);
          // PCN Advance Amount
          drawText(pcnAdvanceAmount, 1820, 932);
          // Close Date
          drawText(closeDate, 1200, 995);
          // Customer Mobile at bottom
          drawText(customerMobile, 1300, 2510);
          // Customer Landphone at bottom
          drawText(customerLandphone, 1300, 2600);
          // Customer NIC at bottom
          drawText(customerNIC, 530, 2558);
        } else if (documentType === 'FINANCE_SELLER') {
          // Seller Name (top)
          drawText(sellerName, 180, 120);
          // Seller Address
          drawText(sellerAddress, 180, 184);
          // Seller City
          drawText(sellerCity, 180, 245);
          // Date
          drawText(closeDate, 180, 430);
          // Vehicle Number
          drawText(vehicleNumber, 180, 600);
          // Finance Company / Leasing Company
          console.log('🏦 Drawing Finance/Leasing Company - Value:', financeCompany);
          console.log('🏦 Drawing Finance/Leasing Company - Type:', typeof financeCompany);
          console.log('🏦 Drawing Finance/Leasing Company - Length:', financeCompany?.length);
          const financeCompanyText = financeCompany ? String(financeCompany).trim() : '';
          console.log('🏦 Final Text to Draw:', financeCompanyText);
          drawText(financeCompanyText, 200, 1815);
          // Vehicle Brand/Model
          drawText(vehicleInfo,630, 910);
          // Customer Address
          drawText(customerAddress, 250, 1030);
          // Customer Name
          drawText(customerName, 690, 1145);
          // Selling Amount
          drawText(sellingAmount, 1080, 1270);
          // Advance Amount
          drawText(advanceAmount, 1300, 1390);
          // Seller NIC
          drawText(sellerNIC, 580, 2360);
          // To Pay Amount (Balance)
          const balance = (saleData.selling_amount || 0) - (saleData.advance_amount || 0);
          drawText(`Rs. ${balance.toLocaleString()}`, 1200, 1515);
          // Customer NIC
          drawText(customerNIC, 580, 2840);
        } else if (documentType === 'FINANCE_DEALER') {
          // Vehicle Number (top)
          drawText(vehicleNumber, 620, 765);
          // Date (top right)
          drawText(closeDate, 1990, 656);
          // Vehicle Brand/Model
          drawText(vehicleInfo, 1730, 860);
          // Customer Address
          drawText(customerAddress, 660, 960);
          // Customer Name
          drawText(customerName, 1200, 1060);
          // Selling Amount
          drawText(sellingAmount, 700, 1130);
          // Advance Amount
          drawText(advanceAmount, 330, 1245);
          // To Pay Amount (Balance)
          const balanceDealer = (saleData.selling_amount || 0) - (saleData.advance_amount || 0);
          drawText(`Rs. ${balanceDealer.toLocaleString()}`, 1840, 1245);
          // Finance Company
          console.log('🏦 Drawing Finance Company (Dealer):', financeCompany);
          drawText(financeCompany, 750, 1320);
          // Customer Name at bottom
          drawText(customerName, 210, 2300);
          // Customer Mobile
          drawText(customerMobile, 1590, 2420);
          // Customer Landphone
          drawText(customerLandphone, 1590, 2510);
          // Customer NIC
          drawText(customerNIC, 540, 2510);
        }

        console.log('✅ Canvas rendered successfully');

        // Convert canvas to blob and print
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');
            if (printWindow) {
              printWindow.onload = () => {
                setTimeout(() => {
                  printWindow.print();
                  URL.revokeObjectURL(url);
                }, 250);
              };
            }
          }
        });
      };

      img.onerror = () => {
        console.error('❌ Failed to load template image:', templatePath);
        alert('Failed to load document template. Please check if the template file exists.');
      };
    } catch (error) {
      console.error('❌ Error printing document:', error);
      alert('An error occurred while printing');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">Document Print</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse text-gray-500">Loading sale data...</div>
            </div>
          ) : saleData ? (
            <>
              {/* Vehicle Info Banner */}
              <div className="bg-gray-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {saleData.vehicles?.vehicle_brands?.name || 'N/A'}{' '}
                  {saleData.vehicles?.vehicle_models?.name || 'N/A'}{' '}
                  {saleData.vehicles?.manufacture_year || 'N/A'} -{' '}
                  <span className="text-green-600">
                    {saleData.vehicles?.vehicle_number || 'N/A'}
                  </span>
                </h3>
                <p className="text-gray-700 font-medium">
                  Documents are ready to print!
                </p>
              </div>

              {/* Print Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handlePrint('CASH_SELLER', '/documents/CASH_SELLER.png')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
                    Print Cash Seller
                  </span>
                </button>

                <button
                  onClick={() => handlePrint('CASH_DEALER', '/documents/CASH_DEALER.png')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
                    Print Cash Dealer
                  </span>
                </button>

                <button
                  onClick={() => handlePrint('ADVANCE_NOTE', '/documents/ADVANCE_NOTE.png')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
                    Advance Note
                  </span>
                </button>

                <button
                  onClick={() => handlePrint('FINANCE_SELLER', '/documents/FINANCE_SELLER.png')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
                    Print Finance Seller
                  </span>
                </button>

                <button
                  onClick={() => handlePrint('FINANCE_DEALER', '/documents/FINANCE_DEALER.png')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
                    Print Finance Dealer
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg font-semibold text-red-500 mb-2">Failed to load sale data</p>
              <p className="text-sm text-gray-600">Check browser console for error details</p>
            </div>
          )}
        </div>

        {/* Hidden canvas for image manipulation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

// Explicit export for TypeScript
export { PrintDocumentModal };
