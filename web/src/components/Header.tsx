'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail, ChevronDown } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const pathname = usePathname();
  let dropdownTimeout: NodeJS.Timeout;

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

  const handleDropdownEnter = () => {
    clearTimeout(dropdownTimeout);
    setAboutDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout = setTimeout(() => {
      setAboutDropdownOpen(false);
    }, 150);
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Vehicles', href: '/vehicles' },
    { name: 'Our Service', href: '/services' },
    { 
      name: 'About Us', 
      href: '/about',
      dropdown: [
        { name: 'About Us', href: '/about' },
        { name: 'Documents', href: '/about/documents' },
        { name: 'FAQs', href: '/about/faqs' },
      ]
    },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <>
      {/* Main Navigation - Sticky Header */}
      <header className={`sticky top-0 z-50 mb-[-100px] transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg' 
          : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto sm:px-6 md:px-8 lg:px-0 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Navigation Container */}
          <div className="flex items-center gap-4">
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                item.dropdown ? (
                  <div 
                    key={item.name}
                    className="relative group"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-1 ${
                        pathname.startsWith('/about')
                          ? 'text-red-600'
                          : isScrolled ? 'text-gray-900 hover:text-red-600' : 'text-black hover:text-red-600'
                      }`}
                    >
                      {item.name}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div 
                      className={`absolute top-full left-0 pt-2 transition-all duration-200 ${
                        aboutDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                      }`}
                    >
                      <div className="w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`block px-4 py-2.5 text-sm transition-colors ${
                              pathname === subItem.href
                                ? 'bg-red-50 text-red-600 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-red-600'
                            }`}
                            onClick={() => setAboutDropdownOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-red-600'
                        : isScrolled ? 'text-gray-900 hover:text-red-600' : 'text-black hover:text-red-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </nav>
          </div>

          {/* Right Side - Hotline Button and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Hotline Button */}
            <a 
              href="" 
              className={`hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-lg font-normal transition-colors ${
                isScrolled 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-white text-red-600 hover:bg-red-50'
              }`}
            >
              
             Hotline :  <span className='font-bold'>0117 275 275</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              className={`lg:hidden p-2 rounded-md transition-colors ${
                isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-black hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
          <nav className="lg:hidden fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl overflow-y-auto">
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-900"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="px-6 py-4 space-y-2">
              {navItems.map((item) => (
                item.dropdown ? (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className={`block py-3 px-4 rounded-md font-medium transition-colors ${
                        pathname === item.href
                          ? 'text-red-600 bg-red-50'
                          : 'text-gray-900 hover:text-red-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                    <div className="ml-4 mt-2 space-y-2">
                      {item.dropdown.slice(1).map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block py-2 px-4 rounded-md text-sm transition-colors ${
                            pathname === subItem.href
                              ? 'text-red-600 bg-red-50'
                              : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block py-3 px-4 rounded-md font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-900 hover:text-red-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            {/* Mobile Hotline */}
            <div className="px-6 py-4 mt-4 border-t border-gray-200">
              <a 
                href="tel:0117275275" 
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <Phone size={18} />
                <span>Hotline : 0117 275 275</span>
              </a>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
