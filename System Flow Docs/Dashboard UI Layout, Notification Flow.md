# Dashboard UI Layout & Notification System - PCN System

## Overview

This document covers the complete dashboard UI layout architecture, user access control system, and notification system for the PCN Vehicle Selling Management System. The dashboard provides a centralized interface for vehicle inventory management, sales tracking, and real-time notifications.

> **⚠️ AUTHENTICATION STATUS**: The system uses cookie-based session authentication with server-side session validation. API routes are protected with authentication middleware and rate limiting.

**Last Updated**: January 20, 2026

---

## 📢 LATEST UPDATE - January 20, 2026 (Dashboard & Sales Transactions UI Enhancement)

### 📊 Complete "Pending" to "Advance Paid" Rename

**Update: System-wide rename from "Pending Vehicle" to "Advance Paid" completed!**

#### Dashboard Page Changes:
| Old Name | New Name |
|----------|----------|
| Pending Selling Vehicles Card | **Advance Paid Vehicles** Card |
| `pendingVehicles` state variable | `advancePaidVehicles` |

#### Sales Transactions Tab Rename:
| Old Name | New Name |
|----------|----------|
| Pending Vehicles Tab | **Advance Paid** Tab |
| "Pending Vehicle Details" modal | "Advance Paid Vehicle Details" modal |

#### Status Value Change:
| Old Status | New Status |
|------------|------------|
| `'pending'` | `'advance_paid'` |

#### New Table Columns (Advance Paid Tab):
| Column | Size | Description |
|--------|------|-------------|
| Image | 80x50px | Primary vehicle thumbnail |
| Vehicle No. | Auto | Registration number |
| Brand | Auto | Vehicle brand |
| Model | Auto | Vehicle model |
| M.Year | Auto | Manufacture year |
| Reg.Year | Auto | Registration year |
| Mileage | Auto | Mileage in km |
| Country | Auto | Manufacturing country |
| Trans. | Auto | Transmission type |
| Selling Price | Auto | Sale price (Rs.) |
| Payment | Auto | Payment type badge |
| Actions | Auto | Action buttons |

#### Modified Files:
- `dashboard/src/app/(dashboard)/dashboard/page.tsx` ✅
- `dashboard/src/app/(dashboard)/sales-transactions/page.tsx` ✅
- `dashboard/src/components/sales-transactions/PendingVehiclesTable.tsx` ✅
- `dashboard/src/components/sales-transactions/PendingVehicleModal.tsx` ✅
- `api/src/routes/sales.routes.ts` ✅
- `shared/types.ts` ✅

---

## 📢 PREVIOUS UPDATE - January 16, 2026 (Inventory Page Enhancements)

### 📊 Inventory Table & Filter System Update

**Update: Major inventory page enhancement with new columns and real-time filtering!**

#### New Table Columns:
| Column | Size | Description |
|--------|------|-------------|
| Image | 80x50px | Primary vehicle thumbnail |
| M Year | Auto | Manufacture Year |
| Reg Year | Auto | Registered Year |
| Color | Auto | Exterior Color |

#### New Filter System:
- **Price Range**: Min/Max inputs for price filtering
- **Transmission**: Auto/Manual dropdown filter
- **Ownership**: Open Papers / Registered Owner filter
- **Vehicle Type**: Registered / Unregistered filter
- **Country**: Dynamic country dropdown from database
- **Clear Filters**: One-click reset all filters

#### UI Components:
- shadcn/ui Select, Input, Button components
- Real-time filtering without page reload
- Result count display when filters active

#### Modified Files:
- `dashboard/src/app/(dashboard)/inventory/page.tsx` ✅

---

## 📢 PREVIOUS UPDATE - January 1, 2026 (Reports Data Sync & RBAC Updates)

### 🔄 Reports & Analytics Data Consistency

**Update: All reports now properly handle multiple price field variations for accurate data display!**

#### Key Changes:
- Financial Reports Tab uses universal price handling pattern
- Sales Agents Report correctly calculates commissions with any price field
- Summary Reports handles vehicle snapshots and multiple sold-out records

#### Price Field Pattern:
```typescript
const sellingAmount = sale.sale_price ?? sale.selling_price ?? sale.selling_amount ?? 0
```

#### Modified Files:
- `dashboard/src/components/reports/FinancialReportsTab.tsx` ✅
- `dashboard/src/components/reports/SalesAgentsReportTab.tsx` ✅
- `dashboard/src/components/reports/SummaryReportsTab.tsx` ✅

---

## 📢 PREVIOUS UPDATE - December 29, 2025 (API Security & Rate Limiting)

### 🔐 Security Enhancements

**Major Update: Implemented comprehensive API security with authentication middleware and rate limiting!**

#### What's New:

1. **Session-Based API Authentication** (`dashboard/src/lib/api-auth.ts`):
   - `withAuth()` higher-order function for protected API routes
   - Session token validation via `sessions` database table
   - Role and access level authorization checks
   - Automatic unauthorized/forbidden response handling

2. **Rate Limiting** (`dashboard/src/lib/rate-limit.ts`):
   - In-memory rate limiter for API abuse prevention
   - Pre-configured rate limits:
     - OTP sending: 3 requests per 60 seconds
     - OTP verification: 5 attempts per 5 minutes
     - Login attempts: 5 per 15 minutes per IP
     - SMS sending: 10 per hour per user
     - General API: 100 requests per minute per IP

3. **Sessions Table** (`dashboard/migrations/2025_12_29_add_sessions_table.sql`):
   - Secure session token storage in database
   - Session expiration and cleanup
   - Row-level security enabled

4. **SMS API Security**:
   - SMS endpoints now require authentication
   - Template-based messaging only (no arbitrary messages)
   - All API tokens loaded from environment variables

#### New Files:
- `dashboard/src/lib/api-auth.ts` - API authentication middleware ✅
- `dashboard/src/lib/rate-limit.ts` - Rate limiting utility ✅
- `dashboard/migrations/2025_12_29_add_sessions_table.sql` - Sessions table migration ✅

#### Modified Files:
- `dashboard/src/app/api/sms/route.ts` - Protected with auth & rate limiting ✅
- `dashboard/src/app/api/vehicles/send-sms/route.ts` - Protected with auth & rate limiting ✅
- `dashboard/src/app/api/auth/send-otp/route.ts` - Added OTP rate limiting ✅
- `dashboard/src/lib/sms-service.ts` - Template-based messaging ✅

---

## Table of Contents

1. [Dashboard Layout Architecture](#1-dashboard-layout-architecture)
2. [User Access Levels & RBAC](#2-user-access-levels--rbac)
3. [Sidebar Navigation](#3-sidebar-navigation)
4. [Header Component](#4-header-component)
5. [Dashboard Homepage](#5-dashboard-homepage)
6. [Notification System](#6-notification-system)
7. [Toast Notifications](#7-toast-notifications)
8. [Database Schema](#8-database-schema)
9. [Types & Interfaces](#9-types--interfaces)
10. [File Structure](#10-file-structure)

---

## 1. Dashboard Layout Architecture

### 1.1 Layout Structure

**File**: `dashboard/src/app/(dashboard)/layout.tsx`

The dashboard uses a persistent layout wrapper that provides consistent UI elements across all pages.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD LAYOUT                                │
├─────────────┬───────────────────────────────────────────────────────────┤
│             │  HEADER (50px)                                            │
│             │  ┌──────────────────────────────────────────────────────┐ │
│   SIDEBAR   │  │ Greeting      │  🔔 Notifications │ 👤 Profile ▼    │ │
│   (260px    │  └──────────────────────────────────────────────────────┘ │
│   or 80px)  ├───────────────────────────────────────────────────────────┤
│             │                                                           │
│   - Logo    │                    MAIN CONTENT                           │
│   - Nav     │                    (children)                             │
│   - Version │                                                           │
│             │                                                           │
│             │                                                           │
└─────────────┴───────────────────────────────────────────────────────────┘
```

### 1.2 Layout State Management

```typescript
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [greeting, setGreeting] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()

  // Initialize session heartbeat to track user activity
  useSessionHeartbeat()
  
  // Get role-based access control utilities
  const { hasPermissionFor } = useRoleAccess()
  
  // Filter navigation items based on user's role
  const filteredNavigation = useMemo(() => {
    return navigation.filter(item => hasPermissionFor(item.allowedRoles))
  }, [hasPermissionFor])
}
```

### 1.3 Context Providers

The layout wraps children with necessary context providers:

```typescript
return (
  <NotificationProvider>
    <div className="min-h-screen bg-white">
      {/* Logout Modal */}
      {/* Sidebar */}
      {/* Main Content */}
      <Toaster />
      <UserProfileModal />
    </div>
  </NotificationProvider>
)
```

---

## 2. User Access Levels & RBAC

### 2.1 User Roles

**File**: `dashboard/src/lib/rbac/types.ts`

| Role | Description | Access Level |
|------|-------------|--------------|
| `admin` | Full system access | All pages + Reports + User Management |
| `editor` | Standard user access | All pages except Reports & User Management |

### 2.2 Role Types Definition

```typescript
// User roles enum
export type UserRole = 'admin' | 'editor'

// User access level from database
export type AccessLevel = 'Admin' | 'Editor'

// Route permission type
export type RoutePermission = {
  path: string
  allowedRoles: UserRole[]
  name: string
}

// Navigation item with role restrictions
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  allowedRoles?: UserRole[] // If undefined, all roles can access
}
```

### 2.3 Role Conversion & Permission Functions

```typescript
// Helper to convert database access level to role
export function accessLevelToRole(accessLevel: string | null | undefined): UserRole {
  if (!accessLevel) return 'editor'
  
  switch (accessLevel.toLowerCase()) {
    case 'admin':
      return 'admin'
    case 'editor':
    default:
      return 'editor'
  }
}

// Check if role has permission
export function hasPermission(userRole: UserRole, allowedRoles?: UserRole[]): boolean {
  // Admin always has access
  if (userRole === 'admin') return true
  
  // If no restrictions, everyone can access
  if (!allowedRoles || allowedRoles.length === 0) return true
  
  // Check if user's role is in allowed roles
  return allowedRoles.includes(userRole)
}
```

### 2.4 useRoleAccess Hook

**File**: `dashboard/src/hooks/useRoleAccess.ts`

```typescript
interface UseRoleAccessReturn {
  user: UserData | null
  userRole: UserRole
  isLoading: boolean
  isAdmin: boolean
  isEditor: boolean
  canAccessRoute: (path: string) => boolean
  hasPermissionFor: (allowedRoles?: UserRole[]) => boolean
  shouldShowNavItem: (href: string) => boolean
}

export function useRoleAccess(): UseRoleAccessReturn {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single()
        
        if (userData) setUser(userData)
      }
    }
    fetchUserData()
  }, [])

  const userRole = useMemo(() => accessLevelToRole(user?.access_level), [user])
  const isAdmin = userRole === 'admin'
  const isEditor = userRole === 'editor'
  
  return { user, userRole, isLoading, isAdmin, isEditor, ... }
}
```

### 2.5 Page Access Matrix

| Page | Path | Admin | Editor |
|------|------|-------|--------|
| Dashboard | `/dashboard` | ✅ | ✅ |
| Add Vehicle | `/add-vehicle` | ✅ | ✅ |
| Inventory | `/inventory` | ✅ | ✅ |
| Reserve Vehicle | `/reserve-vehicle` | ✅ | ✅ |
| Sales Transactions | `/sales-transactions` | ✅ | ✅ |
| Reports & Analytics | `/reports` | ✅ | ❌ |
| User Management | `/user-management` | ✅ | ❌ |
| Settings | `/settings` | ✅ | ✅ |

---

## 3. Sidebar Navigation

### 3.1 Navigation Configuration

```typescript
const navigation: Array<{
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  allowedRoles?: UserRole[]
}> = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Add Vehicle', href: '/add-vehicle', icon: PlusCircle },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Reserve Vehicle', href: '/reserve-vehicle', icon: DollarSign },
  { name: 'Sales Transactions', href: '/sales-transactions', icon: FileText },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3, allowedRoles: ['admin'] },
  { name: 'User Management', href: '/user-management', icon: Users, allowedRoles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings },
]
```

### 3.2 Sidebar UI Structure

```
┌───────────────────────┐
│ 🚗 Punchi Car Niwasa  │  <- Logo + Title (50px height)
│    Management System  │
├───────────────────────┤
│ 📊 Dashboard          │  <- Navigation Items
│ ➕ Add Vehicle        │     (Role-filtered)
│ 📦 Inventory          │
│ 💰 Reserve Vehicle    │
│ 📄 Sales Transactions │
│ 📈 Reports & Analytics│  <- Admin Only
│ 👥 User Management    │  <- Admin Only
│ ⚙️ Settings           │
├───────────────────────┤
│ Version 1.2.4         │  <- Footer (Only expanded)
└───────────────────────┘
```

### 3.3 Sidebar Collapse/Expand

| State | Width | Features |
|-------|-------|----------|
| Expanded | 260px | Full text labels, logo title, version info |
| Collapsed | 80px | Icons only, hover tooltips |

```typescript
<aside className={`fixed inset-y-0 z-40 left-0 pt-3 bg-white border-r 
  transition-all duration-300 ease-in-out ${
    isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]'
  }`}>
```

### 3.4 Navigation Item Rendering

```typescript
{filteredNavigation.map((item) => (
  <li key={item.name} className="relative"
    onMouseEnter={() => isSidebarCollapsed && setHoveredItem(item.name)}
    onMouseLeave={() => setHoveredItem(null)}>
    
    <Link href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
        pathname === item.href 
          ? 'bg-gray-100 text-gray-900 font-medium' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}>
      <item.icon className="w-5 h-5" />
      <span className={isSidebarCollapsed ? 'hidden' : ''}>{item.name}</span>
    </Link>
    
    {/* Tooltip for collapsed state */}
    {isSidebarCollapsed && hoveredItem === item.name && (
      <div className="fixed left-[80px] z-30 bg-gray-900 text-white px-3 py-2 rounded-lg">
        {item.name}
      </div>
    )}
  </li>
))}
```

---

## 4. Header Component

### 4.1 Header Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Good Morning! John  │                    │ 🔔 (3) │ 👤 John ▼        │
│     (Greeting)      │                    │  Bell  │ Profile Dropdown  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Height**: 50px fixed  
**Position**: Sticky top-0

### 4.2 Dynamic Greeting

```typescript
const updateGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) {
    setGreeting('Good Morning')
  } else if (hour < 18) {
    setGreeting('Good Afternoon')
  } else {
    setGreeting('Good Evening')
  }
}

// Display
<div className="flex items-center gap-2">
  <span className="text-gray-600">{greeting}!</span>
  {currentUser && (
    <span className="text-gray-900 font-semibold">{currentUser.first_name}</span>
  )}
</div>
```

### 4.3 Profile Dropdown

```
┌─────────────────────────┐
│ 👤 My Profile           │
├─────────────────────────┤
│ 🚪 Logout               │ (Red text)
└─────────────────────────┘
```

```typescript
<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-40">
  <button onClick={() => setShowProfileModal(true)}>
    <User className="w-4 h-4" /> My Profile
  </button>
  
  <div className="border-t border-gray-200" />
  
  <button onClick={handleOpenLogoutModal} className="text-red-600">
    <LogOut className="w-4 h-4" /> Logout
  </button>
</div>
```

### 4.4 Logout Flow

```
[User clicks Logout] → [Confirmation Modal] → [End Session] → [API Call] → [Clear Storage] → [Redirect to /]
```

```typescript
const handleLogout = async () => {
  setIsLoggingOut(true)
  
  // 1. End user session
  const { endUserSession } = await import('@/lib/sessionManager')
  await endUserSession(session.user.id)
  
  // 2. Call logout API
  await fetch('/api/auth/logout', { method: 'POST' })
  
  // 3. Clear browser storage
  localStorage.clear()
  sessionStorage.clear()
  
  // 4. Clear cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/=.*/, "=;expires=" + new Date().toUTCString())
  })
  
  // 5. Redirect to login
  window.location.replace('/')
}
```

---

## 5. Dashboard Homepage

### 5.1 Page Overview

**File**: `dashboard/src/app/(dashboard)/dashboard/page.tsx`

The dashboard homepage displays real-time statistics and user activity.

### 5.2 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Dashboard (Title)                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────┬──────────────────┬──────────────────┬─────────────┐│
│ │ Available        │ Pending Selling  │ Sold-Out         │ Active      ││
│ │ Vehicles: 45     │ Vehicles: 12     │ Vehicles: 78     │ Users       ││
│ │ ────────────     │ ────────────     │ ────────────     │ ──────────  ││
│ │ Sedan: 20        │ Sedan: 5         │ Sedan: 30        │ 👤 John     ││
│ │ Hatchback: 10    │ Hatchback: 3     │ Hatchback: 25    │ 👤 Jane     ││
│ │ SUV: 8           │ SUV: 2           │ SUV: 15          │             ││
│ │ Wagon: 5         │ Wagon: 1         │ Wagon: 5         │             ││
│ │ Coupe: 2         │ Coupe: 1         │ Coupe: 3         │             ││
│ ├──────────────────┴──────────────────┴──────────────────┤             ││
│ │                                                        │             ││
│ │           📊 Interactive Sales Chart                   │             ││
│ │                (Area Chart with filters)               │             ││
│ │                                                        │             ││
│ └────────────────────────────────────────────────────────┴─────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 State Management

```typescript
interface VehicleStats {
  total: number
  sedan: number
  hatchback: number
  suv: number
  wagon: number
  coupe: number
}

interface SalesData {
  date: string
  vehicles: number
  inventory: number
}

interface ActiveUser {
  id: string
  first_name: string
  last_name: string
  email: string
  profile_picture_url: string | null
  is_online: boolean
}

// Component State
const [availableVehicles, setAvailableVehicles] = useState<VehicleStats>({...})
const [pendingVehicles, setPendingVehicles] = useState<VehicleStats>({...})
const [soldVehicles, setSoldVehicles] = useState<VehicleStats>({...})
const [chartData, setChartData] = useState<SalesData[]>([])
const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
const [loading, setLoading] = useState(true)
const [salesThisMonth, setSalesThisMonth] = useState(0)
```

### 5.4 Real-time Subscriptions

```typescript
useEffect(() => {
  // Users subscription
  const usersChannel = supabase
    .channel('dashboard-users')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' },
      () => fetchActiveUsers()
    )
    .subscribe()

  // Vehicles subscription
  const vehiclesChannel = supabase
    .channel('dashboard-vehicles')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' },
      () => fetchDashboardData()
    )
    .subscribe()

  // Sales subscription
  const salesChannel = supabase
    .channel('dashboard-sales')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_vehicle_sales' },
      () => fetchDashboardData()
    )
    .subscribe()

  // Auto-refresh every 30 seconds
  const interval = setInterval(() => {
    fetchActiveUsers()
    fetchDashboardData()
  }, 30000)

  return () => {
    supabase.removeChannel(usersChannel)
    supabase.removeChannel(vehiclesChannel)
    supabase.removeChannel(salesChannel)
    clearInterval(interval)
  }
}, [])
```

### 5.5 Data Fetching Functions

#### Fetch Dashboard Data

```typescript
const fetchDashboardData = async () => {
  // Fetch Available Vehicles (status: 'In Sale')
  const { data: availableData } = await supabase
    .from('vehicles')
    .select('body_type')
    .eq('status', 'In Sale')
  setAvailableVehicles(calculateBodyTypeStats(availableData))

  // Fetch Pending Vehicles
  const { data: pendingSalesData } = await supabase
    .from('pending_vehicle_sales')
    .select(`id, vehicle_id, vehicles(body_type)`)
    .eq('status', 'pending')
  setPendingVehicles(calculateBodyTypeStats(pendingSalesData))

  // Fetch Sold Vehicles
  const { data: soldSalesData } = await supabase
    .from('pending_vehicle_sales')
    .select(`id, vehicle_id, vehicles(body_type)`)
    .eq('status', 'sold')
  setSoldVehicles(calculateBodyTypeStats(soldSalesData))
}
```

#### Calculate Body Type Statistics

```typescript
const calculateBodyTypeStats = (vehicles: any[]): VehicleStats => {
  const stats = { total: vehicles.length, sedan: 0, hatchback: 0, suv: 0, wagon: 0, coupe: 0 }

  vehicles.forEach((vehicle) => {
    const bodyType = vehicle.body_type?.toLowerCase() || ''
    if (bodyType.includes('sedan')) stats.sedan++
    else if (bodyType.includes('hatchback')) stats.hatchback++
    else if (bodyType.includes('suv')) stats.suv++
    else if (bodyType.includes('wagon')) stats.wagon++
    else if (bodyType.includes('coupe')) stats.coupe++
  })

  return stats
}
```

---

## 6. Notification System

### 6.1 System Overview

The notification system tracks vehicle actions across the application and provides real-time updates to users.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [User Action] → [useNotify Hook] → [notificationService] → [Supabase] │
│                                                    ↓                    │
│                                           [Real-time Channel]          │
│                                                    ↓                    │
│  [NotificationContext] ← [subscribeToNotifications]                    │
│           ↓                                                             │
│  [NotificationDropdown] + [Toast]                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Notification Types

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| `added` | 🚗 | Green | Vehicle added to inventory |
| `updated` | ✏️ | Yellow | Vehicle details updated |
| `deleted` | 🗑️ | Red | Vehicle removed from inventory |
| `moved_to_sales` | 💰 | Blue | Vehicle moved to sales pending |
| `sold` | ✅ | Emerald | Vehicle sale completed |

### 6.3 NotificationContext

**File**: `dashboard/src/contexts/NotificationContext.tsx`

```typescript
interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  refreshNotifications: () => Promise<void>
  markNotificationAsRead: (id: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { toast } = useToast()

  // Get current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', session.user.id)
          .single()
        
        if (userData) setCurrentUserId(userData.id)
      }
    }
    fetchCurrentUser()
  }, [])

  // Load notifications
  const refreshNotifications = useCallback(async () => {
    if (!currentUserId) return
    const [notifs, count] = await Promise.all([
      getUserNotifications(currentUserId),
      getUnreadCount(currentUserId)
    ])
    setNotifications(notifs)
    setUnreadCount(count)
  }, [currentUserId])

  // Real-time subscription
  useEffect(() => {
    if (!currentUserId) return

    const channel = subscribeToNotifications(currentUserId, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newNotification = payload.new as Notification
        setNotifications(prev => [newNotification, ...prev])
        setUnreadCount(prev => prev + 1)
        
        // Show toast
        toast({
          title: newNotification.title,
          description: newNotification.message,
          variant: getToastVariant(newNotification.type),
        })
      } else if (payload.eventType === 'UPDATE') {
        // Handle update...
      } else if (payload.eventType === 'DELETE') {
        // Handle delete...
      }
    })

    return () => channel.unsubscribe()
  }, [currentUserId, toast])
}
```

### 6.4 NotificationDropdown Component

**File**: `dashboard/src/components/notifications/NotificationDropdown.tsx`

```
┌─────────────────────────────────┐
│ Notifications                   │
│ 3 unread notifications          │
│                   [Mark all read│
├─────────────────────────────────┤
│ 🚗 Vehicle Added         ●      │
│    John added Toyota Aqua       │
│    2 hours ago            [X]   │
├─────────────────────────────────┤
│ ✅ Vehicle Sold                 │
│    Jane sold Honda Civic        │
│    5 hours ago            [X]   │
├─────────────────────────────────┤
│ [🗑️ Clear All Notifications]    │
└─────────────────────────────────┘
```

```typescript
export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAll
  } = useNotifications()
  
  const [open, setOpen] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'added': return '🚗'
      case 'updated': return '✏️'
      case 'deleted': return '🗑️'
      case 'moved_to_sales': return '💰'
      case 'sold': return '✅'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'added': return 'bg-green-50 border-green-200'
      case 'updated': return 'bg-yellow-50 border-yellow-200'
      case 'deleted': return 'bg-red-50 border-red-200'
      case 'moved_to_sales': return 'bg-blue-50 border-blue-200'
      case 'sold': return 'bg-emerald-50 border-emerald-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Notification List */}
      </PopoverContent>
    </Popover>
  )
}
```

### 6.5 Notification Service

**File**: `dashboard/src/lib/notificationService.ts`

#### Create Notification

```typescript
export async function createNotification(input: CreateNotificationInput): Promise<Notification | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: input.user_id,
      type: input.type,
      title: input.title,
      message: input.message,
      vehicle_number: input.vehicle_number,
      vehicle_brand: input.vehicle_brand,
      vehicle_model: input.vehicle_model,
      is_read: false
    })
    .select()
    .single()

  return data
}
```

#### Get User Notifications

```typescript
export async function getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
  const supabase = createClient()
  
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}
```

#### Get Unread Count

```typescript
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient()
  
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return count || 0
}
```

#### Mark As Read

```typescript
export async function markAsRead(notificationId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  return !error
}
```

#### Mark All As Read

```typescript
export async function markAllAsRead(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return !error
}
```

#### Delete Notification

```typescript
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  return !error
}
```

#### Clear All Notifications

```typescript
export async function clearAllNotifications(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)

  return !error
}
```

#### Vehicle Action Notification Helper

```typescript
export async function notifyVehicleAction(
  userId: string,
  userName: string,
  action: NotificationType,
  vehicleNumber: string,
  vehicleBrand: string,
  vehicleModel: string
): Promise<Notification | null> {
  const vehicleInfo = `${vehicleBrand} ${vehicleModel} (${vehicleNumber})`
  
  let title = ''
  let message = ''

  switch (action) {
    case 'added':
      title = 'Vehicle Added'
      message = `${userName} added ${vehicleInfo} to the Inventory.`
      break
    case 'updated':
      title = 'Vehicle Updated'
      message = `${userName} updated details of ${vehicleInfo} in the Inventory.`
      break
    case 'deleted':
      title = 'Vehicle Deleted'
      message = `${userName} deleted ${vehicleInfo} from the Inventory.`
      break
    case 'moved_to_sales':
      title = 'Moved to Sales'
      message = `${userName} moved ${vehicleInfo} to the Selling Process.`
      break
    case 'sold':
      title = 'Vehicle Sold'
      message = `${userName} completed the sale of ${vehicleInfo}.`
      break
  }

  return createNotification({
    user_id: userId,
    type: action,
    title,
    message,
    vehicle_number: vehicleNumber,
    vehicle_brand: vehicleBrand,
    vehicle_model: vehicleModel
  })
}
```

#### Real-time Subscription

```typescript
export function subscribeToNotifications(
  userId: string, 
  callback: (payload: any) => void
) {
  const supabase = createClient()
  
  const channel = supabase
    .channel('notifications-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()

  return channel
}
```

### 6.6 useNotify Hook

**File**: `dashboard/src/hooks/useNotify.ts`

```typescript
export function useNotify() {
  const { toast } = useToast()

  const notify = useCallback(async (
    action: NotificationType,
    vehicleNumber: string,
    vehicleBrand: string,
    vehicleModel: string
  ) => {
    // Get current user
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) return

    const { data: userData } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('auth_id', session.user.id)
      .single()

    if (!userData) return

    const userName = `${userData.first_name} ${userData.last_name}`
    
    // Create notification
    await notifyVehicleAction(
      userData.id,
      userName,
      action,
      vehicleNumber,
      vehicleBrand,
      vehicleModel
    )

    // Show toast
    const vehicleInfo = `${vehicleBrand} ${vehicleModel} (${vehicleNumber})`
    let toastTitle = ''
    let toastDescription = ''

    switch (action) {
      case 'added':
        toastTitle = '✅ Vehicle Added'
        toastDescription = `${vehicleInfo} has been added to inventory`
        break
      case 'updated':
        toastTitle = '✏️ Vehicle Updated'
        toastDescription = `${vehicleInfo} details have been updated`
        break
      case 'deleted':
        toastTitle = '🗑️ Vehicle Deleted'
        toastDescription = `${vehicleInfo} has been removed from inventory`
        break
      case 'moved_to_sales':
        toastTitle = '💰 Moved to Sales'
        toastDescription = `${vehicleInfo} is now in sales transactions`
        break
      case 'sold':
        toastTitle = '🎉 Vehicle Sold'
        toastDescription = `${vehicleInfo} has been sold successfully`
        break
    }

    toast({ title: toastTitle, description: toastDescription })
  }, [toast])

  return { notify }
}
```

### 6.7 Usage Example

```typescript
// In any component
import { useNotify } from '@/hooks/useNotify'

export function AddVehiclePage() {
  const { notify } = useNotify()

  const handleAddVehicle = async (vehicleData) => {
    // ... insert vehicle to database
    
    // Send notification
    await notify(
      'added',
      vehicleData.vehicle_number,
      vehicleData.brand_name,
      vehicleData.model_name
    )
  }
}
```

---

## 7. Toast Notifications

### 7.1 Toast System Overview

**Files**: 
- `dashboard/src/components/ui/toast.tsx`
- `dashboard/src/components/ui/toaster.tsx`
- `dashboard/src/hooks/use-toast.ts`

### 7.2 Toaster Component

```typescript
export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
```

### 7.3 useToast Hook

```typescript
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
  
  const dismiss = () => 
    dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id, open: true, onOpenChange: (open) => !open && dismiss() },
  })

  return { id, dismiss, update }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)
  
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])

  return { ...state, toast, dismiss }
}
```

### 7.4 Toast Variants

| Variant | Usage | Color |
|---------|-------|-------|
| `default` | Success, Info | Default styling |
| `destructive` | Error, Delete | Red background |

```typescript
// Usage
toast({
  title: 'Success',
  description: 'Vehicle added successfully',
  variant: 'default'
})

toast({
  title: 'Error',
  description: 'Failed to delete vehicle',
  variant: 'destructive'
})
```

---

## 8. Database Schema

### 8.1 Notifications Table

**File**: `dashboard/migrations/2025_01_add_notifications_table.sql`

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,        -- 'added', 'updated', 'deleted', 'moved_to_sales', 'sold'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  vehicle_number VARCHAR(50),
  vehicle_brand VARCHAR(100),
  vehicle_model VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
```

### 8.2 Auto-Update Trigger

```sql
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();
```

### 8.3 Row Level Security (RLS)

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::text = (SELECT auth_id::text FROM users WHERE id = user_id));

-- Users can create own notifications
CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT auth_id::text FROM users WHERE id = user_id));

-- Users can update own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::text = (SELECT auth_id::text FROM users WHERE id = user_id));

-- Users can delete own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid()::text = (SELECT auth_id::text FROM users WHERE id = user_id));
```

### 8.4 Users Table (Relevant Fields)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  access_level VARCHAR(20),      -- 'Admin' or 'Editor'
  role VARCHAR(50),
  status VARCHAR(20),
  profile_picture_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 9. Types & Interfaces

### 9.1 Notification Types

**File**: `dashboard/src/types/notification.ts`

```typescript
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  vehicle_number?: string
  vehicle_brand?: string
  vehicle_model?: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export type NotificationType = 
  | 'added' 
  | 'updated' 
  | 'deleted' 
  | 'moved_to_sales' 
  | 'sold'

export interface CreateNotificationInput {
  user_id: string
  type: NotificationType
  title: string
  message: string
  vehicle_number?: string
  vehicle_brand?: string
  vehicle_model?: string
}

export interface NotificationStats {
  total: number
  unread: number
}
```

### 9.2 User Types

```typescript
interface UserData {
  id: string
  auth_id: string
  first_name: string
  last_name: string
  email: string
  access_level: string    // 'Admin' | 'Editor'
  role: string
  status: string
  profile_picture_url?: string
}

export type UserRole = 'admin' | 'editor'
export type AccessLevel = 'Admin' | 'Editor'
```

### 9.3 Dashboard Types

```typescript
interface VehicleStats {
  total: number
  sedan: number
  hatchback: number
  suv: number
  wagon: number
  coupe: number
}

interface SalesData {
  date: string
  vehicles: number
  inventory: number
}

interface ActiveUser {
  id: string
  first_name: string
  last_name: string
  email: string
  profile_picture_url: string | null
  is_online: boolean
}
```

---

## 10. File Structure

```
dashboard/src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Auth layout (no sidebar)
│   │   └── page.tsx                # Login page
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout (sidebar + header)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard homepage
│   │   ├── add-vehicle/
│   │   ├── inventory/
│   │   ├── reserve-vehicle/
│   │   ├── sales-transactions/
│   │   ├── reports/                # Admin only
│   │   ├── user-management/        # Admin only
│   │   └── settings/
│   │
│   ├── layout.tsx                  # Root layout with AuthProvider
│   └── globals.css
│
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   └── AccessDeniedHandler.tsx
│   │
│   ├── notifications/
│   │   └── NotificationDropdown.tsx
│   │
│   ├── profile/
│   │   └── UserProfileModal.tsx
│   │
│   ├── charts/
│   │   └── ChartAreaInteractive.tsx
│   │
│   └── ui/
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── popover.tsx
│       ├── badge.tsx
│       └── button.tsx
│
├── contexts/
│   └── NotificationContext.tsx
│
├── hooks/
│   ├── useRoleAccess.ts
│   ├── useNotify.ts
│   ├── use-toast.ts
│   └── useSessionHeartbeat.ts
│
├── lib/
│   ├── rbac/
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── notificationService.ts
│   ├── supabase-client.ts
│   └── sessionManager.ts
│
├── types/
│   └── notification.ts
│
└── migrations/
    └── 2025_01_add_notifications_table.sql
```

---

## 11. Summary

### Key Features

1. **Responsive Sidebar**: Collapsible navigation with role-based filtering
2. **Dynamic Header**: Time-based greetings, profile dropdown, notification bell
3. **Role-Based Access**: Admin vs Editor permissions for routes and navigation
4. **Real-time Dashboard**: Live vehicle stats with Supabase subscriptions
5. **Notification System**: Complete CRUD with real-time updates
6. **Toast Feedback**: Immediate visual feedback for user actions

### Integration Points

| Feature | Components | Database | Real-time |
|---------|------------|----------|-----------|
| Navigation | Sidebar, useRoleAccess | users.access_level | ❌ |
| Dashboard Stats | StatsCards, Chart | vehicles, pending_vehicle_sales | ✅ |
| Notifications | Dropdown, Context | notifications | ✅ |
| User Status | ActiveUsers | users | ✅ |

### Performance Optimizations

- Memoized navigation filtering
- Parallel data fetching with `Promise.all`
- Real-time subscriptions with cleanup
- Auto-refresh intervals (30 seconds)
- Optimistic UI updates for notifications
