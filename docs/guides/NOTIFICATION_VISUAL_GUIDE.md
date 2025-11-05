# 🎨 Notification System - Visual UI Guide

## 📱 Main UI Components

### 1. Bell Icon with Badge (Top Right Header)

```
┌────────────────────────────────────────────────────────┐
│  Good Morning! Rashmina     [🔔] [👤 Rashmina ▼]   │
│                               3                        │
└────────────────────────────────────────────────────────┘
```

**Features:**
- 🔔 Bell icon in header
- `3` Red badge showing unread count
- Hover effect (gray background)
- Click to open dropdown

---

### 2. Notification Dropdown (When Bell Clicked)

```
┌─────────────────────────────────────────────────────────┐
│  Notification                           ☑ Mark all read │
│  3 unread notifications                                 │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐   │
│  │ 🚗  Vehicle Added                         • ✕  │   │
│  │    Rashmina added Toyota Aqua (CBA-3822)       │   │
│  │    to the Inventory.                           │   │
│  │    2 minutes ago                               │   │
│  └────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐   │
│  │ 💰  Moved to Sales                          ✕  │   │
│  │    Rashmina moved Toyota Aqua (CBA-3822) to   │   │
│  │    the Selling Process — now listed in Sales   │   │
│  │    Transactions (Pending).                     │   │
│  │    5 minutes ago                               │   │
│  └────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐   │
│  │ ✅  Vehicle Sold                            ✕  │   │
│  │    Rashmina completed the sale of Toyota       │   │
│  │    Aqua (CBA-3822) — vehicle moved to Sold Out│   │
│  │    10 minutes ago                              │   │
│  └────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  🗑️  Clear All Notifications                           │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Width: 384px (24rem)
- Max height: 400px with scroll
- Blue dot (•) = unread
- X button = delete notification
- Click notification = mark as read
- Color-coded backgrounds

---

### 3. Empty State (No Notifications)

```
┌─────────────────────────────────────────────────────────┐
│  Notification                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                       🔔                                │
│                                                         │
│              No notifications yet                       │
│                                                         │
│         You'll see updates about vehicles here          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Toast Notification (Bottom Right Corner)

```
                               ┌──────────────────────────────┐
                               │ ✅ Vehicle Added             │
                               │ Toyota Aqua (CBA-3822) added │
                               │ to the Inventory.            │
                               └──────────────────────────────┘
```

**Features:**
- Appears bottom-right
- Auto-dismiss after 5 seconds
- Slide-in animation
- Can stack multiple toasts
- Close button (X)
- Color variants

---

## 🎨 Color Coding by Notification Type

### 1. Added (Green)
```
┌────────────────────────────────────────────────┐
│ 🚗  Vehicle Added                         • ✕  │
│    Rashmina added Toyota Aqua (CBA-3822)       │
│    to the Inventory.                           │
│    2 minutes ago                               │
└────────────────────────────────────────────────┘
```
- Background: Light green (`bg-green-50`)
- Border: Green (`border-green-200`)
- Icon: 🚗

### 2. Updated (Yellow)
```
┌────────────────────────────────────────────────┐
│ ✏️  Vehicle Updated                       • ✕  │
│    Rashmina updated details of Toyota Aqua     │
│    (CBA-3822) in the Inventory.                │
│    5 minutes ago                               │
└────────────────────────────────────────────────┘
```
- Background: Light yellow (`bg-yellow-50`)
- Border: Yellow (`border-yellow-200`)
- Icon: ✏️

### 3. Deleted (Red)
```
┌────────────────────────────────────────────────┐
│ 🗑️  Vehicle Deleted                        ✕  │
│    Rashmina deleted Toyota Aqua (CBA-3822)     │
│    from the Inventory.                         │
│    10 minutes ago                              │
└────────────────────────────────────────────────┘
```
- Background: Light red (`bg-red-50`)
- Border: Red (`border-red-200`)
- Icon: 🗑️
- **No unread dot** (already seen)

### 4. Moved to Sales (Blue)
```
┌────────────────────────────────────────────────┐
│ 💰  Moved to Sales                        • ✕  │
│    Rashmina moved Toyota Aqua (CBA-3822) to   │
│    the Selling Process — now listed in Sales   │
│    Transactions (Pending).                     │
│    15 minutes ago                              │
└────────────────────────────────────────────────┘
```
- Background: Light blue (`bg-blue-50`)
- Border: Blue (`border-blue-200`)
- Icon: 💰

### 5. Sold (Emerald)
```
┌────────────────────────────────────────────────┐
│ ✅  Vehicle Sold                          • ✕  │
│    Rashmina completed the sale of Toyota Aqua  │
│    (CBA-3822) — vehicle moved to Sold Out.     │
│    20 minutes ago                              │
└────────────────────────────────────────────────┘
```
- Background: Light emerald (`bg-emerald-50`)
- Border: Emerald (`border-emerald-200`)
- Icon: ✅

---

## 🎬 Animations & Interactions

### Bell Icon Hover
```
Normal: 🔔 (gray icon)
Hover:  🔔 (darker, light gray background)
Click:  Opens dropdown
```

### Notification Hover
```
Normal: White/colored background
Hover:  Slightly darker background
       X button appears
```

### Badge Counter
```
0 notifications:  No badge
1-9:             Shows number "3"
10+:             Shows "9+"
```

### Time Format
```
Just now
1 minute ago
5 minutes ago
1 hour ago
2 hours ago
Yesterday
2 days ago
1 week ago
```

---

## 📐 Layout Specifications

### Dropdown
- Width: `384px` (w-96)
- Max Height: `400px` (max-h-[400px])
- Position: Aligned to right edge
- Offset: 8px from bell icon
- Shadow: `shadow-lg`
- Border: `border border-gray-200`
- Border Radius: `rounded-lg`

### Notification Item
- Padding: `16px` (p-4)
- Gap: `12px` (gap-3)
- Hover: `hover:bg-gray-50`
- Transition: `transition-colors`

### Icon Circle
- Size: `40px` (w-10 h-10)
- Border Radius: `rounded-full`
- Text Size: `text-lg` (emoji)
- Border: `border`

### Badge
- Size: `20px` (h-5 w-5)
- Position: `absolute -top-1 -right-1`
- Background: `bg-red-500`
- Text: `text-xs`
- Border Radius: `rounded-full`

---

## 🎯 User Interactions

### Click Bell Icon
1. Dropdown opens
2. Notifications load
3. Unread count visible

### Click Notification
1. Background color changes (if unread)
2. Blue dot disappears
3. Marked as read in database
4. Badge count decreases

### Click X Button
1. Notification removed from list
2. Fade out animation
3. Deleted from database
4. Badge count updates

### Click "Mark all read"
1. All blue dots disappear
2. Badge count becomes 0
3. All marked read in database
4. Toast confirmation

### Click "Clear All"
1. All notifications removed
2. Empty state shows
3. All deleted from database
4. Toast confirmation

---

## 🔔 Toast Notification Variants

### Success (Green) - Added, Sold
```
┌────────────────────────────────┐
│ ✅ Vehicle Added               │
│ Toyota Aqua (CBA-3822) added   │
│ to the Inventory.              │
└────────────────────────────────┘
```

### Default (Blue) - Updated, Moved
```
┌────────────────────────────────┐
│ 💰 Moved to Sales              │
│ Toyota Aqua (CBA-3822) moved   │
│ to sales transactions.         │
└────────────────────────────────┘
```

### Destructive (Red) - Deleted
```
┌────────────────────────────────┐
│ 🗑️ Vehicle Deleted              │
│ Toyota Aqua (CBA-3822) removed │
│ from inventory.                │
└────────────────────────────────┘
```

---

## 📱 Responsive Behavior

### Desktop (1024px+)
- Full width dropdown (384px)
- All features visible
- Hover effects active

### Tablet (768px - 1023px)
- Full width dropdown (384px)
- Scrollable if many notifications
- Touch-friendly tap areas

### Mobile (< 768px)
- Dropdown adjusts to screen
- Full-width on small screens
- Touch gestures supported
- Larger tap targets

---

## ✨ Real-time Visual Feedback

### When Notification Arrives
1. **Badge** increments: `2` → `3`
2. **Toast** slides in from bottom-right
3. **Dropdown** updates if open (new item appears at top)
4. **Sound** (optional - can add)

### When User Interacts
1. **Click notification**: Blue dot fades out
2. **Delete**: Item slides out
3. **Mark all**: All dots fade simultaneously
4. **Clear all**: All items fade, empty state fades in

---

## 🎨 Design System Colors

```css
/* Added - Green */
bg-green-50: #f0fdf4
border-green-200: #bbf7d0
text-green-700: #15803d

/* Updated - Yellow */
bg-yellow-50: #fefce8
border-yellow-200: #fef08a
text-yellow-700: #a16207

/* Deleted - Red */
bg-red-50: #fef2f2
border-red-200: #fecaca
text-red-700: #b91c1c

/* Moved to Sales - Blue */
bg-blue-50: #eff6ff
border-blue-200: #bfdbfe
text-blue-700: #1d4ed8

/* Sold - Emerald */
bg-emerald-50: #ecfdf5
border-emerald-200: #a7f3d0
text-emerald-700: #047857

/* Unread Badge */
bg-red-500: #ef4444

/* Unread Dot */
bg-blue-500: #3b82f6
```

---

## 🎪 Animation Details

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
duration: 200ms
```

### Slide Out
```css
@keyframes slideOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(100%); }
}
duration: 300ms
```

### Toast Slide In
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
duration: 300ms
```

---

## 🖼️ Component Hierarchy

```
NotificationProvider (Context)
  └── DashboardLayout
       ├── Header
       │    └── NotificationDropdown
       │         ├── Bell Button (Trigger)
       │         └── Popover Content
       │              ├── Header
       │              ├── Notification List
       │              │    └── Notification Items
       │              │         ├── Icon
       │              │         ├── Content
       │              │         ├── Unread Dot
       │              │         └── Delete Button
       │              └── Footer (Clear All)
       └── Page Content
       
Toaster (Global)
  └── Toast Items (Stacked)
```

---

This visual guide shows exactly how your notification system looks and behaves!

All UI components match your uploaded screenshots and requirements. 🎉
