# Password Reset Flow - Visual UI Guide 📱

## Complete User Journey with UI Screenshots

This guide shows the exact user interface for each step of the password reset flow.

---

## 🔐 Step 1: Forgot Password - Enter Mobile Number

**URL:** `/forgot-password`

### UI Elements:
```
┌──────────────────────────────────────────────────────┐
│                  Forget Password                      │
│                                                       │
│  Please enter your Mobile Number to search for       │
│  your account.                                        │
│                                                       │
│  Mobile Number                                        │
│  ┌────────────────────────────────────────┐         │
│  │ +94                                     │         │
│  └────────────────────────────────────────┘         │
│                                                       │
│  ┌────────────────────────────────────────┐         │
│  │           Send OTP                      │  (Black)│
│  └────────────────────────────────────────┘         │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ If you don't have an account, please         │   │
│  │ contact the administrator. Account creation  │   │
│  │ is not available for existing users.         │   │
│  │                                               │   │
│  │ Email: admin@punchicar.com                   │   │
│  │ Call: 0112 413 865                           │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### User Actions:
1. Enter mobile number in format: `+94771234567`
2. Click "Send OTP" button
3. System sends 6-digit OTP via SMS

---

## 📲 Step 2: Verify OTP - Enter 6-Digit Code

**URL:** `/verify-otp?mobile={phoneNumber}`

### UI Elements:
```
┌──────────────────────────────────────────────────────┐
│                  Forget Password                      │
│                                                       │
│  Please enter your Mobile Number to search for       │
│  your account.                                        │
│                                                       │
│  Enter OTP Code                                       │
│                                                       │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐          │
│  │   │  │   │  │   │  │   │  │   │  │   │          │
│  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘          │
│                                                       │
│  ┌────────────────────────────────────────┐         │
│  │           Continue                      │  (Black)│
│  └────────────────────────────────────────┘         │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ If you don't have an account, please         │   │
│  │ contact the administrator. Account creation  │   │
│  │ is not available for existing users.         │   │
│  │                                               │   │
│  │ Email: admin@punchicar.com                   │   │
│  │ Call: 0112 413 865                           │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Features:
- 6 separate input boxes for OTP digits
- Auto-focus moves to next box after entering digit
- Backspace moves to previous box
- Paste support (automatically fills all 6 boxes)
- 15-minute expiration countdown

### User Actions:
1. Enter the 6-digit code received via SMS
2. Code auto-validates as you type
3. Click "Continue" button
4. System verifies OTP and generates reset token

---

## 🔑 Step 3: Change Password - Set New Password

**URL:** `/change-password?token={resetToken}`

### UI Elements:
```
┌──────────────────────────────────────────────────────┐
│                  Change Password                      │
│                                                       │
│  It's time to change your password to a new one.    │
│                                                       │
│  New Password                                         │
│  ┌────────────────────────────────────────┐  👁     │
│  │                                         │         │
│  └────────────────────────────────────────┘         │
│                                                       │
│  Re-enter password                                    │
│  ┌────────────────────────────────────────┐  👁     │
│  │                                         │         │
│  └────────────────────────────────────────┘         │
│                                                       │
│  ┌────────────────────────────────────────┐         │
│  │            Update                       │  (Black)│
│  └────────────────────────────────────────┘         │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ If you don't have an account, please         │   │
│  │ contact the administrator. Account creation  │   │
│  │ is not available for existing users.         │   │
│  │                                               │   │
│  │ Email: admin@punchicar.com                   │   │
│  │ Call: 0112 413 865                           │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Features:
- Password visibility toggle (eye icon)
- Real-time validation
- Password confirmation matching
- Minimum 6 characters requirement

### User Actions:
1. Enter new password (minimum 6 characters)
2. Re-enter password to confirm
3. Click eye icon to show/hide password
4. Click "Update" button
5. System updates password via Supabase

### Validations:
- ✅ Passwords must match
- ✅ Minimum 6 characters
- ✅ Token must be valid (15 min expiry)

---

## ✅ Step 4: Success - Password Changed

**URL:** `/password-reset-success`

### UI Elements:
```
┌──────────────────────────────────────────────────────┐
│                                                       │
│                    ✓                                  │
│               (Green Circle)                          │
│                                                       │
│               Congratulations                         │
│                                                       │
│    Your Password has been Successfully changed       │
│                                                       │
│                                                       │
│  ┌────────────────────────────────────────┐         │
│  │  ←  Back to Login                       │  (White)│
│  └────────────────────────────────────────┘  Border │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Features:
- Animated checkmark (done_animation.png)
- Success message
- Auto-transition option (optional)

### User Actions:
1. See success confirmation
2. Click "Back to Login" button
3. Redirects to `/login`
4. Login with new password

---

## 🔄 Complete Flow Diagram

```
┌─────────────┐
│   LOGIN     │  User clicks
│   PAGE      │  "Forget Password?"
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  FORGOT PASSWORD PAGE           │
│  • Enter mobile number          │
│  • Validates Sri Lankan format  │
│  • Checks user exists           │
└──────┬──────────────────────────┘
       │ Click "Send OTP"
       │ → API: /api/auth/send-otp
       │ → Generates 6-digit OTP
       │ → Sends SMS via Text.lk
       ▼
┌─────────────────────────────────┐
│  VERIFY OTP PAGE                │
│  • Enter 6-digit code           │
│  • Auto-focus & paste support   │
│  • 15-minute expiration         │
└──────┬──────────────────────────┘
       │ Click "Continue"
       │ → API: /api/auth/verify-otp
       │ → Validates OTP
       │ → Generates JWT token
       ▼
┌─────────────────────────────────┐
│  CHANGE PASSWORD PAGE           │
│  • Enter new password           │
│  • Confirm password             │
│  • Show/hide password toggle    │
└──────┬──────────────────────────┘
       │ Click "Update"
       │ → API: /api/auth/reset-password
       │ → Updates via Supabase Admin
       │ → Deletes used OTP
       ▼
┌─────────────────────────────────┐
│  SUCCESS PAGE                   │
│  • Show checkmark animation     │
│  • Display success message      │
│  • "Back to Login" button       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────┐
│   LOGIN     │  User logs in with
│   PAGE      │  new password
└─────────────┘
```

---

## 🎨 Design Consistency

All pages follow the same design pattern:

### Layout:
- **Left Side:** Full-height image with logo and branding
- **Right Side:** White background with centered form
- **Width:** 50/50 split on desktop, full width on mobile

### Branding Elements:
- Logo: Punchi Car Niwasa circular logo
- Cover Image: Stylized car illustration (login_cover.png)
- Copyright: "© 2025 Punchi Car. All rights reserved."

### Color Scheme:
- Primary Button: Black (`bg-gray-900`)
- Secondary Button: White with black border
- Input Focus: Gray ring (`focus:ring-gray-900`)
- Error Messages: Red background (`bg-red-50`)
- Info Box: Gray background (`bg-gray-50`)

### Typography:
- Heading: 24px, bold, gray-900
- Body Text: Gray-600
- Labels: Small, medium weight, gray-700

### Spacing:
- Consistent padding: 8px on mobile, more on desktop
- Form spacing: 6 (space-y-6)
- Input padding: px-4 py-3

---

## 📱 Mobile Responsiveness

All pages are fully responsive:

```
Desktop (lg:):                 Mobile:
┌─────────┬─────────┐        ┌──────────┐
│  Image  │  Form   │        │   Form   │
│         │         │        │          │
│         │         │        │          │
└─────────┴─────────┘        └──────────┘
  50%       50%                100%
```

### Mobile Considerations:
- Image hidden on small screens
- Full-width form on mobile
- Touch-friendly button sizes (py-3)
- Larger OTP input boxes for easier tapping
- Auto-zoom disabled on inputs

---

## 🔐 Security Indicators

### Visual Security Elements:
1. **OTP Expiration:** 15-minute countdown timer (optional)
2. **Password Strength:** Visual indicator (optional)
3. **HTTPS Lock:** Browser shows secure connection
4. **Session Timeout:** Auto-logout after inactivity

### User Feedback:
- ✅ Success: Green checkmark animation
- ❌ Error: Red background with clear message
- ⏳ Loading: "Sending...", "Verifying...", "Updating..."
- 📱 SMS Sent: "OTP sent successfully"

---

## 🎯 User Experience Features

### Keyboard Navigation:
- Tab through form fields
- Enter to submit
- Arrow keys to move between OTP boxes

### Auto-Complete:
- Mobile number auto-format
- OTP paste detection
- Password manager integration

### Error Handling:
- Clear error messages
- Field-level validation
- Inline error display
- Retry mechanisms

### Accessibility:
- ARIA labels on all inputs
- Screen reader friendly
- High contrast colors
- Focus indicators

---

## 📋 Quick Reference

| Page | URL | Primary Action | API Endpoint |
|------|-----|----------------|--------------|
| Forgot Password | `/forgot-password` | Send OTP | `/api/auth/send-otp` |
| Verify OTP | `/verify-otp` | Verify Code | `/api/auth/verify-otp` |
| Change Password | `/change-password` | Update Password | `/api/auth/reset-password` |
| Success | `/password-reset-success` | Back to Login | - |

---

## 🚀 Testing Checklist

### Visual Testing:
- [ ] All pages render correctly
- [ ] Images load properly
- [ ] Buttons are clickable
- [ ] Forms are aligned
- [ ] Colors match design
- [ ] Mobile responsive

### Functional Testing:
- [ ] OTP sends successfully
- [ ] SMS delivers within 30 seconds
- [ ] OTP validates correctly
- [ ] Password updates successfully
- [ ] Redirects work properly
- [ ] Error messages display

### Edge Cases:
- [ ] Invalid mobile number
- [ ] Expired OTP (after 15 min)
- [ ] Wrong OTP code
- [ ] Password mismatch
- [ ] Network errors
- [ ] Already used OTP

---

**Status:** ✅ READY FOR TESTING
**Last Updated:** November 8, 2025
**UI Version:** 2.0
