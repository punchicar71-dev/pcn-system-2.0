# Quick Reference Guide - PCN Vehicle System

## 🚀 Quick Start Commands

### Initial Setup
```bash
# Install all dependencies
npm install
cd dashboard && npm install && cd ..
cd web && npm install && cd ..
cd api && npm install && cd ..

# Copy environment files
cd dashboard && cp .env.example .env.local && cd ..
cd web && cp .env.example .env.local && cd ..
cd api && cp .env.example .env && cd ..
```

### Development

```bash
# Run all services together (from root)
npm run dev

# OR run individually:

# Terminal 1 - Dashboard
cd dashboard && npm run dev

# Terminal 2 - Website
cd web && npm run dev

# Terminal 3 - API
cd api && npm run dev
```

### Access URLs
- 🌐 Website: http://localhost:3000
- 🎯 Dashboard: http://localhost:3001
- 🔌 API: http://localhost:4000
- ✅ API Health: http://localhost:4000/health

## 📦 Adding Shadcn/ui Components

### Dashboard
```bash
cd dashboard

# Common components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add alert-dialog
```

### Website
```bash
cd web

# Common components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
```

## 🏗️ Building for Production

```bash
# Build all projects
npm run build

# OR build individually:
cd dashboard && npm run build
cd web && npm run build
cd api && npm run build
```

## 🧪 Type Checking

```bash
# Check types in all projects
npm run lint

# OR check individually:
cd dashboard && npm run type-check
cd web && npm run type-check
cd api && npm run type-check
```

## 📝 Common File Patterns

### Creating a new Dashboard page
```typescript
// dashboard/src/app/(dashboard)/my-page/page.tsx
export default function MyPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Page</h1>
      {/* Your content */}
    </div>
  );
}
```

### Creating a Shadcn component usage
```typescript
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function MyComponent() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

### Creating an API route
```typescript
// api/src/routes/my-resource.routes.ts
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  // Your logic
  res.json({ data: [] });
});

export default router;
```

### Using shared types
```typescript
// In any project
import { Vehicle, Customer, Sale } from '../shared';

const vehicle: Vehicle = {
  // ...
};
```

## 🗄️ Supabase Quick Commands

### Create Supabase Client (Dashboard/Web)
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Fetch Data Example
```typescript
// Get all vehicles
const { data, error } = await supabase
  .from('vehicles')
  .select('*')
  .eq('status', 'available');

// Insert vehicle
const { data, error } = await supabase
  .from('vehicles')
  .insert([{ brand: 'Toyota', model: 'Aqua' }]);

// Update vehicle
const { data, error } = await supabase
  .from('vehicles')
  .update({ status: 'sold' })
  .eq('id', vehicleId);

// Delete vehicle
const { error } = await supabase
  .from('vehicles')
  .delete()
  .eq('id', vehicleId);
```

## 🎨 Tailwind CSS Quick Classes

### Layout
```css
/* Container */
container mx-auto px-4

/* Grid */
grid grid-cols-1 md:grid-cols-3 gap-6

/* Flex */
flex items-center justify-between
```

### Spacing
```css
/* Padding */
p-4 px-6 py-8

/* Margin */
m-4 mx-auto mt-6 mb-8

/* Gap */
gap-4 gap-x-6 gap-y-8
```

### Typography
```css
/* Font Size */
text-sm text-base text-lg text-xl text-2xl text-3xl

/* Font Weight */
font-normal font-medium font-semibold font-bold

/* Text Color */
text-gray-600 text-primary text-white
```

### Colors (Based on your design)
```css
/* Primary (Yellow) */
bg-yellow-500 text-yellow-500 border-yellow-500

/* Success (Green) */
bg-green-600 text-green-600

/* Text */
text-gray-900 text-gray-600 text-gray-400
```

## 🔍 Debugging

### Check if services are running
```bash
# Check ports
lsof -i :3000  # Web
lsof -i :3001  # Dashboard
lsof -i :4000  # API

# Kill process on port
kill -9 $(lsof -t -i:3000)
```

### Common Issues

**Port already in use:**
```bash
# Change port in package.json
"dev": "next dev -p 3002"  # Different port
```

**Module not found:**
```bash
cd <project-directory>
rm -rf node_modules package-lock.json
npm install
```

**Supabase connection:**
- Check .env.local has correct URL and keys
- Verify Supabase project is active
- Test connection at Supabase dashboard

## 📚 File Import Aliases

### Dashboard & Web
```typescript
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useVehicles } from "@/hooks/use-vehicles"
import { Vehicle } from "@/types/vehicle"
```

### API
```typescript
import { vehicleController } from "@/controllers/vehicle.controller"
import { authMiddleware } from "@/middleware/auth.middleware"
import { Vehicle } from "@/types"
```

## 🔄 Git Workflow (Recommended)

```bash
# Create feature branch
git checkout -b feature/vehicle-listing

# Make changes
git add .
git commit -m "Add vehicle listing page"

# Push to remote
git push origin feature/vehicle-listing

# Create pull request on GitHub
```

## 📊 Project Stats

- **Languages**: TypeScript, JavaScript, CSS
- **Frameworks**: Next.js 14, Express.js
- **Total Projects**: 4 (Dashboard, Web, API, Shared)
- **Estimated Lines of Code**: 10,000+ (when complete)
- **Development Time**: 3-6 months (estimated)

---

## 🆘 Need Help?

1. Check the documentation files:
   - README.md
   - SETUP.md
   - FOLDER_STRUCTURE.md
   - PROJECT_SUMMARY.md

2. Review the code examples in this guide

3. Check Supabase documentation: https://supabase.com/docs

4. Check Next.js documentation: https://nextjs.org/docs

5. Check Shadcn/ui documentation: https://ui.shadcn.com

---

**Happy Coding! 🚀**
