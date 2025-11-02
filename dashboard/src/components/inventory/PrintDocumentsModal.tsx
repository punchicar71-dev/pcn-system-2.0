'use client';

import { Printer, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PrintDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleData: {
    vehicleNumber: string;
    brandName: string;
    modelName: string;
    year: number;
    registeredYear: number;
    engineCapacity: string;
    exteriorColor: string;
    sellingAmount: number;
  };
  sellerDetails: {
    title: string;
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    nic_number: string;
    mobile_number: string;
  } | null;
  vehicleOptions: Array<{ option_name: string }>;
}

export default function PrintDocumentsModal({
  isOpen,
  onClose,
  vehicleData,
  sellerDetails,
  vehicleOptions,
}: PrintDocumentsModalProps) {

  const handlePrintAcceptance = () => {
    if (!sellerDetails) {
      alert('Seller details not found. Cannot print acceptance document.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the acceptance document');
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Vehicle Acceptance Document - ${vehicleData.vehicleNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            @page {
              size: A4;
              margin: 0;
            }
            body {
              font-family: 'FMMalithi', Arial, sans-serif;
              text-transform: capitalize;
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              position: relative;
            }
            .template-container {
              position: relative;
              width: 100%;
              height: 100%;
            }
            .template-image {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              object-fit: contain;
              z-index: 1;
            }
            .content-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 2;
            }
            .field {
              position: absolute;
              font-size: 14px;
              font-weight: 500;
              color: #000;
              line-height: 1.2;
            }
            .date {
              top: 304px;
              right: 180px;
              font-size: 16px;
            }
            .address-city {
              top: 384px;
              left: 195px;
              font-size: 16px;
              max-width: 500px;
            }
            .seller-name {
              top: 416px;
              left: 305px;
              font-size: 16px;
            }
            .vehicle-number {
              top: 450px;
              left: 510px;
              font-size: 16px;
              font-weight: 600;
            }
            .brand-model {
              top: 484px;
              left: 200px;
              font-size: 16px;
            }
            .id-number {
              top: 884px;
              left: 590px;
              font-size: 14px;
            }
            .mobile-number {
              top: 920px;
              left: 590px;
              font-size: 14px;
            }
            @media print {
              body {
                width: 210mm;
                height: 297mm;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="template-container">
            <img src="/documents/BARAGANIIMA.png" alt="Acceptance Template" class="template-image" />
            
            <div class="content-overlay">
              <div class="field date">${currentDate}</div>
              <div class="field address-city">${sellerDetails.address}, ${sellerDetails.city}</div>
              <div class="field seller-name">${sellerDetails.title} ${sellerDetails.first_name} ${sellerDetails.last_name}</div>
              <div class="field vehicle-number">${vehicleData.vehicleNumber}</div>
              <div class="field brand-model">${vehicleData.brandName}, ${vehicleData.modelName}</div>
              <div class="field id-number">${sellerDetails.nic_number}</div>
              <div class="field mobile-number">${sellerDetails.mobile_number}</div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintPriceTag = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the price tag');
      return;
    }

    // Format options for display
    const allOptions = vehicleOptions.map(opt => opt.option_name.toUpperCase());

    // Format price with commas
    const formatPrice = (price: number) => {
      return price.toLocaleString('en-US');
    };

    // Split options into chunks for multiple pages if needed
    const optionsPerPage = 15;
    const optionPages: string[][] = [];
    for (let i = 0; i < allOptions.length; i += optionsPerPage) {
      optionPages.push(allOptions.slice(i, i + optionsPerPage));
    }

    if (optionPages.length === 0) {
      optionPages.push([]);
    }

    const generatePage = (pageOptions: string[], isFirstPage: boolean) => `
      <div class="page">
        ${isFirstPage ? `
        <div class="header">
          <h1 class="brand">${vehicleData.brandName.toUpperCase()}</h1>
          <h2 class="model">${vehicleData.modelName.toUpperCase()}</h2>
          <div class="color">${vehicleData.exteriorColor.toUpperCase()}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="price-section">
          <div class="price-label">Price :</div>
          <div class="price-value">${formatPrice(vehicleData.sellingAmount)}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="details-grid">
          <div class="detail-row">
            <div class="detail-label">Mfg. Year</div>
            <div class="detail-label">Reg. Year</div>
          </div>
          <div class="detail-row">
            <div class="detail-value">${vehicleData.year}</div>
            <div class="detail-value">${vehicleData.registeredYear}</div>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="engine-section">
          <div class="engine-label">Eng. Cap.</div>
          <div class="engine-value">${vehicleData.engineCapacity}</div>
        </div>
        
        <div class="divider"></div>
        ` : ''}
        
        <div class="options-section">
          ${pageOptions.map(option => `
            <div class="option-item">* ${option}</div>
          `).join('')}
        </div>
      </div>
    `;

    const allPagesHtml = optionPages.map((pageOptions, index) => 
      generatePage(pageOptions, index === 0)
    ).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Price Tag - ${vehicleData.brandName} ${vehicleData.modelName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              font-family: Arial, sans-serif;
              text-transform: uppercase;
            }
            
            .page {
              page-break-after: always;
              padding: 40px;
              min-height: 100vh;
            }
            
            .page:last-child {
              page-break-after: auto;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            
            .brand {
              font-size: 72px;
              font-weight: bold;
              margin-bottom: 10px;
              letter-spacing: 2px;
            }
            
            .model {
              font-size: 56px;
              font-weight: bold;
              margin-bottom: 15px;
              letter-spacing: 1px;
            }
            
            .color {
              font-size: 48px;
              font-weight: normal;
            }
            
            .divider {
              border-bottom: 3px solid #000;
              margin: 30px 0;
            }
            
            .price-section {
              text-align: center;
              margin: 40px 0;
            }
            
            .price-label {
              font-size: 42px;
              margin-bottom: 10px;
            }
            
            .price-value {
              font-size: 64px;
              font-weight: bold;
              letter-spacing: 2px;
            }
            
            .details-grid {
              margin: 40px 0;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-around;
              margin-bottom: 15px;
            }
            
            .detail-label {
              font-size: 36px;
              flex: 1;
              text-align: center;
            }
            
            .detail-value {
              font-size: 48px;
              font-weight: bold;
              flex: 1;
              text-align: center;
            }
            
            .engine-section {
              text-align: center;
              margin: 40px 0;
            }
            
            .engine-label {
              font-size: 36px;
              margin-bottom: 10px;
            }
            
            .engine-value {
              font-size: 52px;
              font-weight: bold;
            }
            
            .options-section {
              margin-top: 40px;
            }
            
            .option-item {
              font-size: 32px;
              margin-bottom: 20px;
              padding-left: 20px;
              line-height: 1.4;
              font-weight: 500;
            }
            
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              
              .page {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          ${allPagesHtml}
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Printer className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {vehicleData.brandName} {vehicleData.modelName} {vehicleData.year}
                </h3>
                <p className="text-sm text-gray-500 font-normal">
                  {vehicleData.vehicleNumber}
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <p className="text-center text-gray-600 mb-6">
            Documents are ready to print!
          </p>

          <div className="grid gap-4">
            <button
              onClick={handlePrintAcceptance}
              disabled={!sellerDetails}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Printer className="w-5 h-5" />
              <span className="font-medium">Print Acceptance</span>
            </button>

            <button
              onClick={handlePrintPriceTag}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-5 h-5" />
              <span className="font-medium">Print Price Tag</span>
            </button>
          </div>

          {!sellerDetails && (
            <p className="text-sm text-amber-600 mt-4 text-center">
              ⚠️ Seller details not found. Acceptance document cannot be printed.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
