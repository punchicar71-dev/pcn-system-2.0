'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail, Globe } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'All Vehicles', href: '/vehicles' },
    { name: 'Our Services', href: '/services' },
    { name: 'Help Guide', href: '/help-guide' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <>
      {/* Top Bar - Hidden on Mobile */}
      <div className="hidden md:block bg-black text-white py-2.5">
        <div className=" max-w-7xl mx-auto sm:px-6 md:px-8 lg:px-0 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-400 ">
              Open Everyday! <span className="font-medium ml-2 text-xs text-white ">09:00AM – 06:00PM</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <span className="text-xs text-gray-400">Hotline :</span>
              <a href="tel:+94112413865" className="font-medium text-xs hover:text-slate-800 transition-colors">
                0112 413 865
              </a>
              <a href="tel:+94112413866" className="font-medium  text-xs hover:text-slate-800 transition-colors">
                0112 413 866
              </a>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-gray-400">Email :</span>
              <a href="mailto:sales@punchicar.lk" className="font-medium text-xs hover:text-slate-800 transition-colors">
                sales@punchicar.lk
              </a>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Navigation - Sticky Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/70 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}>
      <div className=" max-w-7xl mb-[-90px] mx-auto sm:px-6 md:px-8 lg:px-0 py-3">
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
                className={`px-4 py-2 rounded-md font-base transition-colors ${
                  pathname === item.href
                    ? 'text-[#FDF898]'
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
      </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <nav className="lg:hidden fixed top-0 right-0 h-full w-80 bg-black z-50 shadow-2xl overflow-y-auto">
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-md transition-colors text-white"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block py-3 px-4 rounded-md font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-[#FDF898] bg-slate-800'
                      : 'text-white hover:text-[#F5A623] hover:bg-slate-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Contact Info */}
            <div className="px-6 py-4 mt-4 border-t border-slate-700 space-y-3">
              <a href="tel:+94112413865" className="flex items-center gap-3 text-sm text-white hover:text-[#F5A623] py-2">
                <Phone size={18} />
                <span>0112 413 865</span>
              </a>
              <a href="tel:+94112413866" className="flex items-center gap-3 text-sm text-white hover:text-[#F5A623] py-2">
                <Phone size={18} />
                <span>0112 413 866</span>
              </a>
              <a href="mailto:sales@punchicar.lk" className="flex items-center gap-3 text-sm text-white hover:text-[#F5A623] py-2">
                <Mail size={18} />
                <span>sales@punchicar.lk</span>
              </a>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
