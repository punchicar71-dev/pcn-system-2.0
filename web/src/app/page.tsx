import Link from 'next/link';
import Image from 'next/image';
import { Car, Shield, Award, Wrench, CheckCircle, Search } from 'lucide-react';
import UploadSection from '@/components/UploadSection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative h-[600px] md:h-[700px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero_image.png"
            alt="Punchi Car Niwasa Vehicle Park"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-3xl text-white">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Punch Car Niwasa
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl mb-4">
              Vehicle Park <span className="text-[#F5A623]">, Malabe</span>
            </p>
            <p className="text-lg md:text-xl text-slate-200 mb-12">
              When choosing a vehicle from a dealership with 400 options
            </p>

            {/* Search Box */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">
                Find the best vehicle for you
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Search vehicles"
                  className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-[#F5A623] focus:border-transparent outline-none"
                />
                <select className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#F5A623] focus:border-transparent outline-none">
                  <option>Select Brands</option>
                  <option>Toyota</option>
                  <option>Honda</option>
                  <option>Nissan</option>
                  <option>Mazda</option>
                  <option>Suzuki</option>
                  <option>BMW</option>
                  <option>Mercedes</option>
                </select>
                <input
                  type="text"
                  placeholder="Model (Ex : Corolla)"
                  className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-[#F5A623] focus:border-transparent outline-none"
                />
                <button className="bg-[#F5A623] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#E09615] transition flex items-center justify-center gap-2">
                  <Search size={20} />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logos Section */}
      <section className="py-8 bg-white border-t border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap opacity-70 hover:opacity-100 transition-opacity">
            <div className="text-2xl font-bold text-slate-600">BMW</div>
            <div className="text-2xl font-bold text-slate-600">CHERY</div>
            <div className="text-2xl font-bold text-slate-600">CHEVROLET</div>
            <div className="text-2xl font-bold text-slate-600">HONDA</div>
            <div className="text-2xl font-bold text-slate-600">ISUZU</div>
            <div className="text-2xl font-bold text-slate-600">Jeep</div>
            <div className="text-2xl font-bold text-slate-600">JAGUAR</div>
            <div className="text-2xl font-bold text-slate-600">Land Rover</div>
            <div className="text-2xl font-bold text-slate-600">LEXUS</div>
            <div className="text-2xl font-bold text-slate-600">MAYBACH</div>
            <div className="text-2xl font-bold text-slate-600">Mazda</div>
            <div className="text-2xl font-bold text-slate-600">MITSUBISHI</div>
            <div className="text-2xl font-bold text-slate-600">Mercedes-Benz</div>
            <div className="text-2xl font-bold text-slate-600">MINI</div>
          </div>
        </div>
      </section>

      {/* Latest Vehicles Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-2">Latest vehicles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="text-[#F5A623]" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">400+ Vehicles</h3>
              <p className="text-slate-600">
                Largest selection of quality Japanese used vehicles in one location
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-[#F5A623]" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Quality Assured</h3>
              <p className="text-slate-600">
                Every vehicle undergoes comprehensive inspection and comes with warranty
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-[#F5A623]" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Trusted Dealer</h3>
              <p className="text-slate-600">
                Years of experience and thousands of satisfied customers
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="text-[#F5A623]" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">After Sales Service</h3>
              <p className="text-slate-600">
                Complete support and maintenance services for your vehicle
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Featured Vehicles</h2>
              <p className="text-slate-600">Check out our latest arrivals</p>
            </div>
            <Link
              href="/vehicles"
              className="text-[#F5A623] hover:text-[#E09615] font-semibold flex items-center gap-2"
            >
              View All
              <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-48 bg-slate-200">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Car size={64} />
                  </div>
                  <div className="absolute top-3 right-3 bg-[#F5A623] text-black px-3 py-1 rounded-full text-sm font-semibold">
                    New Arrival
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#F5A623] transition">
                    Toyota Aqua 2020
                  </h3>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                    <span>Hybrid</span>
                    <span>•</span>
                    <span>Auto</span>
                    <span>•</span>
                    <span>50,000 km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-900">Rs 4.5M</span>
                    <Link
                      href="/vehicles"
                      className="text-[#F5A623] hover:text-[#E09615] font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section Component */}
      <UploadSection />

      {/* Services Overview */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Complete automotive solutions for all your vehicle needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition">
              <CheckCircle className="text-[#F5A623] mb-4" size={40} />
              <h3 className="text-xl font-semibold mb-3">Vehicle Inspection</h3>
              <p className="text-slate-300">
                Comprehensive multi-point inspection for all vehicles before sale
              </p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition">
              <CheckCircle className="text-[#F5A623] mb-4" size={40} />
              <h3 className="text-xl font-semibold mb-3">Financing Options</h3>
              <p className="text-slate-300">
                Flexible payment plans and leasing options available
              </p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition">
              <CheckCircle className="text-[#F5A623] mb-4" size={40} />
              <h3 className="text-xl font-semibold mb-3">Trade-In Service</h3>
              <p className="text-slate-300">
                Get the best value for your current vehicle with our trade-in program
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/services"
              className="inline-block bg-[#F5A623] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#E09615] transition"
            >
              Learn More About Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#F5A623]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Ready to Find Your Perfect Vehicle?
          </h2>
          <p className="text-lg text-slate-800 mb-8 max-w-2xl mx-auto">
            Visit our showroom today or browse our online inventory. Our team is ready to help you find the perfect vehicle.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/vehicles"
              className="bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition"
            >
              Browse Inventory
            </Link>
            <Link
              href="/contact"
              className="bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition"
            >
              Schedule a Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
