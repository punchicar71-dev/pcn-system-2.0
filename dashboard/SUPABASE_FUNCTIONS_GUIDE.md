# Supabase Functions Activation Guide

## 📌 Current Status

Your Supabase Edge Function (`send-email`) is **optional** and not required for the application to work. The email system is already using Supabase's built-in authentication email features.

## 🚀 If You Want to Deploy the Edge Function

### Prerequisites
1. Install Supabase CLI:
```bash
brew install supabase/tap/supabase
```

2. Login to Supabase:
```bash
supabase login
```

### Deploy the Edge Function

From the dashboard directory:

```bash
cd dashboard

# Link to your Supabase project (replace with your project ref)
supabase link --project-ref your-project-ref

# Deploy the send-email function
supabase functions deploy send-email

# Set environment variables (if needed)
supabase secrets set SUPABASE_URL=your-supabase-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set APP_URL=http://localhost:3001
```

### Test the Function

```bash
# Test locally
supabase functions serve send-email

# In another terminal, test with curl
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello World</h1>"
  }'
```

## ⚠️ Important Notes

### TypeScript Errors Are Normal
The Edge Function uses **Deno** (not Node.js), so TypeScript errors in your IDE are expected and don't affect functionality.

### You Don't Actually Need This
Your application already uses Supabase's built-in email system via:
- `supabase.auth.admin.inviteUserByEmail()` 
- This works without deploying any Edge Functions

## 🔧 Alternative: Remove the Edge Function

If you don't plan to use custom Edge Functions:

```bash
# Remove the functions directory
rm -rf dashboard/supabase/functions/send-email
```

The application will continue working perfectly.

## 📚 Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
