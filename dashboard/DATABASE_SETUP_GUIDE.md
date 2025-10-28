# Database Setup Instructions

## Overview

Before using the user management add user feature, you need to set up the enhanced users table in Supabase.

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Copy & Paste SQL

Open the file: `dashboard/CREATE_USERS_TABLE.sql`

Copy ALL the contents and paste into Supabase SQL Editor.

### Step 3: Run the Query

Click the blue **Run** button (or press Ctrl+Enter)

You should see: ✅ **Success**

### Step 4: Verify

Go to **Table Editor** (left sidebar) and confirm you see the `users` table with columns:
- user_id
- first_name
- last_name
- email
- username
- access_level
- role
- status
- And more...

---

## What Gets Created

The SQL creates:

### 1. Enhanced Users Table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  auth_id UUID,           -- Links to Supabase Auth
  user_id TEXT UNIQUE,    -- Auto: "00471", "00472"...
  
  -- Personal Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT,         -- Auto-generated
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile_number TEXT,
  profile_picture_url TEXT,
  
  -- Access Control
  access_level TEXT,      -- "Admin" or "Editor"
  role TEXT,              -- "Manager", "Accountant", "Sales Agent"
  status TEXT,            -- "Active" or "Inactive"
  is_active BOOLEAN,
  
  -- Timestamps
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ
)
```

### 2. Indexes (for performance)
- idx_users_email
- idx_users_username
- idx_users_user_id
- idx_users_status

### 3. Automatic Functions
- `generate_user_id()` - Auto-generates 5-digit IDs
- `set_user_id()` - Trigger to set ID on insert
- `update_updated_at_column()` - Trigger for timestamps

### 4. Security Policies (Row Level Security)
- Users can read all users
- Admin access control
- Service role full access

### 5. Sample Data
Four test users are inserted:
- Rashmina Yapa (Admin)
- Ralph Edwards (Editor)
- Jenny Wilson (Editor)
- Kathryn Murphy (Admin)

---

## After Setup: Test the Feature

1. **Restart the dev server**:
   ```bash
   npm run dev
   ```

2. **Login** at: http://localhost:3001/login
   - Use existing credentials or create new

3. **Navigate** to: User Management

4. **Click** "+ Add User" button

5. **Fill form**:
   - First Name: John
   - Last Name: Doe
   - Username: john.doe
   - Email: john@example.com
   - Password: Test123456
   - Re-enter: Test123456

6. **Check** "Send email"

7. **Click** "Add User"

You should see ✅ **Success modal**!

---

## Troubleshooting

### Error: "Duplicate Key Value"

**Cause**: Username or email already exists

**Solution**: 
- Use unique values
- Or clear table: Run in SQL Editor:
  ```sql
  DELETE FROM public.users;
  ```

### Error: "Table Already Exists"

**Cause**: Users table already exists

**Solution**: 
- The script has `CREATE TABLE IF NOT EXISTS`
- It will skip creation and continue
- You can safely run it again

### Error: "RESEND_API_KEY Not Found"

**Cause**: Email service not configured

**Solution**:
- Follow EMAIL_SETUP_GUIDE.md
- Or uncheck "Send email" when creating user

### Users Table Not Appearing

**Cause**: Query didn't execute properly

**Solution**:
1. Check for errors in SQL Editor output
2. Try running again
3. Refresh page (F5)
4. Check Table Editor sidebar

---

## Manual Verification

After setup, verify in SQL Editor:

```sql
-- Check table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'users';

-- Check columns
SELECT * FROM information_schema.columns 
WHERE table_name = 'users';

-- Check sample data
SELECT user_id, first_name, last_name, email, access_level 
FROM public.users;

-- Check triggers
SELECT * FROM pg_trigger 
WHERE tgrelid = 'public.users'::regclass;

-- Check indexes
SELECT * FROM pg_indexes 
WHERE tablename = 'users';
```

---

## Database Structure Diagram

```
┌─────────────────────┐
│   Supabase Auth     │
│   (auth.users)      │
└──────────┬──────────┘
           │ auth_id (FK)
           ↓
┌─────────────────────┐
│   public.users      │
├─────────────────────┤
│ id (UUID, PK)       │
│ auth_id (UUID, FK)  │
│ user_id (TEXT)      │ ← Auto-generated
│ first_name          │
│ last_name           │
│ full_name           │ ← Auto-computed
│ username (UNIQUE)   │
│ email (UNIQUE)      │
│ access_level        │ → Admin/Editor
│ role                │ → Manager/Account/Sales
│ status              │ → Active/Inactive
│ created_at          │ ← Auto-timestamp
│ updated_at          │ ← Auto-timestamp
└─────────────────────┘
```

---

## Row Level Security (RLS)

The system uses Postgres RLS for security:

### Policies Created

1. **Everyone Can Read**
   ```sql
   CREATE POLICY "Users can read all users" ON public.users
   FOR SELECT TO authenticated USING (true);
   ```

2. **Admins Can Manage**
   ```sql
   CREATE POLICY "Admins can manage all users" ON public.users
   FOR ALL TO authenticated
   USING (
     EXISTS (SELECT 1 FROM public.users 
     WHERE id = auth.uid() AND access_level = 'Admin')
   );
   ```

3. **Service Role Full Access**
   ```sql
   CREATE POLICY "Service role has full access" ON public.users
   FOR ALL TO service_role USING (true);
   ```

---

## User ID Generation

The system auto-generates 5-digit sequential user IDs:

```
First user:  00001
Second user: 00002
...
Rashmina:    00471  (sample data)
```

### How It Works

1. Function finds max existing ID
2. Increments by 1
3. Pads with zeros to 5 digits
4. Automatically assigned on user creation

---

## Sample Queries

### Get all users
```sql
SELECT * FROM public.users ORDER BY created_at DESC;
```

### Find by email
```sql
SELECT * FROM public.users WHERE email = 'john@example.com';
```

### Get admins only
```sql
SELECT * FROM public.users WHERE access_level = 'Admin';
```

### Count users by role
```sql
SELECT role, COUNT(*) as count 
FROM public.users 
GROUP BY role;
```

### Get next user ID
```sql
SELECT generate_user_id();
```

---

## Backup & Restore

### Backup Users Table
```sql
-- Supabase automatically backs up
-- But you can export manually:
-- 1. SQL Editor → Download as CSV
-- 2. Table Editor → Export
```

### Restore from Backup
```sql
-- Delete all users
DELETE FROM public.users;

-- Restore from CSV (upload through Supabase UI)
```

---

## Performance Optimization

The indices improve performance:

- **idx_users_email**: Fast email lookups
- **idx_users_username**: Fast username lookups
- **idx_users_user_id**: Fast user ID lookups
- **idx_users_status**: Fast status filtering

For larger datasets (10k+ users), consider:
- Pagination in UI
- Caching frequently accessed data
- Search indexing on name fields

---

## Migration to Production

When deploying to production:

1. **Backup production database first**
2. **Run the CREATE_USERS_TABLE.sql on production** Supabase instance
3. **Test thoroughly** before going live
4. **Keep dev and prod separate**
5. **Use environment-specific API keys**

---

## Still Have Questions?

Check these resources:

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Database Functions**: https://supabase.com/docs/guides/database/extensions/plpgsql

---

**Setup Date**: October 28, 2025
**Status**: ✅ Ready to Deploy
