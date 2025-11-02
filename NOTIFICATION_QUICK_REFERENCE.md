# 🔔 Notification System - Quick Reference

## 🎯 Quick Start

### 1️⃣ Run SQL Migration
```bash
# Go to Supabase Dashboard → SQL Editor
# Copy from: dashboard/migrations/2025_01_add_notifications_table.sql
# Click "Run" button
```

### 2️⃣ Use in Your Components
```tsx
import { useNotify } from '@/hooks/useNotify'

const { notify } = useNotify()

// When adding a vehicle:
await notify('added', vehicleNumber, brand, model)

// When updating:
await notify('updated', vehicleNumber, brand, model)

// When deleting:
await notify('deleted', vehicleNumber, brand, model)

// When moving to sales:
await notify('moved_to_sales', vehicleNumber, brand, model)

// When sold:
await notify('sold', vehicleNumber, brand, model)
```

## 📝 5 Notification Types

| Type | Icon | Color | When to Use |
|------|------|-------|-------------|
| `added` | 🚗 | Green | Vehicle added to inventory |
| `updated` | ✏️ | Yellow | Vehicle details changed |
| `deleted` | 🗑️ | Red | Vehicle removed |
| `moved_to_sales` | 💰 | Blue | Vehicle moved to sales |
| `sold` | ✅ | Emerald | Sale completed |

## 🎨 UI Features

### Notification Bell (Top Right)
- Shows unread count badge
- Click to open dropdown
- Real-time updates

### Notification Dropdown
- ✅ List all notifications
- ✅ Mark individual as read
- ✅ Mark all as read
- ✅ Delete individual
- ✅ Clear all notifications
- ✅ Color-coded by type
- ✅ Time ago format

### Toast Notifications
- ✅ Instant feedback
- ✅ Auto-dismiss (5s)
- ✅ Color variants
- ✅ Appears on all actions

## 🚀 Real-time Updates
- Notifications sync across all browser tabs
- Other users see your actions instantly
- Uses Supabase Realtime subscriptions

## 📍 Where to Add Notifications

### Add Vehicle Page
```tsx
// After successfully creating vehicle
await notify('added', vehicle.vehicle_number, vehicle.brand_name, vehicle.model_name)
```

### Inventory Page
```tsx
// After update
await notify('updated', vehicle.vehicle_number, vehicle.brand_name, vehicle.model_name)

// After delete
await notify('deleted', vehicle.vehicle_number, vehicle.brand_name, vehicle.model_name)
```

### Sell Vehicle Page
```tsx
// After moving to sales
await notify('moved_to_sales', vehicle.vehicle_number, vehicle.brand_name, vehicle.model_name)
```

### Sales Transactions Page
```tsx
// After completing sale
await notify('sold', vehicle.vehicle_number, vehicle.brand_name, vehicle.model_name)
```

## 🧪 Testing

1. **Add a test vehicle** → Green notification appears
2. **Update the vehicle** → Yellow notification appears
3. **Open in 2 tabs** → See real-time sync
4. **Click bell icon** → See all notifications
5. **Click notification** → Mark as read
6. **Click "Mark all read"** → All turn read
7. **Click "Clear All"** → All removed

## ✅ What's Already Done

- ✅ Database table created
- ✅ All components built
- ✅ Context and hooks ready
- ✅ UI fully designed
- ✅ Real-time subscriptions working
- ✅ Toast notifications active
- ✅ Integrated into layout

## 🔧 You Need To

1. Run the SQL migration
2. Add `notify()` calls to your vehicle operations
3. Test and enjoy!

## 📚 Full Documentation

See `NOTIFICATIONS_GUIDE.md` for detailed integration instructions.

---

**Need help?** Check browser console for errors or review the guide.
