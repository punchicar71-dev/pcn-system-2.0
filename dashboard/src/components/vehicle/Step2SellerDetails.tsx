'use client';

import { SellerDetailsData } from '@/types/vehicle-form.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Step2SellerDetailsProps {
  data: SellerDetailsData;
  onChange: (data: Partial<SellerDetailsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2SellerDetails({ data, onChange, onNext, onBack }: Step2SellerDetailsProps) {
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Seller Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="John"
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={data.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
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
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Ex: No1, Petta, Colombo 1"
          />
        </div>

        {/* Row 3: City & NIC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Colombo 1"
            />
          </div>

          <div>
            <Label htmlFor="nicNumber">NIC Number</Label>
            <Input
              id="nicNumber"
              value={data.nicNumber}
              onChange={(e) => onChange({ nicNumber: e.target.value })}
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
              value={data.mobileNumber}
              onChange={(e) => onChange({ mobileNumber: formatMobileNumber(e.target.value) })}
              placeholder="+94"
              required
            />
          </div>

          <div>
            <Label htmlFor="landPhoneNumber">Land Phone Number</Label>
            <Input
              id="landPhoneNumber"
              value={data.landPhoneNumber}
              onChange={(e) => onChange({ landPhoneNumber: formatLandPhone(e.target.value) })}
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
            placeholder="Ex: john.doe@gmail.com"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
