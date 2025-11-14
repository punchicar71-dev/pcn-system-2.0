'use client';

import { useState, useEffect } from 'react';
import { SellingDetailsData, ENTRY_TYPES, VEHICLE_STATUS } from '@/types/vehicle-form.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-client';
import { PriceCategory } from '@/lib/database.types';

interface Step4SellingDetailsProps {
  data: SellingDetailsData;
  onChange: (data: Partial<SellingDetailsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4SellingDetails({ data, onChange, onNext, onBack }: Step4SellingDetailsProps) {
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchPriceCategories();
  }, []);

  const fetchPriceCategories = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('price_categories')
        .select('*')
        .eq('is_active', true)
        .order('min_price');
      if (categoriesData) setPriceCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching price categories:', error);
    }
  };
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
    <div className="bg-white max-w-4xl p-6">
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

        {/* Row 2: Entry Type & Price Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <Label htmlFor="priceCategory">Price Category</Label>
            <Select value={data.priceCategoryId} onValueChange={(value) => onChange({ priceCategoryId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select price category" />
              </SelectTrigger>
              <SelectContent>
                {priceCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

        {/* Navigation Buttons */}
        <div className="flex justify-start gap-4 pt-6">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
          >
            Back
          </Button>
          <Button
            type="submit"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
