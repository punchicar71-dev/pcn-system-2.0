# Dashboard App Structure

This directory contains the management system for the PCN Vehicle Selling System.

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── add-vehicle/   # Add new vehicle (7 steps)
│   │   ├── inventory/     # Inventory management
│   │   ├── sell-vehicle/  # Sell vehicle (3 steps)
│   │   ├── sales/         # Sales transactions
│   │   ├── reports/       # Reports & Analytics
│   │   ├── users/         # User management
│   │   ├── settings/      # Settings
│   │   └── layout.tsx
│   ├── api/               # API routes
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                # Shadcn UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── forms/             # Form components
│   ├── tables/            # Table components
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Supabase client and utilities
│   ├── validations/       # Zod schemas
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## Port

Dashboard runs on **port 3001**
