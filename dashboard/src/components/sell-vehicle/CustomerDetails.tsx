'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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
    <div className="bg-slate-50 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Seller Details</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name and Last Name */}
        <div className="flex w-full md:flex-cols-2 gap-4">
          <div className="relative">
            <Label className="block w-[400px] mb-1">
              First Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative flex items-center">
              {/* Title Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-9 px-3 rounded-r-none border-r-0 min-w-[80px] justify-between"
                >
                  <span className="text-sm">{formData.title || 'Mr.'}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-[80px] bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    {titles.map((title) => (
                      <Button
                        key={title}
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          onChange('title', title);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full justify-start rounded-none first:rounded-t-lg last:rounded-b-lg h-auto py-2"
                      >
                        {title}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* First Name Input */}
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => onChange('firstName', e.target.value)}
                className="flex-1 rounded-l-none"
                placeholder=""
                required
              />
            </div>
          </div>

          <div>
            <Label className="block w-[400px] mb-1">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              className="w-full"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div className="w-[820px]">
          <Label className="block mb-1">
            Address
          </Label>
          <Input
            type="text"
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="w-full"
            placeholder="Ex: No1, Petta, Colombo 1"
          />
        </div>

        {/* City and NIC Number */}
        <div className="flex md:flex-cols-2 gap-4">
          <div >
            <Label className="block w-[400px] mb-1">
              Town
            </Label>
            <Input
              type="text"
              value={formData.city}
              onChange={(e) => onChange('city', e.target.value)}
              className="w-full"
              placeholder="Select"
            />
          </div>

          <div>
            <Label className="block w-[400px] mb-1">
              NIC Number
            </Label>
            <Input
              type="text"
              value={formData.nicNumber}
              onChange={(e) => onChange('nicNumber', e.target.value)}
              className="w-full"
              placeholder="Ex: 8748909230V"
            />
          </div>
        </div>

        {/* Mobile Number and Land Phone Number */}
        <div className="flex md:flex-cols-2 gap-4">
          <div>
            <Label className="block w-[400px] mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </Label>
            <Input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => onChange('mobileNumber', e.target.value)}
              className="w-full"
              placeholder="+94"
              required
            />
          </div>

          <div>
            <Label className="block w-[400px] mb-1">
              Land Phone Number
            </Label>
            <Input
              type="tel"
              value={formData.landPhoneNumber}
              onChange={(e) => onChange('landPhoneNumber', e.target.value)}
              className="w-full"
              placeholder="+94"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="w-[820px]">
          <Label className="block mb-1">
            Email Address
          </Label>
          <Input
            type="email"
            value={formData.emailAddress}
            onChange={(e) => onChange('emailAddress', e.target.value)}
            className="w-full"
            placeholder="Ex: john.doe@gmail.com"
          />
        </div>

        {/* Next Button */}
        <div className="flex justify-start pt-4">
          <Button
            type="submit"
            className="px-8"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
