'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Our Showroom',
      details: ['Vehicle Park, Malabe', 'Sri Lanka'],
      link: 'https://maps.google.com',
      linkText: 'Get Directions',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+94 11 234 5678', '+94 77 123 4567'],
      link: 'tel:+94112345678',
      linkText: 'Call Now',
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@punchicar.lk', 'sales@punchicar.lk'],
      link: 'mailto:info@punchicar.lk',
      linkText: 'Send Email',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Monday - Sunday', '9:00 AM - 6:00 PM'],
      link: null,
      linkText: null,
    },
  ];

  const departments = [
    {
      name: 'Sales Department',
      phone: '+94 11 234 5678',
      email: 'sales@punchicar.lk',
      description: 'New vehicle inquiries and purchases',
    },
    {
      name: 'Service Department',
      phone: '+94 11 234 5679',
      email: 'service@punchicar.lk',
      description: 'Vehicle maintenance and repairs',
    },
    {
      name: 'Finance Department',
      phone: '+94 11 234 5680',
      email: 'finance@punchicar.lk',
      description: 'Financing and leasing inquiries',
    },
    {
      name: 'Customer Support',
      phone: '+94 11 234 5681',
      email: 'support@punchicar.lk',
      description: 'General inquiries and support',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Have questions? We're here to help. Reach out to us through any of the channels below 
            or visit our showroom in Malabe.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200 hover:border-yellow-500 transition">
                  <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                    <Icon className="text-yellow-600" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{info.title}</h3>
                  <div className="space-y-1 mb-4">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-slate-600">{detail}</p>
                    ))}
                  </div>
                  {info.link && (
                    <a
                      href={info.link}
                      className="text-yellow-600 hover:text-yellow-700 font-semibold inline-flex items-center gap-2"
                    >
                      {info.linkText} →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content - Form and Map */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select a subject</option>
                      <option value="vehicle-inquiry">Vehicle Inquiry</option>
                      <option value="test-drive">Schedule Test Drive</option>
                      <option value="financing">Financing Options</option>
                      <option value="service">Service & Maintenance</option>
                      <option value="trade-in">Trade-In Valuation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-yellow-500 text-black py-4 rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Map and Additional Info */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-96 bg-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="text-slate-400 mx-auto mb-4" size={64} />
                    <p className="text-slate-600 font-semibold">Google Maps Integration</p>
                    <p className="text-sm text-slate-500">Vehicle Park, Malabe, Sri Lanka</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Find Us Here</h3>
                  <p className="text-slate-600 mb-4">
                    We're conveniently located at Vehicle Park in Malabe with easy access and 
                    ample parking space.
                  </p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-600 hover:text-yellow-700 font-semibold inline-flex items-center gap-2"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Connect With Us</h3>
                <p className="text-slate-600 mb-4">
                  Follow us on social media for the latest updates, new arrivals, and special offers.
                </p>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition"
                  >
                    <Facebook size={24} />
                  </a>
                  <a
                    href="#"
                    className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 transition"
                  >
                    <Instagram size={24} />
                  </a>
                  <a
                    href="#"
                    className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition"
                  >
                    <Youtube size={24} />
                  </a>
                  <a
                    href="#"
                    className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition"
                  >
                    <MessageCircle size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Departments</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Contact the right department for faster assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {departments.map((dept, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{dept.name}</h3>
                <p className="text-slate-600 mb-4">{dept.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone size={18} className="text-yellow-600" />
                    <a href={`tel:${dept.phone}`} className="hover:text-yellow-600">
                      {dept.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail size={18} className="text-yellow-600" />
                    <a href={`mailto:${dept.email}`} className="hover:text-yellow-600">
                      {dept.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Check our Help Guide for answers to frequently asked questions
          </p>
          <a
            href="/help-guide"
            className="inline-block bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            Visit Help Center
          </a>
        </div>
      </section>
    </div>
  );
}
