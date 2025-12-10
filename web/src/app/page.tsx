'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import BrandLogoMarquee from '@/components/BrandLogoMarquee';
import LatestVehicleCard from '@/components/LatestVehicleCard';
import { VehicleCardData } from '@/lib/types';
import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function HomePage() {
  const [latestVehicles, setLatestVehicles] = useState<VehicleCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?limit=4&sortBy=latest');
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        const data = await response.json();
        setLatestVehicles(data.vehicles || []);
      } catch (error) {
        console.error('Error fetching latest vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestVehicles();
  }, []);
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-full min-h-[600px]  w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/hero_home_image.png"
            alt="Punchi Car Niwasa Vehicle Park"
            fill
            className="object-cover object-center md:object-center object-left"
            priority
            quality={100}
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full w-full">
          <div className="max-w-7xl mx-auto px-6 md:px-4 flex h-full min-h-[600px] items-center justify-center md:justify-start mt-[50px]">
            <div className="max-w-2xl text-center md:text-left">
              {/* Main Heading - Sinhala */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight font-sinhala">
                <span className="text-black">මාලඹේ පුංචි කාර් නිවස</span>
              </h1>
              
              {/* Subheading - Red */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-[#E4002B] font-sinhala">
                වාහන උද්‍යානය
              </h2>

              {/* Description Text */}
              <div className="space-y-4 mb-8 text-black font-sinhala">
                <p className="text-[16px] md:text-[18px] leading-relaxed">
                  තෝරා ගැනිමට වාහන 400ක් එකම උද්‍යානයක. මහ පාරෙන් මීටර් 600ක් ඇතුළත
                  මනරම් හරිත කලාපයක පිහිටි දැවැන්ත වාහන උද්‍යානය.
                </p>
                <p className="text-[16px] md:text-md leading-relaxed font-medium">
                  මාලඹේ පුංචි කාර් නිවස, ස්ලිට් කැම්පස් අසල, ඉසුරුපුර පාර, මාලඹේ.
                </p>
              </div>

              {/* Opening Hours */}
              <div className="mb-8">
                <p className="text-[16px] md:text-[18px] text-gray-700">
                  Open Everyday! <span className="font-semibold text-black ml-2">09:00AM – 06:00PM</span>
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex justify-center md:justify-start flex-wrap gap-4">
                <Button 
                  asChild
                  className="bg-[#E4002B] text-white px-8 py-6  rounded-lg font-semibold text-[16px] hover:bg-[#C4001B] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Link href="/vehicles">
                    View Vehicles
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="bg-white text-black px-8 py-6  rounded-lg font-semibold text-[16px] hover:bg-gray-100 transition-all duration-300  hover:shadow-xl border border-gray-300"
                >
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className='max-w-7xl mx-auto'>
        {/* Brand Logo Marquee */}
        <BrandLogoMarquee />
      </div>

      {/* Latest Vehicles Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-[24px] md:text-[24px] font-semibold text-gray-900">
             Showroom New Arrivals
            </h2>
            <Link href="/vehicles">
              <Button 
                variant="outline" 
                className=" border border-red-300 text-red-500 hover:bg-[#E4002B] hover:text-white px-6 py-5 rounded-lg font-semibold text-[16px] transition-all duration-300"
              >
                View All
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Vehicle Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-[12px] border border-gray-300 overflow-hidden">
                  <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                  <div className="">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : latestVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestVehicles.map((vehicle) => (
                <LatestVehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No vehicles available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section with Video */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Side - Text Content (40%) */}
            <div className="w-full lg:w-[40%] space-y-6 font-sinhala">
              <h2 className="text-[28px] md:text-[32px] font-bold text-gray-900 leading-tight">
                සිරිලක වාහන ඉසුරු පුරය.
              </h2>

              <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700">
                පුංචි කාර් නිවස යනු ලංකාවේ එකම තැනක වාහන අලුත්ම 400කට ආසන්න සංග්‍රහයක් තිබෙන අයුරින් විශාලතම වාහන එකතුවයි.

සියලු ගනුදෙනු ස්පීකර් ෆෝන් හරහා විවෘතව සිද්ධ වන අතර, ගැණුම්කරුටද එය සෘජුව ඇසීමට හැක. අත්තිකාරම් මුදල ගත් පසුව එම මිල තත්‍ක්ෂණිකව සනාථ කර, වාහනයේ හිමිකරුට ස්වයංක්‍රීය SMS පණිවිඩයක් යවයි.
              </p>

              <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700">
                වාහනය ගැණුම්කරු වෙත ලැබෙන්නේ එම වාහනයේ අයිතිකරුගේම මිලටයි. ඉතින් 
                පුංචි කාර් නිවසේ වාහනවල මිලත් අඩුයි.
              </p>

              <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-medium">
               <span className='font-bold text-black'>පුංචි කාර් නිවස.</span> ලංකාවේ සුවිශාලතම වාහන එකතුව....
              </p>
            </div>

            {/* Right Side - Video (60%) */}
            <div className="w-full lg:w-[60%]">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-lg"
                  src="https://www.youtube.com/embed/Q0bq5oPjEvc"
                  title="Punchi Car Niwasa"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buy & Sell Vehicle Section */}
      <section className="pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Buy Vehicle Card (50%) */}
            <div className="bg-gray-100 rounded-2xl p-8 lg:p-10">
              {/* Icon */}
              <div className="mb-6">
                <Image
                  src="/buy_vehicle.png"
                  alt="Buy Vehicle"
                  width={80}
                  height={80}
                  className=" w-20"
                />
              </div>

              {/* Title */}
              <h2 className="text-[28px] md:text-[28px] font-semibold text-gray-900 mb-6 font-sinhala">
                වාහනයක් ගන්නද?
              </h2>

              {/* Description */}
              <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 mb-8 font-sinhala">
                අපේ වාහන අංගනයට පිවිසෙන්න පහත click කරන්න. තෝරා ගැනිමට වාහන 400කට 
                ආසන්න ප්‍රමාණයක් දැන් ඔබ ඉදිරියේ. මෙම සියලුම වාහන අප වාහන අංගනයේ මේ 
                මොහොතේ ප්‍රදර්ශනය කෙරෙනවා. මෙම සියලුම වාහන පරික්ෂාවකින් පසුව තෝරාගත් 
                හොදම වාහන පමණයි. පිවිසෙන්න.
              </p>

              {/* Button */}
              <Button 
                asChild
                className="bg-[#E4002B] text-white px-8 py-6 rounded-lg font-semibold text-[16px] hover:bg-[#C4001B] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Link href="/vehicles">
                  Available Vehicles
                </Link>
              </Button>
            </div>

            {/* Right Side - Sell Vehicle Card (50%) */}
            <div className="bg-gray-100 rounded-2xl p-8 lg:p-10">
              {/* Icon */}
              <div className="mb-6">
                <Image
                  src="/sell_vehicle.png"
                  alt="Sell Vehicle"
                  width={80}
                  height={80}
                  className="object-contain "
                />
              </div>

              {/* Title */}
              <h2 className="text-[28px] md:text-[28px] font-semibold text-gray-900 mb-6 font-sinhala">
                වාහනයක් විකුණන්නද?
              </h2>

              {/* Description */}
              <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 mb-6 font-sinhala">
                ලියාපදිංචි සහතිකයේ පිටපත් දෙකක් සමග වාහනය රැගෙන එන්න පුංචි කාර් නිවසට.
                වාහනය හොඳ නම් ලියකියවිලිත් නිරවුල් නම් අපි ඔබේ වාහනය විකිණීමට භාර ගන්නවා.
              </p>

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <p className="text-[16px] md:text-[18px] text-gray-900">
                  <span className="font-normal text-gray-700 pr-2">Hotline : </span>
                  <span className="font-semibold">0112 413 865</span>
                  <span className="mx-2">|</span>
                  <span className="font-semibold">0112 413 866</span>
                </p>

                <p className="text-[16px] md:text-[18px] text-gray-900">
                  <span className="font-normal text-gray-700 pr-2">Open Everyday! </span>
                  <span className="font-semibold">09:00AM – 06:00PM</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 400 Vehicles Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left Side - Text Content (50%) */}
            <div className="w-full lg:w-[50%] space-y-6 font-sinhala">
              <h2 className="text-[28px] md:text-[28px] font-bold text-gray-900 leading-tight">
                තෝරා ගැනිමට වාහන 400ක් එකම උද්‍යානයක.
              </h2>

              <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700">
                වාහනයක් ගන්නකොට වාහනය වගේම ලියකියවිලි ගැනත් හොඳටම බලන්න ඕනෑ. ව්‍යාජ 
                ලියකියවිලි සහිත වාහනයකට අහුවුනොත් ඔක්කොම ඉවරයි. ඉතින් වාහනයක 
                ලියකියවිලි බලන්න ඕනෑ මනා දැනුමක් ඇතිවයි.
              </p>

              <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700">
                ලියාපදිංචි සහතිකය දිහා බැලුවට එය නිරවුල් එකක්දැයි කියන්න බැහැ. පුංචි කාර් 
                නිවස වාහන උද්‍යානයේදි මෙම ලියකියවිලි පරික්ෂාව නිවැරදිවම කරගන්න පුලුවන්. 
                ඒ සදහා තාක්ෂණික උපකරණත් ආධාර කරන්නවා.
              </p>
            </div>

            {/* Right Side - Image (50%) */}
            <div className="w-full lg:w-[50%]">
              <div className="relative w-full h-[300px] md:h-[300px] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/showroom_image.png"
                  alt="Punchi Car Niwasa Showroom"
                  fill
                  className="object-cover"
                  quality={100}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
