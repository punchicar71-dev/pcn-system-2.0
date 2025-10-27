'use client';

interface CustomerDetailsProps {
  formData: {
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

export default function CustomerDetails({ formData, onChange, onNext }: CustomerDetailsProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Details</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name and Last Name */}
        <div className="flex w-full md:flex-cols-2 gap-4">
          <div>
            <label className="block w-[400px] text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="John"
              required
            />
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
