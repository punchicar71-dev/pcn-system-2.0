# PCN Vehicle System - Complete Folder Structure

```
PCN System . 2.0/
│
├── 📁 dashboard/                          # Management System (Next.js)
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 (auth)/                # Authentication routes
│   │   │   │   ├── 📁 login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── 📁 (dashboard)/           # Protected routes
│   │   │   │   ├── 📁 dashboard/         # Main dashboard
│   │   │   │   │   └── page.tsx
│   │   │   │   │
│   │   │   │   ├── 📁 add-vehicle/       # 7-step vehicle addition
│   │   │   │   │   ├── 📁 vehicle-details/
│   │   │   │   │   ├── 📁 seller-details/
│   │   │   │   │   ├── 📁 vehicle-options/
│   │   │   │   │   ├── 📁 selling-details/
│   │   │   │   │   ├── 📁 notes/
│   │   │   │   │   ├── 📁 summary/
│   │   │   │   │   └── 📁 publish/
│   │   │   │   │
│   │   │   │   ├── 📁 inventory/         # Inventory management
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── 📁 [id]/
│   │   │   │   │
│   │   │   │   ├── 📁 sell-vehicle/      # 3-step selling process
│   │   │   │   │   ├── 📁 customer-details/
│   │   │   │   │   ├── 📁 selling-info/
│   │   │   │   │   └── 📁 confirmation/
│   │   │   │   │
│   │   │   │   ├── 📁 sales/             # Sales transactions
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── 📁 [id]/
│   │   │   │   │
│   │   │   │   ├── 📁 reports/           # Reports & Analytics
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── 📁 overview/
│   │   │   │   │   ├── 📁 sales-agent/
│   │   │   │   │   └── 📁 vehicle-brand/
│   │   │   │   │
│   │   │   │   ├── 📁 users/             # User management
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── 📁 [id]/
│   │   │   │   │
│   │   │   │   ├── 📁 settings/          # Settings
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── 📁 vehicle-brands/
│   │   │   │   │   ├── 📁 price-category/
│   │   │   │   │   └── 📁 sales-agent/
│   │   │   │   │
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── 📁 api/                   # API routes
│   │   │   │   └── 📁 auth/
│   │   │   │
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📁 ui/                    # Shadcn components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── 📁 dashboard/             # Dashboard components
│   │   │   │   ├── stats-card.tsx
│   │   │   │   ├── recent-sales.tsx
│   │   │   │   └── sales-chart.tsx
│   │   │   │
│   │   │   ├── 📁 forms/                 # Form components
│   │   │   │   ├── vehicle-form.tsx
│   │   │   │   ├── customer-form.tsx
│   │   │   │   └── seller-form.tsx
│   │   │   │
│   │   │   ├── 📁 tables/                # Table components
│   │   │   │   ├── vehicle-table.tsx
│   │   │   │   ├── sales-table.tsx
│   │   │   │   └── user-table.tsx
│   │   │   │
│   │   │   └── 📁 layout/                # Layout components
│   │   │       ├── sidebar.tsx
│   │   │       ├── header.tsx
│   │   │       └── navbar.tsx
│   │   │
│   │   ├── 📁 lib/
│   │   │   ├── 📁 supabase/
│   │   │   │   ├── client.ts
│   │   │   │   └── server.ts
│   │   │   │
│   │   │   ├── 📁 validations/
│   │   │   │   ├── vehicle.schema.ts
│   │   │   │   ├── customer.schema.ts
│   │   │   │   └── sale.schema.ts
│   │   │   │
│   │   │   └── utils.ts
│   │   │
│   │   ├── 📁 hooks/                     # Custom hooks
│   │   │   ├── use-vehicles.ts
│   │   │   ├── use-sales.ts
│   │   │   └── use-auth.ts
│   │   │
│   │   ├── 📁 types/                     # Type definitions
│   │   │   ├── vehicle.ts
│   │   │   └── sale.ts
│   │   │
│   │   └── 📁 utils/                     # Utility functions
│   │       ├── format.ts
│   │       └── api.ts
│   │
│   ├── .env.example
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── README.md
│
├── 📁 web/                                # Vehicle Showcase Website (Next.js)
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 vehicles/              # Vehicle listing
│   │   │   │   ├── page.tsx
│   │   │   │   └── 📁 [id]/             # Vehicle detail
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── 📁 about/                 # About page
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── 📁 contact/               # Contact page
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── 📁 leasing/               # Leasing calculator
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                  # Home page
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📁 ui/                    # Shadcn components
│   │   │   ├── 📁 home/                  # Home components
│   │   │   │   ├── hero.tsx
│   │   │   │   ├── search-bar.tsx
│   │   │   │   └── vehicle-card.tsx
│   │   │   │
│   │   │   ├── 📁 vehicles/              # Vehicle components
│   │   │   │   ├── vehicle-grid.tsx
│   │   │   │   ├── vehicle-filters.tsx
│   │   │   │   └── vehicle-detail.tsx
│   │   │   │
│   │   │   └── 📁 layout/                # Layout components
│   │   │       ├── header.tsx
│   │   │       ├── footer.tsx
│   │   │       └── navbar.tsx
│   │   │
│   │   ├── 📁 lib/
│   │   │   ├── 📁 supabase/
│   │   │   │   └── client.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── 📁 hooks/
│   │   │   └── use-vehicles.ts
│   │   │
│   │   └── 📁 types/
│   │       └── vehicle.ts
│   │
│   ├── .env.example
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── README.md
│
├── 📁 api/                                # Backend API (Node.js/Express)
│   ├── 📁 src/
│   │   ├── 📁 routes/                    # API routes
│   │   │   ├── vehicle.routes.ts
│   │   │   ├── sales.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── analytics.routes.ts
│   │   │
│   │   ├── 📁 controllers/               # Route controllers
│   │   │   ├── vehicle.controller.ts
│   │   │   ├── sales.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── analytics.controller.ts
│   │   │
│   │   ├── 📁 middleware/                # Middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── error.middleware.ts
│   │   │
│   │   ├── 📁 models/                    # Data models
│   │   │   ├── vehicle.model.ts
│   │   │   ├── sales.model.ts
│   │   │   └── user.model.ts
│   │   │
│   │   ├── 📁 utils/                     # Utilities
│   │   │   ├── supabase.ts
│   │   │   ├── jwt.ts
│   │   │   └── validation.ts
│   │   │
│   │   ├── 📁 types/                     # Type definitions
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                      # Entry point
│   │
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── 📁 shared/                             # Shared utilities
│   ├── types.ts                          # Shared type definitions
│   ├── constants.ts                      # Shared constants
│   ├── index.ts                          # Exports
│   └── package.json
│
├── 📁 supabase/                           # Database (future)
│   ├── 📁 migrations/
│   └── config.toml
│
├── .gitignore
├── package.json                          # Root package.json (monorepo)
├── README.md                             # Project overview
├── SETUP.md                              # Setup instructions
└── FOLDER_STRUCTURE.md                   # This file
```

## Key Features by Module

### 🎯 Dashboard (Management System)
- **Authentication**: Login/logout system
- **Dashboard**: Overview with stats and charts
- **Add Vehicle**: 7-step wizard for vehicle entry
- **Inventory**: Manage all vehicles
- **Sell Vehicle**: 3-step sales process
- **Sales Transactions**: Track all sales
- **Reports & Analytics**: Business insights
- **User Management**: Manage system users
- **Settings**: Configure brands, categories, agents

### 🌐 Web (Vehicle Showcase)
- **Home**: Hero section with search
- **Vehicles**: Browse with filters
- **Vehicle Detail**: Full vehicle information
- **About**: Company information
- **Contact**: Contact form
- **Leasing Calculator**: Calculate payments

### 🔌 API (Backend)
- **RESTful API**: Standard REST endpoints
- **Authentication**: JWT-based auth
- **File Upload**: Handle vehicle images
- **Data Validation**: Request validation
- **Error Handling**: Consistent error responses
- **Security**: Helmet, CORS, rate limiting

### 📦 Shared
- **Types**: TypeScript interfaces
- **Constants**: Shared constants
- **Utilities**: Common functions

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Icons**: Lucide React
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth / JWT
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Image Carousel**: Embla Carousel

## Ports

- **Web**: http://localhost:3000
- **Dashboard**: http://localhost:3001
- **API**: http://localhost:4000
