# 📧 Supabase Email Setup Guide - Using Built-in SMTP

## ✅ Why Use Supabase Email?

- **Already Configured**: SMTP is enabled by default on all Supabase projects
- **No Extra Service**: No need for Resend, SendGrid, or other services
- **Free**: Included in your Supabase plan
- **Integrated**: Works seamlessly with Supabase Auth
- **Reliable**: Uses Supabase's infrastructure

---

## 🚀 Quick Setup (5 Minutes)

### Option 1: Using Supabase Auth Emails (Recommended - Simplest)

This is the **easiest method** - uses Supabase's built-in auth email system.

#### Step 1: Configure Supabase Email Templates

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Email Templates**
4. You'll see templates for:
   - Confirm signup
   - Invite user ✅ (We'll use this)
   - Magic link
   - Change email
   - Reset password

#### Step 2: Customize "Invite User" Template

1. Click on **"Invite user"** template
2. You'll see the current template
3. **Customize it** with this template:

```html
<h2>Welcome to PCN Vehicle Management System</h2>

<p>Hello {{ .Data.first_name }} {{ .Data.last_name }},</p>

<p>Your account has been created in the PCN Vehicle Management System.</p>

<h3>Your Login Credentials:</h3>
<ul>
  <li><strong>Email:</strong> {{ .Email }}</li>
  <li><strong>Username:</strong> {{ .Data.username }}</li>
  <li><strong>Temporary Password:</strong> {{ .Data.temporary_password }}</li>
  <li><strong>Access Level:</strong> {{ .Data.access_level }}</li>
  <li><strong>Role:</strong> {{ .Data.role }}</li>
</ul>

<p><a href="{{ .ConfirmationURL }}">Click here to confirm your email and login</a></p>

<p><strong>Security Note:</strong> Please change your password after your first login.</p>

<p>If you did not request this account, please ignore this email.</p>

<p>Thank you,<br>PCN Management Team</p>
```

4. Click **"Save"**

#### Step 3: Update Environment Variables

Your `.env.local` should already have these (no changes needed):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

#### Step 4: Test Email Sending

1. Restart your dev server:
   ```bash
   cd /Users/asankaherath/Projects/PCN\ System\ .\ 2.0/dashboard
   npm run dev
   ```

2. Go to: http://localhost:3001/user-management
3. Click **"+ Add User"**
4. Fill in the form with **your real email**
5. ✅ Check **"Send email to user"**
6. Click **"Add User"**
7. Check your email inbox (might take 30 seconds)

---

## 🔧 Option 2: Using Supabase Edge Functions (Advanced)

If you need more control over email content, use Edge Functions.

### Step 1: Install Supabase CLI

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link Your Project

```bash
cd /Users/asankaherath/Projects/PCN\ System\ .\ 2.0/dashboard
supabase link --project-ref your-project-ref
```

To find your project ref:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** (the part after `https://` and before `.supabase.co`)

### Step 4: Deploy Email Function

```bash
# Deploy the send-email function
supabase functions deploy send-email
```

### Step 5: Set Environment Variables

```bash
# Set environment variables for the function
supabase secrets set APP_URL=http://localhost:3001
```

### Step 6: Test the Function

```bash
# Test locally
supabase functions serve send-email

# In another terminal, test with curl:
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1><p>This is a test email.</p>"
  }'
```

---

## 📧 How It Works

### Current Implementation (Using Supabase Auth Invite)

```typescript
// In: /api/users/send-credentials/route.ts

// When sendEmail is true, this code runs:
const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
  data: {
    first_name: firstName,
    last_name: lastName,
    username: username,
    access_level: accessLevel,
    role: role,
    temporary_password: password
  }
})

// This automatically sends an email using your 
// "Invite User" template in Supabase Dashboard
```

### What Happens:

1. **User Fills Form** → Clicks "Add User"
2. **API Creates User** → `/api/users` endpoint
3. **If `sendEmail = true`**:
   - Calls `/api/users/send-credentials`
   - Calls `supabase.auth.admin.inviteUserByEmail()`
   - Supabase sends email using your template
4. **User Receives Email** with login credentials

---

## 🎨 Customizing Email Appearance

### Change Email Styling

In Supabase Dashboard → Authentication → Email Templates → Invite User:

```html
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    padding: 20px;
  }
  .container {
    background: white;
    border-radius: 8px;
    padding: 30px;
    max-width: 600px;
    margin: 0 auto;
  }
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }
  .credentials {
    background: #f9f9f9;
    padding: 20px;
    border-left: 4px solid #667eea;
    margin: 20px 0;
  }
  .button {
    display: inline-block;
    background: #667eea;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    text-decoration: none;
    margin: 20px 0;
  }
</style>

<div class="container">
  <div class="header">
    <h2>Welcome to PCN System</h2>
  </div>
  
  <p>Hello {{ .Data.first_name }} {{ .Data.last_name }},</p>
  
  <div class="credentials">
    <h3>Your Login Credentials:</h3>
    <p><strong>Email:</strong> {{ .Email }}</p>
    <p><strong>Username:</strong> {{ .Data.username }}</p>
    <p><strong>Password:</strong> {{ .Data.temporary_password }}</p>
    <p><strong>Access Level:</strong> {{ .Data.access_level }}</p>
    <p><strong>Role:</strong> {{ .Data.role }}</p>
  </div>
  
  <center>
    <a href="{{ .ConfirmationURL }}" class="button">Login Now</a>
  </center>
  
  <p style="margin-top: 30px; font-size: 12px; color: #666;">
    If you didn't request this account, please ignore this email.
  </p>
</div>
```

### Available Template Variables

Supabase provides these variables:

- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Confirmation/login link
- `{{ .Token }}` - Confirmation token
- `{{ .TokenHash }}` - Token hash
- `{{ .SiteURL }}` - Your site URL
- `{{ .Data.any_field }}` - Any custom data you pass

---

## 🔒 SMTP Configuration (Advanced)

### Use Your Own SMTP Server

If you want to use your own email server:

1. Go to: **Authentication** → **Settings** → **SMTP Settings**
2. Enable **"Enable Custom SMTP"**
3. Configure:
   - **Host**: smtp.gmail.com (for Gmail)
   - **Port**: 587
   - **Username**: your-email@gmail.com
   - **Password**: your-app-password
   - **Sender email**: noreply@yourdomain.com
   - **Sender name**: PCN Management System

#### Gmail Setup:

1. Enable 2-factor authentication
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in SMTP settings

---

## 🧪 Testing Email Delivery

### Test 1: Check Email Template

1. Go to Supabase Dashboard
2. **Authentication** → **Email Templates** → **Invite User**
3. Click **"Send test email"**
4. Enter your email
5. Check inbox

### Test 2: Test Through Application

1. Create a test user with your email
2. Check these checkboxes in browser DevTools (F12):
   - Network tab
   - Look for `/api/users/send-credentials`
   - Should return `200 OK`
3. Check email inbox (and spam folder)

### Test 3: Check Supabase Logs

1. Go to: **Logs** → **Auth Logs**
2. Look for "invite user" events
3. Check for any errors

---

## 🐛 Troubleshooting

### Problem: Email Not Received

**Check:**
1. ✅ Spam folder
2. ✅ Email address is correct
3. ✅ Supabase project SMTP is enabled
4. ✅ "Send email" checkbox was checked in form
5. ✅ Check Supabase logs for errors

**Solution:**
```bash
# Check Supabase auth logs
supabase logs auth
```

### Problem: Email Goes to Spam

**Solutions:**
1. Add sender to contacts
2. Use custom domain (not supabase.co)
3. Configure SPF, DKIM, DMARC records
4. Use custom SMTP with verified domain

### Problem: "SMTP not configured" Error

**Solution:**
SMTP is enabled by default. If you see this:
1. Check your Supabase project is on paid plan (or free tier with email enabled)
2. Go to: **Authentication** → **Settings**
3. Ensure "Enable email confirmations" is ON

### Problem: Template Variables Not Working

**Check:**
- Use correct syntax: `{{ .Data.field_name }}`
- Ensure you're passing data in `inviteUserByEmail()`
- Variables are case-sensitive

---

## 📊 Email Limits

### Supabase Free Tier:
- **Unlimited auth emails** (signup, login, invite)
- Rate limited to prevent abuse
- Uses Supabase SMTP (might go to spam)

### Supabase Pro Tier:
- **Custom SMTP** available
- Better deliverability
- Higher rate limits
- Custom email domain

---

## 🎯 Best Practices

### 1. Email Template Tips:
- Keep it simple and professional
- Include clear call-to-action
- Show all necessary credentials
- Add security warnings
- Make it mobile-friendly

### 2. Security:
- Never log passwords in plain text
- Use HTTPS for all links
- Expire invite links after 24-48 hours
- Force password change on first login

### 3. Deliverability:
- Use custom domain for production
- Configure SPF/DKIM records
- Don't send too many emails at once
- Monitor bounce rates

### 4. User Experience:
- Send emails immediately
- Make them easy to read
- Include support contact
- Test on different email clients

---

## 🚀 Production Checklist

Before going live:

- [ ] Customize email template with your branding
- [ ] Set up custom SMTP with your domain
- [ ] Configure SPF, DKIM, DMARC records
- [ ] Test emails on Gmail, Outlook, Yahoo
- [ ] Update login URL to production domain
- [ ] Enable email rate limiting
- [ ] Set up email monitoring/logging
- [ ] Create support email for user questions
- [ ] Test on mobile devices
- [ ] Add unsubscribe link (if sending marketing emails)

---

## 📞 Support Resources

### Supabase Docs:
- Auth: https://supabase.com/docs/guides/auth
- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- Edge Functions: https://supabase.com/docs/guides/functions

### Your Implementation Files:
- Email API: `dashboard/src/app/api/users/send-credentials/route.ts`
- User Creation: `dashboard/src/app/api/users/route.ts`
- Edge Function: `dashboard/supabase/functions/send-email/index.ts`

---

## 🎉 Summary

**Easiest Setup:**
1. ✅ Go to Supabase Dashboard → Auth → Email Templates
2. ✅ Edit "Invite User" template with your content
3. ✅ Save template
4. ✅ Test by creating a new user
5. ✅ Check your email

**Time to setup: 3 minutes** ⏱️

No external services needed! Everything works with your existing Supabase setup.

---

Last Updated: October 28, 2025
