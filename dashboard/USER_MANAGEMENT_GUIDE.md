# User Management - Add User Feature Implementation Guide

## Overview

You now have a complete user management system with two modals and database integration for adding new users with automatic email notifications.

## Architecture

### 1. Database Level (Supabase PostgreSQL)
- **Table**: `public.users`
- **Auto-generated User ID**: 5-digit format (00471, 00472, etc.)
- **Roles**: Admin, Editor
- **Business Roles**: Manager, Accountant, Sales Agent
- **Status**: Active, Inactive

### 2. Backend APIs

#### POST `/api/users` - Create New User
**Purpose**: Creates both auth user and database record

**Flow**:
1. Receives form data from frontend
2. Creates Supabase Auth user (with email/password)
3. Creates user record in database table
4. Returns success or error

**Payload**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "john.doe",
  "email": "john@example.com",
  "mobileNumber": "+94771234567",
  "accessLevel": "Admin",
  "role": "Manager",
  "password": "SecurePass123",
  "profilePicture": "base64string",
  "sendEmail": true
}
```

#### POST `/api/users/send-credentials` - Send Email
**Purpose**: Sends login credentials to user's email

**Email Service**: Resend.com (FREE tier)
- Free: 100 emails/day
- Paid: $20/month for unlimited

### 3. Frontend Components

#### Modal 1: Add New User Form
- Profile picture uploader
- First Name, Last Name
- Username (must be unique)
- Access Level dropdown (Admin/Editor)
- Email address
- Mobile number
- Role dropdown (Manager/Accountant/Sales Agent)
- Password & Re-enter Password
- Checkbox: "Send credentials via email"
- Form validation
- Error handling

#### Modal 2: Success Confirmation
- Green checkmark icon
- "User Adding Successfully" message
- User's full name
- Auto-closes after 3 seconds
- Refreshes page to show new user

## Setup Instructions

### Step 1: Run Database Migration

Execute this SQL in your Supabase SQL Editor:

```sql
-- Execute the content from CREATE_USERS_TABLE.sql
-- Go to Supabase Dashboard > SQL Editor > paste and run
```

Or use dashboard command:
```bash
cd dashboard
supabase migration up
```

### Step 2: Configure Email Service (Resend)

1. **Sign up at**: https://resend.com
2. **Get API Key**: https://resend.com/api-keys
3. **Add to `.env.local`**:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   ```

4. **Verify Domain** (for production):
   - Add your domain DNS records in Resend dashboard
   - Currently using default `noreply@punchicar.com`

### Step 3: Start Using

1. Login to dashboard at `http://localhost:3001`
2. Navigate to "User Management"
3. Click "+ Add User" button
4. Fill in the form
5. Check "Send email" checkbox
6. Click "Add User"
7. See success modal
8. Check email for credentials

## How It Works - Step by Step

### Adding a User

```
1. User fills Add User Form
   ↓
2. Frontend validates form
   ↓
3. POST to /api/users with form data
   ↓
4. Backend creates Supabase Auth user
   ↓
5. Backend creates user record in database
   ↓
6. If sendEmail checked:
   → POST to /api/users/send-credentials
   → Resend API sends email with credentials
   ↓
7. Frontend shows Success Modal
   ↓
8. Auto-refreshes user list after 3 seconds
```

### Email Content

The system sends a professional HTML email containing:
- Welcome message
- Username (for login)
- Password (temporary, user should change on first login)
- Access Level
- Business Role
- Security warnings
- Login link

Example email body:
```
Username: john.doe
Password: SecurePass123
Access Level: Admin
Role: Manager

⚠️ IMPORTANT:
- Keep password confidential
- Change password on first login
- Contact admin if not requested
```

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  auth_id UUID (links to Supabase Auth),
  
  -- Auto-generated
  user_id TEXT (00471, 00472, etc.)
  
  -- Personal
  first_name TEXT NOT NULL
  last_name TEXT NOT NULL
  full_name TEXT (auto-generated)
  username TEXT UNIQUE NOT NULL
  email TEXT UNIQUE NOT NULL
  mobile_number TEXT
  profile_picture_url TEXT
  
  -- Access & Roles
  access_level TEXT (Admin/Editor)
  role TEXT (Manager/Accountant/Sales Agent)
  status TEXT (Active/Inactive)
  is_active BOOLEAN DEFAULT true
  
  -- Timestamps
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
  last_login TIMESTAMPTZ
)
```

## Features

✅ **Auto User ID Generation**: Automatically generates sequential IDs
✅ **Password Hashing**: Supabase handles secure password hashing
✅ **Email Verification**: Emails auto-confirmed on creation
✅ **Email Notifications**: Automatic credential delivery
✅ **Form Validation**: Client and server-side validation
✅ **Error Handling**: Comprehensive error messages
✅ **Profile Pictures**: Base64 image upload support
✅ **Success Feedback**: Modal confirmation with auto-refresh
✅ **Role-Based Access**: Admin and Editor levels
✅ **Business Roles**: Manager, Accountant, Sales Agent

## API Response Examples

### Success Response (201)
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "user_id": "00471",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "access_level": "Admin",
    "role": "Manager",
    "status": "Active"
  },
  "message": "User created successfully"
}
```

### Error Response (400)
```json
{
  "error": "Email already exists"
}
```

## Troubleshooting

### Email Not Sending

1. Check `RESEND_API_KEY` in `.env.local`
2. Verify API key is valid at https://resend.com/api-keys
3. Check browser console for errors
4. Look at terminal logs in VS Code

### User Not Created

1. Verify email is unique
2. Check username is unique
3. Ensure password is 6+ characters
4. Verify Supabase is running

### Form Validation Errors

- First Name: Required, non-empty
- Last Name: Required, non-empty
- Username: Required, unique
- Email: Required, valid format, unique
- Password: 6+ characters
- Re-enter Password: Must match password

## Environment Variables

Add to `.env.local`:

```
# Email Service
RESEND_API_KEY=re_your_api_key_here

# Or for SendGrid alternative (not configured yet):
# SENDGRID_API_KEY=SG.your_key_here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Next Steps

### Optional Enhancements

1. **Bulk User Import**: CSV upload for multiple users
2. **User Editing**: Modal to edit user details
3. **Password Reset**: Send password reset email
4. **User Deactivation**: Soft delete/deactivate users
5. **Activity Logs**: Track user creation by admin
6. **Email Templates**: Customize email design
7. **Two-Factor Auth**: Add 2FA on login
8. **User Roles Management**: Edit roles per user

### Security Recommendations

1. **Password Policy**: Enforce strong passwords
2. **Rate Limiting**: Limit add user requests per time
3. **Audit Logging**: Log all user creation
4. **Admin Verification**: Require admin approval
5. **Email Verification**: Send verification link

## File Structure

```
dashboard/
├── src/
│   └── app/
│       ├── api/
│       │   └── users/
│       │       ├── route.ts (POST/GET users)
│       │       └── send-credentials/
│       │           └── route.ts (Send email)
│       └── (dashboard)/
│           └── user-management/
│               └── page.tsx (UI with modals)
├── CREATE_USERS_TABLE.sql (Database migration)
└── .env.local (API keys)
```

## Testing

### Test Scenario 1: Create User with Email
1. Open User Management page
2. Click "+ Add User"
3. Fill all fields
4. Check "Send email" checkbox
5. Click "Add User"
6. See success modal
7. Check email inbox for credentials

### Test Scenario 2: Duplicate Email Error
1. Try creating user with existing email
2. Should show error: "Email already exists"

### Test Scenario 3: Password Mismatch
1. Enter different passwords in password fields
2. Should show error: "Passwords do not match"

### Test Scenario 4: Offline Email Service
1. Use invalid RESEND_API_KEY
2. User should still be created
3. Email fails gracefully

## Security Considerations

✅ Passwords NOT stored in database (Supabase Auth handles)
✅ Emails auto-confirmed to prevent abuse
✅ User ID auto-generated to prevent conflicts
✅ SQL injection prevention (parameterized queries)
✅ CORS protection via API routes
✅ Rate limiting needed (TODO)
✅ Audit logging needed (TODO)

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

**Created**: October 28, 2025
**Status**: ✅ Complete and Ready to Use
