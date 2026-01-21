'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { SellingDetailsData, ENTRY_TYPES, VEHICLE_STATUS } from '@/types/vehicle-form.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { createClient } from '@/lib/supabase-client';
import { SalesCommission } from '@/lib/database.types';

interface Step4SellingDetailsProps {
  data: SellingDetailsData;
  onChange: (data: Partial<SellingDetailsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Threshold for auto-selecting entry type (5,000,000)
const ENTRY_TYPE_THRESHOLD = 5000000;

export default function Step4SellingDetails({ data, onChange, onNext, onBack }: Step4SellingDetailsProps) {
  const [salesCommissions, setSalesCommissions] = useState<SalesCommission[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchSalesCommissions();
    
    // Set up real-time subscription to sales_commissions table
    const channel = supabase
      .channel('sales_commissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_commissions'
        },
        (payload) => {
          console.log('Sales commission changed:', payload);
          fetchSalesCommissions();
        }
      )
      .subscribe();

    // Also refetch when component regains focus (in case user switched tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSalesCommissions();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchSalesCommissions = async () => {
    try {
      const { data: commissionsData } = await supabase
        .from('sales_commissions')
        .select('*')
        .eq('is_active', true)
        .order('min_price');
      if (commissionsData) setSalesCommissions(commissionsData);
    } catch (error) {
      console.error('Error fetching sales commissions:', error);
    }
  };

  // Function to auto-select entry type based on selling amount
  const getAutoEntryType = useCallback((amount: number): string => {
    if (amount < ENTRY_TYPE_THRESHOLD) {
      return 'PCN';
    } else {
      return 'PCN Pvt Ltd.';
    }
  }, []);

  // Function to find matching sales commission based on selling amount - Improved matching
  const findMatchingSalesCommission = useCallback((amount: number): string | undefined => {
    if (!salesCommissions.length || amount <= 0) return undefined;
    
    // First, try to find exact match within a range
    const exactMatch = salesCommissions.find(
      commission => amount >= commission.min_price && amount <= commission.max_price
    );
    
    if (exactMatch) {
      return exactMatch.id;
    }
    
    // If amount exceeds all ranges, select the highest category
    const sortedByMaxPrice = [...salesCommissions].sort((a, b) => b.max_price - a.max_price);
    const highestCategory = sortedByMaxPrice[0];
    
    if (highestCategory && amount > highestCategory.max_price) {
      return highestCategory.id;
    }
    
    // If amount is below all ranges, select the lowest category
    const sortedByMinPrice = [...salesCommissions].sort((a, b) => a.min_price - b.min_price);
    const lowestCategory = sortedByMinPrice[0];
    
    if (lowestCategory && amount < lowestCategory.min_price) {
      return lowestCategory.id;
    }
    
    return undefined;
  }, [salesCommissions]);

  // Handle selling amount change with auto-selection logic
  const handleSellingAmountChange = (value: string) => {
    const formattedValue = formatCurrency(value);
    const numericAmount = parseFloat(value.replace(/,/g, '')) || 0;
    
    // Prepare the update object
    const updates: Partial<SellingDetailsData> = {
      sellingAmount: formattedValue
    };
    
    // Auto-select entry type based on amount
    if (numericAmount > 0) {
      updates.entryType = getAutoEntryType(numericAmount);
      
      // Auto-select sales commission based on amount
      const matchingCommissionId = findMatchingSalesCommission(numericAmount);
      if (matchingCommissionId) {
        updates.salesCommissionId = matchingCommissionId;
      }
    }
    
    onChange(updates);
  };

  const formatCurrency = (value: string) => {
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

  // Get the current numeric selling amount
  const currentAmount = parseFloat(data.sellingAmount?.replace(/,/g, '') || '0');
  
  // Get the matched commission for display
  const matchedCommission = salesCommissions.find(c => c.id === data.salesCommissionId);

  return (
    <div className="bg-slate-50 px-6 pt-6 pb-0">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicle Selling Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Selling Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          <div>
            <Label htmlFor="sellingAmount">
              Selling Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rs.</span>
              <Input
                id="sellingAmount"
                value={data.sellingAmount}
                onChange={(e) => handleSellingAmountChange(e.target.value)}
                placeholder="2,900,000"
                className="pl-10"
                required
              />
            </div>
            <div className="text-xs mt-1 space-y-0.5">
              {data.sellingAmount && (
                <p className="text-gray-500">Rs. {data.sellingAmount}</p>
              )}
              {currentAmount > 0 && (
                <p className="text-blue-600">
                  Auto: Entry Type → {getAutoEntryType(currentAmount)}
                  {matchedCommission && ` | Commission → ${matchedCommission.name}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Entry Type & Sales Commission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          <div>
            <Label htmlFor="entryType">
              Entry Type <span className="text-red-500">*</span> 
              <span className="text-xs font-normal text-gray-500 ml-1">(Auto-selected based on amount)</span>
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
            <p className="text-xs text-gray-500 mt-1">
              Below Rs. 5,000,000 → PCN | Above Rs. 5,000,000 → PCN Pvt Ltd.
            </p>
          </div>

          <div>
            <Label htmlFor="salesCommission">
              Sales Commission
              <span className="text-xs font-normal text-gray-500 ml-1">(Auto-detected based on amount)</span>
            </Label>
            <Select value={data.salesCommissionId} onValueChange={(value) => onChange({ salesCommissionId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select sales commission" />
              </SelectTrigger>
              <SelectContent>
                {salesCommissions.map((commission) => (
                  <SelectItem key={commission.id} value={commission.id}>
                    {commission.name} (Rs. {commission.min_price.toLocaleString()} - Rs. {commission.max_price.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {matchedCommission && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Matched: {matchedCommission.name} | Commission: Rs. {matchedCommission.commission_amount.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Entry Date & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          <div>
            <Label htmlFor="entryDate">
              Entry Date <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              date={data.entryDate ? new Date(data.entryDate) : undefined}
              onDateChange={(date) => onChange({ entryDate: date ? format(date, 'yyyy-MM-dd') : '' })}
              placeholder="Select entry date"
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

        {/* Navigation Buttons - Sticky Bottom */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t py-4 px-6 -mx-6 mt-6">
          <div className="flex justify-start gap-4">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className='px-6 py-2'
            >
              Back
            </Button>
            <Button
              type="submit"
              className='px-6 py-2'
            >
              Next
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
