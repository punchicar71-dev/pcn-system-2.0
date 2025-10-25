# Vehicle Showcase Website

Public-facing website for browsing and viewing vehicle inventory.

## Pages

- **Home** (`/`) - Hero section, search, latest vehicles
- **All Vehicles** (`/vehicles`) - Vehicle listing with filters
- **Vehicle Detail** (`/vehicles/[id]`) - Detailed vehicle information
- **About Us** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form and details
- **Leasing Calculator** (`/leasing`) - Calculate leasing options

## Features

- Browse available vehicles
- Advanced search and filtering
- Vehicle image galleries
- Leasing calculator
- Contact forms
- Responsive design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Lucide Icons
- Supabase (for data fetching)

## Running Locally

```bash
cd web
npm install
cp .env.example .env.local
# Update environment variables
npm run dev
```

The website will be available at http://localhost:3000

## Environment Variables

See `.env.example` for required variables.
