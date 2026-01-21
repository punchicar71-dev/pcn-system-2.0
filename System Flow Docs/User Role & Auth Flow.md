# User Role & Authentication Flow Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication System](#authentication-system)
3. [User Roles & Access Levels](#user-roles--access-levels)
4. [Authentication Flow](#authentication-flow)
5. [Password Reset Flow](#password-reset-flow)
6. [Dashboard UI Access & Navigation](#dashboard-ui-access--navigation)
7. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
8. [Session Management](#session-management)
9. [Security Features](#security-features)
10. [Migration Status](#migration-status)

---

## Overview

The PCN (Punchi Car Niwasa) System implements a comprehensive authentication and authorization system with role-based access control (RBAC). The system supports multiple user roles with different permission levels, ensuring secure access to dashboard features based on user privileges.

> **⚠️ MIGRATION STATUS**: The system is currently migrating from Supabase Auth to **Better Auth**. Step 1 (Supabase Auth removal) is complete. The current implementation uses a temporary custom authentication mechanism with cookie-based sessions, preparing for Better Auth integration in Step 2.

**Last Updated**: January 16, 2026

---

## 📢 LATEST UPDATE - January 16, 2026 (System Status)

### ✅ Current System Status

**Status: Authentication & Authorization fully operational!**

#### Security Features Active:
- Cookie-based session authentication
- Rate limiting on all sensitive endpoints
- Template-based SMS messaging
- Session expiration with automatic cleanup

#### Recent System Changes:
- Inventory page now has advanced filtering capabilities
- Vehicle Type & Ownership fields added for access control considerations
- Print document templates updated

---

## 📢 PREVIOUS UPDATE - January 1, 2026 (Data Field Updates)

### 🔄 Authentication & Data Consistency Updates

**Update: System continues to use secure cookie-based sessions with enhanced data field handling!**

#### Session Security:
- Sessions table with secure token storage
- 7-day session duration with automatic cleanup
- Rate limiting on sensitive API endpoints
- Template-based SMS messaging for security

#### Key Security Features:
- OTP rate limiting: 3 requests per 60 seconds
- Login attempts: 5 per 15 minutes per IP
- SMS sending: 10 per hour per user
- General API: 100 requests per minute per IP

---

## Authentication System

### Technology Stack
- **Authentication Provider**: Custom Auth (Migration in Progress → Better Auth v1.4.9)
- **Session Management**: Cookie-based sessions with Next.js middleware
- **Password Hashing**: SHA-256 (temporary) → Better Auth (planned: bcrypt/argon2)
- **Database**: PostgreSQL (via Supabase)
- **Future Integration**: Better Auth v1.4.9 (installed, pending configuration)

### Current Authentication Implementation

The system currently uses a **temporary authentication mechanism** during the migration:

1. **Password Storage**: `password_hash` column in `users` table (SHA-256 hashed)
2. **Session Cookies**: `pcn-dashboard.session_token` cookie (stores session token)
3. **Session Database**: `sessions` table for secure session token storage
4. **Client Storage**: `localStorage` for user data (temporary)
5. **Session Duration**: 7 days
6. **API Protection**: Session-based authentication for sensitive API routes
7. **Rate Limiting**: In-memory rate limiting for abuse prevention

### Authentication Methods
1. **Email/Username + Password Authentication**
   - Users can log in using either their email address or username
   - System automatically detects input type (email contains '@', username doesn't)
   - If username is provided, system looks up the corresponding email from the `users` table
   - Password verified against `password_hash` column via `/api/auth/verify-password`

2. **Password Reset via OTP**
   - Mobile number-based OTP verification
   - SMS-based OTP delivery (via TextLK)
   - Secure JWT token-based password reset

3. **Phone Verification**
   - Optional phone number verification via OTP
   - Stored in `phone_verification_otps` table

---

## User Roles & Access Levels

### Role Types

The system supports two primary roles:

#### 1. **Admin** (`access_level: 'Admin'`)
- **Full System Access**
- Can access all dashboard features
- **Exclusive Access**:
  - Reports & Analytics (`/reports`)
  - User Management (`/user-management`)
- **User Management Permissions**:
  - Create new users
  - Edit user details
  - Delete users
  - View all user information
  - Manage user roles and access levels
- **All Standard Permissions** (same as Editor)

#### 2. **Editor** (`access_level: 'Editor'`)
- **Standard Dashboard Access**
- **Accessible Features**:
  - Dashboard Overview (`/dashboard`)
  - Add Vehicle (`/add-vehicle`)
  - Inventory Management (`/inventory`)
  - Reserve Vehicle (`/reserve-vehicle`)
  - Sales Transactions (`/sales-transactions`)
  - Settings (`/settings`)
- **Restricted Features**:
  - ❌ Reports & Analytics (Admin only)
  - ❌ User Management (Admin only)
- **User Management Permissions**:
  - View user details (read-only)
  - Cannot edit or delete users
  - Cannot create new users

### Role Conversion
- Database stores `access_level` as `'Admin'` or `'Editor'` (capitalized)
- System converts to lowercase roles: `'admin'` or `'editor'`
- Default role for missing/invalid access levels: `'editor'` (most restrictive)

---

## Authentication Flow

### Login Process

```
┌─────────────────┐
│  User Opens     │
│  Login Page     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enter Email/    │
│ Username &      │
│ Password        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Input     │
│ Type: Email or  │
│ Username?       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ Email  │ │ Username     │
│        │ │ Lookup Email │
│        │ │ from DB      │
└───┬────┘ └──────┬───────┘
    │             │
    └─────┬───────┘
          │
          ▼
┌─────────────────┐
│ Query users     │
│ table for user  │
│ data            │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│User    │ │ Not Found   │
│Found   │ │ Show Error  │
└───┬────┘ └──────────────┘
    │
    ▼
┌─────────────────┐
│ Check Account   │
│ Status (active?)│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│Active  │ │ Inactive     │
│        │ │ Show Error   │
└───┬────┘ └──────────────┘
    │
    ▼
┌─────────────────┐
│ Verify Password │
│ via API call to │
│ /api/auth/      │
│ verify-password │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│Valid   │ │ Invalid      │
│        │ │ Show Error   │
└───┬────┘ └──────────────┘
    │
    ▼
┌─────────────────┐
│ Set Session     │
│ Cookie          │
│ (7 days)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store User Data │
│ in localStorage │
│ (temporary)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│ Dashboard       │
└───────────────────┘
```

### Login Page Features
- **Dual Input Support**: Email or Username
- **Password Visibility Toggle**: Show/Hide password
- **Remember Me**: Optional session persistence
- **Forgot Password Link**: Directs to password reset flow
- **Error Handling**: User-friendly error messages
- **Session Management**: Cookie-based session handling

### Login Implementation Details

**File**: `dashboard/src/app/login/page.tsx`

```typescript
// Temporary login mechanism (pending Better Auth)
const handleLogin = async (e: React.FormEvent) => {
  // 1. Determine if input is email or username
  const isEmail = emailOrUsername.includes('@')
  
  // 2. Look up user in database
  let query = supabase.from('users').select('...')
  
  // 3. Verify password via API
  const passwordHash = await fetch('/api/auth/verify-password', {
    method: 'POST',
    body: JSON.stringify({ password, hash: userData.password_hash })
  })
  
  // 4. Set session cookie
  document.cookie = `pcn-dashboard.session_token=${userData.id}; path=/; max-age=${60 * 60 * 24 * 7}`
  
  // 5. Store user in localStorage (temporary)
  localStorage.setItem('pcn-user', JSON.stringify({...}))
  
  // 6. Redirect to dashboard
  router.push('/dashboard')
}
```

### Middleware Protection

The system uses Next.js middleware to protect routes:

**Protected Routes** (require authentication):
- `/dashboard`
- `/add-vehicle`
- `/inventory`
- `/reports` (Admin only)
- `/sales-transactions`
- `/reserve-vehicle`
- `/settings`
- `/user-management` (Admin only)

**Public Routes**:
- `/login`
- `/` (redirects to dashboard if authenticated)
- API routes (handled separately)

**Middleware Flow**:
1. Check if route requires authentication
2. Verify session cookie exists (`pcn-dashboard.session_token`)
3. If no session → redirect to `/login`
4. If session exists → allow access (role check pending Better Auth integration)
5. TODO: Role-based route protection will be added with Better Auth
5. If unauthorized role → redirect to dashboard with access denied message

---

## Password Reset Flow

### Password Reset via Email OTP

> **Updated December 2024**: Password reset now uses **email-based OTP** via **Resend.com** instead of SMS. This provides better reliability and professional branded email templates.

```
┌─────────────────┐
│ User Clicks     │
│ "Forgot         │
│ Password"       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enter Email     │
│ Address         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate Email  │
│ in Users Table  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│Found   │ │ Not Found   │
│        │ │ Show Error  │
└───┬────┘ └──────────────┘
    │
    ▼
┌─────────────────┐
│ Generate 6-digit│
│ OTP Code        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store OTP in    │
│ password_reset  │
│ _otps table     │
│ (with email)    │
│ (Expires: 5min)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send OTP via    │
│ Resend Email    │
│ Service         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Receives   │
│ Branded Email   │
│ with OTP Code   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Enters OTP│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verify OTP     │
│ - Check exists │
│ - Check expiry │
│ - Check verified│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│Valid   │ │ Invalid/     │
│        │ │ Expired      │
│        │ │ Show Error   │
└───┬────┘ └──────────────┘
    │
    ▼
┌─────────────────┐
│ Mark OTP as     │
│ Verified        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate JWT    │
│ Reset Token     │
│ (Expires: 15min)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Enters New │
│ Password        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verify Token   │
│ & Update        │
│ Password via    │
│ Supabase Admin  │
│ API             │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Password Reset  │
│ Complete        │
│ Redirect to     │
│ Login           │
└─────────────────┘
```

### OTP Features
- **6-digit numeric code**
- **5-minute expiration**
- **Single-use verification**
- **Email delivery via Resend.com service**
- **Branded HTML email templates** with Punchi Car Niwasa styling
- **Email validation** before sending OTP

### Email Service Configuration

**File**: `dashboard/src/lib/email-service.ts`

```typescript
// Resend Email Service Configuration
const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async ({
  to,
  subject,
  html,
  text
}) => {
  return await resend.emails.send({
    from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
    to,
    subject,
    html,
    text
  })
}

// Password Reset OTP Email Template
export const emailTemplates = {
  passwordResetOTP: (otp: string, userName: string) => ({
    subject: 'Password Reset OTP - Punchi Car Niwasa',
    html: `/* Professional branded HTML template */`,
    text: `Your OTP code is: ${otp}`
  })
}
```

### Environment Variables (Email)
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev  # Use verified domain in production
RESEND_FROM_NAME=Punchi Car Niwasa
```

---

## Dashboard UI Access & Navigation

### Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header (50px)                                      │
│ - Greeting + User Name                             │
│ - Notifications Bell                               │
│ - User Profile Dropdown                            │
└─────────────────────────────────────────────────────┘
┌──────┬──────────────────────────────────────────────┐
│      │                                              │
│ Side │ Main Content Area                            │
│ bar  │                                              │
│      │                                              │
│ (260px│                                              │
│ /80px)│                                              │
│      │                                              │
└──────┴──────────────────────────────────────────────┘
```

### Sidebar Navigation

The sidebar displays navigation items based on user role:

#### All Users (Admin & Editor):
1. **Dashboard** (`/dashboard`)
   - Overview statistics
   - Sales charts
   - Active users panel
   - Vehicle statistics

2. **Add Vehicle** (`/add-vehicle`)
   - 6-step vehicle addition wizard
   - Vehicle details form
   - Image upload

3. **Inventory** (`/inventory`)
   - View all vehicles
   - Filter and search
   - Vehicle status management

4. **Reserve Vehicle** (`/reserve-vehicle`)
   - 3-step reservation process
   - Customer information
   - Payment details

5. **Sales Transactions** (`/sales-transactions`)
   - Complete sales history
   - Transaction details
   - Filtering and reporting

6. **Settings** (`/settings`)
   - System configuration
   - User preferences

#### Admin Only:
7. **Reports & Analytics** (`/reports`)
   - Sales reports
   - Revenue analysis
   - Performance metrics
   - Custom report builder

8. **User Management** (`/user-management`)
   - User CRUD operations
   - Role management
   - User status tracking
   - Real-time user activity

### Navigation Filtering

The system uses the `useRoleAccess` hook to filter navigation items:

```typescript
// Navigation items with role restrictions
const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Add Vehicle', href: '/add-vehicle' },
  { name: 'Inventory', href: '/inventory' },
  { name: 'Reserve Vehicle', href: '/reserve-vehicle' },
  { name: 'Sales Transactions', href: '/sales-transactions' },
  { name: 'Reports & Analytics', href: '/reports', allowedRoles: ['admin'] },
  { name: 'User Management', href: '/user-management', allowedRoles: ['admin'] },
  { name: 'Settings', href: '/settings' },
]
```

**Filtering Logic**:
- If `allowedRoles` is undefined → All authenticated users can access
- If `allowedRoles` is specified → Only users with matching role can see the item
- Admin users see all navigation items (admin has access to everything)

### Sidebar Features
- **Collapsible Sidebar**: Toggle between expanded (260px) and collapsed (80px)
- **Tooltips**: Show item names when sidebar is collapsed
- **Active Route Highlighting**: Current page is highlighted
- **Smooth Transitions**: Animated expand/collapse
- **Responsive Design**: Adapts to screen size

### Header Features
- **Dynamic Greeting**: "Good Morning/Afternoon/Evening" based on time
- **User Profile Dropdown**:
  - My Profile (view/edit profile)
  - Logout (with confirmation modal)
- **Notification Bell**: Real-time notifications
- **User Avatar**: Profile picture or initial letter

---

## Role-Based Access Control (RBAC)

### RBAC Implementation

The system implements RBAC through multiple layers:

#### 1. **Type Definitions** (`lib/rbac/types.ts`)
```typescript
type UserRole = 'admin' | 'editor'
type AccessLevel = 'Admin' | 'Editor' // Database format

function accessLevelToRole(accessLevel: string): UserRole
function hasPermission(userRole: UserRole, allowedRoles?: UserRole[]): boolean
```

#### 2. **Route Configuration** (`lib/rbac/config.ts`)
```typescript
const RESTRICTED_ROUTES: RoutePermission[] = [
  { path: '/reports', allowedRoles: ['admin'], name: 'Reports & Analytics' },
  { path: '/user-management', allowedRoles: ['admin'], name: 'User Management' },
]
```

#### 3. **Middleware Protection** (`middleware.ts`)
- Checks user role before allowing access to restricted routes
- Redirects unauthorized users to dashboard with access denied message

#### 4. **Component-Level Protection** (`hooks/useRoleAccess.ts`)
- Provides role checking utilities for React components
- Real-time role updates on auth state changes
- Navigation item filtering

### Permission Checking

**Admin Permissions**:
- ✅ Always has access to all routes
- ✅ Can access admin-only routes
- ✅ Can perform all CRUD operations on users
- ✅ Can view all reports and analytics

**Editor Permissions**:
- ✅ Can access standard dashboard routes
- ❌ Cannot access `/reports`
- ❌ Cannot access `/user-management`
- ✅ Can view user details (read-only)
- ❌ Cannot edit/delete users

### Access Denied Handling

When an Editor tries to access an admin-only route:
1. Middleware detects unauthorized access
2. Redirects to `/dashboard?access=denied`
3. Dashboard displays access denied notification
4. User is informed they don't have permission

---

## Session Management

### Current Session Implementation (Temporary)

> **Note**: This is a temporary implementation during the migration to Better Auth.

1. **Session Creation**:
   - Created on successful login
   - User ID stored in `pcn-dashboard.session_token` cookie
   - User data stored in `localStorage` (temporary approach)
   - Session duration: 7 days

2. **Session Tracking**:
   - User activity tracked in `user_sessions` table
   - Session heartbeat updates every 30 seconds
   - Tracks last activity timestamp

3. **Session Validation**:
   - Middleware checks for session cookie
   - Cookie presence allows access to protected routes
   - TODO: Full session validation will be implemented with Better Auth

4. **Session Termination**:
   - Manual logout via UI
   - Session cleared from database
   - Cookies cleared from browser
   - localStorage cleared
   - Redirect to login page

### Session Cookie Details

```typescript
// Cookie Name
'pcn-dashboard.session_token'

// Cookie Value
userId (UUID string)

// Cookie Attributes
path=/
max-age=604800 (7 days)
```

### Session Heartbeat

The system implements a session heartbeat mechanism:
- Updates user's `last_activity` timestamp every 30 seconds
- Tracks active users in real-time
- Used for "Active Users" panel on dashboard
- Helps identify currently logged-in team members

### Active User Status

**Active Users** (Green dot):
- Currently logged in
- Session active within last 5 minutes
- Shown in dashboard's "Active Users" panel

**Inactive Users** (Gray dot):
- Not currently logged in
- Session expired or logged out
- Still visible in user management

---

## Security Features

### Authentication Security

1. **Password Security**:
   - Stored as SHA-256 hashed values (temporary)
   - TODO: Migrate to bcrypt/argon2 with Better Auth
   - `password_hash` column in `users` table
   - Verification via `/api/auth/verify-password` endpoint

2. **Session Security**:
   - Cookie-based sessions with 7-day expiry
   - Session token is user ID (temporary approach)
   - TODO: Better Auth will provide secure session tokens
   - HTTP cookies (httpOnly flag to be added with Better Auth)

3. **OTP Security**:
   - 6-digit numeric codes
   - 5-minute expiration
   - Single-use verification
   - Stored securely in database

4. **Route Protection**:
   - Middleware-level route guards
   - Cookie-based session validation
   - Client-side role checking
   - Multi-layer security

### Data Protection

1. **User Data**:
   - Sensitive data encrypted at rest
   - Secure API endpoints
   - Role-based data access

2. **Session Data**:
   - Secure cookie storage
   - Automatic cleanup on logout
   - Session timeout handling

3. **API Security**:
   - Service role key for admin operations
   - Anon key for client operations
   - Request validation and sanitization

### Security Best Practices

1. **Input Validation**:
   - Email format validation
   - Phone number normalization
   - Password strength requirements

2. **Error Handling**:
   - Generic error messages (no sensitive data exposure)
   - Proper error logging
   - User-friendly error feedback

3. **Access Control**:
   - Principle of least privilege
   - Role-based restrictions
   - Route-level and component-level checks

---

## Dashboard UI Engagement Guide

### For Admin Users

#### Initial Login
1. Navigate to `/login`
2. Enter email/username and password
3. Click "Login"
4. Redirected to `/dashboard`

#### Dashboard Overview
- View real-time statistics:
  - Available vehicles count
  - Pending sales
  - Sold vehicles
  - Sales trends chart
- See active team members
- Monitor sales performance

#### User Management
1. Click "User Management" in sidebar
2. View all users with status indicators
3. **Create User**:
   - Click "Add User" button
   - Fill in user details
   - Select access level (Admin/Editor)
   - System creates Supabase Auth user automatically
4. **Edit User**:
   - Click user row → "View Detail"
   - Click "Edit" button
   - Modify user information
   - Save changes
5. **Delete User**:
   - Click delete icon (red)
   - Confirm deletion
   - User removed from system

#### Reports & Analytics
1. Click "Reports & Analytics" in sidebar
2. Access comprehensive reports:
   - Sales reports
   - Revenue analysis
   - Performance metrics
   - Custom date ranges

### For Editor Users

#### Initial Login
1. Navigate to `/login`
2. Enter email/username and password
3. Click "Login"
4. Redirected to `/dashboard`

#### Dashboard Overview
- Same view as Admin
- View real-time statistics
- See active team members
- Monitor sales performance

#### Restricted Features
- **Reports & Analytics**: Not visible in sidebar
- **User Management**: Not visible in sidebar
- If attempting direct URL access → Redirected with access denied message

#### Available Features
1. **Add Vehicle**: Complete vehicle addition wizard
2. **Inventory**: Manage vehicle inventory
3. **Reserve Vehicle**: Process vehicle reservations
4. **Sales Transactions**: View sales history
5. **Settings**: Configure preferences

### Common Dashboard Interactions

#### Navigation
- **Sidebar Toggle**: Click chevron icon to collapse/expand
- **Active Route**: Current page highlighted in sidebar
- **Tooltips**: Hover over collapsed sidebar items

#### User Profile
1. Click user avatar/name in header
2. Dropdown menu appears:
   - **My Profile**: View/edit personal information
   - **Logout**: Sign out of system

#### Notifications
- Click bell icon in header
- View real-time notifications
- Mark as read/unread

#### Logout Process
1. Click user dropdown → "Logout"
2. Confirmation modal appears
3. Confirm logout
4. Session cleared
5. Redirected to login page

---

## Database Schema

### Users Table
```sql
users (
  id: UUID (Primary Key)
  auth_id: UUID (Foreign Key to auth.users)
  first_name: TEXT
  last_name: TEXT
  email: TEXT (Unique)
  username: TEXT (Unique)
  mobile_number: TEXT
  access_level: TEXT ('Admin' | 'Editor')
  role: TEXT
  status: TEXT ('active' | 'inactive')
  profile_picture_url: TEXT
  phone_verified: BOOLEAN
  phone_verified_at: TIMESTAMP
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  last_activity: TIMESTAMP
)
```

### Password Reset OTPs Table
```sql
password_reset_otps (
  id: UUID (Primary Key)
  mobile_number: TEXT
  otp_code: TEXT
  user_id: UUID (Nullable)
  expires_at: TIMESTAMP
  verified: BOOLEAN
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

### User Sessions Table
```sql
user_sessions (
  id: UUID (Primary Key)
  user_id: UUID
  auth_id: UUID
  session_token: TEXT
  is_active: BOOLEAN
  last_activity: TIMESTAMP
  created_at: TIMESTAMP
  expires_at: TIMESTAMP
)
```

---

## API Endpoints

### Authentication Endpoints

#### Login
- **Method**: Client-side (Direct database lookup + API verification)
- **Endpoint**: Database query + `/api/auth/verify-password`
- **Request**: `{ email/username, password }`
- **Response**: Redirect to dashboard on success

#### Session Check
- **Method**: GET
- **Endpoint**: `/api/auth/session`
- **Response**: `{ user: null, session: null }` (placeholder for Better Auth)

#### Verify Password
- **Method**: POST
- **Endpoint**: `/api/auth/verify-password`
- **Request**: `{ password, hash }`
- **Response**: `{ valid: boolean }`

#### Logout
- **Method**: POST
- **Endpoint**: `/api/auth/logout`
- **Response**: Success message, clears cookies

#### Send OTP
- **Method**: POST
- **Endpoint**: `/api/auth/send-otp`
- **Request**: `{ mobileNumber }`
- **Response**: `{ success, message }`

#### Verify OTP
- **Method**: POST
- **Endpoint**: `/api/auth/verify-otp`
- **Request**: `{ mobileNumber, otp }`
- **Response**: `{ success, token }`

#### Reset Password
- **Method**: POST
- **Endpoint**: `/api/auth/reset-password`
- **Request**: `{ token, newPassword }`
- **Response**: `{ success, message }`

### User Management Endpoints

#### Get Users
- **Method**: GET
- **Endpoint**: `/api/users`
- **Response**: Array of user objects

#### Create User
- **Method**: POST
- **Endpoint**: `/api/users`
- **Request**: User data object
- **Response**: Created user object

#### Update User
- **Method**: PUT
- **Endpoint**: `/api/users/[id]`
- **Request**: Updated user data
- **Response**: Updated user object

#### Delete User
- **Method**: DELETE
- **Endpoint**: `/api/users/[id]`
- **Response**: Success message

---

## Troubleshooting

### Common Issues

#### Login Issues
1. **Invalid Credentials**:
   - Verify email/username is correct
   - Check password is correct
   - Ensure account exists in database

2. **Session Errors**:
   - Clear browser cookies
   - Try incognito/private mode
   - Check Supabase connection

3. **Username Not Found**:
   - Verify username exists in `users` table
   - Check username spelling
   - Try using email instead

#### Access Issues
1. **Access Denied**:
   - Verify user's `access_level` in database
   - Check if route requires admin role
   - Contact administrator for role upgrade

2. **Navigation Items Missing**:
   - Check user role
   - Verify `allowedRoles` configuration
   - Refresh page

#### Password Reset Issues
1. **OTP Not Received**:
   - Verify mobile number in database
   - Check SMS service status
   - Wait for SMS delivery (may take time)

2. **OTP Expired**:
   - Request new OTP
   - OTPs expire after 5 minutes
   - Generate new code

3. **Invalid OTP**:
   - Verify OTP code is correct
   - Check for typos
   - Ensure OTP hasn't been used

---

## Best Practices

### For Administrators

1. **User Management**:
   - Regularly review user access levels
   - Deactivate unused accounts
   - Monitor active sessions

2. **Security**:
   - Use strong passwords
   - Enable two-factor authentication (if available)
   - Regularly audit user permissions

3. **Role Assignment**:
   - Assign Editor role by default
   - Only promote to Admin when necessary
   - Document role changes

### For Editors

1. **Account Security**:
   - Use strong, unique passwords
   - Don't share credentials
   - Log out when finished

2. **Data Access**:
   - Understand your access limitations
   - Request admin access if needed
   - Report access issues promptly

---

## Version Information

- **Application Version**: 2.0.37
- **Last Updated**: December 29, 2025
- **Authentication System**: Custom Auth with Session-Based API Authentication
- **Better Auth Version**: v1.4.9 (installed, pending integration)
- **Framework**: Next.js 14+ (App Router)

---

## Migration Status

### Step 1: Supabase Auth Removal ✅ COMPLETE

- Removed `@supabase/ssr` dependency
- Removed Supabase Auth API calls
- Added `password_hash` column to `users` table
- Implemented temporary SHA-256 password verification
- Implemented cookie-based session management

### Step 2: API Security & Rate Limiting ✅ COMPLETE (Dec 29, 2025)

**Implemented Security Features**:

1. **Session-Based API Authentication** (`dashboard/src/lib/api-auth.ts`)
   - Session validation via `sessions` database table
   - `withAuth()` higher-order function for protected API routes
   - Role-based and access-level-based authorization
   - Automatic session expiration handling

2. **Rate Limiting** (`dashboard/src/lib/rate-limit.ts`)
   - In-memory rate limiter for API abuse prevention
   - Pre-configured limiters:
     - OTP: 3 requests per 60 seconds
     - OTP Verify: 5 attempts per 5 minutes
     - Login: 5 attempts per 15 minutes
     - SMS: 10 per hour per user
     - General API: 100 requests per minute

3. **Sessions Table Migration** (`dashboard/migrations/2025_12_29_add_sessions_table.sql`)
   - Secure session token storage
   - Automatic session cleanup function
   - Row-level security enabled

4. **Environment Variable Security**
   - Removed all hardcoded API tokens
   - All secrets loaded from environment variables only
   - Template-based SMS messaging (no arbitrary messages allowed)

### Step 3: Better Auth Integration 🔄 PENDING

**Installed**: Better Auth v1.4.9

**TODO Items**:
1. Create Better Auth configuration (`lib/auth.ts`)
2. Create Better Auth API route handler (`/api/auth/[...all]/route.ts`)
3. Update `auth-helpers.ts` with Better Auth client
4. Migrate existing password hashes to bcrypt/argon2
5. Remove localStorage-based temporary auth
6. Implement proper JWT session tokens

**Files to Update**:
- `dashboard/src/lib/auth.ts` (create new)
- `dashboard/src/lib/auth-helpers.ts` (update)
- `dashboard/src/middleware.ts` (update)
- `dashboard/src/app/login/page.tsx` (update)
- `dashboard/src/app/api/auth/[...all]/route.ts` (create)

---

## Support & Contact

For authentication or access issues:
- **Email**: admin@punchicar.com
- **Phone**: 0112 413 865
- **System**: Contact administrator for account creation

---

*This documentation is maintained as part of the PCN System 2.0. For updates or corrections, please contact the development team.*

