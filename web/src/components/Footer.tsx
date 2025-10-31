'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
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
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Section 1: Company Logo & Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/white_logo.png" 
                alt="Punchi Car Niwasa" 
                width={220} 
                height={40}
                className="w-250 h-250"
              />
              
            </div>
            <div className="pt-4 space-y-1 text-sm text-gray-300">
              <p className="font-semibold">Vehicle Park , Malabe</p>
              <p className="text-xs leading-relaxed">
                When choosing a vehicle from a dealership with 400 options
              </p>
            </div>
          </div>

          {/* Section 2: Sales Hours */}
          <div className="space-y-4">
            <div>
              <h4 className="text-base font-semibold mb-4">Sales Hours</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">Open Everyday!</p>
                <p className="font-semibold text-yellow-400">09:00AM – 06:00PM</p>
              </div>
            </div>
          </div>

          {/* Section 3: Contact Details */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold">Contact Details</h4>
            <div className="space-y-3 text-sm">
              {/* Address */}
              <div>
                <p className="text-gray-400 text-xs mb-1">📍</p>
                <p className="text-gray-300 leading-relaxed">
                  Malabe Punchi Car Niwasa (Pvt) Ltd.<br />
                  Near SLIIT Campus, Isurupura Road,<br />
                  Malabe, Sri Lanka.
                </p>
              </div>
              
              {/* Phone Numbers */}
              <div className="pt-2">
                <p className="text-gray-400 text-xs mb-2">📱</p>
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <p className="text-yellow-400 font-semibold">0112 413 865</p>
                  <p className="text-yellow-400 font-semibold">0112 413 866</p>
                  <p className="text-yellow-400 font-semibold">0112 413 867</p>
                  <p className="text-yellow-400 font-semibold">0112 413 868</p>
                </div>
              </div>
              
              {/* Email */}
              <div className="pt-2">
                <p className="text-gray-400 text-xs mb-1">✉️</p>
                <a href="mailto:sales@punchicar.lk" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  sales@punchicar.lk
                </a>
              </div>
            </div>
          </div>

          {/* Section 4: Subscribe */}
          <div className="space-y-4">
            <div>
              <h4 className="text-base font-semibold mb-3">Subscribe</h4>
              <p className="text-sm text-gray-300 mb-4">
                Subscribe to receive updates on the latest vehicle deals.
              </p>
              
              {/* Email Input */}
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email here..."
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white text-sm rounded focus:border-yellow-400 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                >
                  {submitted ? '✓ Submitted' : 'Submit'} 🚀
                </button>
              </form>

              {/* Social Icons */}
              <div className="flex gap-3 mt-6 justify-center">
                <a href="#" className="bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500 transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="#" className="bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500 transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="#" className="bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500 transition-colors">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-gray-700" />
      <div className="bg-yellow-400 text-black">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="font-semibold">&copy; Copyright 2024 Punchi Car Niwasa</p>
            <p className="text-gray-700">Design & Developed by asanka.live</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
