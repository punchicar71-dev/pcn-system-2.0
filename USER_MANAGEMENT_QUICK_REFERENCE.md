# User Management Quick Reference

## What Changed?

### Admin Capabilities
| Action | Before | After |
|--------|--------|-------|
| View Users | ✅ | ✅ |
| Edit Users | ❌ Limited | ✅ All Users |
| Delete Users | ❌ No UI | ✅ Delete Icon + Modal Button |
| Edit Own Account | ✅ | ✅ |
| Delete Own Account | ❌ | ❌ (Prevented) |

### Editor Capabilities
| Action | Before | After |
|--------|--------|-------|
| View Users | ✅ | ✅ |
| Edit Users | ❌ | ❌ (Blocked) |
| Delete Users | ❌ | ❌ (Blocked) |
| See Edit Button | ❌ | ❌ (Hidden) |
| See Delete Button | ❌ | ❌ (Hidden) |

---

## Key Features

### 1. **Admin Edit UI**
```
Table → View Detail Button → "Edit Details" button appears
                          → Click Edit
                          → Form fields become editable
                          → Click Save
                          → Changes persist
```

### 2. **Admin Delete UI**
```
Option A: Table → Trash Icon → Confirmation → Delete
Option B: Table → View Detail → "Delete User" button → Confirmation → Delete
```

### 3. **Editor View UI**
```
Table → View Detail → Read-only modal with blue banner
                    → "View Only - Admin required to edit"
                    → No edit option
                    → No delete option
```

---

## Color Coding

- 🔵 **Blue Banner** = View-only mode (Editor users)
- 🔒 **Lock Icon** = Restricted access
- 🔴 **Red Delete Button** = Destructive action (Admin only)
- ⚫ **Black Edit Button** = Save changes (Admin only)

---

## Component Props

### UserDetailsModal
```typescript
interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onUserUpdated: () => void
  currentUserAccessLevel: string  // "Admin" or "Editor"
  onDeleteUser?: (userId: string) => void  // NEW
}
```

---

## API Validation Checklist

- [ ] Backend validates `access_level` on PUT (edit)
- [ ] Backend validates `access_level` on DELETE
- [ ] Backend prevents self-deletion
- [ ] Backend returns 403 for unauthorized access
- [ ] Backend returns 400 for self-deletion attempt

---

## What Editors See

When an editor opens the User Details modal:

1. Header shows "View Only - Admin access required to edit"
2. Blue info banner appears with warning
3. All form fields disabled (gray, no input)
4. Buttons shown: only "Close" button
5. No "Edit Details" or "Delete User" buttons visible

---

## What Admins See

When an admin opens the User Details modal:

1. Header shows normal "User Details"
2. No warning banner (they have full access)
3. Buttons shown: "Close", "Edit Details", "Delete User"
4. When editing: all fields editable, Save button appears
5. Delete button is red for visibility

---

## Testing Quick Checklist

- [ ] Create 2 test accounts: 1 Admin, 1 Editor
- [ ] Admin logs in → can edit any user ✅
- [ ] Admin logs in → can see delete icon in table ✅
- [ ] Admin logs in → can see Delete User button in modal ✅
- [ ] Admin logs in → cannot delete own account ✅
- [ ] Editor logs in → sees "View Only" message ✅
- [ ] Editor logs in → form fields disabled ✅
- [ ] Editor logs in → no delete icon visible ✅
- [ ] Editor logs in → no edit button visible ✅

---

## Troubleshooting

**Issue**: Admin sees "View Only" message
- **Solution**: Check `currentUserAccessLevel` prop is being passed correctly
- **Check**: Make sure user's `access_level` in DB is exactly "Admin" (case-sensitive after lowercase check)

**Issue**: Delete button not appearing for admin
- **Solution**: Verify `onDeleteUser` prop is passed to UserDetailsModal
- **Check**: Verify admin is not viewing their own profile (self-delete prevention)

**Issue**: Editor can edit after clicking "View Detail"
- **Solution**: Form fields should be disabled, verify CSS is applied correctly
- **Check**: Verify `disabled={!isEditing}` on form inputs

---

## Files Changed

1. **UserDetailsModal.tsx** (68 lines added/modified)
   - Added delete handler
   - Added delete button UI
   - Added prop for onDeleteUser

2. **page.tsx** (1 line changed)
   - Added onDeleteUser prop to UserDetailsModal component

**Total Changes**: ~70 lines of code
**Complexity**: Low (mostly UI conditional rendering)
**Breaking Changes**: None

---

## Notes

- Delete requires confirmation dialog
- All admin actions go through existing API endpoints
- No database schema changes required
- Backward compatible with existing code
- Ready for production after backend API validation

