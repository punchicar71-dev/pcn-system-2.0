import Link from 'next/link';
import { 
  Award, 
  Target, 
  Heart, 
  Users, 
  TrendingUp, 
  CheckCircle,
  MapPin,
  Calendar,
  Car,
  Shield
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { value: '400+', label: 'Vehicles Available' },
    { value: '15+', label: 'Years Experience' },
    { value: '10,000+', label: 'Happy Customers' },
    { value: '98%', label: 'Customer Satisfaction' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Quality First',
      description: 'We never compromise on quality. Every vehicle is thoroughly inspected and meets our high standards.',
    },
    {
      icon: Heart,
      title: 'Customer Focused',
      description: 'Your satisfaction is our priority. We go the extra mile to ensure you get the perfect vehicle.',
    },
    {
      icon: CheckCircle,
      title: 'Transparency',
      description: 'Honest pricing, detailed vehicle history, and clear communication throughout your journey.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to providing exceptional service and maintaining the highest industry standards.',
    },
  ];

  const timeline = [
    {
      year: '2010',
      title: 'The Beginning',
      description: 'Started with a vision to provide quality Japanese vehicles to Sri Lankan customers.',
    },
    {
      year: '2013',
      title: 'Expansion',
      description: 'Moved to our current location at Vehicle Park, Malabe with capacity for 400+ vehicles.',
    },
    {
      year: '2018',
      title: 'Service Center',
      description: 'Launched our comprehensive after-sales service center with experienced technicians.',
    },
    {
      year: '2025',
      title: 'Digital Innovation',
      description: 'Introduced advanced online inventory system and digital customer experience.',
    },
  ];

  const team = [
    {
      name: 'John Perera',
      role: 'Managing Director',
      description: '15+ years of automotive industry experience',
    },
    {
      name: 'Sarah Fernando',
      role: 'Sales Director',
      description: 'Expert in customer relations and vehicle sales',
    },
    {
      name: 'Rajith Silva',
      role: 'Service Manager',
      description: 'Certified automotive technician with 12 years experience',
    },
    {
      name: 'Priya Jayawardena',
      role: 'Finance Manager',
      description: 'Specialist in automotive financing and leasing',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24">
        <div className="absolute inset-0 bg-[url('/about-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About Punchi Car Niwasa</h1>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
              Your trusted partner in finding the perfect vehicle. For over 15 years, we've been helping 
              customers across Sri Lanka discover quality Japanese vehicles at the best value.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Story</h2>
              <p className="text-lg text-slate-600">
                From humble beginnings to Sri Lanka's premier vehicle dealership
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Punchi Car Niwasa was founded with a simple mission: to make quality Japanese vehicles 
                accessible to everyone in Sri Lanka. What started as a small operation has grown into 
                one of the largest and most trusted vehicle dealerships in the country.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Located at Vehicle Park in Malabe, our expansive showroom features over 400 carefully 
                selected vehicles from Japan's most reliable manufacturers. Each vehicle undergoes 
                rigorous inspection to ensure it meets our high standards of quality and reliability.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Today, we're proud to have served over 10,000 satisfied customers, earning their trust 
                through transparent business practices, competitive pricing, and exceptional after-sales 
                support. Our commitment to excellence has made us a household name in the Sri Lankan 
                automotive market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-8 md:p-12 rounded-xl text-white">
              <Target size={48} className="mb-6" />
              <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
              <p className="text-lg leading-relaxed">
                To provide our customers with the highest quality vehicles, exceptional service, and 
                transparent dealings that build lasting relationships based on trust and satisfaction.
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-12 rounded-xl text-white">
              <TrendingUp size={48} className="mb-6" />
              <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-lg leading-relaxed">
                To be Sri Lanka's most trusted and preferred automotive dealership, recognized for 
                quality, innovation, and customer-centric approach in every interaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                  <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-yellow-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Journey</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Key milestones in our growth story
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="bg-yellow-500 text-black w-20 h-20 rounded-full flex items-center justify-center font-bold text-lg">
                      {item.year}
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet Our Leadership Team</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experienced professionals dedicated to your satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden text-center">
                <div className="bg-slate-200 h-48 flex items-center justify-center">
                  <Users className="text-slate-400" size={80} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-yellow-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-sm text-slate-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 md:p-12 text-white">
            <div className="flex items-start gap-4 mb-6">
              <MapPin className="text-yellow-500 flex-shrink-0" size={40} />
              <div>
                <h2 className="text-3xl font-bold mb-4">Visit Our Showroom</h2>
                <p className="text-lg text-slate-300 mb-6">
                  Come see our extensive collection of vehicles in person. Our team is ready to help 
                  you find your perfect vehicle.
                </p>
                <div className="space-y-3 mb-8">
                  <p className="flex items-center gap-3">
                    <MapPin size={20} className="text-yellow-500" />
                    <span>Vehicle Park, Malabe, Sri Lanka</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Calendar size={20} className="text-yellow-500" />
                    <span>Open Daily: 9:00 AM - 6:00 PM</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Car size={20} className="text-yellow-500" />
                    <span>400+ Vehicles on Display</span>
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="inline-block bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-600 transition"
                >
                  Get Directions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Ready to Find Your Dream Vehicle?
          </h2>
          <p className="text-lg text-slate-800 mb-8 max-w-2xl mx-auto">
            Experience the Punchi Car Niwasa difference. Browse our inventory or visit us today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/vehicles"
              className="bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition"
            >
              View Our Vehicles
            </Link>
            <Link
              href="/contact"
              className="bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition"
            >
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
