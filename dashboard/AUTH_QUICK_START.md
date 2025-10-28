# Quick Start - Authentication Setup

## 🚀 Fast Setup (5 minutes)

### 1. Install Dependencies (if needed)
```bash
cd dashboard
npm install
```

### 2. Configure Supabase

Create `.env.local` in the dashboard folder:
```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get credentials from: https://app.supabase.com → Project Settings → API

### 3. Set Up Database

Go to Supabase Dashboard → SQL Editor and run:
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Service role has full access" ON public.users
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

### 4. Create Root Admin

Run the automated script:
```bash
npm run create-root-admin
```

OR manually in Supabase Dashboard:
1. Authentication → Users → Add User
2. Email: `punchicar71@gmail.com`
3. Password: `punchcarrootadmin2025`
4. Auto Confirm: YES
5. Then run in SQL Editor:
```sql
INSERT INTO public.users (id, email, username, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'punchicar71@gmail.com'),
  'punchicar71@gmail.com',
  'punchcarrootadmin2025',
  'Root Administrator',
  'admin'
);
```

### 5. Start Development Server

```bash
npm run dev
```

Open http://localhost:3001

### 6. Login

```
Email/Username: punchicar71@gmail.com
Password:       punchcarrootadmin2025
```

## ✅ Done!

You should now be able to:
- ✅ Login with email or username
- ✅ Access the dashboard
- ✅ Create new users (from user management - coming soon)

## 📁 Files Created

```
dashboard/
├── src/
│   ├── app/
│   │   └── (auth)/
│   │       └── page.tsx                    # Login UI
│   ├── components/
│   │   └── auth/
│   │       └── LogoutButton.tsx            # Logout component
│   ├── lib/
│   │   └── supabase-client.ts              # Supabase client
│   └── middleware.ts                        # Route protection
├── scripts/
│   └── create-root-admin.js                # Admin creation script
├── CREATE_ROOT_ADMIN.sql                   # SQL setup
└── AUTHENTICATION_SETUP.md                 # Full documentation
```

## 🎨 Login Screen Features

- Split-screen design (image + form)
- Logo and branding
- Email OR username login
- Remember me checkbox
- Forget password link
- Contact information for new users
- Responsive mobile design
- Error handling

## 🔐 Security Features

- Supabase authentication
- Session management
- Protected routes (middleware)
- Row-level security
- No email verification (disabled for root admin)

## 🐛 Troubleshooting

**Can't login?**
- Check Supabase credentials in `.env.local`
- Verify user exists in Supabase Auth
- Ensure user is confirmed (no email verification)

**Script fails?**
- Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Verify you have admin access to Supabase project

**Redirect issues?**
- Clear browser cache and cookies
- Restart the dev server

## 📞 Need Help?

Email: admin@punchicar.com  
Phone: 0112 413 865

---

**Next Steps:**
1. Change root admin password after first login
2. Implement user management UI
3. Add password reset functionality
4. Set up role-based permissions
