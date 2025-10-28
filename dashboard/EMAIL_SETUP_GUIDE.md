# Email Setup - Quick Start Guide

## Option 1: Resend.com (Recommended) ✅

### Why Resend?
- **Free tier**: 100 emails/day (perfect for development)
- **Simple setup**: No domain verification needed for testing
- **Professional emails**: Beautiful HTML templates
- **Good deliverability**: Works reliably
- **Easy integration**: REST API only

### Setup Steps

1. **Create Account**
   - Go to: https://resend.com/register
   - Sign up with your email
   - Verify email

2. **Get API Key**
   - Go to: https://resend.com/api-keys
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Add to Environment**
   ```bash
   # Edit dashboard/.env.local
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   ```

4. **Test**
   - Navigate to http://localhost:3001/user-management
   - Click "+ Add User"
   - Fill form with test data
   - Check "Send email" checkbox
   - Check your email inbox (might be in spam)

### For Production
- Verify your domain in Resend dashboard
- Update `from` email in send-credentials API
- Monitor email delivery rates

---

## Option 2: SendGrid

### Setup Steps

1. Create account at: https://sendgrid.com
2. Create API key
3. Update `.env.local`:
   ```
   SENDGRID_API_KEY=SG.your_key_here
   ```
4. Modify `/api/users/send-credentials/route.ts` (not implemented yet)

---

## Option 3: Local Testing (No Email)

If you don't want to set up email yet:

1. The user is still created in database
2. Email sending fails silently
3. You can manually share credentials

Just leave `RESEND_API_KEY` empty or unset.

---

## Testing Email Setup

### Check if Email Sent

1. Open browser DevTools (F12)
2. Go to Network tab
3. Create a new user
4. Look for request to: `/api/users/send-credentials`
5. Response should show `200 OK`

### Email Not Received?

1. **Check spam folder** (first thing!)
2. **Verify email address** is correct in form
3. **Check Resend logs**:
   - Go to https://resend.com/logs
   - See if email appears there
4. **Check API key** is correct in `.env.local`
5. **Restart server** after changing `.env.local`:
   ```bash
   npm run dev
   ```

### Email Content Test

Create a test user:
- Name: Test User
- Email: your.email@example.com
- Username: testuser123
- Password: Test123456

You should receive email with:
- Username: testuser123
- Password: Test123456
- Access Level: Admin/Editor
- Role: Manager/Accountant/Sales Agent

---

## Email Template Customization

The email is generated in `/api/users/send-credentials/route.ts`

### To Change Email:

1. Open file: `dashboard/src/app/api/users/send-credentials/route.ts`
2. Find the `emailHtml` variable
3. Edit the HTML
4. Restart server

### Example Changes:

**Change sender email**:
```ts
from: 'noreply@yourdomain.com',
```

**Change subject**:
```ts
subject: 'Your Custom Subject',
```

**Change company name**:
Replace all `PCN Vehicle Management System` with your brand

**Change login URL**:
```ts
<a href="https://yourdomain.com/login" class="button">Login Now</a>
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Email not sent" error | Check RESEND_API_KEY in .env.local |
| Email received but looks wrong | Clear browser cache, restart server |
| User created but no email | Check .sendEmail checkbox was checked |
| Email to spam folder | Add to contacts, check sender reputation |
| Rate limit error | Resend free tier: max 100/day, wait until tomorrow |

---

## Performance Tips

- **Batch emails**: For bulk user import (coming later)
- **Queue emails**: Use background jobs for reliability
- **Template caching**: Pre-compile templates
- **Async sending**: Don't block user creation on email

---

## Cost Estimation

### Resend
- **Free**: 100 emails/day, perfect for development
- **Paid**: $20/month = 12,000 emails/month
- **Usage**: 50 users/month = ~$0 (free tier)
- **No hidden fees**: Transparent pricing

### SendGrid (Alternative)
- **Free**: 100 emails/day
- **Paid**: $9.95/month = 40,000 emails/month

---

## Security Notes

⚠️ **Important**:
- Never commit API keys to Git
- Use `.env.local` (already in .gitignore)
- Rotate keys periodically
- Use different keys for dev/production
- Monitor unusual email activity

---

## Next Steps

1. ✅ Create Resend account
2. ✅ Get API key
3. ✅ Add to `.env.local`
4. ✅ Restart server
5. ✅ Test with user creation
6. ✅ Check email inbox

Then you're done! 🎉

---

## Support

- **Resend Help**: https://resend.com/docs
- **API Docs**: https://resend.com/docs/api-reference
- **Status Page**: https://status.resend.com
- **Email Support**: support@resend.com

---

**Last Updated**: October 28, 2025
