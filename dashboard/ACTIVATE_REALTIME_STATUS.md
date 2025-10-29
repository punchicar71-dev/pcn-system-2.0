# Quick Start: Activate Real-Time User Status

## 🚀 3-Step Setup (5 minutes)

### Step 1: Run Database Script (2 minutes)
1. Open **Supabase Dashboard** → Your Project → **SQL Editor**
2. Click **New Query**
3. Copy & paste from `CREATE_USER_SESSIONS_TABLE.sql`
4. Click **Run** ▶️
5. Copy & paste from `ENABLE_REALTIME.sql`
6. Click **Run** ▶️ again

✅ **Verify:** You should see "Success. No rows returned" message

---

### Step 2: Restart Server (1 minute)
```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

✅ **Verify:** All 3 services start (Dashboard:3001, Web:3000, API:4000)

---

### Step 3: Test It! (2 minutes)
1. Login at `http://localhost:3001/login`
2. Go to **User Management**
3. See your status: 🟢 **Active**

**Multi-user test:**
- Open incognito/private window
- Login as different user
- Refresh first window
- Both users show 🟢 **Active**

---

## What You'll See

### Active User (Online - Last 5 minutes)
```
🟢 Active
```
- Green dot
- "Active" text
- User is currently using the system

### Inactive User (Offline - 5+ minutes)
```
⚫ Inactive
```
- Gray dot
- "Inactive" text
- User logged out or no activity

---

## How It Works

**Real-time tracking:**
- ✅ Mouse movements
- ✅ Keyboard typing
- ✅ Clicks
- ✅ Scrolling
- ✅ Page switching

**Auto-updates:**
- Every 30 seconds (background)
- Instant when user logs in/out
- Live status changes

**Activity threshold:**
- Active = activity within 5 minutes
- Inactive = no activity for 5+ minutes

---

## Troubleshooting

**❌ All users show Inactive**
→ Check browser console for errors
→ Verify `user_sessions` table exists in Supabase

**❌ Status not updating**
→ Enable Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;`
→ Restart server

**❌ "Table does not exist" error**
→ Run `CREATE_USER_SESSIONS_TABLE.sql` first

---

## Quick Test Commands

### Check Active Sessions (in Supabase SQL Editor)
```sql
SELECT 
  u.first_name,
  u.last_name,
  u.email,
  us.is_active,
  us.last_activity
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.is_active = true;
```

### Manual Cleanup (if needed)
```sql
-- Mark old sessions as inactive
UPDATE user_sessions
SET is_active = false
WHERE last_activity < NOW() - INTERVAL '5 minutes';
```

---

## 🎉 That's It!

Your User Management table now shows real-time active/inactive status for all users!

**For detailed documentation, see:** `REALTIME_STATUS_SETUP_GUIDE.md`
