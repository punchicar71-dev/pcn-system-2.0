'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CustomerDetailsProps {
  formData: {
    title: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    nicNumber: string;
    mobileNumber: string;
    landPhoneNumber: string;
    emailAddress: string;
  };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

const titles = ['Mr.', 'Miss.', 'Mrs.', 'Dr.'];

export default function CustomerDetails({ formData, onChange, onNext }: CustomerDetailsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Seller Details</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name and Last Name */}
        <div className="flex w-full md:flex-cols-2 gap-4">
          <div className="relative">
            <label className="block w-[400px] text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              {/* Title Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-[42px] px-3 border border-r-0 border-gray-300 rounded-l-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-1 min-w-[80px]"
                >
                  <span className="text-sm">{formData.title || 'Mr.'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-[80px] bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    {titles.map((title) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() => {
                          onChange('title', title);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* First Name Input */}
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => onChange('firstName', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder=""
                required
              />
            </div>
          </div>

          <div>
            <label className="block w-[400px] text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div className="w-[820px]">
          <label className="block  text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: No1, Petta, Colombo 1"
          />
        </div>

        {/* City and NIC Number */}
        <div className="flex md:flex-cols-2 gap-4">
          <div >
            <label className="block w-[400px] text-sm font-medium text-gray-700 mb-1">
              Town
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => onChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Select"
            />
          </div>

          <div>
            <label className="block w-[400px] text-sm font-medium text-gray-700 mb-1">
              NIC Number
            </label>
            <input
              type="text"
              value={formData.nicNumber}
              onChange={(e) => onChange('nicNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 8748909230V"
            />
          </div>
        </div>

        {/* Mobile Number and Land Phone Number */}
        <div className="flex md:flex-cols-2 gap-4">
          <div>
            <label className="block w-[400px] text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => onChange('mobileNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+94"
              required
            />
          </div>

          <div>
            <label className="block w-[400px] text-sm font-medium text-gray-700 mb-1">
              Land Phone Number
            </label>
            <input
              type="tel"
              value={formData.landPhoneNumber}
              onChange={(e) => onChange('landPhoneNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+94"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="w-[820px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.emailAddress}
            onChange={(e) => onChange('emailAddress', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: john.doe@gmail.com"
          />
        </div>

        {/* Next Button */}
        <div className="flex justify-start pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
