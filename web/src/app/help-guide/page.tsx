'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Book, 
  FileText,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';

export default function HelpGuidePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      category: 'Buying a Vehicle',
      icon: '🚗',
      faqs: [
        {
          question: 'How do I purchase a vehicle from Punchi Car Niwasa?',
          answer: 'Purchasing a vehicle is simple: Browse our inventory online or visit our showroom, select your vehicle, arrange a test drive, review the inspection report, complete documentation with our assistance, and arrange payment or financing. Our team guides you through every step.',
        },
        {
          question: 'Can I test drive a vehicle before purchasing?',
          answer: 'Yes, absolutely! We encourage all potential buyers to test drive vehicles. Simply contact us to schedule a test drive appointment. You\'ll need to bring a valid driver\'s license.',
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept bank transfers, cash payments, financing through partnered banks, and leasing arrangements. Our finance team can help you explore the best payment option for your situation.',
        },
        {
          question: 'Do you offer vehicle history reports?',
          answer: 'Yes, we provide detailed vehicle history reports for all our vehicles, including import details, maintenance records, and inspection results.',
        },
      ],
    },
    {
      category: 'Financing & Leasing',
      icon: '💰',
      faqs: [
        {
          question: 'What financing options are available?',
          answer: 'We partner with major banks and financial institutions to offer various financing options including traditional auto loans, leasing arrangements, and flexible payment plans. Our finance team can help you find the best rates.',
        },
        {
          question: 'What documents do I need for financing?',
          answer: 'Typically, you\'ll need: Valid NIC, Proof of income (salary slips/bank statements), Proof of residence, and Employment verification letter. Requirements may vary by lender.',
        },
        {
          question: 'How long does loan approval take?',
          answer: 'Loan approval typically takes 2-5 business days depending on the financial institution. We work to expedite the process and keep you informed at every stage.',
        },
      ],
    },
    {
      category: 'Vehicle Inspection & Quality',
      icon: '🔍',
      faqs: [
        {
          question: 'Are all vehicles inspected before sale?',
          answer: 'Yes, every vehicle undergoes a comprehensive multi-point inspection by our qualified technicians. We check mechanical components, body condition, interior, electronics, and safety features.',
        },
        {
          question: 'Do vehicles come with a warranty?',
          answer: 'Yes, all our vehicles come with warranty coverage. The warranty period and coverage details vary by vehicle age and condition. Ask our sales team for specific warranty information.',
        },
        {
          question: 'What if I find an issue after purchase?',
          answer: 'If you discover an issue covered under warranty within the warranty period, contact us immediately. We\'ll arrange for inspection and repair as per warranty terms.',
        },
      ],
    },
    {
      category: 'Documentation & Registration',
      icon: '📄',
      faqs: [
        {
          question: 'What documents will I receive with my vehicle?',
          answer: 'You\'ll receive: Vehicle registration certificate, Insurance papers, Inspection certificate, Import documents, Service manual, Warranty documentation, and Sales invoice.',
        },
        {
          question: 'How long does registration transfer take?',
          answer: 'Registration transfer typically takes 1-2 weeks. We handle most of the paperwork on your behalf to make the process smooth and hassle-free.',
        },
        {
          question: 'Do you help with insurance?',
          answer: 'Yes, we work with several insurance providers and can help you arrange comprehensive insurance coverage for your new vehicle.',
        },
      ],
    },
    {
      category: 'Trade-In & Exchange',
      icon: '🔄',
      faqs: [
        {
          question: 'Do you accept trade-ins?',
          answer: 'Yes, we offer competitive trade-in values for your current vehicle. Our assessment team will evaluate your vehicle and provide a fair market value quote.',
        },
        {
          question: 'How is my trade-in value determined?',
          answer: 'Trade-in value is based on: Vehicle make, model, and year, Current condition and mileage, Market demand, Service history, and Overall market conditions.',
        },
        {
          question: 'Can I trade in a vehicle with an outstanding loan?',
          answer: 'Yes, we can work with vehicles that have outstanding loans. We\'ll help settle the loan and adjust the balance in your new vehicle purchase.',
        },
      ],
    },
    {
      category: 'After-Sales Support',
      icon: '🛠️',
      faqs: [
        {
          question: 'Do you provide maintenance services?',
          answer: 'Yes, our service center offers comprehensive maintenance and repair services using genuine parts and experienced technicians.',
        },
        {
          question: 'Where can I get spare parts?',
          answer: 'We stock genuine spare parts for most common makes and models. For specialized parts, we can source them through our reliable suppliers.',
        },
        {
          question: 'How do I schedule a service appointment?',
          answer: 'You can schedule service appointments by calling our service center, visiting our showroom, or using our online booking system.',
        },
      ],
    },
  ];

  const guides = [
    {
      title: 'First-Time Buyer\'s Guide',
      description: 'Everything you need to know before purchasing your first vehicle',
      topics: ['Setting a budget', 'Choosing the right vehicle', 'Understanding financing', 'What to look for'],
    },
    {
      title: 'Vehicle Inspection Checklist',
      description: 'What we check when inspecting vehicles',
      topics: ['Engine and transmission', 'Body and paint', 'Interior condition', 'Safety features'],
    },
    {
      title: 'Financing Guide',
      description: 'Understanding your financing options',
      topics: ['Loan vs. Lease', 'Interest rates', 'Down payments', 'Monthly budgeting'],
    },
    {
      title: 'Import Vehicle Guide',
      description: 'Learn about Japanese import vehicles',
      topics: ['Auction grades', 'Mileage verification', 'Import process', 'Quality standards'],
    },
  ];

  const filteredFaqCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="mx-auto mb-6 text-yellow-500" size={64} />
          <h1 className="text-5xl font-bold mb-6">Help & Guide Center</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Find answers to your questions and learn everything about buying and owning a vehicle from us
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-slate-900 text-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/contact" className="flex items-center gap-4 p-6 border-2 border-slate-200 rounded-xl hover:border-yellow-500 hover:shadow-lg transition group">
              <div className="bg-yellow-100 p-4 rounded-full group-hover:bg-yellow-500 transition">
                <Phone className="text-yellow-600 group-hover:text-white" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Call Us</h3>
                <p className="text-slate-600 text-sm">Speak with our team</p>
              </div>
            </Link>
            
            <Link href="/contact" className="flex items-center gap-4 p-6 border-2 border-slate-200 rounded-xl hover:border-yellow-500 hover:shadow-lg transition group">
              <div className="bg-yellow-100 p-4 rounded-full group-hover:bg-yellow-500 transition">
                <Mail className="text-yellow-600 group-hover:text-white" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Email Support</h3>
                <p className="text-slate-600 text-sm">Get help via email</p>
              </div>
            </Link>
            
            <Link href="/contact" className="flex items-center gap-4 p-6 border-2 border-slate-200 rounded-xl hover:border-yellow-500 hover:shadow-lg transition group">
              <div className="bg-yellow-100 p-4 rounded-full group-hover:bg-yellow-500 transition">
                <MessageCircle className="text-yellow-600 group-hover:text-white" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Live Chat</h3>
                <p className="text-slate-600 text-sm">Chat with us online</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Book className="text-yellow-500" size={32} />
            <h2 className="text-3xl font-bold text-slate-900">Helpful Guides</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
                <FileText className="text-yellow-500 mb-4" size={32} />
                <h3 className="text-xl font-bold text-slate-900 mb-3">{guide.title}</h3>
                <p className="text-slate-600 mb-4">{guide.description}</p>
                <ul className="space-y-2">
                  {guide.topics.map((topic, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Find quick answers to common questions
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {filteredFaqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex;
                    const isOpen = openFaq === globalIndex;
                    
                    return (
                      <div
                        key={faqIndex}
                        className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-100 transition"
                        >
                          <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="text-yellow-500 flex-shrink-0" size={24} />
                          ) : (
                            <ChevronDown className="text-slate-400 flex-shrink-0" size={24} />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 py-4 bg-white border-t border-slate-200">
                            <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {searchQuery && filteredFaqCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg mb-4">No results found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-yellow-600 hover:text-yellow-700 font-semibold"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our team is here to help you
          </p>
          <Link
            href="/contact"
            className="inline-block bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
