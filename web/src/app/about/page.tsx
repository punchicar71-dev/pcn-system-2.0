import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

    {/* Hero Section */}
       <section 
        className="relative h-[280px] sm:h-[380px] md:h-[400px] lg:h-[450px] flex items-center overflow-hidden bg-cover bg-no-repeat bg-[position:left] md:bg-center"
        style={{
          backgroundImage: "url('/about_hero.png')",
        }}
      >
        {/* Content - Center on mobile, Left on desktop */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-4 xl:px-0">
          <div className="text-center md:text-left text-black max-w-xl mt-12 sm:mt-16 md:mt-20 lg:mt-[100px] mx-auto md:mx-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] mb-4 font-bold tracking-tight font-sinhala">
              මාලඹේ පුංචි කාර් නිවස
            </h1>
            {/* Subheading - Red */}
              <h2 className="text-xl sm:text-2xl md:text-[26px] lg:text-[28px] font-bold mb-4 sm:mb-6 lg:mb-8 text-[#E4002B] font-sinhala">
                වාහන උද්‍යානය
              </h2>
            <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 font-sinhala leading-relaxed">
              තෝරා ගැනිමට වාහන 400ක් එකම උද්‍යානයක. මහ පාරෙන් මීටර් 600ක්

               ඇතුළත මනරම් හරිත කලාපයක පිහිටි දැවැන්ත වාහන උද්‍යානය.
            </p>
            
          </div>
        </div>
      </section>

        {/* About Section with Video */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 xl:px-0">
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


        {/* 400 Vehicles Content Section */}
              <section className="pb-12 bg-white  px-4 sm:px-6 lg:px-4 xl:px-0">
                <div className="max-w-7xl mx-auto p-8 rounded-2xl bg-gray-100 ">
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

        <div className="bg-gray-100 max-w-7xl  mx-auto p-6 md:p-8 mb-12 rounded-2xl">
          <h2 className="text-[28px] md:text-[28px] font-semibold text-gray-900 mb-6 font-sinhala">
            පුංචි කාර් නිවස ගැන මේ දේවල් දන්නවාද?
          </h2>
          <p className="text-[16px] md:text-[16px] leading-relaxed text-gray-700 mb-6 font-sinhala">
            පුංචි කාර් නිවස ආරම්භ වූයේ වාහන 3කිනි. අද පුංචි කාර් නිවස වාහන 400ක දැවැන්ත වාහන උද්‍යානයකි.<br/><br/>

13 අවාසනාවන්ත අංකයක් යැයි කියයි. විශේෂයෙන්ම වාහනවල අංක එකතුව 13 වූ විට විකුණා ගැනීම ද අපහසුය. මේ 13 අවාසනාවන්ත යැයි ජනතාව කොතරම් විශ්වාස කළේ ද යත් එම බලපෑම නිසා මෝටර් ප‍්‍රවාහන දෙපාර්තමේන්තුව මගින් 13 අංක එකතුව එන ලෙස වාහන අංක නිකුත් කිරීම ද අත්හිටුවිය. ඒ අනුව 18 ශ‍්‍රී වලින් පසුව අංක එකතුව 13 එන ලෙස වාහන අංක ලබා දීම රජය මගින් ම නවතා දමන ලදී. එහෙත් අපි සියල්ලට අභියෝග කළෙමු. පුංචි කාර් නිවසේ පළමු වාහනයේ අංකවල එකතුව 13 විය. 12 ශ‍්‍රී 0913 සුසුකි ජපන් මෝටර් රථය අපගේ පළමු වාහනයයි. රටටම අවාසනාවන්ත වූ 13 අපි ජය ගතිමු.<br/><br/>

ලෝකයේ සියලූ වාහන අලෙවි ප‍්‍රදර්ශනාගාර පවත්වාගෙන යන්නේ ජනාකීර්ණ වීථියකට මුහුණ ලායි. වාහන අලෙවි ප‍්‍රදර්ශනාගාර ජනතාවගේ ඇස ගැටෙන තැන්වල තිබිය යුතුය. වාහන අලෙවි මධ්‍යස්ථානයක් ජනතාවගෙන් හුදෙකලා ප‍්‍රදේශයක පවත්වාගෙන යා හැකිද? අපි එයට ද අභියෝග කළෙමු. පුංචි කාර් නිවස වාහන උද්‍යානය පිහිටා තිබෙන්නේ ජනතාවගෙන් හුදෙකලා වූල ප‍්‍රධාන මාර්ගයේ සිට මීටර් 600ක් ඇතුළතට යා යුතු හරිත කලාපයකයි. ලොව කාටත් කළ නොහැකි වූ දේ අපි කළෙමු. අද ලංකාවේ වාහනයක් මිල දී ගැනීමට හෝ තම වාහනය විකිණීමට සිතන ඕනෑම කෙනෙක් පුංචි කාර් නිවස වාහන උද්‍යානයට පැමිණ මිස තීරණ ගන්නේ නැත.<br/><br/>

පුංචි කාර් නිවසට විකිණීමට භාර දීමට එන වාහන සැම එකක්ම අපි භාර නොගනිමු. ඒවා පරීක්‍ෂාවකට ලක් කර ගැටළු රහිත හොඳ වාහන පමණක්ම අපගේ පාරිභෝගික ජනතාව වෙනුවෙන් පුංචි කාර් නිවසට භාර ගනිමු.<br/><br/>

වාහනයක් මිල දී ගැනීමට සූදානම් වන විට එම වාහනය සම්පූර්ණ ස්කෑන් පරීක්‍ෂාවකට ලක්කොට එම වාර්තාව ද පාරිභෝගිකයාට ලබා දෙන අතර කිසියම් ගැටළුවක් ඇත්නම් වාහනය අපගේ පාරිභෝගිකයාට ලබා නොදී අයිතිකරු වෙත ආපසු යවමු.<br/><br/>

හයිබ්‍රිඩ් වාහන ගන්නා විට හයිබ්‍රිඩ් බැටරි පරීක්‍ෂාව කරගත යුතුමය. එම සේවාව පුංචි කාර් නිවසේ දී ලබා දෙන්නේ නොමිලේමය.<br/><br/>

ඕනෑම වාහනයක් මතුපිටින් දකින විට ඉතා හොඳය. වාහන ගමන් කරන්නේ මහා මාර්ගයේයි. එබැවින් බැලිය යුතු දේ තිබෙන්නේ වාහනයේ මතුපිට නොව යටය. එබැවින් අපි වාහනයක් ගන්නා විට එම වාහනය හොයිස්ට් යන්ත්‍ර මගින් ඔසවා වාහනයේ යට තත්ත්වය බැලීමට අවස්ථාව ලබා දෙන්නේ ද නොමිලේමය. එහිදී චැසිය ඇදවෙලාදල දිරලද, අනතුරට ලක්වෙලාද අලූත්වැඩියා කරලද, සම්ප්, ඉන්ධන ටැංකිය සයිලන්සර්, බ්රේක් බට ආදියෙහි ඩැමේජ් තිබෙනවාද? එබීම්, තැලීම්, පෑස්සුම් තිබෙනවාද? ඔයිල් ලීක් තිබෙනවාද? චැසි හානි තිබෙනවාද? මේ සියල්ල දැක ගැනීමට වාහනයේ ගැණුම්කරුවාට හැකියාව ලැබේ. මෙම සේවය ද ලැබෙන්නේ නොමිලේය.<br/><br/>

මිල දී ගන්නා සෑම වාහනයකටම බොරලැස්ගමුව අබිරාමි ඔටෝ කෙයා ආයතනයේ දී LABOUR FREE සේවා වාර 3ක් ද හිමිවේ.<br/><br/>

මෙම සේවාවන් සඳහා කිසිදු අතිරේක ගාස්තුවක් ද අය නොකෙරේ.<br/><br/>

තෝරා ගැනීමට වාහන 400කට ආසන්න ප‍්‍රමාණයක් එකම තැනක ඇති ලංකාවේ එකම තැනයි පුංචි කාර් නිවස වාහන උද්‍යානය.<br/><br/>

වාහන ගනුදෙනු කතා කෙරෙන්නේ ස්පීකර් ෆෝන් ආධාරයෙන් ගැණුම්කරුට ද ඇසෙන ලෙසයි. ඉතින් ගනුදෙනුව මුළුමනින්ම විවෘතය.<br/><br/>

වාහනයකට අත්තිකාරම් මුදලක් ගත් සැණින් එම මිල සනාථ කර වාහනයේ හිමිකරුගේ දුරකථනයට එස්එම්එස් පණිවිඩයක් යන්නේ අපගේ තොරතුරු ජාලය හරහා ස්වයංක‍්‍රීයවමය.<br/><br/>

වාහනයක් විකිණීමෙන් පසු අප ගාස්තු අය කරන්නේ වාහනයේ හිමිකරුගෙන් පමණි. ලක්‍ෂ 15 ට අඩු මෝටර් කාර් සඳහා පමණක් රු15000 කි. ලක්‍ෂ 15 සිට ලක්‍ෂ 50 දක්වා වාහන සඳහා රු20000 කි. ලක්ෂ 50 සිට 100 දක්වා වාහන සඳහා රු.25000 කි. ලක්‍ෂ 100 ට වැඩි වාහන සඳහා රු.100000 කි. මෙම අය කිරීම සිදු වන්නේ වහනය විකිණුනහොත් පමණි. වෙනත් කිසිඳු ගෙවීමක් කල යුතු නැත.<br/><br/>

වාහනය ගැණුම්කරු වෙත ලැබෙන්නේ එම වාහනයේ අයිතිකරුගේම මිලටයි. ඉතින් පුංචි කාර් නිවසේ වාහනවල මිලත් අඩුයි.
          </p> 
        </div>




      
    </div>
  );
}
