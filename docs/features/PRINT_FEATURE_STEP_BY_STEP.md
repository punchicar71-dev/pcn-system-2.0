# 🔧 Print Document Feature - Step-by-Step Build Guide

## Current Status: Data Loading Issue ⚠️

The modal opens but shows "Failed to load sale data". Let's fix this step by step.

---

## 🔍 Step 1: Debug the Data Loading

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click the print icon
4. Look for error messages

### Expected Console Output:
```
Sale data loaded: { id: "...", customer_first_name: "...", vehicles: {...} }
```

### If You See Error:
Check the error message - it will tell us what's wrong with the database query.

---

## 🔧 Step 2: Fix Database Query

The issue is likely in how we're fetching the seller data. Let's verify the database structure:

### Check if sellers table has vehicle_id:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'sellers';
```

### Check pending_vehicle_sales structure:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'pending_vehicle_sales';
```

---

## 🎯 Step 3: Simplified Version (Test First)

Let me create a simplified version that just shows the buttons without the complex print logic:

### File: `PrintDocumentModal.tsx` (Simplified)

```typescript
'use client';

import { X, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
}

export default function PrintDocumentModal({
  isOpen,
  onClose,
  saleId,
}: PrintDocumentModalProps) {
  const [saleData, setSaleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && saleId) {
      fetchSaleData();
    }
  }, [isOpen, saleId]);

  const fetchSaleData = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // Simple query first
      const { data: sale, error } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          *,
          vehicles:vehicle_id (
            *,
            vehicle_brands:brand_id (name),
            vehicle_models:model_id (name)
          ),
          sales_agents:sales_agent_id (
            name
          )
        `)
        .eq('id', saleId)
        .single();

      if (error) {
        console.error('Error fetching sale data:', error);
        alert('Error: ' + error.message);
        return;
      }

      // Fetch seller separately
      if (sale?.vehicles?.id) {
        const { data: sellerData } = await supabase
          .from('sellers')
          .select('*')
          .eq('vehicle_id', sale.vehicles.id)
          .maybeSingle();

        if (sellerData) {
          sale.seller = sellerData;
        }
      }

      console.log('✅ Sale data loaded:', sale);
      setSaleData(sale);
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (documentType: string) => {
    if (!saleData) {
      alert('No data available');
      return;
    }

    console.log('Printing:', documentType);
    console.log('Sale data:', saleData);
    
    // For now, just show an alert
    alert(`Printing ${documentType}\n\nVehicle: ${saleData.vehicles?.vehicle_brands?.name} ${saleData.vehicles?.vehicle_models?.name}\nNumber: ${saleData.vehicles?.vehicle_number}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">Document Print</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse text-gray-500">Loading sale data...</div>
            </div>
          ) : saleData ? (
            <>
              {/* Vehicle Info Banner */}
              <div className="bg-gray-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {saleData.vehicles?.vehicle_brands?.name || 'N/A'}{' '}
                  {saleData.vehicles?.vehicle_models?.name || 'N/A'}{' '}
                  {saleData.vehicles?.manufacture_year || 'N/A'} -{' '}
                  <span className="text-green-600">
                    {saleData.vehicles?.vehicle_number || 'N/A'}
                  </span>
                </h3>
                <p className="text-green-600 font-medium">
                  Documents are ready to print!
                </p>
              </div>

              {/* Print Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handlePrint('CASH_SELLER')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
                    Print Cash Seller
                  </span>
                </button>

                <button
                  onClick={() => handlePrint('CASH_DEALER')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
                    Print Cash Dealer
                  </span>
                </button>

                <button
                  onClick={() => handlePrint('ADVANCE_NOTE')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
                    Advance Note
                  </span>
                </button>

                <button
                  onClick={() => handlePrint('FINANCE_SELLER')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
                    Print Finance Seller
                  </span>
                </button>

                <button
                  onClick={() => handlePrint('FINANCE_DEALER')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  <span className="text-base font-semibold text-gray-700 group-hover:text-gray-900">
                    Print Finance Dealer
                  </span>
                </button>
              </div>

              {/* Debug Info (remove in production) */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg text-xs">
                <p className="font-semibold text-blue-900 mb-2">Debug Info:</p>
                <pre className="text-blue-800 overflow-auto max-h-40">
                  {JSON.stringify({
                    saleId: saleData.id,
                    customer: `${saleData.customer_first_name} ${saleData.customer_last_name}`,
                    vehicle: saleData.vehicles?.vehicle_number,
                    amount: saleData.selling_amount,
                    hasSeller: !!saleData.seller
                  }, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-red-500">
              <p className="text-lg font-semibold">Failed to load sale data</p>
              <p className="text-sm mt-2">Check console for error details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Step 4: Test the Simplified Version

1. Save the file
2. Refresh browser
3. Click print icon
4. Check if vehicle info displays
5. Click a button - should show alert with data

---

## 🎨 Step 5: Add Canvas Printing (Once Step 4 Works)

Only after confirming data loads correctly, we'll add the canvas printing logic.

---

## 🔍 Common Issues & Solutions

### Issue 1: "Failed to load sale data"
**Check:**
- Browser console for error message
- Database connection
- Table permissions in Supabase

### Issue 2: Vehicle info shows "N/A"
**Check:**
- Database query includes proper joins
- vehicle_brands and vehicle_models tables exist
- brand_id and model_id are correct in vehicles table

### Issue 3: Seller data missing
**Check:**
- sellers table has vehicle_id column
- Relationship between vehicles and sellers is correct

---

## 📋 Next Steps After Testing

Once the simplified version works:

1. ✅ Data loads correctly
2. ✅ Vehicle info displays
3. ✅ All 5 buttons work (show alert)
4. 🔄 Add canvas printing logic
5. 🔄 Add template image loading
6. 🔄 Add data overlay on templates
7. 🔄 Add print dialog functionality

---

## 🚀 Full Implementation (After Testing)

I'll provide the complete canvas printing code once we confirm the data loading works correctly.

---

## 📞 Testing Checklist

- [ ] Modal opens without errors
- [ ] Vehicle info displays correctly
- [ ] All 5 buttons are visible
- [ ] Buttons have hover effects
- [ ] Debug info shows correct data
- [ ] Console shows "✅ Sale data loaded"
- [ ] No error messages in console

---

**Current Priority:** Fix data loading first, then add printing functionality.

**Next Document:** Will provide full canvas implementation once basic version works.
