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
      <div className=" max-w-7xl mx-auto py-12 ">
        <div className="flex gap-x-12">
          
          {/* Section 1: Company Logo & Info */}
          <div className="space-y-4 w-1/3">
            <div className="flex items-center gap-3">
              <Image 
                src="/black_logo.png" 
                alt="Punchi Car Niwasa" 
                width={220} 
                height={40}
                className="w-250 h-250"
              />
              
            </div>
            <div className="pt-4  text-sm text-gray-900">
              
              <p className="text-[14px] text-gray-600 leading-relaxed">
                When choosing a vehicle from a <br/>dealership with 400 options
              </p>
            </div>
            <div className="space-y-4 ">
            <div>
              <h4 className="text-base font-semibold mt-8  mb-4">Sales Hours</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-900 mb-2">Open Everyday!</p>
                <p className="font-semibold text-[18px] text-black">09:00AM – 06:00PM</p>
              </div>
            </div>
          </div>
          </div>


          {/* Section 2: Sales Hours */}
          

          {/* Section 3: Contact Details */}
          <div className="space-y-6 w-1/3">
            <h4 className="text-base text-[18px] font-semibold">Contact Details</h4>
            <div className="space-y-3 text-sm">
              {/* Address */}
              <div className='flex gap-3 mb-4'>
                <p className="text-gray-900 text-xs mb-1"><MapPin className='h-4 w-4 mt-1' /></p>
                <p className="text-gray-900 leading-relaxed">
                  Malabe Punchi Car Niwasa (Pvt) Ltd.<br />
                  Near SLIIT Campus, Isurupura Road,<br />
                  Malabe, Sri Lanka.
                </p>
              </div>
              
              {/* Phone Numbers */}
              <div className="pt-2 flex gap-3 mb-4">
                <p className="text-gray-900 text-[16px] mb-2"><Phone className='h-4 w-4 mt-1' /></p>
                <div className="grid grid-cols-2 text-[16px] gap-4 text-gray-900">
                  <p className=" font-semibold">0112 413 865</p>
                  <p className=" font-semibold">0112 413 866</p>
                  <p className=" font-semibold">0112 413 867</p>
                  <p className=" font-semibold">0112 413 868</p>
                </div>
              </div>
              
              {/* Email */}
              <div className="pt-2 flex gap-3 ">
                <p className="text-gray-900 text-[16px] mb-1"><Mail className='h-4 w-4 mt-1'/></p>
                <a href="mailto:sales@punchicar.lk" className="text-gray-900 text-[16px] hover:text-yellow-400 transition-colors">
                  sales@punchicar.lk
                </a>
              </div>
            </div>
          </div>

          {/* Section 4: Subscribe */}
          <div className="space-y-4 w-1/3">
            <div>
              <h4 className="text-base text-[18px] font-semibold mb-3">Subscribe</h4>
              <p className="text-[14px] text-gray-900 mb-4">
                Subscribe to receive updates on the latest vehicle deals.
              </p>
              
              {/* Email Input */}
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email here..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-black text-sm rounded-lg focus:border-gray-600 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="w-auto bg-gray-900 hover:bg-gray-600 text-white font-base text-[16px] py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {submitted ? '✓ Submitted' : 'Submit'}  <Send className='h-4 w-4' />
                </button>
              </form>

              {/* Social Icons */}
              <div className="flex gap-3 mt-6 start">
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
      </div>

      {/* Bottom Bar */}

      <div className=" bg-black text-white">
        <div className=" mx-auto max-w-7xl  py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="font-medium text-[13px]">&copy; Copyright 2024 Punchi Car Niwasa</p>
            <p className="text-gray-300 text-[13px]">Design & Developed by asankaherath.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
