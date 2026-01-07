# User Management Flow - PCN System

## Overview

The User Management module allows administrators to add, edit, view, and manage users, their authentication, access levels, and roles. It provides a secure interface for handling user credentials, profile data, and permissions, with database storage via Supabase PostgreSQL.

**Access Level**: Admin Only (Role-Based Access Control)

> **⚠️ AUTHENTICATION STATUS**: The system uses cookie-based session authentication with server-side session validation. API routes are protected with authentication middleware and rate limiting.

**Last Updated**: January 3, 2026

---

## 📢 LATEST UPDATE - January 1, 2026 (Database Alignment)

### 🔄 User & Agent Data Updates

**Update: Database schema aligned with simplified user management!**

#### Key Changes:
- Sales Agent Tab removed deprecated `user_id` field
- User roles properly mapped: `admin` and `editor`
- Session-based authentication with secure cookie handling

---

## 📢 PREVIOUS UPDATE - December 29, 2025 (API Security)

### 🔐 Security Enhancements

- **Sessions Table**: New `sessions` table for secure session token storage
- **Rate Limiting**: OTP sending limited to 3 requests per 60 seconds
- **SMS Security**: Welcome SMS uses template-based messaging (server-side only)
- **Environment Variables**: All API tokens loaded from `.env.local` only

---

## Table of Contents

1. [Database Schema & Connections](#1-database-schema--connections)
2. [User Add & Authentication Handling](#2-user-add--authentication-handling)
3. [User Access Levels & Roles](#3-user-access-levels--roles)
4. [UI Design & Components](#4-ui-design--components)
5. [Functions & Logic](#5-functions--logic)
6. [API Endpoints](#6-api-endpoints)
7. [Security & Validation](#7-security--validation)
8. [Types & Interfaces](#8-types--interfaces)
9. [File Structure Summary](#9-file-structure-summary)
10. [Future Enhancements](#10-future-enhancements)

---

## 1. Database Schema & Connections

### 1.1 Main Table: `users`

| Column              | Type      | Description                           | Required |
|---------------------|-----------|---------------------------------------|----------|
| id                  | UUID      | Primary key (auto-generated)          | ✓ |
| auth_id             | UUID      | Legacy Supabase Auth user id          | - |
| first_name          | VARCHAR   | User's first name                     | ✓ |
| last_name           | VARCHAR   | User's last name                      | ✓ |
| username            | VARCHAR   | Unique username for login             | ✓ |
| email               | VARCHAR   | Email address (unique)                | ✓ |
| password_hash       | VARCHAR   | SHA-256 hashed password (temporary)   | ✓ |
| mobile_number       | VARCHAR   | Mobile number (Sri Lankan format)     | - |
| phone_verified      | BOOLEAN   | Whether phone is verified             | - |
| phone_verified_at   | TIMESTAMP | Phone verification timestamp          | - |
| access_level        | VARCHAR   | Admin / Editor / Viewer               | ✓ |
| role                | VARCHAR   | Manager / Accountant / Sales Agent    | ✓ |
| profile_picture_url | VARCHAR   | Base64 or URL of profile image        | - |
| status              | VARCHAR   | Active / Inactive                     | ✓ |
| created_at          | TIMESTAMP | Creation timestamp                    | ✓ |
| updated_at          | TIMESTAMP | Last update timestamp                 | - |

### 1.2 Supabase Connection

**Client-Side Connection**: `dashboard/src/lib/supabase-client.ts`
```typescript
import { supabase } from '@/lib/supabase-client'
```

**Server-Side Connection**: `dashboard/src/lib/supabase-server.ts`
```typescript
import { createClient } from '@/lib/supabase-server'
const supabase = await createClient()
```

**Admin Client** (for privileged operations):
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### 1.3 Real-Time Subscription

```typescript
const usersChannel = supabase
  .channel('users-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      fetchUsers() // Refresh on any change
    }
  )
  .subscribe()
```

---

## 2. User Add & Authentication Handling

### 2.1 Add User Flow Diagram

```
┌─────────────────┐
│  Add User Btn   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ AddUserModal    │
│ (Form Display)  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Client-Side     │
│ Validation      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ POST /api/users │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Check Unique    │
│ Username/Email  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Hash Password   │
│ (SHA-256)       │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Insert User     │
│ Record in DB    │
│ (with hash)     │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Send SMS/Email  │
│ (Optional)      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Success Modal   │
│ & Refresh List  │
└─────────────────┘
```

### 2.2 Form Fields

| Field            | Type     | Validation                    | Required |
|------------------|----------|-------------------------------|----------|
| First Name       | text     | Non-empty                     | ✓ |
| Last Name        | text     | Non-empty                     | ✓ |
| Username         | text     | Non-empty, unique             | ✓ |
| Access Level     | select   | Admin / Editor                | ✓ |
| Email            | email    | Valid email, unique           | ✓ |
| Mobile Number    | tel      | Sri Lankan format (07XXXXXXXX)| - |
| Role             | select   | Manager / Accountant / Sales Agent | ✓ |
| Password         | password | Min 6 characters              | ✓ |
| Re-enter Password| password | Must match password           | ✓ |
| Profile Picture  | file     | Image, max 2MB                | - |
| Send SMS         | checkbox | Enabled only if mobile filled | - |

### 2.3 Authentication Handling (Current Implementation)

> **Note**: This is a temporary implementation during the migration to Better Auth.

**Step 1: Hash Password**
```typescript
import * as crypto from 'crypto'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}
```

**Step 2: Create User Record in Database**
```typescript
const { data: userData, error: userError } = await supabaseAdmin
  .from('users')
  .insert([{
    first_name: firstName,
    last_name: lastName,
    username: username,
    email: email,
    password_hash: hashPassword(password),  // SHA-256 hash
    mobile_number: mobileNumber || null,
    access_level: accessLevel,
    role: role,
    profile_picture_url: profilePicture || null,
    status: 'Active'
  }])
  .select()
  .single()
```

**Step 3: Handle Errors**
```typescript
if (userError) {
  return NextResponse.json(
    { error: `Failed to create user record: ${userError.message}` },
    { status: 400 }
  )
}
```

### 2.4 SMS Credentials Delivery (Text.lk Integration)

**Validation**:
```typescript
import { sendSMS, formatPhoneNumber, isValidSriLankanPhone, smsTemplates } from '@/lib/sms-service'

if (isValidSriLankanPhone(mobileNumber)) {
  const formattedPhone = formatPhoneNumber(mobileNumber)
  const smsMessage = smsTemplates.welcome(firstName, username, email, password)
  
  const smsResult = await sendSMS({
    to: formattedPhone,
    message: smsMessage
  })
}
```

---

## 3. User Access Levels & Roles

### 3.1 Access Levels

| Access Level | Description         | User Management Permissions              |
|--------------|---------------------|------------------------------------------|
| Admin        | Full access         | View, Add, Edit, Delete all users        |
| Editor       | Limited access      | View users only (read-only mode)         |
| Viewer       | Read-only           | View users only                          |

### 3.2 Roles (Business Function)

| Role         | Description              |
|--------------|--------------------------|
| Manager      | Management/supervisor    |
| Accountant   | Finance & accounting     |
| Sales Agent  | Vehicle sales staff      |

### 3.3 Role-Based UI Visibility

**Admin View**:
- Can see Edit and Delete buttons
- Can toggle edit mode in UserDetailsModal
- Full form editing capabilities

**Editor/Viewer View**:
- View Detail button only (no Edit/Delete)
- Read-only mode in UserDetailsModal
- "View Only - Admin access required to edit" banner

### 3.4 Access Level Check Functions

```typescript
// In page.tsx
const isAdmin = currentUser?.access_level?.toLowerCase() === 'admin'

// Conditional rendering
{currentUser?.access_level?.toLowerCase() === 'admin' && (
  <>
    <button onClick={() => handleEditUser(user.id)}>Edit</button>
    <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
  </>
)}
```

---

## 4. UI Design & Components

### 4.1 Main Page: `UserManagementPage`

**File**: `dashboard/src/app/(dashboard)/user-management/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ User Management                        [+ Add User]     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ User ID │ Name │ Email │ Access │ Status │ Actions │ │
│ ├─────────┼──────┼───────┼────────┼────────┼─────────┤ │
│ │ abc123  │ John │ j@... │ Admin  │ 🟢     │ 👁 ✏️ 🗑│ │
│ │ def456  │ Jane │ j@... │ Editor │ ⚪     │ 👁      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Rows per page: [10 ▼]    < 1 2 3 ... 10 >              │
└─────────────────────────────────────────────────────────┘
```

**State Variables**:
```typescript
const [users, setUsers] = useState<User[]>([])
const [loading, setLoading] = useState(true)
const [showAddUserModal, setShowAddUserModal] = useState(false)
const [showSuccessModal, setShowSuccessModal] = useState(false)
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)
const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
const [currentUser, setCurrentUser] = useState<User | null>(null)
const [currentPage, setCurrentPage] = useState(1)
const [totalPages, setTotalPages] = useState(1)
const [itemsPerPage, setItemsPerPage] = useState(10)
```

### 4.2 Add User Modal: `AddUserModal`

**File**: `dashboard/src/app/(dashboard)/user-management/components/AddUserModal.tsx`

**Props Interface**:
```typescript
interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  formData: FormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onProfilePictureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  errors: Record<string, string>
  loading: boolean
}
```

**Form Structure**:
```
┌─────────────────────────────────────┐
│           Add New User              │
├─────────────────────────────────────┤
│         [Profile Picture]           │
│           [Upload Btn]              │
│                                     │
│ First Name      │ Last Name         │
│ [____________]  │ [____________]    │
│                                     │
│ Username        │ Access Level      │
│ [____________]  │ [Admin ▼]         │
│                                     │
│ Email                               │
│ [________________________________]  │
│                                     │
│ Mobile Number   │ Role              │
│ [____________]  │ [Sales Agent ▼]   │
│                                     │
│ Password        │ Re-enter Password │
│ [____________]  │ [____________]    │
│                                     │
│ ☐ Send login credentials via SMS    │
│                                     │
│ [Cancel]           [Add User]       │
└─────────────────────────────────────┘
```

### 4.3 User Details Modal: `UserDetailsModal`

**File**: `dashboard/src/app/(dashboard)/user-management/components/UserDetailsModal.tsx`

**Props Interface**:
```typescript
interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onUserUpdated: () => void
  currentUserAccessLevel: string
  onDeleteUser?: (userId: string) => void
}
```

**Modal States**:
- **View Mode** (default): All fields disabled, only Close button
- **Edit Mode** (Admin only): All fields enabled, Save/Cancel buttons

**View-Only Banner for Non-Admins**:
```tsx
{!isAdmin && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <Lock className="w-5 h-5 text-blue-600" />
    <h4>View-Only Mode</h4>
    <p>Only administrators can edit user information.</p>
  </div>
)}
```

### 4.4 Delete User Modal: `DeleteUserModal`

**Confirmation dialog with**:
- User name display
- Warning message
- Cancel and Confirm Delete buttons

### 4.5 Success Modal: `SuccessModal`

- Shows after successful user creation
- Displays new user's name
- Auto-closes after 3 seconds

### 4.6 UI Components Used

| Component | Source | Purpose |
|-----------|--------|---------|
| Table, TableBody, TableCell | `@/components/ui/table` | Users table |
| Pagination | `@/components/ui/pagination` | Page navigation |
| Plus, Eye, Pencil, Trash2 | `lucide-react` | Action icons |
| X, Upload, Lock | `lucide-react` | Modal icons |

### 4.7 Status Indicators

**Online/Offline Status**:
```typescript
const getStatusColor = (isOnline?: boolean) => {
  return isOnline ? 'bg-green-500' : 'bg-gray-400'
}

const getStatusText = (isOnline?: boolean) => {
  return isOnline ? 'Active' : 'Inactive'
}
```

**Access Level Badge Colors**:
```typescript
const getLevelColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'admin':
      return 'bg-green-100 text-green-700'
    case 'editor':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
```

---

## 5. Functions & Logic

### 5.1 State Management

**Form Data State**:
```typescript
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  username: '',
  accessLevel: 'Editor',
  email: '',
  mobileNumber: '',
  role: 'Sales Agent',
  password: '',
  reEnterPassword: '',
  sendEmail: true,
  sendSMS: true,
  profilePicture: ''
})
```

**Error State**:
```typescript
const [errors, setErrors] = useState<Record<string, string>>({})
```

### 5.2 Fetch Functions

**Fetch Current User** (for access control):
```typescript
const fetchCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', session.user.id)
      .single()
    
    if (userData) {
      userData.access_level = userData.access_level.trim() // Normalize
      setCurrentUser(userData)
    }
  }
}
```

**Fetch All Users**:
```typescript
const fetchUsers = async () => {
  const response = await fetch('/api/users')
  const data = await response.json()
  
  if (response.ok && data.users) {
    // Mark current logged-in user as active
    const { data: { session } } = await supabase.auth.getSession()
    const usersWithCurrentStatus = data.users.map((user: User) => {
      if (session && user.auth_id === session.user.id) {
        return { ...user, is_online: true }
      }
      return user
    })
    setUsers(usersWithCurrentStatus)
    setTotalPages(Math.ceil(usersWithCurrentStatus.length / itemsPerPage))
  }
}
```

### 5.3 Input Handling

**Generic Input Change Handler**:
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target
  if (type === 'checkbox') {
    setFormData({
      ...formData,
      [name]: (e.target as HTMLInputElement).checked
    })
  } else {
    setFormData({
      ...formData,
      [name]: value
    })
  }
  // Clear error for this field
  if (errors[name]) {
    setErrors({ ...errors, [name]: '' })
  }
}
```

**Profile Picture Upload**:
```typescript
const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({
        ...formData,
        profilePicture: reader.result as string
      })
    }
    reader.readAsDataURL(file)
  }
}
```

### 5.4 Validation Logic

**Client-Side Form Validation**:
```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!formData.firstName.trim()) {
    newErrors.firstName = 'First name is required'
  }
  if (!formData.lastName.trim()) {
    newErrors.lastName = 'Last name is required'
  }
  if (!formData.username.trim()) {
    newErrors.username = 'Username is required'
  }
  if (!formData.email.trim()) {
    newErrors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email'
  }
  if (!formData.password) {
    newErrors.password = 'Password is required'
  } else if (formData.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters'
  }
  if (formData.password !== formData.reEnterPassword) {
    newErrors.reEnterPassword = 'Passwords do not match'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### 5.5 Add User Logic

```typescript
const handleAddUser = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) return

  setFormLoading(true)

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        accessLevel: formData.accessLevel,
        role: formData.role,
        password: formData.password,
        profilePicture: formData.profilePicture,
        sendEmail: formData.sendEmail,
        sendSMS: formData.sendSMS
      })
    })

    if (!response.ok) {
      const error = await response.json()
      setErrors({ submit: error.error || 'Failed to create user' })
      return
    }

    // Show success modal
    setSuccessUserName(`${formData.firstName} ${formData.lastName}`)
    setShowAddUserModal(false)
    setShowSuccessModal(true)

    // Reset form and refresh
    resetFormData()
    setTimeout(() => {
      setShowSuccessModal(false)
      fetchUsers()
    }, 3000)
  } catch (error) {
    setErrors({ submit: 'An error occurred. Please try again.' })
  } finally {
    setFormLoading(false)
  }
}
```

### 5.6 Edit User Logic

```typescript
const handleSave = async () => {
  if (!userId) return

  setSaving(true)
  setError('')

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await response.json()

    if (response.ok) {
      setIsEditing(false)
      onUserUpdated()
      await fetchUserDetails()
    } else {
      setError(data.error || 'Failed to update user')
    }
  } catch (err) {
    setError('Failed to update user. Please try again.')
  } finally {
    setSaving(false)
  }
}
```

### 5.7 Delete User Logic

```typescript
const confirmDeleteUser = async () => {
  if (!userToDelete) return

  setDeleteLoading(true)

  try {
    const response = await fetch(`/api/users/${userToDelete.id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      setShowDeleteModal(false)
      setUserToDelete(null)
      fetchUsers() // Refresh list
    } else {
      const data = await response.json()
      console.error('Failed to delete user:', data.error)
    }
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    setDeleteLoading(false)
  }
}
```

### 5.8 Pagination Logic

```typescript
const getPaginatedUsers = () => {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return users.slice(startIndex, endIndex)
}

const handlePageChange = (page: number) => {
  setCurrentPage(page)
}

const handleItemsPerPageChange = (value: number) => {
  setItemsPerPage(value)
  setCurrentPage(1) // Reset to first page
  setTotalPages(Math.ceil(users.length / value))
}
```

### 5.9 Real-Time Updates

```typescript
useEffect(() => {
  fetchUsers()
  
  // Real-time subscription
  const usersChannel = supabase
    .channel('users-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'users' },
      (payload) => {
        console.log('User change detected:', payload)
        fetchUsers()
      }
    )
    .subscribe()

  // Auto-refresh every 30 seconds
  const intervalId = setInterval(() => {
    fetchUsers()
  }, 30000)

  return () => {
    supabase.removeChannel(usersChannel)
    clearInterval(intervalId)
  }
}, [currentPage])
```

---

## 6. API Endpoints

### 6.1 Get All Users: `GET /api/users`

**File**: `dashboard/src/app/api/users/route.ts`

**Response**:
```typescript
{
  users: [
    {
      id: "uuid",
      auth_id: "uuid",
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      access_level: "Admin",
      status: "Active",
      last_sign_in_at: "2025-12-28T10:00:00Z",
      is_online: true
    }
  ]
}
```

**Online Status Logic**:
```typescript
// Consider user online if signed in within last 30 minutes
const isOnline = lastSignIn 
  ? (new Date().getTime() - new Date(lastSignIn).getTime()) < 30 * 60 * 1000
  : false
```

### 6.2 Create User: `POST /api/users`

**Request Body**:
```typescript
{
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  mobileNumber?: string,
  accessLevel: "Admin" | "Editor",
  role: "Manager" | "Accountant" | "Sales Agent",
  password: string,
  profilePicture?: string,
  sendEmail?: boolean,
  sendSMS?: boolean
}
```

**Process**:
1. Validate required fields
2. Check unique username
3. Check unique email
4. Create Supabase Auth user
5. Insert user record in database
6. Send email credentials (optional)
7. Send SMS credentials (optional)
8. Rollback on failure

**Response Success**:
```typescript
{ user: UserObject, message: "User created successfully" }
```

**Response Error**:
```typescript
{ error: "Error message" }
```

### 6.3 Get Single User: `GET /api/users/[id]`

**File**: `dashboard/src/app/api/users/[id]/route.ts`

**Authentication**: Required (any authenticated user)

**Response**:
```typescript
{ user: UserObject }
```

### 6.4 Update User: `PUT /api/users/[id]`

**Authorization**: Admin only

**Request Body**:
```typescript
{
  first_name?: string,
  last_name?: string,
  username?: string,
  email?: string,
  mobile_number?: string,
  access_level?: string,
  role?: string,
  profile_picture_url?: string
}
```

**Access Check**:
```typescript
if (currentUser.access_level?.toLowerCase() !== 'admin') {
  return NextResponse.json(
    { error: 'Forbidden - Only administrators can update users' },
    { status: 403 }
  )
}
```

### 6.5 Delete User: `DELETE /api/users/[id]`

**Authorization**: Admin only

**Process**:
1. Verify admin access
2. Prevent self-deletion
3. Delete from `users` table
4. Delete from Supabase Auth

**Self-Deletion Prevention**:
```typescript
if (currentUser.id === params.id) {
  return NextResponse.json(
    { error: 'Cannot delete your own account' },
    { status: 400 }
  )
}
```

**Response Success**:
```typescript
{
  success: true,
  message: "User John Doe has been permanently deleted",
  deletedUser: { id, name, email }
}
```

---

## 7. Security & Validation

### 7.1 Authentication Checks

| Endpoint | Auth Required | Admin Required |
|----------|---------------|----------------|
| GET /api/users | ✓ | - |
| POST /api/users | ✓ | - |
| GET /api/users/[id] | ✓ | - |
| PUT /api/users/[id] | ✓ | ✓ |
| DELETE /api/users/[id] | ✓ | ✓ |

### 7.2 Validation Rules

**Server-Side Validation**:
```typescript
// Required fields
if (!firstName || !lastName || !username || !email || !password || !accessLevel || !role) {
  return NextResponse.json(
    { error: 'Missing required fields' },
    { status: 400 }
  )
}

// Unique username check
const { data: existingUsername } = await supabaseAdmin
  .from('users')
  .select('username')
  .eq('username', username)
  .single()

if (existingUsername) {
  return NextResponse.json(
    { error: 'Username already exists. Please choose a different username.' },
    { status: 400 }
  )
}

// Unique email check (similar logic)
```

### 7.3 Profile Picture Validation

```typescript
// Max 2MB size
if (file.size > 2 * 1024 * 1024) {
  setError('Image size should be less than 2MB')
  return
}

// Accept only images
<input type="file" accept="image/*" />
```

### 7.4 Password Security

- Passwords are hashed by Supabase Auth (never stored in plain text)
- Minimum 6 characters required
- Password confirmation required before submission

### 7.5 Rollback Mechanism

If database insert fails after auth user creation:
```typescript
if (userError) {
  // Rollback: Delete the auth user
  await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
  return NextResponse.json(
    { error: `Failed to create user record: ${userError.message}` },
    { status: 400 }
  )
}
```

---

## 8. Types & Interfaces

### 8.1 User Interface (Page Level)

```typescript
interface User {
  id: string
  auth_id: string
  first_name: string
  last_name: string
  email: string
  access_level: string
  status: string
  created_at: string
  last_sign_in_at?: string
  is_online?: boolean
}
```

### 8.2 User Details Interface (Modal Level)

```typescript
interface UserDetails {
  id: string
  auth_id: string
  first_name: string
  last_name: string
  username: string
  email: string
  mobile_number: string | null
  phone_verified: boolean
  phone_verified_at: string | null
  access_level: string
  role: string
  profile_picture_url: string | null
  status: string
  created_at: string
}
```

### 8.3 Add User Form Data

```typescript
interface FormData {
  firstName: string
  lastName: string
  username: string
  accessLevel: string
  email: string
  mobileNumber: string
  role: string
  password: string
  reEnterPassword: string
  sendEmail: boolean
  sendSMS: boolean
  profilePicture: string
}
```

### 8.4 Modal Props Interfaces

```typescript
interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  formData: FormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onProfilePictureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  errors: Record<string, string>
  loading: boolean
}

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onUserUpdated: () => void
  currentUserAccessLevel: string
  onDeleteUser?: (userId: string) => void
}
```

---

## 9. File Structure Summary

```
dashboard/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── user-management/
│   │   │       ├── page.tsx                    # Main user management page
│   │   │       └── components/
│   │   │           ├── AddUserModal.tsx        # Add user modal
│   │   │           ├── UserDetailsModal.tsx    # View/Edit user modal
│   │   │           ├── DeleteUserModal.tsx     # Delete confirmation modal
│   │   │           └── SuccessModal.tsx        # Success notification modal
│   │   │
│   │   └── api/
│   │       └── users/
│   │           ├── route.ts                    # GET all, POST create
│   │           ├── [id]/
│   │           │   └── route.ts                # GET single, PUT update, DELETE
│   │           └── send-credentials/
│   │               └── route.ts                # Email credentials endpoint
│   │
│   ├── hooks/
│   │   └── useRoleAccess.ts                    # RBAC hook
│   │
│   ├── lib/
│   │   ├── supabase-client.ts                  # Client-side Supabase
│   │   ├── supabase-server.ts                  # Server-side Supabase
│   │   ├── sms-service.ts                      # Text.lk SMS integration
│   │   └── rbac/
│   │       ├── index.ts                        # RBAC exports
│   │       ├── types.ts                        # Role types
│   │       └── config.ts                       # Route restrictions
│   │
│   └── components/
│       └── ui/
│           ├── table.tsx                       # Table components
│           └── pagination.tsx                  # Pagination components
│
└── scripts/
    └── create-root-admin.js                    # Root admin creation script
```

---

## 10. Future Enhancements

- **Two-Factor Authentication (2FA)**: OTP verification for login
- **User Activity Logs**: Track all user actions and changes
- **Bulk User Import/Export**: CSV import and export functionality
- **Custom Roles & Permissions**: Granular permission system
- **Password Reset Flow**: Self-service password recovery
- **Session Management**: View and terminate active sessions
- **Login History**: Track login attempts and devices
- **Profile Completion Tracking**: Percentage of profile filled
- **User Groups**: Group-based permission management
- **Email Verification**: Verify email before account activation
