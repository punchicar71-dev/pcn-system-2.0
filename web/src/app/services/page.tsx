import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CircleCheck } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div>


      {/* Hero Section */}
       <section 
        className="relative h-[280px] sm:h-[400px] md:h-[400px] lg:h-[450px] flex items-center overflow-hidden"
        style={{
          backgroundImage: "url('/service_page.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Content - Left Aligned */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-4 xl:px-0 flex justify-center md:justify-start">
          <div className="text-left text-black max-w-xl mt-12 sm:mt-16 md:mt-20 lg:mt-[100px]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] mb-4 font-bold tracking-tight font-sinhala">
              මාලඹේ පුංචි කාර් නිවස
            </h1>
            {/* Subheading - Red */}
              <h2 className="text-xl sm:text-2xl md:text-[26px] lg:text-[28px] font-bold mb-4 sm:mb-6 lg:mb-8 text-[#E4002B] font-sinhala">
                වාහන උද්‍යානය
              </h2>
            <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 font-sinhala leading-relaxed">
              අප විසින් අපගේ සේවාදයකයින් හට ලබාදෙන සේවාවන් <br className="hidden sm:block" />
              සියල්ල පහතින් දැක්වේ.
            </p>
            <p className="text-[16px] md:text-[18px] text-gray-700">
                  Open Everyday! <span className="font-semibold text-black ml-2">09:00AM – 06:00PM</span>
                </p>
            
          </div>
        </div>
      </section>



      {/* Buy & Sell Vehicle Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 xl:px-0">
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


        <section className="pb-12 px-4 sm:px-6 lg:px-4 xl:px-0 gap-y-12 flex flex-col lg:px-28 bg-white">

        <div className="bg-gray-100 max-w-7xl mx-auto p-6 md:p-8 rounded-2xl">
          <h2 className="text-[28px] md:text-[28px] font-semibold text-gray-900 mb-6 font-sinhala">
            ස්කෑනින් සේවාව
          </h2>
          <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 mb-6 font-sinhala">
            දැන් ඉස්සර වගේ නෙවෙයි. සියලුම වාහන පාලනය වෙන්නේ පරිගණකයක් මගින්. එම පද්ධතියේ දෝෂ තිබු‍ණොත් වාහනය අරන් හැමදාම වියදම් කරන්න තමයි වෙන්නෙ. එයා බෑග්ස්, ඒබීඑස් සෙන්සර්ස්, විද්‍යුත් පරිපථය මේ සියල්ලම ස්කෑන් පරික්ෂාවේදි සියුම්ව සුපරික්ෂණයට ලක් වෙනවා. වාහනයේ ස්කෑන් පරික්ෂාව පිළිබද විද්‍යුත් සටහන් ඔබ අතටම ලැබෙනවා.
          </p>
          
        </div>

        <div className="bg-gray-100 max-w-7xl  mx-auto p-6 md:p-8 rounded-2xl">
          <h2 className="text-[28px] md:text-[28px] font-semibold text-gray-900 mb-6 font-sinhala">
            වාහනය ඔසවා පරික්ෂාව
          </h2>
          <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 mb-6 font-sinhala">
            ඉස්සර අපි ගියේ හැටට. දැන් අපේ වේගය සීයටත් එහා. ඉතින් හයියෙන් යන්න නම් හයිවේ යන්න නම් තමන් ගන්නා වාහනයේ චැසි පරික්ෂාව කරගන්න ඕනෑ. ඒ සදහා වාහනයක හොයිස්ට් මගින් ඔසවා පරික්ෂාව කෙරෙනවා. ඔබ ගන්නා වාහනයේ චැසිය අනතුරුවලට ලක්වෙලාද? චැසිය ඇදවෙලාද? අලුත්වැඩියා කරලද? පාහලාද? දිරලද? ඔයිල් ලීක් තිබෙනවාද? සයිලන්සරය බ්රේක් නළ පද්ධතිය, සම්ප් එක, ඉන්ධන ටැංකිය ආදියෙහි පෑස්සීම්, අනතුරු බිදිම්, තැලිම්, දිරුම් තිබෙනවාද? සියල්ල දැකිය හැක්කේ වාහනය ඔසවා බැලීමෙන්ම පමණයි.
          </p> 
        </div>


        <div className="bg-gray-100 max-w-7xl mx-auto p-6 md:p-8 rounded-2xl">
          <h2 className="text-[28px] md:text-[28px] font-semibold text-gray-900 mb-6 font-sinhala">
            හයිබ්‍රිඩ් පරික්ෂාව
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                මෙම වාහනය ගන්නා විට ඔබට පුංචි කාර් නිවසේදීම AUTO MIRAJ සමාගමේ වාහන පරීක්ෂණ ඒකකය මගින් වාහනය සම්පුර්ණයෙන්ම පරීක්ෂා කර අංග සම්පුර්ණ තත්ව පරීක්ෂණ වාර්තාවක් ලබා ගත හැකිය.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                වාහනය ගැනීමට ඔබ සුදානම් නම් මෙම වාහනයේ හිමිකරු සමග ඔබට පුංචි කාර් නිවසේදී කෙලින්ම දුරකතනයෙන් ගනුදෙනු කතා කරගත හැකිය.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                වාහනයේ ලියවිලිවල නිරවද්‍යතාව අප කාර්ය මණ්ඩලය මගින් තාක්ෂණික උපකරණද භාවිතයෙන් පරීක්ෂා කර දෙනු ලැබේ.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                ලීසිං පහසුකම් සඳහා LB FINANCE, SINGER FINANCE, MERCANTILE INVESTMENT, PEOPLES LEASING යන දිවයිනේ ජනප්‍රිය ලීසිං සමාගම් කාර්යාල පුංචි කාර් නිවස වාහන උද්‍යාන පරිශ්‍රයේම පිහිටුවා ඇත.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                ඔබ ගන්න වාහනයට LABOUR FREE SERVICE 3ක් හිමි වේ.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                තෝරා ගැනීමට වාහන 400ක් එකම උද්‍යානයක.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                වැලිවේෂන් සහ රක්ෂණ සේවාවන් ද පුංචි කාර් නිවසේදීම
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                වාහන පාකින්, ආපන ශාලා, ප්‍රධාන පාර දක්වා නොමිලේ ශට්ල් සේවා ආදී සියල්ලෙන් සපිරි සිරිලක වාහන උද්‍යානය.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                තාක්ෂණික උපකරණ මගින් ලියකියවිලි පරික්ෂාව.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                ලීසිං සමාගම් හතරක් උද්‍යාන භුමිය තුළම.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                රක්ෂණ සේවා. වැලි‍වේෂන් සේවා.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                ආපන ශාලාව. පාරිභෝගික විවේකාගාරය.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CircleCheck className="text-green-600 h-6 w-6 flex-shrink-0 mt-0.5" />
              <span className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 font-sinhala">
                ප්‍රධාන මාර්ගය දක්වා නොමිලේ ෂට්ල් සේවා.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white border max-w-7xl  mx-auto p-6 md:p-8 rounded-2xl">
          <h2 className="text-[28px] md:text-[28px] font-semibold text-gray-900 mb-6 font-sinhala">
            ලීසිං සමාගම් 4ක් උද්‍යානය තුළම.
          </h2>
          <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 mb-6 font-sinhala">
            මෙම සියලු ලිසිං සමාගම්වල ශාඛා කාර්යාල දවස පුරාම පුංචි කාර් නිවස වාහන උද්‍යාන භූමිය තුළ විවෘතයි. වාහන උද්‍යානය තුළ දී ලීසිං හිතමිතුරන් ඔබ හමුවී ඔබට අවශ්‍ය සහාය ලබා දෙනු ඇති.
          </p> 


        <div className=' flex gap-8 items-center flex-wrap'>
          <Image
                  src="/lg1.png"
                  alt="Buy Vehicle"
                  width={80}
                  height={80}
                  className=" h-20 w-auto"
                />
                <Image
                  src="/lg2.png"
                  alt="Buy Vehicle"
                  width={80}
                  height={80}
                  className=" h-12 w-auto"
                />
                <Image
                  src="/lg3.png"
                  alt="Buy Vehicle"
                  width={80}
                  height={80}
                  className=" h-12 w-auto"
                />
                <Image
                  src="/lg4.png"
                  alt="Buy Vehicle"
                  width={80}
                  height={80}
                  className=" h-16 w-auto"
                />


              </div>



        </div>


        </section>




    </div>
  );
}
