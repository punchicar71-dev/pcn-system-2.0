'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, CircleCheck, House  } from 'lucide-react';
import Image360Viewer from '@/components/Image360Viewer';
import RelatedVehicleCard, { RelatedVehicle } from '@/components/RelatedVehicleCard';
import { Separator } from "@/components/ui/separator"
import VehicleDetailSkeleton from '@/components/VehicleDetailSkeleton';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";


interface VehicleDetail {
  id: string;
  vehicle_number: string;
  brand: { id: string; name: string; logo_url?: string };
  model: { id: string; name: string };
  model_number_other?: string;
  manufacture_year: number;
  country: { id: string; name: string };
  body_type: string;
  fuel_type: string;
  transmission: string;
  engine_capacity?: string;
  exterior_color?: string;
  registered_year?: number;
  selling_amount: number;
  mileage?: number;
  entry_type: string;
  entry_date: string;
  status: string;
  tag_notes?: string;
  special_note_print?: string;
  created_at: string;
  updated_at: string;
  images: Array<{ id: string; image_url: string; is_primary: boolean; display_order: number; image_type?: string }>;
  image_360?: Array<{ id: string; image_url: string; image_type: string; display_order: number }>;
  options: Array<{ id: string; name: string; type: string }>;
  custom_options: Array<{ id: string; option_name: string }>;
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    address?: string;
    city?: string;
    mobile_number: string;
    land_phone_number?: string;
    email_address?: string;
  };
}

const formatPrice = (price: number) => {
  return `Rs. ${price.toLocaleString().replace(/,/g, ',')}`;
};

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'gallery' | '360'>('gallery');
  const [relatedVehicles, setRelatedVehicles] = useState<RelatedVehicle[]>([]);
  
  // Leasing calculator state
  const [downPayment, setDownPayment] = useState('30');
  const [leasingAmount, setLeasingAmount] = useState('3500000');
  const [leasingPeriod, setLeasingPeriod] = useState('24');
  const [interestRate] = useState('15');
  
  // Calculate monthly amount
  const calculateMonthlyAmount = () => {
    const principal = parseFloat(leasingAmount) * (1 - parseFloat(downPayment) / 100);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(leasingPeriod);
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(monthlyPayment);
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicle');
        }
        
        const data = await response.json();
        setVehicle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  // Fetch related vehicles
  useEffect(() => {
    const fetchRelatedVehicles = async () => {
      if (!vehicle) return;
      
      try {
        // Fetch vehicles from the same brand, get 4 to ensure we have 3 after filtering current
        const response = await fetch(`/api/vehicles?brand=${vehicle.brand.id}&limit=6`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched related vehicles:', data);
          
          // Filter out the current vehicle and limit to 3
          if (data.vehicles && Array.isArray(data.vehicles)) {
            const filtered = data.vehicles
              .filter((v: RelatedVehicle) => v.id !== vehicleId)
              .slice(0, 3);
            console.log('Filtered related vehicles:', filtered);
            setRelatedVehicles(filtered);
          }
        } else {
          console.error('Failed to fetch related vehicles:', response.status);
        }
      } catch (err) {
        console.error('Error fetching related vehicles:', err);
      }
    };

    fetchRelatedVehicles();
  }, [vehicle, vehicleId]);

  if (loading) {
    return <VehicleDetailSkeleton />;
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'Vehicle not found'}</div>
          <Link href="/vehicles" className="text-blue-500 hover:underline">
            Back to vehicles
          </Link>
        </div>
      </div>
    );
  }

  const vehicleImages = vehicle.images && vehicle.images.length > 0 
    ? vehicle.images.sort((a, b) => (b.is_primary ? 1 : -1))
    : [];

  return (
    <div className="min-h-screen bg-white bg-gray-50">
      {/* Hero Section with Background */}
      <div 
        className="relative bg-cover h-96 bg-center  pt-10 bg-no-repeat"
        style={{ backgroundImage: "url('/detail_bg.png')" }}
      >
        <div className="absolute inset-0 "></div>
        
        <div className="relative  max-w-7xl  mx-auto pt-20 ">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList className="text-black/90">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-black/80 hover:text-black flex gap-2 items-center"><House className='h-4 w-4' />Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-black/60" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/vehicles" className="text-black/80 hover:text-black">All Vehicles</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-black/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-black font-medium">
                    {vehicle.brand.name} {vehicle.model.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Two Column Flex Layout */}
          <div className="flex bg-white rounded-t-[12px] border  flex-col max-w-7xl lg:flex-row gap-2">
            {/* Left Column - Gallery */}
            <div className="flex-1 p-4">
              {/* Main Image with Overlay Buttons */}
              <div className="relative">
                {viewMode === 'gallery' && vehicleImages.length > 0 ? (
                  <img
                    src={vehicleImages[currentImageIndex]?.image_url}
                    alt={`${vehicle.brand.name} ${vehicle.model.name}`}
                    className="w-full h-[400px] object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-car.jpg';
                    }}
                  />
                ) : viewMode === '360' && vehicle.image_360 && vehicle.image_360.length > 0 ? (
                  <div className="h-[400px] rounded-lg overflow-hidden">
                    <Image360Viewer 
                      images={vehicle.image_360.map(img => img.image_url)}
                      autoRotate={false}
                      autoRotateSpeed={50}
                      sensitivity={5}
                      height="400px"
                      showControls={true}
                    />
                  </div>
                ) : (
                  <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No images available</span>
                  </div>
                )}
                
                {/* Overlay Buttons */}
                <div className="absolute top-4 left-4 bg-white bg-opacity-25 rounded p-1 flex gap-2">
                  
                  <button 
                    onClick={() => setViewMode('gallery')}
                    className={`px-4 py-2 bg-black/70 hover:bg-black/80 text-white text-sm font-medium rounded transition ${
                      viewMode === 'gallery' ? 'ring-2 ring-white' : ''
                    }`}
                  >
                    Gallery
                  </button>
                  <button 
                    onClick={() => setViewMode('360')}
                    disabled={!vehicle.image_360 || vehicle.image_360.length === 0}
                    className={`px-4 py-2 bg-black/70 hover:bg-black/80 text-white text-sm font-medium rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      viewMode === '360' ? 'ring-2 ring-white' : ''
                    }`}
                  >
                    360° View
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {vehicleImages.length > 1 && viewMode === 'gallery' && (
                <div className="flex gap-3 mt-4">
                  {vehicleImages.slice(0, 3).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-1 h-24 rounded-lg overflow-hidden border-2 transition ${
                        currentImageIndex === index ? 'border-white' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-car.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="flex-1 p-4 bg-white space-y-6 rounded-lg ">
             

         
              <h1 className="text-[32px] font-semibold text-gray-900 mt-4">
                {vehicle.brand.name} {vehicle.model.name} NXT
              </h1>
              <p className="text-[24px] text-gray-600 mt-1">{vehicle.manufacture_year}</p>
              
              <div className="my-6">
                <p className="text-4xl font-semibold text-gray-900">
                  {formatPrice(vehicle.selling_amount)}
                </p>
              </div>

              {/* Specs Flex 2x4 */}
              <div className="flex flex-wrap gap-y-4 gap-x-8 py-8">
                <div className="w-[calc(50%-1rem)] flex gap-3">
                  <p className="text-base w-auto font-regular text-gray-600 ">Body :</p>
                  <p className="text-base font-semibold text-gray-900">{vehicle.body_type}</p>
                </div>
                <div className="w-[calc(50%-1rem)] flex gap-3">
                  <p className="text-base w-auto font-regular text-gray-600 ">Fuel type :</p>
                  <p className="text-base font-semibold text-gray-900">{vehicle.fuel_type}</p>
                </div>
                <div className="w-[calc(50%-1rem)] flex gap-3">
                  <p className="text-base w-auto font-regular text-gray-600 ">Engine :</p>
                  <p className="text-base font-semibold text-gray-900">{vehicle.engine_capacity || 'N/A'}</p>
                </div>
                <div className="w-[calc(50%-1rem)] flex gap-3">
                  <p className="text-base w-auto font-regular text-gray-600 ">Transmission :</p>
                  <p className="text-base font-semibold text-gray-900">{vehicle.transmission}</p>
                </div>
               

                <div className="w-[calc(50%-1rem)] flex gap-3">
                  <p className="text-base w-auto font-regular text-gray-600 ">Year :</p>
                  <p className="text-base font-semibold text-gray-900">{vehicle.manufacture_year}</p>
                </div>
                
                <div className="w-[calc(50%-1rem)] flex gap-3">
                  <p className="text-base w-auto font-regular text-gray-600 ">Exterior Color :</p>
                  <p className="text-base font-semibold text-gray-900">{vehicle.exterior_color || 'N/A'}</p>
                </div>
                <div className="w-[calc(50%-1rem)] flex gap-3">
                  <p className="text-base w-auto font-regular text-gray-600 ">Country :</p>
                  <p className="text-base font-semibold text-gray-900">{vehicle.country.name}</p>
                </div>
                <div className="w-[calc(50%-1rem)] flex gap-3">
                  <p className="text-base w-auto font-regular text-gray-600 ">Registered :</p>
                  <p className="text-base font-semibold text-gray-900">{vehicle.registered_year || vehicle.manufacture_year}</p>
                </div>
              </div>

              {/* Contact Link */}
              <p className="text-[20px]">
                Get more info : <span className="text-green-600  font-semibold mt-6">0117 275 275</span> 
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Content Area */}
      <div className="max-w-7xl border px-4  mx-auto mt-[315px]">
        <div className="flex flex-col lg:flex-row ">
          {/* Left Column - 70% - Features & Service */}
          <div className="flex-1 border-r lg:w-[70%]">
            {/* Extra Features */}
            {(vehicle.options.length > 0 || vehicle.custom_options.length > 0) && (
              <div className=" p-6  border-b">
                <h2 className="text-[20px]  font-semibold text-gray-900 mb-6">Extra Features</h2>
                <div className="flex flex-wrap gap-4">
                  {vehicle.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2 w-[calc(33.333%-0.67rem)]">
                      <CircleCheck  className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{option.name}</span>
                    </div>
                    
                  ))}
                  {vehicle.custom_options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2 w-[calc(33.333%-0.67rem)]">
                      <CircleCheck  className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{option.option_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Our Service */}
            <div className="bg-white rounded-lg p-6 ">
              <h2 className="text-[20px]  font-semibold text-gray-900 mb-4">Our Service</h2>
              <div className="space-y-4 text-[16px] text-gray-700 leading-relaxed">
                මෙම වාහනය ගන්නා විට ඔබට පුංචි කාර් නිවසේදීම AUTO MIRAJ සමාගමේ වාහන පරීක්ෂණ ඒකකය මගින් වාහනය සම්පුර්ණයෙන්ම පරීක්ෂා කර අංග සම්පුර්ණ තත්ව පරීක්ෂණ වාර්තාවක් ලබා ගත හැකිය.<br/><br/>
වාහනය ගැනීමට ඔබ සුදානම් නම් මෙම වාහනයේ හිමිකරු සමග ඔබට පුංචි කාර් නිවසේදී කෙලින්ම දුරකතනයෙන් ගනුදෙනු කතා කරගත හැකිය.<br/><br/>
වාහනයේ ලියවිලිවල නිරවද්‍යතාව අප කාර්ය මණ්ඩලය මගින් තාක්ෂණික උපකරණද භාවිතයෙන් පරීක්ෂා කර දෙනු ලැබේ.<br/><br/>
ලීසිං පහසුකම් සඳහා LB FINANCE, SINGER FINANCE, MERCANTILE INVESTMENT, PEOPLES LEASING යන දිවයිනේ ජනප්‍රිය ලීසිං සමාගම් කාර්යාල පුංචි කාර් නිවස වාහන උද්‍යාන පරිශ්‍රයේම පිහිටුවා ඇත.<br/><br/>
ඔබ ගන්න වාහනයට LABOUR FREE SERVICE 3ක් හිමි වේ.<br/><br/>
තෝරා ගැනීමට වාහන 400ක් එකම උද්‍යානයක.<br/><br/>
වැලිවේෂන් සහ රක්ෂණ සේවාවන් ද පුංචි කාර් නිවසේදීම.<br/><br/>
වාහන පාකින්, ආපන ශාලා, ප්‍රධාන පාර දක්වා නොමිලේ ශට්ල් සේවා ආදී සියල්ලෙන් සපිරි සිරිලක වාහන උද්‍යානය.<br/><br/>
   <Separator className="my-4" />  
   <p className='text-[18px] font-bold'> ගමන් මග</p>
    <br/>

අධිවේගී මාර්ගයේ මාතර කොට්ටාව දෙසින් නම් කොතලාවල පිටවීමෙන් බත්තරමුල්ල දෙසට එන්න. කිලෝමීටර් 1යි.
කඩවත දෙසින් නම් කඩුවෙලින් පිටවී කඩුවෙල නගරය හරහා මාලඹේ දෙසට එන්න. කඩුවෙල කොල්ලුපිටිය 177 බස් මාර්ගය. <br/><br/>

SLIIT කැම්පස් අසලින් ඉසුරුපුර පාරේ මීටර් 600ක් එන්න.<br/><br/>

පුංචි කාර් නිවස වාහන උද්‍යානය, ඉසුරුපුර පාර, මාලඹේ.<br/><br/>

Telephone : <span className='font-bold'>0117 275 275 | 0112 413 866</span>  <br/><br/> Email : <span className='font-bold'>sales@punchicar.lk</span> 
                
              </div>
            </div>
          </div>

          {/* Right Column - 30% - Leasing Calculator */}
          <div className="lg:w-[30%]">
            <div className="bg-white rounded-lg p-6 shadow-sm  top-6">
              <h3 className="text-[20px]  font-semibold text-gray-900 mb-2">Leasing Calculate</h3>
              <p className="text-sm text-gray-600 mb-6">
                Every vehicle 30% downpayment get in the leasing
              </p>

              <div className="space-y-4">
                {/* Down Payment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Down payment
                  </label>
                  <Select value={downPayment} onValueChange={setDownPayment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select down payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Leasing Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leasing Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 z-10">LKR</span>
                    <Input
                      type="text"
                      value={leasingAmount}
                      onChange={(e) => setLeasingAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      className="pl-12"
                    />
                  </div>
                </div>

                {/* Leasing Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leasing period
                  </label>
                  <Select value={leasingPeriod} onValueChange={setLeasingPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                      <SelectItem value="48">48 months</SelectItem>
                      <SelectItem value="60">60 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest rate
                  </label>
                  <Input
                    type="text"
                    value={`${interestRate}%`}
                    readOnly
                    className="bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Monthly Amount Result */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Monthly amount</p>
                  <p className="text-3xl font-bold text-gray-900">
                    Rs. {calculateMonthlyAmount().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Vehicles Section */}
      <div className="bg-white  ">
        <div className="max-w-7xl border rounded-b-[15px]  mx-auto p-6 mb-12">
          <h2 className="text-[20px]  font-semibold text-gray-900 mb-8">
            Related Vehicles from {vehicle.brand.name}
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            {relatedVehicles.length > 0 ? (
              relatedVehicles.map((relatedVehicle) => (
                <RelatedVehicleCard key={relatedVehicle.id} vehicle={relatedVehicle} />
              ))
            ) : (
              <div className="w-full text-center py-12">
                <p className="text-gray-500 text-lg mb-2">
                  No other {vehicle.brand.name} vehicles available at the moment
                </p>
                <p className="text-gray-400 text-sm">
                  Check back soon for more vehicles from this brand
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
