'use client';

import { SellerDetailsData } from '@/types/vehicle-form.types';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Step2SellerDetailsProps {
  data: SellerDetailsData;
  onChange: (data: Partial<SellerDetailsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const titles = ['Mr.', 'Miss.', 'Mrs.', 'Dr.'];

export default function Step2SellerDetails({ data, onChange, onNext, onBack }: Step2SellerDetailsProps) {
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
    
    // Validation
    if (!data.firstName || !data.lastName || !data.mobileNumber) {
      alert('Please fill in required fields: First Name, Last Name, and Mobile Number');
      return;
    }

    // Validate mobile number format
    if (!/^\+94\d{9}$/.test(data.mobileNumber) && !/^0\d{9}$/.test(data.mobileNumber)) {
      alert('Please enter a valid mobile number');
      return;
    }

    onNext();
  };

  const formatMobileNumber = (value: string) => {
    // Remove all non-digit characters except +
    let formatted = value.replace(/[^\d+]/g, '');
    
    // If starts with 0, replace with +94
    if (formatted.startsWith('0')) {
      formatted = '+94' + formatted.substring(1);
    }
    
    // If doesn't start with +94, add it
    if (!formatted.startsWith('+94')) {
      formatted = '+94' + formatted;
    }
    
    return formatted;
  };

  const formatLandPhone = (value: string) => {
    // Remove all non-digit characters except +
    let formatted = value.replace(/[^\d+]/g, '');
    
    // If starts with 0, replace with +94
    if (formatted.startsWith('0')) {
      formatted = '+94' + formatted.substring(1);
    }
    
    // If doesn't start with +94, add it
    if (!formatted.startsWith('+94')) {
      formatted = '+94' + formatted;
    }
    
    return formatted;
  };

  return (
    <div className="bg-white max-w-4xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Seller Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">
              First Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative flex items-center mt-1">
              {/* Title Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-9 px-3 rounded-r-none border-r-0 flex items-center gap-1 min-w-[80px]"
                >
                  <span className="text-sm">{data.title || 'Mr.'}</span>
                  <ChevronDown className="h-4 w-4" />
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
                          onChange({ title });
                          setIsDropdownOpen(false);
                        }}
                        className="w-full justify-start text-sm first:rounded-t-lg last:rounded-b-lg h-9"
                      >
                        {title}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* First Name Input */}
              <Input
                id="firstName"
                type="text"
                value={data.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
                className="flex-1 rounded-l-none border-l-0"
                placeholder=""
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lastName">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              value={data.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              className="mt-1"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        {/* Row 2: Address */}
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className="mt-1"
            placeholder="Ex: No1, Petta, Colombo 1"
          />
        </div>

        {/* Row 3: City & NIC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className="mt-1"
              placeholder="Colombo 1"
            />
          </div>

          <div>
            <Label htmlFor="nicNumber">NIC Number</Label>
            <Input
              id="nicNumber"
              type="text"
              value={data.nicNumber}
              onChange={(e) => onChange({ nicNumber: e.target.value })}
              className="mt-1"
              placeholder="Ex: 870690920v"
            />
          </div>
        </div>

        {/* Row 4: Phone Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mobileNumber">
              Mobile Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mobileNumber"
              type="text"
              value={data.mobileNumber}
              onChange={(e) => onChange({ mobileNumber: formatMobileNumber(e.target.value) })}
              className="mt-1"
              placeholder="+94"
              required
            />
          </div>

          <div>
            <Label htmlFor="landPhoneNumber">Land Phone Number</Label>
            <Input
              id="landPhoneNumber"
              type="text"
              value={data.landPhoneNumber}
              onChange={(e) => onChange({ landPhoneNumber: formatLandPhone(e.target.value) })}
              className="mt-1"
              placeholder="+94"
            />
          </div>
        </div>

        {/* Row 5: Email */}
        <div>
          <Label htmlFor="emailAddress">Email Address</Label>
          <Input
            id="emailAddress"
            type="email"
            value={data.emailAddress}
            onChange={(e) => onChange({ emailAddress: e.target.value })}
            className="mt-1"
            placeholder="Ex: john.doe@gmail.com"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-start gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="bg-black text-white hover:bg-gray-800"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
