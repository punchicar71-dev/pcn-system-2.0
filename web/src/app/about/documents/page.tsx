import { Download } from 'lucide-react';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
  const documents = [
    {
      id: 'doc-1',
      title: 'මොටර් රථ ප්‍රවාහන ලියාපදිංචි කිරීමට හා සම්පාතක ලියකියවිලි',
      description: 'විකිණුම්කරුගේ කොටස විකිණුම්කරු විසින්මත්, ගැණුම්කරුගේ කොටස ගැණුම්කරු විසින්මත් ඔවුන්ගේ අත් අකුරින්ම පුරවා අත්සන් කිරීම මගින් මෙම ලේඛණවල නීතිමය සුරක‍ෂිතතාව වඩාත් ශක්තිමත් වනු ඇත. පුංචි කාර් නිවසේ තවත් මහජන සේවාවකි.',
      downloadUrl: '/documents/vehicle-registration.pdf'
    },
    {
      id: 'doc-2',
      title: 'අත්තිකාරම් ලබා ගැනීමේ ලිපිය',
      description: 'විකිණුම්කරුගේ කොටස විකිණුම්කරු විසින්මත්, ගැණුම්කරුගේ කොටස ගැණුම්කරු විසින්මත් ඔවුන්ගේ අත් අකුරින්ම පුරවා අත්සන් කිරීම මගින් මෙම ලේඛණවල නීතිමය සුරක‍ෂිතතාව වඩාත් ශක්තිමත් වනු ඇත. පුංචි කාර් නිවසේ තවත් මහජන සේවාවකි.',
      downloadUrl: '/documents/loan-document.pdf'
    },
    {
      id: 'doc-3',
      title: 'වික්‍රීමේ හා මිල දී ගැණීමේ ලිපිය',
      description: 'විකිණුම්කරුගේ කොටස විකිණුම්කරු විසින්මත්, ගැණුම්කරුගේ කොටස ගැණුම්කරු විසින්මත් ඔවුන්ගේ අත් අකුරින්ම පුරවා අත්සන් කිරීම මගින් මෙම ලේඛණවල නීතිමය සුරක‍ෂිතතාව වඩාත් ශක්තිමත් වනු ඇත. පුංචි කාර් නිවසේ තවත් මහජන සේවාවකි.',
      downloadUrl: '/documents/sale-purchase.pdf'
    },
    {
      id: 'doc-4',
      title: 'දිව්‍රෝධා කොමැත් ඔව්ට ලිපිය',
      description: 'විකිණුම්කරුගේ කොටස විකිණුම්කරු විසින්මත්, ගැණුම්කරුගේ කොටස ගැණුම්කරු විසින්මත් ඔවුන්ගේ අත් අකුරින්ම පුරවා අත්සන් කිරීම මගින් මෙම ලේඛණවල නීතිමය සුරක‍ෂිතතාව වඩාත් ශක්තිමත් වනු ඇත. පුංචි කාර් නිවසේ තවත් මහජන සේවාවකි.',
      downloadUrl: '/documents/dispute-resolution.pdf'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">



          {/* Hero Section */}
            <section className="relative h-96 md:h-72 lg:h-80 overflow-hidden">
                    <Image
                      src="/vehicle_page_hero.png"
                      alt="Contact Hero"
                      fill
                      className="object-cover w-full h-full"
                      priority
                    />
                    <div className="absolute inset-0 flex items-center pt-12 md:pt-16 lg:pt-20 justify-center px-4">
                      <div className="text-center  text-white">
                        <h1 className="text-2xl md:text-3xl max-w-[90%]  lg:w-[60%] mx-auto lg:text-[30px] font-semibold mb-2 md:mb-3 lg:mb-4">වාහන විකිණීමේදීත්, අත්තිකාරම් ගෙවීමේදීත් සකස් කරගත යුතු ලේඛණ මෙතැනින්
භාගත කරගත හැකියි.</h1>
                        <p className="text-sm md:text-base lg:text-[16px] font-base max-w-[90%]  lg:w-[80%] mx-auto">මෙය පුංචි කාර් නිවස මගින් නොමිලේ සපයනු ලබන මහජන සේවාවකි. ඔබ භාගත කරගන්නා ලේඛණවල අත්සන් තබන්නා විසින්ම දිනය ද ඔහුගේ අත්අකුරින්ම සටහන් කිරීම මගින් මෙම ලේඛණවල නීතිමය සුරක‍ෂිතතාව වඩාත් ශක්තිමත් වනු ඇත.
පුංචි කාර් නිවස - මහජනතාවගේ තැන.</p>
                      </div>
                    </div>
            </section>

      {/* Documents Section with Accordion */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800">
            Available Documents for Download
          </h2>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {documents.map((doc) => (
              <AccordionItem 
                key={doc.id} 
                value={doc.id}
                className="border border-gray-200 rounded-lg px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:no-underline py-6">
                  {doc.title}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6">
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {doc.description}
                    </p>
                    
                    <Button 
                      asChild
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <a 
                        href={doc.downloadUrl} 
                        download
                        className="inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">
              සියල්ලෙන් සපිරි සිරිලක වාහන ඉසුරුපුරය. පුංචි කාර් නිවස වාහන උද්‍යානය, ස්ලිට් කැම්පස් අසල – මාලඹේ.
            </p>
          </div>
        </div>
      </section>

         
    </div>
  );
}
