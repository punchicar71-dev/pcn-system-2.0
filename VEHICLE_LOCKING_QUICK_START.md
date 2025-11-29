# 🚀 VEHICLE LOCKING - QUICK START GUIDE

## ⚡ 3-Step Deployment

### Step 1: Apply Database Migration (5 minutes)

**Option A: Supabase Dashboard (Easiest)**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `dashboard/migrations/2025_11_25_add_vehicle_locks.sql`
3. Paste and click **Run**

**Option B: Command Line**
```bash
./apply-vehicle-locks-migration.sh
```

### Step 2: Verify Migration (30 seconds)

Run this in Supabase SQL Editor:
```sql
-- Should return the vehicle_locks table structure
SELECT * FROM vehicle_locks LIMIT 1;
```

### Step 3: Test It! (2 minutes)

1. Open sell-vehicle page in **Browser A**
2. Select any vehicle
3. Open sell-vehicle page in **Browser B** (different browser or incognito)
4. Try to select the same vehicle in Browser B
5. **Expected**: Browser B shows toast "Vehicle Locked" and form is disabled ✅

---

## 🎯 What This Does

**Before:**
- Multiple users could edit/sell same vehicle simultaneously
- Risk of data conflicts and confusion
- No way to know if someone else is working on a vehicle

**After:**
- First user locks the vehicle automatically
- Other users see notification and disabled form
- Lock released when first user completes action
- Real-time updates via WebSocket

---

## 📱 What Users See

### User A (Has the lock)
- ✅ Normal form, all fields enabled
- Can complete the sale normally
- Lock auto-extends while they work

### User B (Vehicle is locked)
- 🔔 Toast: "User A is currently selling this vehicle"
- 🟨 Yellow warning banner at top of form
- ⛔ All input fields disabled
- ⛔ Submit button disabled
- ✅ Can still navigate back

### When User A Finishes
- 🔓 User B sees: "Vehicle Unlocked" toast
- ✅ User B's form becomes enabled
- ✅ User B can now proceed

---

## 🧪 Quick Test Script

```bash
# Test 1: Single user (should work normally)
1. Open sell-vehicle page
2. Select a vehicle
3. Fill in customer details
4. Complete the sale
✅ Should work exactly as before

# Test 2: Two users (locking test)
Browser A:
1. Open sell-vehicle page
2. Select vehicle "ABC-1234"
3. Go to Step 2 (Selling Info)

Browser B (immediately after):
1. Open sell-vehicle page
2. Try to select "ABC-1234"
3. Should see: Toast notification ✅
4. Should see: Yellow warning banner ✅
5. Form should be: Disabled ✅

Browser A:
1. Complete the sale

Browser B:
1. Should see: "Vehicle Unlocked" toast ✅
2. Form should: Become enabled ✅
```

---

## 🔍 Verify It's Working

### Check Active Locks
```sql
SELECT 
  locked_by_name,
  lock_type,
  locked_at,
  expires_at - NOW() as time_remaining
FROM vehicle_locks
WHERE expires_at > NOW();
```

### Check Browser Console
Should see logs like:
```
✅ Lock acquired for vehicle abc123 by John Doe
🔄 Lock extended for vehicle abc123
🔔 Lock change detected: INSERT
✅ Lock released for vehicle abc123
```

---

## ⚙️ Configuration

### Lock Duration
Edit `dashboard/src/lib/vehicle-lock-service.ts`:
```typescript
const LOCK_DURATION_MS = 5 * 60 * 1000; // Change to 10 * 60 * 1000 for 10 minutes
```

### Disable Locking (Emergency)
Edit `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx`:
```typescript
const { ... } = useVehicleLock(
  sellingData.selectedVehicle?.id || null,
  'selling',
  false  // Change from currentStep === 2 to false
);
```

---

## 🐛 Troubleshooting

### "No toast showing"
**Fix**: Check Supabase Realtime is enabled
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE vehicle_locks;
```

### "Form not disabling"
**Check**:
1. Lock exists in database: `SELECT * FROM vehicle_locks;`
2. Browser console for errors
3. User is authenticated

### "Lock stuck/won't release"
**Manual cleanup**:
```sql
DELETE FROM vehicle_locks WHERE vehicle_id = '<vehicle-id>';
-- Or remove all locks:
DELETE FROM vehicle_locks;
```

---

## 📋 Rollback Plan (If Needed)

If something goes wrong:

1. **Disable locking** (doesn't require code deployment):
```sql
-- Make all locks expire immediately
UPDATE vehicle_locks SET expires_at = NOW() - INTERVAL '1 hour';
```

2. **Remove the feature** (requires code deployment):
```bash
# Revert the changes
git revert <commit-hash>
```

3. **Drop the table** (last resort):
```sql
DROP TABLE IF EXISTS vehicle_locks CASCADE;
```

---

## ✅ Success Criteria

- ✅ Two users can't edit same vehicle simultaneously
- ✅ Real-time notifications work
- ✅ Form disables when locked
- ✅ Lock releases after completion
- ✅ Existing sale flow unchanged
- ✅ SMS still sends
- ✅ No errors in console

---

## 📚 Full Documentation

See `VEHICLE_LOCKING_SYSTEM.md` for:
- Complete technical details
- Architecture explanation
- Performance impact
- Future improvements
- Advanced troubleshooting

---

## 🎉 That's It!

The system is **production-ready** and **non-breaking**. It only adds locking protection without changing how the existing sale flow works.

**Need Help?** Check the full documentation or the code comments.
