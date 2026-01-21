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
    specialNotePrint?: string; // Special notes for price tag
  };
  sellerDetails: {
    title: string;
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    nic_number: string;
    mobile_number: string;
    land_phone_number?: string;
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

    // Get the base URL for absolute paths
    const baseUrl = window.location.origin;

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
            html, body {
              font-family: Arial, sans-serif;
              text-transform: capitalize;
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              position: relative;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .template-container {
              position: relative;
              width: 210mm;
              height: 297mm;
            }
            .template-image {
              position: absolute;
              top: 0;
              left: 0;
              width: 210mm;
              height: 297mm;
              object-fit: contain;
              z-index: 1;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
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
              font-weight: 600;
              color: #000;
              line-height: 1.2;
            }
            /* Name & Address - top area */
            .name-address {
              top: 240px;
              left: 240px;
              font-size: 14px;
              max-width: 400px;
            }
            
            }
            /* Date field */
            .date {
              top: 95px;
              left: 87px;
              font-size: 11px;
            }
          
            /* Vehicle Number - right side */
            .vehicle-number {
              top: 295px;
              left: 100px;
              font-size: 14px;
              font-weight: 600;
            }
            /* Brand and Model - left side */
            .brand-model {
              top: 295px;
              left: 280px;
              font-size: 14px;
            }
            /* Mobile Number - bottom left */
            .mobile-number {
              top: 600px;
              left: 150px;
              font-size: 14px;
            }
            /* Land Phone Number - below mobile */
            .land-phone {
              top: 600px;
              left: 350px;
              font-size: 14px;
            }
            /* ID Number (NIC) */
            .id-number {
              top: 275px;
              left: 250px;
              font-size: 14px;
            }
            
            
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              .template-image {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="template-container">
            <!-- Background Template Image -->
            <img src="${baseUrl}/documents/BARAGANIIMA.jpg" alt="Acceptance Template" class="template-image" />
            
            <div class="content-overlay">
              <!-- Name & Address - (Name & Adress) field -->
              <div class="field name-address">${sellerDetails.title} ${sellerDetails.first_name} ${sellerDetails.last_name}, ${sellerDetails.address}, ${sellerDetails.city}</div>

              <!-- Vehicle Number in section 2 -->
              <div class="field vehicle-number">${vehicleData.vehicleNumber}</div>
              
              <!-- Brand and Model in section 3 -->
              <div class="field brand-model">${vehicleData.brandName} ${vehicleData.modelName}</div>
              
             
              <!-- Mobile Number in section 9 -->
              <div class="field mobile-number"> ${sellerDetails.mobile_number}</div>
              
              <!-- Land Phone Number -->
              ${sellerDetails.land_phone_number ? `<div class="field land-phone"> ${sellerDetails.land_phone_number}</div>` : ''}
              
              <!-- ID Number (NIC) -->
              <div class="field id-number"> ${sellerDetails.nic_number}</div>
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
              margin: 10mm;
            }
            
            body {
              font-family: Arial, sans-serif;
              text-transform: uppercase;
              padding: 20px;
            }
            
            /* Hide browser default headers and footers */
            @media print {
              @page {
                margin-top: 0;
                margin-bottom: 0;
              }
              body {
                padding-top: 20px;
                padding-bottom: 20px;
              }
            }
            
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            
            .brand {
              font-size: 48px;
              font-weight: bold;
              margin-bottom: 0;
              letter-spacing: 1px;
            }
            
            .model {
              font-size: 42px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .color {
              font-size: 28px;
              font-weight: normal;
              text-decoration: underline;
              margin-bottom: 10px;
            }
            
            .price-section {
              text-align: center;
              margin: 15px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #000;
            }
            
            .price-text {
              font-size: 32px;
              font-weight: bold;
              text-decoration: underline;
            }
            
            .content-wrapper {
              display: flex;
              margin-top: 20px;
            }
            
            .options-column {
              flex: 1;
              padding-right: 20px;
            }
            
            .details-column {
              width: 200px;
              text-align: left;
            }
            
            .option-item {
              font-size: 22px;
              font-style: italic;
              margin-bottom: 12px;
              font-weight: 500;
            }
            
            .detail-label {
              font-size: 20px;
              font-style: italic;
              margin-bottom: 5px;
            }
            
            .detail-value {
              font-size: 26px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .detail-underline {
              border-bottom: 1px solid #000;
              margin-bottom: 15px;
              width: 100%;
            }
            
            .special-notes-section {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #000;
            }
            
            .special-notes-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              text-decoration: underline;
            }
            
            .special-notes-content {
              font-size: 20px;
              font-style: italic;
              line-height: 1.5;
            }
            
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">${vehicleData.brandName.toUpperCase()}</div>
            <div class="model">${vehicleData.modelName.toUpperCase()}</div>
            <div class="color">${vehicleData.exteriorColor.toUpperCase()}</div>
          </div>
          
          <div class="price-section">
            <div class="price-text">Price : ${formatPrice(vehicleData.sellingAmount)}</div>
          </div>
          
          <div class="content-wrapper">
            <div class="options-column">
              ${allOptions.map(option => `
                <div class="option-item">* ${option}</div>
              `).join('')}
            </div>
            
            <div class="details-column">
              <div class="detail-label">Mfg. Year</div>
              <div class="detail-value">${vehicleData.year}</div>
              <div class="detail-underline"></div>
              
              <div class="detail-label">Reg. Year</div>
              <div class="detail-value">${vehicleData.registeredYear}</div>
              <div style="height: 30px;"></div>
              
              <div class="detail-label">Eng. Cap.</div>
              <div class="detail-value">${vehicleData.engineCapacity}</div>
            </div>
          </div>
          
          ${vehicleData.specialNotePrint ? `
          <div class="special-notes-section">
            <div class="special-notes-title">Special Notes</div>
            <div class="special-notes-content">${vehicleData.specialNotePrint.toUpperCase()}</div>
          </div>
          ` : ''}
          
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
