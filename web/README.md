# Vehicle Showcase Website

Public-facing website for browsing and viewing vehicle inventory for Punchi Car Niwasa.

## Pages

- **Home** (`/`) - Hero section, search, latest vehicles
- **All Vehicles** (`/vehicles`) - Vehicle listing with filters
- **Vehicle Detail** (`/vehicles/[id]`) - Detailed vehicle information
- **About Us** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form and location details
- **Help Guide** (`/help-guide`) - User assistance and FAQs
- **Services** (`/services`) - Service offerings

## Features

- Browse available vehicles with comprehensive details
- Advanced search and filtering capabilities
- Vehicle image galleries with 360° viewers
- Responsive design for mobile, tablet, and desktop
- Contact forms with location mapping
- Leasing calculator integration
- Multi-language support (English & Sinhala)
- Proper Sinhala font rendering with Iskoola Pota

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Flexbox layouts
- **UI Components**: Shadcn/ui
- **Icons**: Lucide Icons
- **Backend**: Supabase API
- **Fonts**: Poppins (English), Iskoola Pota (Sinhala)

## Recent Updates (v2.0)

### Layout Improvements
- Replaced all Grid layouts with Flexbox for better flexibility
- Improved responsive design across all pages
- Contact page now uses flex-based layout for better mobile support

### Sinhala Language Support
- Added Iskoola Pota font for proper Sinhala Unicode rendering
- Sinhala text on contact page displays correctly with `.font-sinhala` class
- Font smoothing enabled for improved readability

### Bug Fixes
- Fixed build errors in vehicle detail page
- Removed unused demo exports
- Optimized font loading and rendering

## Running Locally

```bash
cd web
npm install
cp .env.example .env.local
# Update environment variables
npm run dev
```

The website will be available at http://localhost:3000

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- API endpoints for vehicles, brands, countries

## Font Information

### English Text
- **Font**: Poppins (Google Fonts)
- **Weights**: 400, 500, 600, 700

### Sinhala Text
- **Font**: Iskoola Pota (System font fallback)
- **Alternative**: Noto Sans Sinhala
- **Usage**: Apply `font-sinhala` class to Sinhala text elements

## Component Usage

### Contact Details with Sinhala Support
```jsx
<div className="font-sinhala">
  මාලඹේ පුංචි කාර් නිවස, ස්ලිට් කැම්පස් අසල
</div>
```

### Responsive Flex Layouts
```jsx
<div className="flex flex-col lg:flex-row gap-8">
  {/* Content */}
</div>
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Commit with clear messages
5. Push and create a pull request

## License

Proprietary - Punchi Car Niwasa
