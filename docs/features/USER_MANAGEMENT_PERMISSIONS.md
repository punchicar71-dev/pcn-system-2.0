# User Management Permissions

## Overview
The User Management system implements role-based access control (RBAC) to ensure that only authorized users can edit user details.

**Last Updated:** November 4, 2025

---

## Permission Levels

### Admin Access
**Can:**
- ✅ View all user details
- ✅ Edit any user's information (name, username, email, access level, role, mobile number, profile picture)
- ✅ Delete users (except their own account)
- ✅ Create new users
- ✅ Change user access levels and roles

**UI Features:**
- "Edit Details" button visible in User Details Modal
- All form fields are editable when in edit mode
- Profile picture upload enabled
- Delete button visible for all users (except self)

---

### Editor Access
**Can:**
- ✅ View all user details (read-only)
- ❌ Cannot edit any user information
- ❌ Cannot edit their own profile
- ❌ Cannot delete users
- ✅ Can view User Management page

**UI Features:**
- "View Detail" button visible in User Management table
- User Details Modal opens in **view-only mode**
- Blue info banner displayed: "You are viewing user details in read-only mode"
- All form fields are disabled
- No "Edit Details" button visible
- No delete button visible
- Profile picture upload disabled

---

## Implementation Details

### Frontend (UserDetailsModal Component)
**File:** `/dashboard/src/app/(dashboard)/user-management/components/UserDetailsModal.tsx`

```tsx
// Admin check
const isAdmin = currentUserAccessLevel?.toLowerCase() === 'admin'

// View-only info banner for non-admins
{!isAdmin && !isEditing && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <Lock className="w-5 h-5 text-blue-600" />
    <h4>View-Only Mode</h4>
    <p>Only administrators can edit user information.</p>
  </div>
)}

// Edit button only visible to admins
{isAdmin && (
  <button onClick={() => setIsEditing(true)}>
    Edit Details
  </button>
)}
```

**Key Features:**
1. ✅ Dynamic subtitle shows "View Only - Admin access required to edit" for non-admins
2. ✅ Info banner with lock icon for non-admin users
3. ✅ All form fields disabled when not in edit mode
4. ✅ Profile picture upload only available in edit mode
5. ✅ "Edit Details" button conditionally rendered for admins only
6. ✅ "Close" button always visible for all users

---

### Backend (API Route)
**File:** `/dashboard/src/app/api/users/[id]/route.ts`

```typescript
// PUT - Update user details
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Step 1: Authenticate user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized - No session found' },
      { status: 401 }
    )
  }

  // Step 2: Get current user's access level
  const { data: currentUser } = await supabase
    .from('users')
    .select('access_level')
    .eq('auth_id', authUser.id)
    .single()

  // Step 3: Verify admin access
  if (currentUser.access_level?.toLowerCase() !== 'admin') {
    console.log(`[UPDATE USER] Access denied - User ${authUser.id} attempted to update user ${params.id}`)
    return NextResponse.json(
      { error: 'Forbidden - Only administrators can update users' },
      { status: 403 }
    )
  }

  // Step 4: Update user
  // ... update logic
}
```

**Security Features:**
1. ✅ Multi-layer authentication check
2. ✅ Access level verification from database
3. ✅ Case-insensitive admin check
4. ✅ Detailed logging for security audits
5. ✅ Proper HTTP status codes (401, 403, 400, 500)
6. ✅ Error messages for unauthorized attempts

---

### User Management Page
**File:** `/dashboard/src/app/(dashboard)/user-management/page.tsx`

```tsx
// View Detail - Available to all users
const handleViewDetail = (userId: string) => {
  const isAdmin = currentUser?.access_level?.toLowerCase() === 'admin'
  console.log(`View detail: ${userId} (${isAdmin ? 'Can edit' : 'View only'})`)
  setSelectedUserId(userId)
  setShowUserDetailsModal(true)
}

// Delete - Admin only
const handleDeleteUser = (userId: string) => {
  if (!currentUser || currentUser.access_level?.toLowerCase() !== 'admin') {
    alert('Access Denied: Only administrators can delete users.')
    return
  }
  // ... delete logic
}
```

**Features:**
1. ✅ "View Detail" button visible to all users
2. ✅ Delete button only visible to admins
3. ✅ Self-deletion prevention for admins
4. ✅ Console logging for debugging
5. ✅ Alert messages for unauthorized actions

---

## User Experience

### Admin User Flow
1. Click "View Detail" on any user
2. Modal opens with user information
3. See "Edit Details" button at bottom right
4. Click "Edit Details" to enable form editing
5. Modify user information as needed
6. Upload new profile picture if desired
7. Click "Save" to save changes or "Cancel" to discard
8. Success message displayed after save
9. Modal refreshes with updated information

### Editor User Flow
1. Click "View Detail" on any user
2. Modal opens in **view-only mode**
3. See blue info banner: "View-Only Mode"
4. See subtitle: "View Only - Admin access required to edit"
5. All form fields are **disabled** (grayed out)
6. No "Edit Details" button visible
7. Only "Close" button available
8. Cannot make any changes to user information

---

## Security Considerations

### Defense in Depth
The system implements multiple layers of security:

1. **UI Layer** - Hide edit controls from non-admins
2. **Frontend Logic** - Disable editing functionality for non-admins
3. **API Layer** - Verify admin access before processing updates
4. **Database Layer** - Row Level Security (RLS) policies

### Preventing Unauthorized Edits
Even if a user bypasses the UI restrictions:
- ✅ Frontend checks prevent edit mode activation
- ✅ API endpoint verifies admin access level
- ✅ Detailed logging captures unauthorized attempts
- ✅ Clear error messages returned to client
- ✅ No data modification occurs without admin verification

---

## Testing Checklist

### As Admin
- [ ] Can view all users
- [ ] Can edit any user's details
- [ ] Can upload profile pictures
- [ ] Can change access levels
- [ ] Can delete users (except self)
- [ ] Cannot delete own account
- [ ] See "Edit Details" button in modal
- [ ] Form fields are editable

### As Editor
- [ ] Can view all users
- [ ] Cannot edit any user details
- [ ] Cannot edit own profile
- [ ] Cannot delete users
- [ ] See "View-Only Mode" banner
- [ ] See "View Only" subtitle in modal
- [ ] All form fields are disabled
- [ ] No "Edit Details" button visible
- [ ] Only "Close" button available
- [ ] No delete buttons visible in table

### API Security
- [ ] Non-admin PUT requests return 403 Forbidden
- [ ] Admin PUT requests succeed with 200 OK
- [ ] Unauthorized attempts are logged
- [ ] Session validation works correctly
- [ ] Access level check is case-insensitive

---

## Error Messages

### Frontend Alerts
- **Delete Attempt (Non-Admin):** "Access Denied: Only administrators can delete users."
- **Self-Deletion Attempt:** "Error: You cannot delete your own account."

### API Responses
- **No Session:** `401 Unauthorized - No session found`
- **Permission Denied:** `403 Forbidden - Only administrators can update users`
- **User Not Found:** `404 User not found`
- **Update Failed:** `400 Failed to update user: [error message]`

---

## Future Enhancements

### Potential Improvements
1. **Audit Log:** Track all user edit/delete actions with timestamp and actor
2. **Granular Permissions:** Allow specific fields to be editable by certain roles
3. **Self-Profile Edit:** Allow users to edit their own name/profile picture only
4. **Approval Workflow:** Require approval for sensitive changes (access level changes)
5. **Activity History:** Show who made changes and when in user details
6. **Bulk Actions:** Admin-only bulk user operations
7. **Export Users:** Admin-only user list export functionality

---

## Troubleshooting

### Issue: Editor can see edit button
**Solution:** Check that `currentUserAccessLevel` is being passed correctly to UserDetailsModal

### Issue: Admin cannot edit users
**Solution:** Verify admin user's `access_level` in database is exactly "Admin" (case-insensitive)

### Issue: API returns 403 for admin
**Solution:** Check that session is valid and user record exists in users table with correct `auth_id`

### Issue: Changes not saving
**Solution:** Check browser console for API errors and verify Supabase connection

---

## Related Files

### Frontend
- `/dashboard/src/app/(dashboard)/user-management/page.tsx` - Main user management page
- `/dashboard/src/app/(dashboard)/user-management/components/UserDetailsModal.tsx` - User details modal
- `/dashboard/src/app/(dashboard)/user-management/components/DeleteUserModal.tsx` - Delete confirmation modal

### Backend
- `/dashboard/src/app/api/users/[id]/route.ts` - User update/delete API endpoint
- `/dashboard/src/app/api/users/route.ts` - User list/create API endpoint

### Types
- `/shared/types.ts` - Shared TypeScript interfaces

---

## Conclusion

The user management system now has robust role-based access control that ensures:
- ✅ Only administrators can edit user details
- ✅ Editors can view users but cannot make changes
- ✅ Clear visual indicators for permission levels
- ✅ Multiple layers of security enforcement
- ✅ User-friendly error messages and guidance
- ✅ Comprehensive logging for security audits

This implementation follows security best practices and provides a clear, intuitive user experience for both admins and editors.
