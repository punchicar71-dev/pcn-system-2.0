# Real-Time User Status Implementation Guide

## Overview
This guide explains how to set up and activate the real-time user status feature that shows whether users are **Active** or **Inactive** in the User Management table.

## Features
✅ **Real-time Status Updates**: See live online/offline status for all users  
✅ **Session Tracking**: Automatic tracking of user activity and sessions  
✅ **Activity Monitoring**: Users marked active if activity within last 5 minutes  
✅ **Visual Indicators**: Green dot for active, gray dot for inactive  
✅ **Auto-refresh**: Status updates every 30 seconds + real-time subscriptions  
✅ **Heartbeat System**: Tracks mouse, keyboard, clicks, and scrolls  

---

## Step 1: Run the Database Setup Script

Run the SQL script to create the `user_sessions` table:

```bash
# Navigate to dashboard directory
cd dashboard

# Copy and run the SQL script in Supabase SQL Editor
```

**Open Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `CREATE_USER_SESSIONS_TABLE.sql`
6. Paste into the SQL editor
7. Click **Run** button

This will create:
- `user_sessions` table with proper structure
- Indexes for performance
- Automatic cleanup functions
- Row Level Security policies
- Triggers for timestamp updates

---

## Step 2: Verify Database Setup

Run this query to verify the table was created:

```sql
-- Check if user_sessions table exists
SELECT 
  table_name, 
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_sessions';

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_sessions'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (UUID)
- `user_id` (UUID)
- `auth_id` (UUID)
- `session_token` (TEXT)
- `is_active` (BOOLEAN)
- `last_activity` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `expires_at` (TIMESTAMPTZ)

---

## Step 3: Restart the Development Server

The code changes are already in place. Just restart the server:

```bash
# From the project root directory
npm run dev
```

This will start:
- Dashboard on `http://localhost:3001`
- Web on `http://localhost:3000`
- API on `http://4000`

---

## Step 4: Test the Real-Time Status Feature

### Test 1: Login and Check Your Status
1. Open `http://localhost:3001/login`
2. Login with your credentials
3. Navigate to **User Management**
4. You should see your own user with a **green dot** and "Active" status

### Test 2: Multi-User Testing
1. Open a different browser (Chrome, Firefox, Safari)
2. Login as a different user
3. In the first browser, refresh User Management page
4. You should see BOTH users with **green dots** (Active)

### Test 3: Inactive Status
1. Close one browser completely
2. Wait 5 minutes
3. Refresh the User Management page in the other browser
4. The closed user should now show **gray dot** (Inactive)

### Test 4: Real-Time Updates
1. Have two browsers open side by side
2. In Browser 1, stay on User Management page
3. In Browser 2, logout
4. Wait ~30 seconds (or refresh Browser 1)
5. Browser 1 should show Browser 2's user as Inactive

---

## How It Works

### 1. Session Creation
When a user logs in and navigates to any dashboard page:
- `useSessionHeartbeat` hook initializes in the layout
- Creates a new record in `user_sessions` table
- Records the user's `user_id`, `auth_id`, and `session_token`

### 2. Activity Tracking
The system tracks user activity through:
- **Mouse movements**
- **Keyboard presses**
- **Clicks**
- **Scrolling**
- **Page visibility changes**

Every time activity is detected:
- Updates `last_activity` timestamp in the database
- Heartbeat interval: every 2 minutes
- Activity debounce: 1 second

### 3. Status Determination
A user is considered **Active** if:
```
current_time - last_activity < 5 minutes
AND is_active = true
```

A user is **Inactive** if:
- No activity for 5+ minutes
- Session ended (logged out)
- Browser closed

### 4. Real-Time Updates
The User Management page subscribes to:
- `user_sessions` table changes (INSERT, UPDATE, DELETE)
- `users` table changes
- Auto-refresh every 30 seconds

When any change occurs:
- Instantly fetches updated user list
- Updates the status display
- Shows green/gray dot accordingly

### 5. Session Cleanup
Automatic cleanup runs via SQL function:
- Sessions inactive for 5+ minutes → `is_active = false`
- Inactive sessions older than 24 hours → Deleted

---

## Status Display in Table

```tsx
<TableCell className="px-6 py-4">
  <div className="flex items-center gap-2">
    {/* Status dot */}
    <div className={`w-2 h-2 rounded-full ${
      user.is_online ? 'bg-green-500' : 'bg-gray-400'
    }`}></div>
    
    {/* Status text */}
    <span className="text-sm text-gray-900 capitalize">
      {user.is_online ? 'Active' : 'Inactive'}
    </span>
  </div>
</TableCell>
```

**Visual Indicators:**
- 🟢 Green Dot + "Active" = User online (activity within 5 minutes)
- ⚫ Gray Dot + "Inactive" = User offline (no activity for 5+ minutes)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard Layout (useSessionHeartbeat)                         │
│    │                                                             │
│    ├─> Track Activity (mouse, keyboard, clicks, scroll)         │
│    ├─> Heartbeat Timer (every 2 minutes)                        │
│    └─> Update last_activity in user_sessions table              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Database                            │
├─────────────────────────────────────────────────────────────────┤
│  user_sessions table                                            │
│    - id, user_id, auth_id, session_token                        │
│    - is_active, last_activity, created_at                       │
│    - Real-time subscriptions enabled                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  User Management Page                            │
├─────────────────────────────────────────────────────────────────┤
│  - Subscribe to user_sessions changes                           │
│  - Subscribe to users table changes                             │
│  - Auto-refresh every 30 seconds                                │
│  - Display status: Active (🟢) or Inactive (⚫)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files Modified/Created

### Created Files:
1. `dashboard/CREATE_USER_SESSIONS_TABLE.sql` - Database schema
2. `dashboard/src/lib/sessionManager.ts` - Session management utilities
3. `dashboard/src/hooks/useSessionHeartbeat.ts` - Activity tracking hook
4. `dashboard/REALTIME_STATUS_SETUP_GUIDE.md` - This guide

### Modified Files:
1. `dashboard/src/app/(dashboard)/layout.tsx` - Added session heartbeat
2. `dashboard/src/app/(dashboard)/user-management/page.tsx` - Added real-time subscriptions
3. `dashboard/src/app/api/users/route.ts` - Updated status checking logic

---

## Troubleshooting

### Issue: Status not updating
**Solution:**
1. Check browser console for errors
2. Verify `user_sessions` table exists in Supabase
3. Check RLS policies are enabled
4. Ensure Realtime is enabled for `user_sessions` table

### Issue: All users show as Inactive
**Solution:**
1. Verify the session heartbeat is running (check console logs)
2. Ensure service role key is set in `.env.local`
3. Check that the cleanup function isn't too aggressive

### Issue: Real-time updates not working
**Solution:**
1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for `user_sessions` table
3. Restart the development server

### Enable Realtime in Supabase:
```sql
-- Enable realtime for user_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;
```

---

## Performance Considerations

- **Heartbeat Frequency**: 2 minutes (adjustable)
- **Activity Debounce**: 1 second
- **Status Threshold**: 5 minutes
- **Auto-refresh**: 30 seconds
- **Session Cleanup**: 24 hours for old sessions

These values can be adjusted in:
- `useSessionHeartbeat.ts` - Heartbeat and activity timing
- `/api/users/route.ts` - Status threshold
- `user-management/page.tsx` - Auto-refresh interval

---

## Configuration Options

### Change Activity Timeout (default: 5 minutes)
Edit in `dashboard/src/app/api/users/route.ts`:
```typescript
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
// Change to 10 minutes:
const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
```

### Change Heartbeat Interval (default: 2 minutes)
Edit in `dashboard/src/hooks/useSessionHeartbeat.ts`:
```typescript
heartbeatInterval = setInterval(async () => {
  // ... code
}, 2 * 60 * 1000) // Change to 1 minute: 1 * 60 * 1000
```

### Change Auto-refresh Interval (default: 30 seconds)
Edit in `dashboard/src/app/(dashboard)/user-management/page.tsx`:
```typescript
const intervalId = setInterval(() => {
  fetchUsers()
}, 30000) // Change to 1 minute: 60000
```

---

## Security Notes

✅ **Row Level Security (RLS)** enabled on `user_sessions` table  
✅ Users can only manage their own sessions  
✅ Service role required for admin operations  
✅ Session tokens stored securely  
✅ Automatic cleanup of expired sessions  
✅ No sensitive data exposed in real-time subscriptions  

---

## Next Steps

1. **Run the SQL script** in Supabase
2. **Restart the server**
3. **Test the feature** with multiple users
4. **Monitor performance** in production
5. **Adjust timing** if needed based on user behavior

---

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Supabase connection
3. Test with a fresh browser session
4. Review the SQL table structure
5. Check that all environment variables are set

---

**Status Feature is now ready to use! 🎉**

Users will see real-time active/inactive status in the User Management table with visual indicators and automatic updates.
