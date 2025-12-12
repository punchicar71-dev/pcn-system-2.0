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
            /* Field positions - precisely matched to template */
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
            <!-- Background Template Image -->
            <img src="/documents/BARAGANIIMA.png" alt="Acceptance Template" class="template-image" />
            
            <!-- Content Overlay -->
            <div class="content-overlay">
              <!-- Date -->
              <div class="field date">${currentDate}</div>
              
              <!-- Address and City -->
              <div class="field address-city">${sellerDetails.address}, ${sellerDetails.city}</div>
              
              <!-- Seller First and Last Name with Title -->
              <div class="field seller-name">${sellerDetails.title} ${sellerDetails.firstName} ${sellerDetails.lastName}</div>
              
              <!-- Vehicle Number -->
              <div class="field vehicle-number">${vehicleNumber}</div>
              
              <!-- Brand and Model -->
              <div class="field brand-model">${brandName}, ${modelName}</div>
              
              <!-- ID Number (NIC) -->
              <div class="field id-number">${sellerDetails.nicNumber}</div>
              
              <!-- Mobile Number -->
              <div class="field mobile-number">${sellerDetails.mobileNumber}</div>
            </div>
          </div>
          
          <script>
            // Auto print when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            // Close window after printing or canceling
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

    // Split options into chunks for multiple pages if needed
    const optionsPerPage = 15; // Show 15 options per page max
    const optionPages: string[][] = [];
    for (let i = 0; i < allOptions.length; i += optionsPerPage) {
      optionPages.push(allOptions.slice(i, i + optionsPerPage));
    }

    // If no options on first page, at least create one page
    if (optionPages.length === 0) {
      optionPages.push([]);
    }

    // Generate HTML for each page
    const generatePage = (pageOptions: string[], isFirstPage: boolean) => `
      <div class="page">
        ${isFirstPage ? `
        <div class="header">
          <h1 class="brand">${brandName.toUpperCase()}</h1>
          <h2 class="model">${modelName.toUpperCase()}</h2>
          <div class="color">${exteriorColor.toUpperCase()}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="price-section">
          <div class="price-label">Price :</div>
          <div class="price-value">${formatPrice(sellingAmount)}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="details-grid">
          <div class="detail-row">
            <div class="detail-label">Mfg. Year</div>
            <div class="detail-label">Reg. Year</div>
          </div>
          <div class="detail-row">
            <div class="detail-value">${year}</div>
            <div class="detail-value">${registeredYear}</div>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="engine-section">
          <div class="engine-label">Eng. Cap.</div>
          <div class="engine-value">${engineCapacity}</div>
        </div>
        
        <div class="divider"></div>
        ` : ''}
        
        <div class="options-section">
          ${pageOptions.map(option => `
            <div class="option-item">* ${option}</div>
          `).join('')}
        </div>
        
        ${!isFirstPage && pageOptions.length === 0 ? '' : ''}
      </div>
    `;

    const allPagesHtml = optionPages.map((pageOptions, index) => 
      generatePage(pageOptions, index === 0)
    ).join('');

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
            // Auto print when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            // Close window after printing or canceling
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
    <div className=" w-full  bg-slate-50 pt-24 text-center">
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
