# Notification System Integration Guide

## Overview
The PCN System now has a fully functional notification system that tracks all vehicle operations and displays them in real-time.

## Features
- ✅ Real-time notifications with Supabase subscriptions
- ✅ Toast notifications for immediate feedback
- ✅ Persistent notification history in dropdown
- ✅ Unread badge counter
- ✅ Mark as read functionality
- ✅ Delete individual notifications
- ✅ Clear all notifications
- ✅ Color-coded notification types
- ✅ Vehicle-specific notification tracking

## Notification Types

1. **Added** 🚗 - When a vehicle is added to inventory (Green)
2. **Updated** ✏️ - When vehicle details are updated (Yellow)
3. **Deleted** 🗑️ - When a vehicle is removed (Red)
4. **Moved to Sales** 💰 - When vehicle moves to sales transactions (Blue)
5. **Sold** ✅ - When vehicle sale is completed (Emerald)

## Setup Complete

### 1. Database Table ✅
```sql
-- Run this migration in Supabase SQL Editor:
-- /dashboard/migrations/2025_01_add_notifications_table.sql
```

### 2. Components Installed ✅
- Toast (shadcn/ui)
- Badge (shadcn/ui)
- Popover (shadcn/ui)

### 3. Files Created ✅
```
dashboard/src/
├── types/
│   └── notification.ts                    # TypeScript types
├── lib/
│   └── notificationService.ts             # Core notification logic
├── contexts/
│   └── NotificationContext.tsx            # React context & provider
├── hooks/
│   └── useNotify.ts                       # Easy-to-use hook
└── components/
    └── notifications/
        └── NotificationDropdown.tsx       # UI component
```

## How to Use in Your Components

### Method 1: Using the `useNotify` Hook (Recommended)

```tsx
'use client'

import { useNotify } from '@/hooks/useNotify'

export default function YourComponent() {
  const { notify } = useNotify()

  const handleAddVehicle = async () => {
    // Your vehicle creation logic...
    
    // Then notify:
    await notify(
      'added',           // action type
      'CBA-3822',        // vehicle number
      'Toyota',          // brand
      'Aqua'             // model
    )
  }

  const handleUpdateVehicle = async () => {
    // Your update logic...
    
    await notify('updated', 'CBA-3822', 'Toyota', 'Aqua')
  }

  const handleDeleteVehicle = async () => {
    // Your delete logic...
    
    await notify('deleted', 'CBA-3822', 'Toyota', 'Aqua')
  }

  const handleMoveToSales = async () => {
    // Your sales logic...
    
    await notify('moved_to_sales', 'CBA-3822', 'Toyota', 'Aqua')
  }

  const handleCompleteSale = async () => {
    // Your completion logic...
    
    await notify('sold', 'CBA-3822', 'Toyota', 'Aqua')
  }

  return (
    <div>
      {/* Your component UI */}
    </div>
  )
}
```

### Method 2: Direct Service Call

```tsx
import { notifyVehicleAction } from '@/lib/notificationService'
import { createClient } from '@/lib/supabase-client'

// Get current user
const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
const { data: userData } = await supabase
  .from('users')
  .select('id, first_name, last_name')
  .eq('auth_id', session.user.id)
  .single()

const userName = `${userData.first_name} ${userData.last_name}`

// Create notification
await notifyVehicleAction(
  userData.id,
  userName,
  'added',
  'CBA-3822',
  'Toyota',
  'Aqua'
)
```

## Integration Examples

### Add Vehicle Page

```tsx
// In /dashboard/src/app/(dashboard)/add-vehicle/page.tsx

import { useNotify } from '@/hooks/useNotify'

export default function AddVehiclePage() {
  const { notify } = useNotify()

  const handleSubmit = async (formData: any) => {
    try {
      // Create vehicle in database
      const { data: vehicle } = await supabase
        .from('vehicles')
        .insert(formData)
        .select()
        .single()

      // Send notification
      await notify(
        'added',
        vehicle.vehicle_number,
        vehicle.brand_name,
        vehicle.model_name
      )

      // Success message, navigation, etc.
    } catch (error) {
      console.error(error)
    }
  }

  return (
    // Your form UI
  )
}
```

### Inventory Page (Update/Delete)

```tsx
// In /dashboard/src/app/(dashboard)/inventory/page.tsx

import { useNotify } from '@/hooks/useNotify'

export default function InventoryPage() {
  const { notify } = useNotify()

  const handleUpdateVehicle = async (vehicle: any, updates: any) => {
    try {
      await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicle.id)

      await notify(
        'updated',
        vehicle.vehicle_number,
        vehicle.brand_name,
        vehicle.model_name
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteVehicle = async (vehicle: any) => {
    try {
      await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicle.id)

      await notify(
        'deleted',
        vehicle.vehicle_number,
        vehicle.brand_name,
        vehicle.model_name
      )
    } catch (error) {
      console.error(error)
    }
  }

  return (
    // Your inventory UI
  )
}
```

### Sell Vehicle Page

```tsx
// In /dashboard/src/app/(dashboard)/sell-vehicle/page.tsx

import { useNotify } from '@/hooks/useNotify'

export default function SellVehiclePage() {
  const { notify } = useNotify()

  const handleMoveToSales = async (vehicle: any) => {
    try {
      // Create pending sale record
      await supabase
        .from('pending_vehicle_sales')
        .insert({ vehicle_id: vehicle.id, /* other data */ })

      await notify(
        'moved_to_sales',
        vehicle.vehicle_number,
        vehicle.brand_name,
        vehicle.model_name
      )
    } catch (error) {
      console.error(error)
    }
  }

  return (
    // Your form UI
  )
}
```

### Sales Transactions Page

```tsx
// In /dashboard/src/app/(dashboard)/sales-transactions/page.tsx

import { useNotify } from '@/hooks/useNotify'

export default function SalesTransactionsPage() {
  const { notify } = useNotify()

  const handleCompleteSale = async (sale: any) => {
    try {
      // Complete the sale
      await supabase
        .from('pending_vehicle_sales')
        .update({ status: 'completed' })
        .eq('id', sale.id)

      // Move to sales table
      await supabase
        .from('sales')
        .insert({ /* sale data */ })

      await notify(
        'sold',
        sale.vehicle.vehicle_number,
        sale.vehicle.brand_name,
        sale.vehicle.model_name
      )
    } catch (error) {
      console.error(error)
    }
  }

  return (
    // Your sales UI
  )
}
```

## UI Components

### Notification Dropdown
Located in the top-right header, displays:
- Bell icon with unread badge
- Dropdown with notification list
- "Mark all as read" button
- "Clear all" button
- Individual notification actions

### Toast Notifications
Automatic toast pop-ups for:
- Immediate feedback on actions
- Real-time updates from other users
- Color-coded by notification type
- Auto-dismiss after 5 seconds

## Testing

1. **Run Migration**
   ```bash
   # Copy SQL from /dashboard/migrations/2025_01_add_notifications_table.sql
   # Paste into Supabase SQL Editor and run
   ```

2. **Start Development Server**
   ```bash
   cd dashboard
   npm run dev
   ```

3. **Test Notifications**
   - Add a vehicle → See green notification
   - Update a vehicle → See yellow notification
   - Delete a vehicle → See red notification
   - Move to sales → See blue notification
   - Complete sale → See emerald notification

4. **Test Real-time**
   - Open in two browser windows
   - Perform action in one window
   - See notification appear in other window

## Customization

### Change Notification Colors
Edit `/dashboard/src/components/notifications/NotificationDropdown.tsx`:

```tsx
const getNotificationColor = (type: string) => {
  switch (type) {
    case 'added':
      return 'bg-green-50 border-green-200'  // Change these
    // ... other cases
  }
}
```

### Change Notification Messages
Edit `/dashboard/src/lib/notificationService.ts`:

```tsx
case 'added':
  title = 'Vehicle Added'
  message = `${userName} added ${vehicleInfo} to the Inventory.`
  break
```

### Add New Notification Types
1. Add to type in `/dashboard/src/types/notification.ts`
2. Add case in `/dashboard/src/lib/notificationService.ts`
3. Add icon/color in dropdown component

## Troubleshooting

### Notifications Not Appearing
1. Check database table exists
2. Verify user is logged in
3. Check browser console for errors
4. Ensure NotificationProvider wraps your app

### Real-time Not Working
1. Check Supabase subscription status
2. Verify RLS policies allow reads
3. Check network tab for websocket connection

### Toast Not Showing
1. Verify Toaster component is in layout
2. Check useToast hook is imported correctly
3. Look for TypeScript errors

## Next Steps

Now you need to:
1. ✅ Run the SQL migration
2. 🔄 Add notification calls to your vehicle operation pages
3. ✅ Test the notification system
4. ✅ Customize colors/messages if needed

## Support

For issues or questions:
- Check browser console for errors
- Review Supabase logs
- Check RLS policies
- Verify all files are in correct locations
