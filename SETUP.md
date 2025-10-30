# PCN Vehicle System - Setup Guide

Complete guide to set up and run the PCN Vehicle Selling System.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## Project Structure

```
PCN System . 2.0/
├── dashboard/          # Management System (Port 3001)
├── web/               # Vehicle Showcase Website (Port 3000)
├── api/               # Backend API (Port 4000)
├── shared/            # Shared types and constants
└── supabase/          # Database migrations (future)
```

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (uses npm workspaces)
npm install

# This will automatically install dependencies for:
# - Root project
# - Dashboard
# - Web
# - API
# - Shared
```

### 2. Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Get your project URL and API keys
3. Create the following tables in Supabase:

**vehicles** table:
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_number VARCHAR(50) UNIQUE NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  mileage INTEGER NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  transmission VARCHAR(50) NOT NULL,
  body_type VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  country VARCHAR(100) NOT NULL,
  engine_capacity INTEGER,
  images TEXT[],
  features TEXT[],
  description TEXT,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**customers** table:
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  land_phone VARCHAR(20),
  address TEXT NOT NULL,
  town VARCHAR(100) NOT NULL,
  nic_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**sales** table:
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id),
  customer_id UUID REFERENCES customers(id),
  sales_agent_id UUID REFERENCES users(id),
  sale_price DECIMAL(12,2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  down_payment DECIMAL(12,2),
  leasing_amount DECIMAL(12,2),
  leasing_period INTEGER,
  interest_rate DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'pending',
  sale_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**users** table:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'editor',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Configure Environment Variables

**Dashboard (.env.local)**
```bash
cd dashboard
cp .env.example .env.local
```

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Web (.env.local)**
```bash
cd web
cp .env.example .env.local
```

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**API (.env)**
```bash
cd api
cp .env.example .env
```

Add to `.env`:
```env
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=4000
```

### 4. Run the Development Servers

**Option 1: Run all services together (from root)**
```bash
npm run dev
```

**Option 2: Run services individually**

Terminal 1 - Dashboard:
```bash
cd dashboard
npm run dev
```

Terminal 2 - Website:
```bash
cd web
npm run dev
```

Terminal 3 - API:
```bash
cd api
npm run dev
```

### 5. Access the Applications

- **Website**: http://localhost:3000
- **Dashboard**: http://localhost:3001
- **API**: http://localhost:4000

## Development Workflow

### Adding Shadcn/ui Components

Both dashboard and web have shadcn/ui configured with:
- Style: New York
- Base Color: Neutral
- CSS Variables: Enabled
- Icon Library: Lucide React

**Dashboard:**
```bash
cd dashboard
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add dialog
# etc.
```

**Website:**
```bash
cd web
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add carousel
# etc.
```

Browse components at: https://ui.shadcn.com/

### Using Shared Types

Both frontend projects can import shared types:

```typescript
import { Vehicle, Customer, Sale } from '../shared';
```

### API Development

1. Add routes in `api/src/routes/`
2. Add controllers in `api/src/controllers/`
3. Add middleware in `api/src/middleware/`
4. Update `api/src/index.ts` to include new routes

## Building for Production

### Dashboard
```bash
cd dashboard
npm run build
npm start
```

### Website
```bash
cd web
npm run build
npm start
```

### API
```bash
cd api
npm run build
npm start
```

## Troubleshooting

### Port Already in Use

If ports are already in use, you can change them:
- Dashboard: Edit `package.json` script `"dev": "next dev -p 3001"`
- Website: Edit `package.json` script `"dev": "next dev -p 3000"`
- API: Edit `.env` file `PORT=4000`

### Module Not Found Errors

Run `npm install` in the specific project directory.

### Supabase Connection Issues

1. Verify your Supabase URL and keys
2. Check if your Supabase project is active
3. Ensure tables are created correctly

## Dashboard Features

The dashboard includes the following pages:

- **Authentication** (`/`) - Login page
- **Dashboard** (`/dashboard`) - Overview with stats and quick actions
- **Add Vehicle** (`/dashboard/add-vehicle`) - Complete vehicle entry form
- **Inventory** (`/dashboard/inventory`) - Vehicle stock management
- **Sell Vehicle** (`/dashboard/sell-vehicle`) - Sales transaction form
- **Sales Transactions** (`/dashboard/sales-transactions`) - Sales history
- **Reports** (`/dashboard/reports`) - Analytics and reporting
- **User Management** (`/dashboard/user-management`) - User administration
- **Settings** (`/dashboard/settings`) - System configuration

All pages include:
- Responsive design with Tailwind CSS
- Lucide React icons
- Clean, modern UI components
- Sidebar navigation with all menu items

## Next Steps

1. **Authentication**
   - Implement Supabase Auth
   - Add protected routes
   - Create user session management

2. **Database Integration**
   - Connect forms to Supabase
   - Implement CRUD operations
   - Add real-time subscriptions

3. **File Upload**
   - Configure AWS S3 bucket
   - Add image upload for vehicles using S3 presigned URLs
   - Implement image optimization

4. **Data Validation**
   - Add Zod schemas
   - Implement form validation
   - Add error handling

5. **Testing & Deployment**
   - Set up Jest and React Testing Library
   - Configure CI/CD pipelines
   - Set up monitoring and logging

## Support

For issues or questions, contact the development team.
