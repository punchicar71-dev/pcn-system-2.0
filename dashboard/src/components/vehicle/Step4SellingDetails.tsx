'use client';

import { SellingDetailsData, ENTRY_TYPES, VEHICLE_STATUS } from '@/types/vehicle-form.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step4SellingDetailsProps {
  data: SellingDetailsData;
  onChange: (data: Partial<SellingDetailsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4SellingDetails({ data, onChange, onNext, onBack }: Step4SellingDetailsProps) {
  const formatCurrency = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Format with thousand separators
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatMileage = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Format with thousand separators
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!data.sellingAmount || !data.entryType || !data.entryDate || !data.status) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate selling amount
    const amount = parseFloat(data.sellingAmount.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid selling amount');
      return;
    }

    onNext();
  };

  return (
    <div className="bg-white  p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicle Selling Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Amount & Mileage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sellingAmount">
              Selling Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rs.</span>
              <Input
                id="sellingAmount"
                value={data.sellingAmount}
                onChange={(e) => onChange({ sellingAmount: formatCurrency(e.target.value) })}
                placeholder="2,900,000"
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.sellingAmount && `Rs. ${data.sellingAmount}`}
            </p>
          </div>

          <div>
            <Label htmlFor="mileage">Milage</Label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Km.</span>
              <Input
                id="mileage"
                value={data.mileage}
                onChange={(e) => onChange({ mileage: formatMileage(e.target.value) })}
                placeholder="2,900,000"
                className="pr-12"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.mileage && `Km. ${data.mileage}`}
            </p>
          </div>
        </div>

        {/* Row 2: Entry Type */}
        <div>
          <Label htmlFor="entryType">
            Entry Type <span className="text-red-500">*</span>
          </Label>
          <Select value={data.entryType} onValueChange={(value) => onChange({ entryType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select entry type" />
            </SelectTrigger>
            <SelectContent>
              {ENTRY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 3: Entry Date & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="entryDate">
              Entry Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="entryDate"
              type="date"
              value={data.entryDate}
              onChange={(e) => onChange({ entryDate: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select value={data.status} onValueChange={(value) => onChange({ status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Selling Details Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Selling Amount:</span>
              <p className="font-semibold text-gray-900">
                Rs. {data.sellingAmount || '0'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Mileage:</span>
              <p className="font-semibold text-gray-900">
                Km. {data.mileage || '0'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Entry Type:</span>
              <p className="font-semibold text-gray-900">{data.entryType}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-semibold text-gray-900">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    data.status === 'In Sale'
                      ? 'bg-green-100 text-green-800'
                      : data.status === 'Out of Sale'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {data.status}
                </span>
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Entry Date:</span>
              <p className="font-semibold text-gray-900">
                {data.entryDate ? new Date(data.entryDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </p>
            </div>
          </div>
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
