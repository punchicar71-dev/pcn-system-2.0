'use client';

import { Plus, Printer, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Step7SuccessProps {
  vehicleNumber: string;
  brandName: string;
  modelName: string;
  year: number;
  registeredYear: number;
  engineCapacity: string;
  exteriorColor: string;
  sellingAmount: string;
  sellerDetails: {
    title: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    nicNumber: string;
    mobileNumber: string;
    landPhoneNumber?: string;
  };
  vehicleOptions: {
    standardOptions: { [key: string]: boolean };
    specialOptions: { [key: string]: boolean };
    customOptions: string[];
  };
}

export default function Step7Success({ 
  vehicleNumber, 
  brandName, 
  modelName, 
  year, 
  registeredYear,
  engineCapacity,
  exteriorColor,
  sellingAmount,
  sellerDetails,
  vehicleOptions 
}: Step7SuccessProps) {
  const router = useRouter();

  const handleAddNewVehicle = () => {
    router.push('/add-vehicle');
    // Refresh the page to reset form
    router.refresh();
  };

  const handlePrintAcceptanceDoc = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the acceptance document');
      return;
    }

    // Get current date in format
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Get the base URL for absolute paths
    const baseUrl = window.location.origin;
    
    // Prepare the HTML content with the template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Vehicle Acceptance Document - ${vehicleNumber}</title>
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
              <div class="field name-address">${sellerDetails.title} ${sellerDetails.firstName} ${sellerDetails.lastName}, ${sellerDetails.address}, ${sellerDetails.city}</div>

              <!-- Vehicle Number in section 2 -->
              <div class="field vehicle-number">${vehicleNumber}</div>
              
              <!-- Brand and Model in section 3 -->
              <div class="field brand-model">${brandName} ${modelName}</div>
              
              <!-- Mobile Number in section 9 -->
              <div class="field mobile-number">${sellerDetails.mobileNumber}</div>
              
              <!-- Land Phone Number -->
              ${sellerDetails.landPhoneNumber ? `<div class="field land-phone">${sellerDetails.landPhoneNumber}</div>` : ''}
              
              <!-- ID Number (NIC) -->
              <div class="field id-number">${sellerDetails.nicNumber}</div>
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
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the price tag');
      return;
    }

    // Collect all selected options
    const allOptions: string[] = [];
    
    // Add standard options
    Object.entries(vehicleOptions.standardOptions).forEach(([key, value]) => {
      if (value) {
        // Format the key to be more readable (e.g., "airBags" -> "Air Bags")
        const formatted = key.replace(/([A-Z])/g, ' $1').trim();
        allOptions.push(formatted.toUpperCase());
      }
    });
    
    // Add special options
    Object.entries(vehicleOptions.specialOptions).forEach(([key, value]) => {
      if (value) {
        const formatted = key.replace(/([A-Z])/g, ' $1').trim();
        allOptions.push(formatted.toUpperCase());
      }
    });
    
    // Add custom options
    vehicleOptions.customOptions.forEach((option) => {
      allOptions.push(option.toUpperCase());
    });

    // Format price with commas
    const formatPrice = (price: string) => {
      const num = parseFloat(price.replace(/,/g, ''));
      return num.toLocaleString('en-US');
    };

    // Prepare the HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Price Tag - ${brandName} ${modelName}</title>
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
            <div class="brand">${brandName.toUpperCase()}</div>
            <div class="model">${modelName.toUpperCase()}</div>
            <div class="color">${exteriorColor.toUpperCase()}</div>
          </div>
          
          <div class="price-section">
            <div class="price-text">Price : ${formatPrice(sellingAmount)}</div>
          </div>
          
          <div class="content-wrapper">
            <div class="options-column">
              ${allOptions.map(option => `
                <div class="option-item">* ${option}</div>
              `).join('')}
            </div>
            
            <div class="details-column">
              <div class="detail-label">Mfg. Year</div>
              <div class="detail-value">${year}</div>
              <div class="detail-underline"></div>
              
              <div class="detail-label">Reg. Year</div>
              <div class="detail-value">${registeredYear}</div>
              <div style="height: 30px;"></div>
              
              <div class="detail-label">Eng. Cap.</div>
              <div class="detail-value">${engineCapacity}</div>
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

  const handleGoToInventory = () => {
    router.push('/inventory');
  };

  return (
    <div className=" w-full  bg-white pt-24 text-center">
      {/* Success Animation */}
      <div className="mb-6 flex justify-center items-center">
        <Image 
          src="/done_animation.png" 
          alt="Success" 
          width={200} 
          height={200}
          className="object-contain"
        />
      </div>

      {/* Success Message */}
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        {brandName} {modelName} {year} - <span className="text-green-600">{vehicleNumber}</span>
      </h2>
      <p className="text-lg text-gray-600 mb-8">Vehicle acceptance successful</p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleAddNewVehicle}
          className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Vehicle
        </button>

        <button
          onClick={handlePrintAcceptanceDoc}
          className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Acceptance
        </button>

        <button
          onClick={handlePrintPriceTag}
          className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Price Tag
        </button>

        <button
          onClick={handleGoToInventory}
          className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" />
          Go to Inventory
        </button>
      </div>
    </div>
  );
}
