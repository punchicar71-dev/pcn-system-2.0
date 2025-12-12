'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Send  } from 'lucide-react';
import { Separator } from './ui/separator';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription here
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setEmail('');
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <footer className="bg-gray-100 text-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-4 xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-16">
          
          {/* Section 1: Company Logo & Info */}
          <div className="space-y-5 col-span-1">
            <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-14 w-20">
                <Image
                  src="/logo_icon.png"
                  alt="Punchi Car Niwasa"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            </div>
            <p className="text-[14px] lg:text-[15px] text-gray-600 leading-relaxed">
              තෝරා ගැනිමට වාහන 400ක් එකම උද්‍යානයක.<br /> මහ පාරෙන් මීටර් 600ක් ඇතුළත මනරම් හරිත කලාපයක පිහිටි දැවැන්ත වාහන උද්‍යානය.
            </p>
            <div className="pt-2">
              <h4 className="text-[16px] lg:text-[17px] font-semibold mb-2 text-gray-900">Sales Hours</h4>
              <p className="text-[14px] text-gray-700 mb-1">Open Everyday!</p>
              <p className="font-bold text-[18px] lg:text-[20px] text-black">09:00AM – 06:00PM</p>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="space-y-5 col-span-1">
            <h4 className="text-[16px] lg:text-[17px] font-semibold text-gray-900">Contact Details</h4>
            <div className="space-y-5">
              {/* Address */}
              <div className='flex gap-3 items-start'>
                <MapPin className='h-5 w-5 flex-shrink-0 mt-0.5 text-gray-600' />
                <div className="flex-1 leading-relaxed">
                  <p className="text-[14px] lg:text-[15px] text-gray-800">
                    Malabe Punchi Car Niwasa (Pvt) Ltd.
                  </p>
                  <p className="text-[14px] lg:text-[15px] text-gray-800">
                    Near SLIIT Campus, Isurupura Road,
                  </p>
                  <p className="text-[14px] lg:text-[15px] text-gray-800">
                    Malabe, Sri Lanka.
                  </p>
                </div>
              </div>
              
              {/* Phone Numbers */}
              <div className="flex gap-3 items-start">
                <Phone className='h-5 w-5 flex-shrink-0 mt-0.5 text-gray-600' />
                <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                  <a href="tel:0112413865" className="text-[14px] lg:text-[15px] font-semibold text-gray-900 hover:text-yellow-500 transition-colors">0112 413 865</a>
                  <a href="tel:0112413866" className="text-[14px] lg:text-[15px] font-semibold text-gray-900 hover:text-yellow-500 transition-colors">0112 413 866</a>
                  <a href="tel:0112413867" className="text-[14px] lg:text-[15px] font-semibold text-gray-900 hover:text-yellow-500 transition-colors">0112 413 867</a>
                  <a href="tel:0112413868" className="text-[14px] lg:text-[15px] font-semibold text-gray-900 hover:text-yellow-500 transition-colors">0112 413 868</a>
                </div>
              </div>
              
              {/* Email */}
              <div className="flex gap-3 items-start">
                <Mail className='h-5 w-5 flex-shrink-0 mt-0.5 text-gray-600' />
                <a href="mailto:sales@punchicar.lk" className="text-[14px] lg:text-[15px] font-medium text-gray-900 hover:text-yellow-500 transition-colors break-words">
                  sales@punchicar.lk
                </a>
              </div>
            </div>
          </div>

          {/* Section 3: Subscribe */}
          <div className="space-y-5 col-span-1 md:col-span-2 lg:col-span-1">
            <h4 className="text-[16px] lg:text-[17px] font-semibold text-gray-900">Subscribe</h4>
            <p className="text-[14px] lg:text-[15px] text-gray-700 leading-relaxed">
              Subscribe to receive updates on the latest vehicle deals.
            </p>
            
            {/* Email Input */}
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email here..."
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-black text-[14px] rounded-lg focus:border-gray-600 focus:outline-none transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-medium text-[14px] lg:text-[15px] py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {submitted ? '✓ Submitted' : 'Submit'}  <Send className='h-4 w-4' />
              </button>
            </form>

            {/* Social Icons */}
            <div className="flex gap-3 pt-1">
              <a href="#" className="bg-white border border-gray-300 text-black p-2 rounded-full hover:bg-gray-900 hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="bg-white border border-gray-300 text-black p-2 rounded-full hover:bg-gray-900 hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="bg-white border border-gray-300 text-black p-2 rounded-full hover:bg-gray-900 hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-red-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-4 xl:px-0 py-4 sm:py-4">
          <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row justify-center sm:justify-between items-center gap-2 sm:gap-4 text-xs sm:text-sm text-center sm:text-left">
            <p className="text-white text-[11px] sm:text-[13px]">&copy; Copyright 2024 Punchi Car Niwasa</p>
            <p className="text-white text-[11px] sm:text-[13px]">Design & Developed by asankaherath.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
