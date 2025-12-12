'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  MapPinned,
  Clock4
} from 'lucide-react';
import RelatedVehicleCard, { RelatedVehicle } from '@/components/RelatedVehicleCard';
import { Separator } from '@/components/ui/separator';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [latestVehicles, setLatestVehicles] = useState<RelatedVehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  useEffect(() => {
    // Fetch latest 3 vehicles
    const fetchLatestVehicles = async () => {
      try {
        setIsLoadingVehicles(true);
        const response = await fetch('/api/vehicles?limit=3&sort=newest');
        if (response.ok) {
          const data = await response.json();
          setLatestVehicles(data.vehicles || []);
        }
      } catch (error) {
        console.error('Failed to fetch latest vehicles:', error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchLatestVehicles();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: ['Vehicle Park, Malabe', 'Sri Lanka'],
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+94 112 413 865', '+94 112 413 866'],
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['sales@punchicar.lk', 'support@punchicar.lk'],
    },
    {
      icon: Clock,
      title: 'Sales Hours',
      details: ['09:00AM - 06:00PM', 'Open Everyday'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      
          {/* Hero Section */}
       <section 
        className="relative h-[280px] sm:h-[380px] md:h-[400px] lg:h-[450px] flex items-center overflow-hidden bg-cover bg-no-repeat bg-[position:left] md:bg-center"
        style={{
          backgroundImage: "url('/contact_hero.png')",
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
              සියල්ලෙන් සපිරි සිරිලක වාහන ඉසුරුපුරය. පුංචි කාර් නිවස වාහන උද්‍යානය, ස්ලිට් කැම්පස් අසල – මාලඹේ.
            </p>
            <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 font-sinhala leading-relaxed">
              සෑම දිනකම විවෘතයි! 09:00AM – 06:00PM
            </p>
            
          </div>
        </div>
      </section>

      {/* Contact Details Section */}
      <section className="max-w-7xl mx-4 lg:mx-auto border rounded-[12px] bg-white border-gray-200 my-6 md:my-8 lg:my-12">
        <div className="flex flex-col">

           {/* Details Section */}
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
            {/* Left - Contact Details Cards */}
            <div className="flex-1 p-4 md:p-5 lg:p-6">
              <h2 className="text-lg md:text-xl lg:text-[20px] font-bold text-gray-900 mb-4 md:mb-6 lg:mb-8">Contact Details</h2>
              <div className="flex flex-col space-y-4 md:space-y-5 lg:space-y-6">
                <div className="flex flex-col items-start lg:flex-row gap-2 lg:gap-4">
                  <div className='flex items-center gap-2 font-semibold'> <MapPin className='h-4 w-4 text-green-500' />Address: </div>
                  <div className='text-sm md:text-base lg:text-[16px] font-sinhala'>මාලඹේ පුංචි කාර් නිවස, ස්ලිට් කැම්පස් අසල, ඉසුරුපුර පාර, මාලඹේ.</div>
                </div>
                <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
                  <div className='flex items-center gap-2 font-semibold'> <MapPinned  className='h-4 w-4 text-green-500' />Mail Address: </div>
                  <div className='text-sm md:text-base lg:text-[16px] font-sinhala'>46/KL, ගැමුණුපුර, කොතලාවල, කඩුවෙල.</div>
                </div>
                <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
                  <div className='flex items-center gap-2 font-semibold'> <Phone className='h-4 w-4 text-green-500' />Phone: </div>
                  <div className='text-sm md:text-base lg:text-[16px]'>+94 117 275 275</div>
                </div>
                <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
                  <div className='flex items-center gap-2 font-semibold'> <Clock4 className='h-4 w-4 text-green-500' />Sales Hours: </div>
                  <div className='text-sm md:text-base lg:text-[16px] font-sinhala'>සෑම දිනකම විවෘතයි! 09:00AM – 06:00PM</div>
                </div>
                <p className="text-gray-700 bg-gray-100 p-4 md:p-5 lg:p-6 rounded-lg leading-relaxed font-sinhala text-sm md:text-base">
                  පුංචි කාර් නිවස තිබෙන තැන මෙන්න. මාලඹේ ස්ලිට් කැමිපස් අසල. අලුත් KIA ප්‍රදර්ශනාගාරය අසල. අධිවේගි මාර්ගයෙන් මාතර කොට්ටාව දෙසින් එනවා නම් කොතලාවල පිටවීමෙන් වමට කිලෝමීටරයයි. කඩවතින් නම් කඩුවෙලින් පිටවී කඩුවෙල නගරය හරහා කි.මි.4යි.
                </p>
              </div>
            </div>

             <Separator orientation="vertical" className='h-auto hidden lg:block' />

            {/* Right - Contact Image */}
            <div className="flex-1 w-auto p-4 md:p-5 lg:p-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Image
                  src="/contact_img.png"
                  alt="Contact"
                  width={400}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

          <Separator className="" />

          {/* Map */}
            <div className="bg-white rounded-lg p-4 md:p-5 lg:p-6 shadow-md overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1114.0313144356653!2d79.97871655192556!3d6.915182739800654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae256d611ab3bfd%3A0x3b97c89625742ba!2sPunchi%20Car%20Niwasa!5e0!3m2!1sen!2slk!4v1764309422847!5m2!1sen!2slk"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="md:h-[400px] lg:h-[550px]"
              />
            </div>



        </div>
      </section>

      

      
    </div>
  );
}
