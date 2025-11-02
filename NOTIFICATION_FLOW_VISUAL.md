# 🔔 Notification System - Quick Visual Guide V2

## Notification Triggers & Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION SYSTEM FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

USER ACTION                    TRIGGER POINT                   NOTIFICATION
─────────────────────────────────────────────────────────────────────────

🚗 ADD VEHICLE
  ├─ Complete Add Vehicle Form
  ├─ Click "Publish"
  └─ Vehicle inserted into DB
      └─> 📢 "Rashmina added Toyota Aqua (CBA-3822) to the Inventory."


✏️  EDIT VEHICLE
  ├─ Open Edit Modal
  ├─ Modify vehicle details
  └─ Click "Save Changes"
      └─> 📢 "Rashmina updated details of Toyota Aqua (CBA-3822) in the Inventory."


🗑️  DELETE VEHICLE
  ├─ Click Delete Icon
  ├─ Confirm deletion
  └─ Vehicle removed from DB
      └─> 📢 "Rashmina deleted Toyota Aqua (CBA-3822) from the Inventory."


💰 MOVE TO SALES
  ├─ Open Sell Vehicle page
  ├─ Enter customer details
  └─ Submit sale (moves to pending)
      └─> 📢 "Rashmina moved Toyota Aqua (CBA-3822) to the Selling Process 
              — now listed in Sales Transactions (Pending)."


🎉 SOLD OUT
  ├─ Go to Sales Transactions
  ├─ Click "Sold Out" button
  └─ Confirm sale completion
      └─> 📢 "Rashmina completed the sale of Toyota Aqua (CBA-3822) 
              — vehicle moved to Sold Out."

```

## Notification Bell Interface

```
┌───────────────────────────────────────────────────────────┐
│  Header Navigation Bar                                    │
│                                                     🔔 [3] │  ← Badge shows unread count
└───────────────────────────────────────────────────────────┘
                                                         │
                                    When clicked ───────┘
                                                         │
                                                         ▼
                    ┌────────────────────────────────────────────┐
                    │  🔔 Notifications                   [×]     │
                    │  3 unread notifications                    │
                    ├────────────────────────────────────────────┤
                    │  [Mark all as read]  [Clear all]          │
                    ├────────────────────────────────────────────┤
                    │                                            │
                    │  🚗 Vehicle Added              2 mins ago  │
                    │  Rashmina added Toyota Aqua (CBA-3822)    │
                    │  to the Inventory.                         │
                    │                                            │
                    ├────────────────────────────────────────────┤
                    │                                            │
                    │  ✏️  Vehicle Updated            15 mins ago │
                    │  Rashmina updated details of Honda Civic  │
                    │  (KL-1234) in the Inventory.              │
                    │                                            │
                    ├────────────────────────────────────────────┤
                    │                                            │
                    │  💰 Moved to Sales             1 hour ago  │
                    │  Rashmina moved Nissan March (ABC-5678)   │
                    │  to the Selling Process...                │
                    │                                            │
                    └────────────────────────────────────────────┘
```

## Color Coding

```
┌─────────────────────────────────────────────────────────────┐
│  NOTIFICATION TYPE          COLOR         ICON             │
├─────────────────────────────────────────────────────────────┤
│  🚗 Added                   🟢 Green       🚗              │
│  ✏️  Updated                🟡 Yellow      ✏️              │
│  🗑️  Deleted                🔴 Red         🗑️              │
│  💰 Moved to Sales          🔵 Blue        💰              │
│  ✅ Sold Out                🟢 Emerald     ✅              │
└─────────────────────────────────────────────────────────────┘
```

## User Experience Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY                               │
└─────────────────────────────────────────────────────────────────┘

1. User performs action (e.g., adds a vehicle)
   ↓
2. Action completes successfully
   ↓
3. Notification is created in database
   ↓
4. Notification bell badge updates instantly  🔔 [1]
   ↓
5. User clicks bell to view notifications
   ↓
6. Dropdown shows new notification at top (unread - highlighted)
   ↓
7. User clicks notification
   ↓
8. Notification is marked as read (highlight removed)
   ↓
9. Badge count decreases  🔔 [0]
```

## Real-time Updates

```
┌──────────────────────────────────────────────────────────────┐
│  MULTIPLE USERS SCENARIO                                     │
└──────────────────────────────────────────────────────────────┘

User A's Browser                      User B's Browser
     │                                      │
     │  User A adds vehicle                 │
     │         ↓                            │
     │  Notification created in DB          │
     │         ↓                            │
     ├─────────┼────────────────────────────┤
     │         │         DB                 │
     │         │    [New Notification]      │
     │         ↓         ↓                  ↓
     │  Bell updates          Bell updates instantly
     │  🔔 [1]                🔔 [1]
     │                                      │
     │  Both users see:                     │
     │  "User A added Toyota Aqua..."       │
     │                                      │
```

## Notification Storage

```
Database: notifications table
┌──────────────────────────────────────────────────────────────┐
│  id         │  UUID (primary key)                            │
│  user_id    │  UUID (who performed action)                   │
│  type       │  'added', 'updated', 'deleted', etc.           │
│  title      │  'Vehicle Added'                               │
│  message    │  'Rashmina added Toyota Aqua...'              │
│  vehicle_   │  'CBA-3822'                                    │
│   number    │                                                │
│  vehicle_   │  'Toyota'                                      │
│   brand     │                                                │
│  vehicle_   │  'Aqua'                                        │
│   model     │                                                │
│  is_read    │  false                                         │
│  created_at │  2025-11-02 10:30:00                          │
└──────────────────────────────────────────────────────────────┘
```

## Testing Quick Reference

### To Test Add Notification:
```
1. Go to: /add-vehicle
2. Fill all 6 steps
3. Click "Publish Vehicle"
4. Check bell icon → Should show notification
```

### To Test Update Notification:
```
1. Go to: /inventory
2. Click pencil icon on any vehicle
3. Edit any field
4. Click "Save Changes"
5. Check bell icon → Should show notification
```

### To Test Delete Notification:
```
1. Go to: /inventory
2. Click trash icon on any vehicle
3. Confirm deletion
4. Check bell icon → Should show notification
```

### To Test Move to Sales Notification:
```
1. Go to: /sell-vehicle
2. Enter customer details (Step 1)
3. Select vehicle & enter amounts (Step 2)
4. Submit
5. Check bell icon → Should show notification
```

### To Test Sold Out Notification:
```
1. Go to: /sales-transactions
2. Switch to "Pending" tab
3. Click "Sold Out" on any sale
4. Confirm
5. Check bell icon → Should show notification
```

## Troubleshooting

```
┌────────────────────────────────────────────────────────────┐
│  ISSUE                        SOLUTION                     │
├────────────────────────────────────────────────────────────┤
│  Bell not updating            → Refresh page              │
│  Notification not showing     → Check console for errors  │
│  Wrong user name              → Check users table         │
│  Vehicle info missing         → Verify vehicle data       │
│  Database error               → Check notifications table │
└────────────────────────────────────────────────────────────┘
```

---

**Quick Access Paths:**
- View Notifications: Click 🔔 in header
- Mark as Read: Click on notification
- Clear All: Click "Clear all" button
- Mark All Read: Click "Mark all as read" button

**Notification Retention:** Unlimited (stored in database)
**Real-time:** Yes (via Supabase subscriptions)
**Multi-user:** Yes (all users see all notifications)
