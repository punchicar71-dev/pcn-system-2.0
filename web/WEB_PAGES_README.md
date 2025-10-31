# Punchi Car Niwasa - Web Application

Public-facing website for Punchi Car Niwasa vehicle dealership built with Next.js 14.

## 🚀 Pages Created

### 1. **Home Page** (`/`)
- Hero section with call-to-action buttons
- Quick vehicle search with filters
- "Why Choose Us" section with 4 key benefits
- Featured vehicles showcase
- Services overview
- Call-to-action section

### 2. **All Vehicles** (`/vehicles`)
- Comprehensive vehicle listing page
- Advanced filtering sidebar (Brand, Year, Price, Transmission, Fuel Type)
- Search functionality
- Responsive grid layout
- Vehicle cards with key details
- Pagination
- Sorting options
- Toggle filters on/off

### 3. **Our Services** (`/services`)
- 6 main service offerings:
  - Vehicle Sales
  - Quality Inspection
  - Documentation Support
  - Financing Options
  - Trade-In Service
  - After-Sales Service
- "Why Choose Us" benefits section
- Service process timeline (4 steps)
- Call-to-action section

### 4. **Help Guide** (`/help-guide`)
- Searchable FAQ system
- 6 FAQ categories:
  - Buying a Vehicle
  - Financing & Leasing
  - Vehicle Inspection & Quality
  - Documentation & Registration
  - Trade-In & Exchange
  - After-Sales Support
- Quick contact links (Call, Email, Live Chat)
- 4 helpful guide sections
- Expandable/collapsible FAQ items
- Search functionality across all FAQs

### 5. **About Us** (`/about`)
- Company story and mission
- Key statistics (400+ vehicles, 15+ years, 10,000+ customers)
- Mission and Vision statements
- Core values (4 values)
- Company timeline/journey
- Leadership team showcase
- Showroom location information

### 6. **Contact Us** (`/contact`)
- Contact information cards (4 cards)
- Contact form with validation:
  - Name, Email, Phone
  - Subject dropdown
  - Message textarea
- Department contacts (4 departments)
- Map integration placeholder
- Social media links
- Business hours

## 🎨 Shared Components

### Header (`/src/components/Header.tsx`)
- Responsive navigation bar
- Mobile hamburger menu
- Top bar with contact info
- Sticky positioning
- Company logo and branding

### Footer (`/src/components/Footer.tsx`)
- Company information
- Quick links navigation
- Support links
- Contact details
- Social media icons
- Copyright information

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI Components**: Radix UI (Accordion, Dialog, Select, etc.)
- **Forms**: React Hook Form
- **Validation**: Zod

## 📁 Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Header & Footer
│   │   ├── page.tsx            # Home page
│   │   ├── vehicles/
│   │   │   └── page.tsx        # All Vehicles page
│   │   ├── services/
│   │   │   └── page.tsx        # Services page
│   │   ├── help-guide/
│   │   │   └── page.tsx        # Help Guide page
│   │   ├── about/
│   │   │   └── page.tsx        # About Us page
│   │   └── contact/
│   │       └── page.tsx        # Contact Us page
│   ├── components/
│   │   ├── Header.tsx          # Navigation header
│   │   └── Footer.tsx          # Footer component
│   └── lib/
│       └── utils.ts            # Utility functions
├── public/                      # Static assets
└── package.json
```

## 🚀 Running the Application

### Development
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Build
```bash
npm run build
```

### Production
```bash
npm run start
```

## 🎯 Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Hamburger menu for mobile navigation

### SEO Optimized
- Meta tags in layout
- Semantic HTML structure
- Proper heading hierarchy

### User Experience
- Smooth transitions and hover effects
- Loading states
- Form validation
- Search functionality
- Filter system

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus states
- Semantic HTML

## 🔗 Navigation Structure

```
Home (/)
├── All Vehicles (/vehicles)
├── Our Services (/services)
├── Help Guide (/help-guide)
├── About Us (/about)
└── Contact Us (/contact)
```

## 🎨 Design System

### Colors
- **Primary**: Yellow (#EAB308 / yellow-500)
- **Dark**: Slate-900
- **Light**: White
- **Background**: Slate-50
- **Text**: Slate-600, Slate-700, Slate-900

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, various sizes
- **Body**: Regular weight

### Components
- Rounded corners (rounded-lg, rounded-xl)
- Shadow effects (shadow-md, shadow-lg, shadow-xl)
- Consistent spacing (p-4, p-6, p-8)
- Hover effects on interactive elements

## 📝 Next Steps

1. **Connect to API**: Integrate with backend API for real vehicle data
2. **Database Integration**: Connect to Supabase for dynamic content
3. **Search Functionality**: Implement real-time search with filters
4. **Image Upload**: Add real vehicle images
5. **Form Handling**: Connect contact form to email service
6. **Authentication**: Add user login for saved searches/favorites
7. **Vehicle Details Page**: Create individual vehicle detail pages
8. **Google Maps**: Integrate real Google Maps API
9. **Analytics**: Add tracking (Google Analytics, etc.)
10. **Performance**: Optimize images and implement lazy loading

## 🔧 Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS customization
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎯 Key Features by Page

| Page | Key Features |
|------|-------------|
| Home | Hero, Search, Features, Featured Vehicles |
| Vehicles | Filters, Search, Grid, Pagination |
| Services | Service Cards, Benefits, Process Timeline |
| Help Guide | Searchable FAQs, Categories, Guides |
| About | Story, Stats, Timeline, Team |
| Contact | Form, Map, Departments, Social Media |

## 📞 Support

For questions or issues, contact the development team or refer to the main project documentation.

---

**Version**: 2.0.0  
**Last Updated**: October 2025  
**Status**: Development Ready ✅
