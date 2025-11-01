'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, Phone, Mail, Globe } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'All Vehicles', href: '/vehicles' },
    { name: 'Our Services', href: '/services' },
    { name: 'Help Guide', href: '/help-guide' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <header className="bg-black shadow-md">
      {/* Top Bar */}
      <div className="bg-[#F5A623] text-black py-2.5">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <span className="text-xs md:text-sm font-medium">
              Open Everyday! <span className="font-bold ml-2">09:00AM – 06:00PM</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <span className="text-xs">Hotline :</span>
              <a href="tel:+94112413865" className="font-bold hover:text-slate-800 transition-colors">
                0112 413 865
              </a>
              <a href="tel:+94112413866" className="font-bold hover:text-slate-800 transition-colors">
                0112 413 866
              </a>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs">Email :</span>
              <a href="mailto:sales@punchicar.lk" className="font-bold hover:text-slate-800 transition-colors">
                sales@punchicar.lk
              </a>
            </div>
            <button className="flex items-center gap-1 hover:text-slate-800 transition-colors">
              <Globe size={16} />
              <span className="font-bold">EN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container bg-black mx-auto px-4 py-3 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative  h-16 w-48">
              <Image
                src="/white_logo.png"
                alt="Punchi Car Niwasa"
                fill
                className="object-contain"
                priority
              />
            </div>
            
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  item.name === 'Home'
                    ? 'text-[#F5A623]'
                    : 'text-white hover:text-[#F5A623]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-slate-800 rounded-md transition-colors text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-slate-700 pt-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 px-4 rounded-md font-medium transition-colors ${
                  item.name === 'Home'
                    ? 'text-[#F5A623] bg-slate-800'
                    : 'text-white hover:text-[#F5A623] hover:bg-slate-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {/* Mobile Contact Info */}
            <div className="pt-4 mt-4 border-t border-slate-700 space-y-2">
              <a href="tel:+94112413865" className="flex items-center gap-2 text-sm text-white hover:text-[#F5A623]">
                <Phone size={16} />
                <span>0112 413 865</span>
              </a>
              <a href="tel:+94112413866" className="flex items-center gap-2 text-sm text-white hover:text-[#F5A623]">
                <Phone size={16} />
                <span>0112 413 866</span>
              </a>
              <a href="mailto:sales@punchicar.lk" className="flex items-center gap-2 text-sm text-white hover:text-[#F5A623]">
                <Mail size={16} />
                <span>sales@punchicar.lk</span>
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
