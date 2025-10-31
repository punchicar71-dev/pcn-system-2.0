import Link from 'next/link';
import { 
  Car, 
  Shield, 
  Wrench, 
  FileText, 
  DollarSign, 
  Users, 
  CheckCircle,
  Phone,
  Award,
  Clock,
  MapPin,
  Settings
} from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      icon: Car,
      title: 'Vehicle Sales',
      description: 'Browse our extensive collection of 400+ quality used vehicles from Japan. Each vehicle is carefully selected and imported.',
      features: [
        'Wide selection of brands and models',
        'Competitive pricing',
        'Detailed vehicle history',
        'Test drive available',
      ],
    },
    {
      icon: Shield,
      title: 'Quality Inspection',
      description: 'Every vehicle undergoes a comprehensive multi-point inspection before being offered for sale.',
      features: [
        'Professional mechanical inspection',
        'Body and paint assessment',
        'Interior condition check',
        'Comprehensive test drive',
      ],
    },
    {
      icon: FileText,
      title: 'Documentation Support',
      description: 'Complete assistance with all paperwork and documentation required for vehicle purchase and registration.',
      features: [
        'Registration assistance',
        'Transfer of ownership',
        'Insurance coordination',
        'DMT clearance support',
      ],
    },
    {
      icon: DollarSign,
      title: 'Financing Options',
      description: 'Flexible financing solutions tailored to your budget and requirements.',
      features: [
        'Bank loan arrangements',
        'Leasing options available',
        'Competitive interest rates',
        'Quick approval process',
      ],
    },
    {
      icon: Users,
      title: 'Trade-In Service',
      description: 'Get the best value for your current vehicle with our fair and transparent trade-in program.',
      features: [
        'Free vehicle valuation',
        'Instant trade-in quotes',
        'Hassle-free process',
        'Fair market value',
      ],
    },
    {
      icon: Wrench,
      title: 'After-Sales Service',
      description: 'Comprehensive maintenance and repair services to keep your vehicle in top condition.',
      features: [
        'Regular maintenance service',
        'Genuine spare parts',
        'Experienced technicians',
        'Service warranty',
      ],
    },
  ];

  const benefits = [
    {
      icon: Award,
      title: 'Quality Guarantee',
      description: 'All vehicles come with warranty coverage for your peace of mind',
    },
    {
      icon: Clock,
      title: 'Fast Processing',
      description: 'Quick turnaround time for documentation and delivery',
    },
    {
      icon: MapPin,
      title: 'Convenient Location',
      description: 'Easy to access showroom at Vehicle Park, Malabe',
    },
    {
      icon: Settings,
      title: 'Professional Service',
      description: 'Expert guidance throughout your vehicle buying journey',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Comprehensive automotive solutions designed to provide you with the best vehicle buying and ownership experience
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What We Offer</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Complete range of services to support you from purchase to maintenance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Icon className="text-yellow-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                  <p className="text-slate-600 mb-6">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose Us</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience the difference with our professional and customer-focused approach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-yellow-600" size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simple and transparent process from selection to delivery
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Browse & Select', desc: 'Choose your perfect vehicle from our inventory' },
                { step: '02', title: 'Inspection', desc: 'Review detailed inspection report and test drive' },
                { step: '03', title: 'Documentation', desc: 'We handle all paperwork and financing' },
                { step: '04', title: 'Delivery', desc: 'Get your vehicle delivered to your doorstep' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-yellow-500 text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Contact us today to learn more about our services or visit our showroom
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              <Phone size={20} />
              Contact Us
            </Link>
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition"
            >
              <Car size={20} />
              View Vehicles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
