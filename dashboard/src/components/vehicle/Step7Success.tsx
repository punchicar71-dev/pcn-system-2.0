'use client';

import { Plus, Printer, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Step7SuccessProps {
  vehicleNumber: string;
  brandName: string;
  modelName: string;
  year: number;
  sellerDetails: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    nicNumber: string;
    mobileNumber: string;
  };
}

export default function Step7Success({ vehicleNumber, brandName, modelName, year, sellerDetails }: Step7SuccessProps) {
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
            <img src="/documents/acceptance.png" alt="Acceptance Template" class="template-image" />
            
            <!-- Content Overlay -->
            <div class="content-overlay">
              <!-- Date -->
              <div class="field date">${currentDate}</div>
              
              <!-- Address and City -->
              <div class="field address-city">${sellerDetails.address}, ${sellerDetails.city}</div>
              
              <!-- Seller First and Last Name -->
              <div class="field seller-name">${sellerDetails.firstName} ${sellerDetails.lastName}</div>
              
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

  const handleGoToInventory = () => {
    router.push('/inventory');
  };

  return (
    <div className="bg-white  p-8 text-center">
      {/* Success Animation */}
      <div className="mb-6 flex justify-center">
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
          Print Acceptance Doc
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
