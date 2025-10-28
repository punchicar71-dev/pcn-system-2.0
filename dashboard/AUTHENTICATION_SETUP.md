# Authentication Setup Guide

## Overview
This guide will help you set up authentication for the PCN System 2.0 using Supabase.

## Prerequisites
- Supabase project created at [app.supabase.com](https://app.supabase.com)
- Node.js installed
- Access to Supabase project credentials

## Step 1: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cd dashboard
   cp .env.example .env.local
   ```

2. Get your Supabase credentials from [app.supabase.com](https://app.supabase.com):
   - Go to Project Settings > API
   - Copy **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Keep secret!)

3. Update `.env.local` with your actual credentials

## Step 2: Set Up Database Tables

Run the SQL migration in your Supabase SQL Editor:

1. Go to your Supabase Dashboard → SQL Editor
2. Open and run `CREATE_ROOT_ADMIN.sql`
3. This will create the `users` table with proper structure

## Step 3: Create Root Admin User

You have two options to create the root admin user:

### Option A: Automated Script (Recommended)

Run the automated script:
```bash
cd dashboard
node scripts/create-root-admin.js
```

This will:
- Create the auth user in Supabase
- Disable email verification
- Set up the user profile
- Display the credentials

### Option B: Manual Setup

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Fill in the details:
   - **Email:** punchicar71@gmail.com
   - **Password:** punchcarrootadmin2025
   - **Auto Confirm User:** YES (or manually confirm after)
4. Click "Create User"
5. Note the User ID
6. Run this in SQL Editor:
   ```sql
   INSERT INTO public.users (id, email, username, full_name, role)
   VALUES (
     'USER_ID_FROM_STEP_5',
     'punchicar71@gmail.com',
     'punchcarrootadmin2025',
     'Root Administrator',
     'admin'
   );
   ```

## Step 4: Test the Login

1. Start the development server:
   ```bash
   cd dashboard
   npm run dev
   ```

2. Open http://localhost:3001 in your browser

3. Login with:
   - **Email or Username:** punchicar71@gmail.com OR punchcarrootadmin2025
   - **Password:** punchcarrootadmin2025

## Root Admin Credentials

```
Email:    punchicar71@gmail.com
Username: punchcarrootadmin2025
Password: punchcarrootadmin2025
Role:     admin
```

⚠️ **Important:** Change these credentials after first login!

## Features

### Login Screen
- ✅ Two-section layout (cover image + form)
- ✅ Login with email OR username
- ✅ Remember me checkbox
- ✅ Forget password link (placeholder)
- ✅ Register information box with contact details
- ✅ Responsive design (mobile-friendly)

### Authentication
- ✅ Supabase authentication integration
- ✅ Username or email login support
- ✅ No email verification required for root admin
- ✅ Session management
- ✅ Secure password handling

### User Management
- ✅ Users table with role-based access
- ✅ Admin role for root user
- ✅ Email and username uniqueness
- ✅ Row-level security policies

## Next Steps

1. **Add User Management UI**
   - Create admin panel to add new users
   - Implement role-based permissions
   - Add user listing and editing

2. **Implement Password Reset**
   - Enable "Forget Password" functionality
   - Email templates for password reset

3. **Add Profile Management**
   - Allow users to update their profile
   - Change password functionality
   - Avatar upload

4. **Enhance Security**
   - Add 2FA (Two-Factor Authentication)
   - Session timeout
   - Login history tracking

## Troubleshooting

### Issue: "Invalid email/username or password"
- Verify the user exists in Supabase Auth
- Check if email is confirmed
- Ensure password is correct

### Issue: Environment variables not found
- Make sure `.env.local` exists in the dashboard folder
- Restart the Next.js dev server after adding variables

### Issue: Cannot connect to Supabase
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check your internet connection
- Ensure Supabase project is active

## Support

For issues or questions:
- Email: admin@punchicar.com
- Phone: 0112 413 865
