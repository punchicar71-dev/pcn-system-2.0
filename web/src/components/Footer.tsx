import Link from 'next/link';
import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Punchi Car <span className="text-yellow-500">Niwasa</span>
            </h3>
            <p className="text-slate-300 mb-4">
              Quality used cars from Japan. Choose from 400 vehicles in one place with comprehensive inspection and warranty.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-300 hover:text-yellow-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-slate-300 hover:text-yellow-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-slate-300 hover:text-yellow-500 transition-colors">
                <Youtube size={20} />
              </a>
              <a href="#" className="text-slate-300 hover:text-yellow-500 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-300 hover:text-yellow-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="text-slate-300 hover:text-yellow-500 transition-colors">
                  All Vehicles
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-300 hover:text-yellow-500 transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-yellow-500 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help-guide" className="text-slate-300 hover:text-yellow-500 transition-colors">
                  Help Guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-yellow-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-yellow-500 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-yellow-500 transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={20} className="text-yellow-500 flex-shrink-0 mt-1" />
                <span className="text-slate-300">
                  Vehicle Park, Malabe<br />
                  Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={20} className="text-yellow-500 flex-shrink-0" />
                <a href="tel:+94112345678" className="text-slate-300 hover:text-yellow-500">
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={20} className="text-yellow-500 flex-shrink-0" />
                <a href="mailto:info@punchicar.lk" className="text-slate-300 hover:text-yellow-500">
                  info@punchicar.lk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} Punchi Car Niwasa. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-yellow-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-500 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
