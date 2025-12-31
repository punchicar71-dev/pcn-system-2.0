'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, CircleCheck, House  } from 'lucide-react';
import PanoramaViewer from '@/components/ui/panorama-viewer';
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
        // Add cache-busting timestamp to prevent stale data
        const response = await fetch(`/api/vehicles/${vehicleId}?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        
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
        const response = await fetch(`/api/vehicles?brand=${vehicle.brand.id}&limit=6&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        
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

    <section 
        className="relative h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] flex items-center overflow-hidden"
        style={{
          backgroundImage: "url('/vehicle_hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat'
        }}
      >   </section>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 xl:px-0 -mt-32 sm:-mt-40 md:-mt-44 lg:-mt-[200px] xl:-mt-[200px] relative z-10 pt-6 pb-4">
        <Breadcrumb>
          <BreadcrumbList className="text-gray-700 text-xs sm:text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-gray-600 hover:text-gray-900 flex gap-1 sm:gap-2 items-center"><House className='h-3 w-3 sm:h-4 sm:w-4' /><span className="hidden sm:inline">Home</span></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400" />
            <BreadcrumbItem>
              <BreadcrumbLink href="/vehicles" className="text-gray-600 hover:text-gray-900 hidden sm:inline">All Vehicles</BreadcrumbLink>
              <BreadcrumbLink href="/vehicles" className="text-gray-600 hover:text-gray-900 sm:hidden">Vehicles</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-none">
                {vehicle.brand.name} {vehicle.model.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Two Column Flex Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 xl:px-0 relative z-10">
        <div className="flex bg-white rounded-t-[12px] border flex-col lg:flex-row gap-0 sm:gap-2">
            {/* Left Column - Gallery */}
            <div className="flex-1 p-2 sm:p-2">
              {/* Main Image with Overlay Buttons */}
              <div className="relative">
                {viewMode === 'gallery' && vehicleImages.length > 0 ? (
                  <img
                    src={vehicleImages[currentImageIndex]?.image_url}
                    alt={`${vehicle.brand.name} ${vehicle.model.name}`}
                    className="w-full h-[240px] sm:h-[300px] md:h-[350px] lg:h-[400px] object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-car.jpg';
                    }}
                  />
                ) : viewMode === '360' && vehicle.image_360 && vehicle.image_360.length > 0 ? (
                  <div className="h-[240px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg overflow-hidden">
                    <PanoramaViewer 
                      imageUrl={vehicle.image_360[0].image_url}
                      height="100%"
                      className="rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[240px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No images available</span>
                  </div>
                )}
                
                {/* Overlay Buttons */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white bg-opacity-25 rounded p-0.5 sm:p-1 flex gap-1 sm:gap-2">
                  
                  <button 
                    onClick={() => setViewMode('gallery')}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 bg-black/70 hover:bg-black/80 text-white text-xs sm:text-sm font-medium rounded transition ${
                      viewMode === 'gallery' ? 'ring-2 ring-white' : ''
                    }`}
                  >
                    Gallery
                  </button>
                  <button 
                    onClick={() => setViewMode('360')}
                    disabled={!vehicle.image_360 || vehicle.image_360.length === 0}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 bg-black/70 hover:bg-black/80 text-white text-xs sm:text-sm font-medium rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      viewMode === '360' ? 'ring-2 ring-white' : ''
                    }`}
                  >
                    <span className="hidden sm:inline">360° View</span>
                    <span className="sm:hidden">360°</span>
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {vehicleImages.length > 1 && viewMode === 'gallery' && (
                <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
                  {vehicleImages.slice(0, 3).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-1 h-16 sm:h-20 md:h-24 rounded-lg overflow-hidden border-2 transition ${
                        currentImageIndex === index ? 'border-gray-900' : 'border-transparent'
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
            <div className="flex-1 p-4 sm:p-6 bg-white space-y-4 sm:space-y-6 rounded-lg">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-semibold text-gray-900 mt-2 sm:mt-4">
                {vehicle.brand.name} {vehicle.model.name} NXT
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-[24px] text-gray-600 mt-1">{vehicle.manufacture_year}</p>
              
              <div className="my-4 sm:my-6">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
                  {formatPrice(vehicle.selling_amount)}
                </p>
              </div>

              {/* Specs Flex 2x4 */}
              <div className="border-t border-gray-200 pt-4 sm:pt-8 pb-4 sm:pb-8">
                {/* Mobile - Clean Single Column View */}
                <div className="flex flex-col gap-3  lg:hidden">
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Body :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.body_type}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Engine :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.engine_capacity || 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Year :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.manufacture_year}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Country :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.country.name}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Fuel type :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.fuel_type}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Transmission :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.transmission}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Exterior Color :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.exterior_color || 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Registered :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.registered_year || vehicle.manufacture_year}</p>
                  </div>
                </div>

                {/* Desktop - Two Column Grid View */}
                <div className="sm:hidden  lg:grid lg:grid-cols-2  gap-x-16 gap-y-4">
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Body :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.body_type}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Fuel type :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.fuel_type}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Engine :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.engine_capacity || 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Transmission :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.transmission}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Year :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.manufacture_year}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Exterior Color :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.exterior_color || 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Country :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.country.name}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-base text-gray-600 w-[140px]">Registered :</p>
                    <p className="text-base font-semibold text-gray-900">{vehicle.registered_year || vehicle.manufacture_year}</p>
                  </div>
                </div>
              </div>

              {/* Contact Link */}
              <p className="text-base sm:text-lg md:text-[20px]">
                Get more info : <a href="tel:0117275275" className="text-green-600 font-semibold mt-4 sm:mt-6 hover:underline">0117 275 275</a> 
              </p>
            </div>
          </div>
        </div>

      {/* Middle Content Area */}
      <div className="max-w-7xl border border-t-0 mx-auto px-4 sm:px-6 lg:px-4 xl:px-0 mb-8 lg:mb-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - 70% - Features & Service */}
          <div className="flex-1 lg:border-r lg:w-[70%]">
            {/* Extra Features */}
            {(vehicle.options.length > 0 || vehicle.custom_options.length > 0) && (
              <div className="p-4 sm:p-6 border-b">
                <h2 className="text-lg sm:text-xl md:text-[20px] font-semibold text-gray-900 mb-4 sm:mb-6">Extra Features</h2>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {vehicle.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2 w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)]">
                      <CircleCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-xs sm:text-sm">{option.name}</span>
                    </div>
                    
                  ))}
                  {vehicle.custom_options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2 w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)]">
                      <CircleCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-xs sm:text-sm">{option.option_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Our Service */}
            <div className="bg-white rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl md:text-[20px] font-semibold text-gray-900 mb-3 sm:mb-4">Our Service</h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-[16px] text-gray-700 leading-relaxed">
                මෙම වාහනය ගන්නා විට ඔබට පුංචි කාර් නිවසේදීම AUTO MIRAJ සමාගමේ වාහන පරීක්ෂණ ඒකකය මගින් වාහනය සම්පුර්ණයෙන්ම පරීක්ෂා කර අංග සම්පුර්ණ තත්ව පරීක්ෂණ වාර්තාවක් ලබා ගත හැකිය.<br/><br/>
වාහනය ගැනීමට ඔබ සුදානම් නම් මෙම වාහනයේ හිමිකරු සමග ඔබට පුංචි කාර් නිවසේදී කෙලින්ම දුරකතනයෙන් ගනුදෙනු කතා කරගත හැකිය.<br/><br/>
වාහනයේ ලියවිලිවල නිරවද්‍යතාව අප කාර්ය මණ්ඩලය මගින් තාක්ෂණික උපකරණද භාවිතයෙන් පරීක්ෂා කර දෙනු ලැබේ.<br/><br/>
ලීසිං පහසුකම් සඳහා LB FINANCE, SINGER FINANCE, MERCANTILE INVESTMENT, PEOPLES LEASING යන දිවයිනේ ජනප්‍රිය ලීසිං සමාගම් කාර්යාල පුංචි කාර් නිවස වාහන උද්‍යාන පරිශ්‍රයේම පිහිටුවා ඇත.<br/><br/>
ඔබ ගන්න වාහනයට LABOUR FREE SERVICE 3ක් හිමි වේ.<br/><br/>
තෝරා ගැනීමට වාහන 400ක් එකම උද්‍යානයක.<br/><br/>
වැලිවේෂන් සහ රක්ෂණ සේවාවන් ද පුංචි කාර් නිවසේදීම.<br/><br/>
වාහන පාකින්, ආපන ශාලා, ප්‍රධාන පාර දක්වා නොමිලේ ශට්ල් සේවා ආදී සියල්ලෙන් සපිරි සිරිලක වාහන උද්‍යානය.<br/><br/>
   <Separator className="my-4" />  
   <p className='text-base sm:text-lg font-bold'> ගමන් මග</p>
    <br/>

අධිවේගී මාර්ගයේ මාතර කොට්ටාව දෙසින් නම් කොතලාවල පිටවීමෙන් බත්තරමුල්ල දෙසට එන්න. කිලෝමීටර් 1යි.
කඩවත දෙසින් නම් කඩුවෙලින් පිටවී කඩුවෙල නගරය හරහා මාලඹේ දෙසට එන්න. කඩුවෙල කොල්ලුපිටිය 177 බස් මාර්ගය. <br/><br/>

SLIIT කැම්පස් අසලින් ඉසුරුපුර පාරේ මීටර් 600ක් එන්න.<br/><br/>

පුංචි කාර් නිවස වාහන උද්‍යානය, ඉසුරුපුර පාර, මාලඹේ.<br/><br/>

Telephone : <a href="tel:0117275275" className='font-bold text-green-600 hover:underline'>0117 275 275</a> | <a href="tel:0112413866" className='font-bold text-green-600 hover:underline'>0112 413 866</a>  <br/><br/> Email : <a href="mailto:sales@punchicar.lk" className='font-bold text-blue-600 hover:underline'>sales@punchicar.lk</a> 
                
              </div>
            </div>
          </div>

          {/* Right Column - 30% - Leasing Calculator */}
          <div className="lg:w-[30%]">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm lg:sticky lg:top-6">
              <h3 className="text-lg sm:text-xl md:text-[20px] font-semibold text-gray-900 mb-2">Leasing Calculate</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                Every vehicle 30% downpayment get in the leasing
              </p>

              <div className="space-y-3 sm:space-y-4">
                {/* Down Payment */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Down payment
                  </label>
                  <Select value={downPayment} onValueChange={setDownPayment}>
                    <SelectTrigger className="h-10 sm:h-11">
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Leasing Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 sm:top-3 text-xs sm:text-sm text-gray-500 ">LKR</span>
                    <Input
                      type="text"
                      value={leasingAmount}
                      onChange={(e) => setLeasingAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      className="pl-12 h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Leasing Period */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Leasing period
                  </label>
                  <Select value={leasingPeriod} onValueChange={setLeasingPeriod}>
                    <SelectTrigger className="h-10 sm:h-11">
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Interest rate
                  </label>
                  <Input
                    type="text"
                    value={`${interestRate}%`}
                    readOnly
                    className="bg-gray-50 text-gray-600 h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                {/* Monthly Amount Result */}
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Monthly amount</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Rs. {calculateMonthlyAmount().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Vehicles Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 xl:px-0 mb-8 sm:mb-12">
        <div className="border rounded-b-[15px] p-3 sm:p-4 md:p-6 bg-white">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Related Vehicles from {vehicle.brand.name}
          </h2>
          {relatedVehicles.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6">
              {relatedVehicles.map((relatedVehicle) => (
                <RelatedVehicleCard key={relatedVehicle.id} vehicle={relatedVehicle} />
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm sm:text-base md:text-lg mb-2 px-4">
                No other {vehicle.brand.name} vehicles available at the moment
              </p>
              <p className="text-gray-400 text-xs sm:text-sm px-4">
                Check back soon for more vehicles from this brand
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
