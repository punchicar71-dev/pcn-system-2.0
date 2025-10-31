# PCN Vehicle Selling System v2.0

A comprehensive vehicle selling management system with a public-facing website and an internal management dashboard. Built with modern technologies for optimal performance and user experience.

---

## 📢 LATEST UPDATE - October 31, 2025

### ✅ Inventory Edit Modal Enhancement & Success Popup

**Major improvements to the inventory edit functionality with streamlined UI and elegant success feedback!**

#### What's New:
- 🎯 **Simplified Edit Modal** - Removed image upload/management from edit modal
  - Focus on data editing only (vehicle details, seller info, options, notes)
  - Cleaner, faster editing experience
  - All image uploads should be done during vehicle creation
  
- ✨ **Custom Success Popup** - Beautiful success confirmation after updates
  - Green checkmark animation icon
  - Vehicle details displayed (Brand Model Year - Vehicle Number)
  - Auto-closes after 3 seconds
  - Manual close option with X button
  - Smooth fade-in animation
  
#### Technical Changes:
- **EditVehicleModal.tsx**: Removed all image upload/display functionality
  - Removed: Current Images section
  - Removed: Vehicle Image Upload section  
  - Removed: CR/Papers Upload section
  - Kept: All Supabase data updates (vehicles, sellers, options, notes)
  
- **SuccessPopup Component**: New reusable success popup component
  - Location: `dashboard/src/components/ui/SuccessPopup.tsx`
  - Customizable title and message
  - Configurable auto-close duration
  - Uses green checkmark from `dashboard/public/done_animation.png`

#### User Experience:
- Faster editing workflow - no need to handle images during edits
- Clear success confirmation with vehicle information
- Consistent UI patterns across the dashboard

---

## 📢 Previous Update - October 30, 2025

### ✅ Vehicle Add Function - Complete S3 Integration

**Major improvements to vehicle add functionality with full AWS S3 integration!**

→ **Read:** [VEHICLE_ADD_DOCUMENTATION_INDEX.md](VEHICLE_ADD_DOCUMENTATION_INDEX.md)

#### Key Features:
- ✅ **Text data** → Supabase (vehicle details, seller info, options)
- ✅ **Image files** → AWS S3 (direct upload with presigned URLs)
- ✅ **360° image support** with dedicated viewer
- ✅ **CR Paper/Document upload** to S3
- ✅ **Comprehensive validation** before publishing
- ✅ **Error handling** with helpful messages
- ✅ **Production ready** with full documentation

#### Bug Fixes:
- Fixed image upload routing to S3
- Added presigned URL support for direct browser-to-S3 uploads
- Added `s3_key` column to database for proper tracking
- Fixed 360° image handling
- Updated database constraints for image types
- Enhanced error messages and validation

#### Documentation:
- [VEHICLE_ADD_COMPLETE_REPORT.md](VEHICLE_ADD_COMPLETE_REPORT.md) - Overview
- [VEHICLE_ADD_FIX_DOCUMENTATION.md](VEHICLE_ADD_FIX_DOCUMENTATION.md) - Technical details
- [VEHICLE_ADD_TESTING_GUIDE.md](VEHICLE_ADD_TESTING_GUIDE.md) - Testing instructions
- [VEHICLE_ADD_QUICK_REFERENCE.md](VEHICLE_ADD_QUICK_REFERENCE.md) - Quick reference
- [AWS_S3_SETUP_GUIDE.md](AWS_S3_SETUP_GUIDE.md) - S3 configuration guide

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL database (Supabase account)

### Installation & Running

1. **Clone the repository**
```bash
git clone https://github.com/punchicar71-dev/pcn-system-2.0.git
cd "PCN System . 2.0"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local` in both `dashboard/` and `web/` directories
   - Add your Supabase credentials

4. **Run the development server**
```bash
npm run dev
```

This will start all three services:
- **Web**: http://localhost:3000 (Public website)
- **Dashboard**: http://localhost:3001 (Management system)
- **API**: http://localhost:4000 (Backend API)

5. **Access the dashboard**
   - Navigate to http://localhost:3001/login
   - Use your credentials to log in
   - You'll be redirected to the dashboard automatically

## Project Structure

```
pcn/
├── dashboard/          # Management System (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/           # Authentication pages
│   │   │   ├── (dashboard)/      # Dashboard pages
│   │   │   └── api/              # API routes
│   │   ├── components/
│   │   │   ├── auth/             # Auth components
│   │   │   ├── settings/         # Settings components
│   │   │   └── ui/               # UI components (shadcn/ui)
│   │   └── lib/                  # Utilities and configurations
│   └── scripts/                  # Utility scripts
├── web/               # Vehicle Showcase Website (Next.js)
├── api/               # Backend API (Node.js/Express)
├── shared/            # Shared utilities, types, and configurations
└── README.md          # This file
```

## Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Re-usable component library
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Modern icon library
- **React Hook Form** - Form validation
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database with real-time capabilities
- **AWS S3** - Cloud storage for vehicle images
- **TypeScript** - Type safety

### Database & Storage
- **PostgreSQL** (via Supabase) - Relational database
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live updates
- **AWS S3** - Secure cloud storage for images
  - Gallery images: `vehicle_images/`
  - 360° images: `vehicle_360_image/`
  - CR/Documents: `cr_pepar_image/`

## Environment Setup

### Required Environment Variables

#### Dashboard (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Backend API (.env)
```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_CLOUDFRONT_URL=your_cdn_url  # Optional

# API
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

### AWS S3 Configuration

For vehicle image storage, you need to configure AWS S3:

1. **Create S3 Bucket**
   - Create a new S3 bucket in AWS Console
   - Enable public access for image viewing
   - Configure CORS for cross-origin uploads

2. **Create IAM User**
   - Create an IAM user with S3 full access
   - Generate access keys (Access Key ID and Secret Access Key)
   - Save credentials securely

3. **Configure Environment**
   - Add AWS credentials to API `.env` file
   - Test connection: `cd api && node test-s3-connection.js`

→ **Full Guide:** [AWS_S3_SETUP_GUIDE.md](AWS_S3_SETUP_GUIDE.md)

## Features

### Management System (Dashboard)

#### 🔐 Authentication
- Secure login system with Supabase Auth
- Username or email-based login
- Server-side session management
- Protected routes with middleware
- Automatic logout with session cleanup
- Session synchronization between client and server

#### 📊 Dashboard Overview
- **Real-time statistics** showing available, pending, and sold vehicles
- **Interactive area chart** displaying sales trends over time
- **Date range selector** (Past Week, Past Month, Past Year)
- **Active users panel** showing currently logged-in team members
- **Body type breakdown** for all vehicle categories (Sedan, Hatchback, SUV, Wagon, Coupe)
- **Live data connections** to sales transaction tables
- **Auto-refresh** every 30 seconds for real-time updates
- **Sales performance metrics** with monthly sales count
- **User avatars and online status** indicators
- **Responsive layout** with two-column design

**Data Sources:**
- Available Vehicles: `vehicles` table (status: 'In Sale')
- Pending Vehicles: `pending_vehicle_sales` table (status: 'pending')
- Sold Vehicles: `pending_vehicle_sales` table (status: 'sold')
- Sales Chart: Historical data from completed transactions
- Active Users: Real-time session tracking
- Real-time business metrics
- Total vehicles, sales, and inventory stats
- Recent sales activity
- Quick action buttons for common tasks

#### 🚗 Vehicle Management
- **Add Vehicle**: Complete 6-step vehicle addition wizard
  - **Step 1: Vehicle Information**
    - Brand and Model selection
    - Vehicle number (VIN/Chassis)
    - Manufacture and registered year
    - Country of origin
    - Body type, fuel, and transmission
    - Engine capacity and exterior color
    - Multiple vehicle image uploads with drag & drop
    - CR paper/document uploads
  - **Step 2: Seller Information**
    - Personal details (First Name, Last Name, NIC)
    - Full address with city
    - Contact information (Mobile, Email, Landline)
  - **Step 3: Vehicle Options**
    - Standard options (A/C, Bluetooth, Alloy Wheels, etc.)
    - Special options (Full Option, Crystal Light, etc.)
    - Custom options (free text)
  - **Step 4: Selling Details**
    - Selling price with formatted input
    - Mileage tracking
    - Entry type (Auction, Direct Purchase, Consignment)
    - Entry date and status
  - **Step 5: Special Notes**
    - Tag notes for internal use
    - Special notes for printing
    - Character count for both fields
  - **Step 6: Review & Publish**
    - Complete vehicle details preview
    - Edit any section before publishing
    - One-click publish to inventory
- **Inventory Management**: 
  - **Smart Search**: Real-time search by Vehicle Number, Brand, and Model with clear button
  - **Search Results Counter**: Shows number of matching vehicles
  - Status tracking (In Sale, Out of Sale, Sold, Reserved)
  - Pagination with customizable rows per page (5, 10, 25, 50)
  - Quick actions (View, Edit, Delete)
  - **Modern Black Theme**: Clean black buttons and consistent gray focus states
  - **Edit Vehicle Modal** (Full functionality):
    - **4-Tab Interface**: Vehicle Details, Seller Details, Options, Notes
    - **Vehicle Details Tab**:
      - Edit all vehicle information (number, brand, model, year)
      - Change body type, country, fuel type, transmission
      - Update engine capacity, color, mileage, price
      - Modify entry type, entry date, and status
      - Upload new vehicle images with preview
      - Upload CR Paper/documents
      - Delete existing images with one click
    - **Seller Details Tab**:
      - Edit seller personal information (name, NIC, address)
      - Update contact details (mobile, landline, email)
      - Create new seller if doesn't exist
    - **Options Tab**:
      - Toggle standard options (A/C, Bluetooth, etc.)
      - Toggle special options (Full Option, Crystal Light)
      - Add custom options dynamically
      - Remove custom options
    - **Notes Tab**:
      - Edit tag notes for internal use
      - Edit special notes for print
    - Real-time updates with instant feedback
    - Comprehensive error handling
    - Success notifications
  - **Vehicle Details Modal** (View-only):
    - Image carousel with navigation arrows (shows 3 images at a time)
    - Complete vehicle information display
    - Selling information (price, mileage, entry date, status)
    - Seller details with contact information
    - Technical specifications
    - Vehicle options with checkmark indicators
    - Download CR paper button
  - Export functionality (coming soon)

#### 💰 Sales Management
- **Sell Vehicle**: Sales transaction form
  - Vehicle selection from inventory
  - Customer information capture
  - Sale details and payment method
- **Sales Transactions**: 
  - Complete sales history
  - Transaction tracking with filters
  - Date-based reporting
  - Payment method tracking

#### 📈 Reports & Analytics
- Sales reports and trends
- Inventory reports
- Revenue analysis
- Customer demographics
- Performance metrics
- Custom report builder

#### 👥 User Management
- **Complete User Management System** (Updated October 29, 2025)
  - **User Creation**: Add new users with email-based authentication
  - **Email Activation**: Automatic email sending with secure activation links
  - **Role-Based Access Control**: 
    - Admin: Full system access including user management
    - Editor: Limited access, cannot edit or delete users
    - Sales: Create sales and manage customers
    - Viewer: Read-only access
  - **Real-Time User Status** (NEW):
    - Live active/inactive status indicators
    - Green dot for active users (currently logged in)
    - Gray dot for inactive users
    - Auto-refresh every 30 seconds
    - Real-time subscriptions to database changes
  - **Admin-Only User Editing** (NEW):
    - Edit functionality restricted to administrators
    - Editors can only view user details
    - Multi-level security enforcement
    - Access denied alerts for unauthorized attempts
  - **User Table Features**:
    - Real-time search by name, email, or username
    - Pagination with customizable rows per page (5, 10, 25, 50, 100)
    - Status indicators (Active/Inactive with colored badges)
    - Action buttons: View Detail (all users), Delete (admins only)
    - Red delete icon for better visibility
  - **User CRUD Operations**:
    - Create users with automatic Supabase Auth integration
    - Edit user details (admins only)
    - View user details (all users)
    - Delete users with confirmation modal (admins only)
    - Self-deletion prevention
  - **User Details Modal**:
    - View mode for all authenticated users
    - Edit mode only available to administrators
    - Profile picture upload support (Base64, 2MB limit)
    - Complete user information display
    - Form validation and error handling
    - Success notifications
  - **Email Integration**:
    - Branded email templates with PCN branding
    - Secure activation links with token-based verification
    - Automatic email sending via Supabase Auth
    - Password setup flow for new users
  - **Security Features**:
    - Admin-only edit and delete operations
    - Password encryption via Supabase Auth
    - Secure token generation for activation
    - Session management with heartbeat tracking
    - Protected API routes
    - Row Level Security (RLS) policies
  - **Database Integration**:
    - `users` table with complete user information
    - Automatic sync with Supabase Auth users
    - Real-time status tracking
    - Foreign key relationships

#### ⚙️ Settings
- **Vehicle Brands Management**
  - Add, edit, delete vehicle brands
  - Sync models with brands
  - Search functionality
  - Pagination (6, 10, 20, 50 rows per page)
  - Optimized database queries for fast loading
- **Price Category Management**
- **Sales Agent Management**
- **Countries Management**

### Vehicle Showcase Website
- **Home Page**: Featured vehicles and search
- **Vehicle List**: Browse all available vehicles
- **Vehicle Detail Page**: Detailed vehicle information
- **About Us**: Company information
- **Contact Page**: Contact form

## Recent Updates (v2.0)

### 🎨 Dashboard UI & User Management Enhancements (October 29, 2025)

✅ **Enhanced Dashboard Header**:
- **Dynamic Greeting System**:
  - Time-based greetings (Good Morning, Good Afternoon, Good Evening)
  - Displays current user's first name
  - Updates automatically every minute
- **User Profile Section**:
  - User avatar with profile picture support
  - Fallback to first letter avatar with blue background
  - User's first name displayed next to avatar
  - Dropdown menu with smooth animations
- **Profile Dropdown Menu**:
  - My Profile option with User icon
  - Password Change option with Key icon
  - Logout option with red text and icon
  - Clean hover effects and transitions
  - Click-outside-to-close functionality
- **Professional UI Design**:
  - Consistent 16px font sizing
  - Smooth transitions and animations
  - Modern dropdown with proper z-index layering
  - Bell notification icon with red indicator dot

✅ **User Management - Real-Time Status & Access Control**:
- **Real-Time User Status Tracking**:
  - Active/Inactive status indicators
  - Green dot (🟢) for active users (logged in)
  - Gray dot (⚫) for inactive users
  - Auto-refresh every 30 seconds
  - Current user always shows as active
  - Real-time subscriptions to user table changes
- **Admin-Only Edit Access**:
  - Edit functionality restricted to administrators only
  - Editors can only view user details (read-only)
  - Edit icon removed from table for all users
  - "Edit Details" button hidden for non-admins
  - Access denied alerts for unauthorized edit attempts
  - Multi-level security checks
- **Enhanced User Actions**:
  - Red delete icon (🔴) for better visibility
  - Admin-only delete with confirmation modal
  - View Detail button for all users
  - Self-deletion prevention
  - Clean action button layout
- **User Details Modal**:
  - View-only mode for all users
  - Edit mode only for administrators
  - Profile picture upload support
  - Complete user information display
  - Admin verification for updates
  - Success/error notifications

### 🔐 User Management & Email Activation System (October 28, 2025)
✅ **Complete User Management Module**:
- **User Creation & Management**:
  - Add new users with comprehensive form validation
  - Edit existing users (name, username, email, role, status)
  - Delete/deactivate users with confirmation
  - Real-time user search and filtering
  - Pagination with customizable rows per page
- **Email-Based User Activation**:
  - Automatic email sending when creating new users
  - Branded email template with PCN logo and styling
  - Secure activation link with token-based verification
  - Users can set their own password upon first login
  - Email template includes:
    - Welcome message with user's name
    - Secure activation button
    - Username reminder
    - Professional PCN branding
- **Supabase Email Configuration**:
  - Custom SMTP setup for reliable email delivery
  - Email templates configured in Supabase dashboard
  - Magic link authentication for password setup
  - Automatic user account creation in Supabase Auth
- **Role-Based Access Control**:
  - Four user roles: Admin, Manager, Sales, Viewer
  - Role-specific permissions throughout the system
  - Role selection dropdown in user forms
- **User Interface**:
  - Modern table with search and pagination
  - Status badges (Active/Inactive) with color coding
  - Action buttons for View, Edit, Delete operations
  - Loading states and error handling
  - Success notifications for all operations
- **Security Features**:
  - Password encryption handled by Supabase Auth
  - Secure token generation for activation links
  - Row Level Security (RLS) on users table
  - Protected API routes for user operations
- **Database Integration**:
  - `users` table synced with Supabase Auth
  - Foreign key relationships maintained
  - Automatic timestamp tracking
  - Comprehensive error handling

### 🎨 Latest Carousel Enhancement (October 28, 2025)
✅ **Embla Carousel Integration for Vehicle Images**:
- **Replaced Custom Arrow Navigation**:
  - Integrated `embla-carousel-react` library for smoother carousel experience
  - Replaced manual left/right arrows with Embla's built-in navigation
  - Modern card-based image display with shadcn Card components
- **Enhanced Modal Image Galleries**:
  - **Inventory Vehicle Details Modal**: Embla carousel with 3 images visible at a time
  - **Pending Vehicle Sales Modal**: Embla carousel for gallery images
  - Navigation arrows positioned outside carousel for better UX
  - Responsive design with proper spacing and padding
- **New UI Components Added**:
  - `carousel.tsx` - Complete Embla carousel wrapper with shadcn styling
  - `card.tsx` - Card components for image containers
  - Integrated with existing modal dialogs seamlessly
- **Improved Sold Out Confirmation**:
  - New `SoldOutConfirmModal` component replacing browser confirms
  - Professional modal with clear messaging
  - Loading states during processing
  - Note about automatic image deletion after sale
- **Benefits**:
  - Smoother touch and swipe gestures on mobile
  - Better keyboard navigation support
  - Improved accessibility with ARIA labels
  - Consistent carousel behavior across all modals
  - Professional appearance matching shadcn design system

### 🎯 Enhanced Sales Transactions Module - Two-Modal Implementation (October 28, 2025)
✅ **Complete Sales Management System**:
- **Separate Modals for Pending and Sold Vehicles**:
  - **PendingVehicleModal**: 
    - Displays full image carousel with 3 images at a time
    - Left/Right navigation arrows for browsing images
    - CR Paper download button for vehicle documents
    - Complete vehicle, seller, and buyer details
    - Export data to CSV functionality
    - Modern horizontal carousel design
  - **SoldOutVehicleModal**:
    - Clean layout without image gallery (images auto-deleted)
    - Information notice explaining image removal
    - Complete sale details preserved
    - Export data to CSV functionality
    - Sold date display instead of creation date
- **Automatic Image Management**:
  - Database trigger automatically deletes vehicle images when marked as sold
  - Images remain available during pending phase
  - CR papers and documents handled separately
  - Images filtered by type (gallery vs. documents)
- **Improved Table Styling**:
  - Updated Tailwind CSS classes for better visual consistency
  - Enhanced responsive design for mobile devices
  - Cleaner card-based layouts
  - Improved spacing and padding throughout

✅ **Tailwind CSS Refinements**:
- Updated component styling across Sales Transactions tables
- Improved button hover states and transitions
- Enhanced modal layouts with better spacing
- Fixed responsive design issues on smaller screens
- Consistent color scheme throughout the application

### 🎯 Sell Vehicle & Sales Transactions Module (October 28, 2025)
✅ **Complete Sales Management System**:
- **3-Step Vehicle Selling Wizard**:
  - **Step 1: Customer Details** - Capture buyer information (name, NIC, contact, address)
  - **Step 2: Selling Information** - Vehicle search with autocomplete, pricing, payment type, sales agent
  - **Step 3: Confirmation** - Success screen with sale summary
- **Real-time Vehicle Search**: 
  - Autocomplete from inventory (only "In Sale" vehicles)
  - Display vehicle details card with images
  - Show seller information
- **Sales Transactions Page** (Enhanced):
  - Modern **shadcn Tabs** component (consistent with Settings page)
  - **Pending Vehicles Tab**: View all pending vehicle sales
    - Search by vehicle number, brand, or model
    - Pagination with customizable rows per page
    - Action buttons: View Details, Sold Out, Delete
  - **Sold Out Vehicle Tab** (NEW - October 28, 2025):
    - **Complete Sales History**: View all completed vehicle sales
    - **Advanced Filtering**:
      - Search by vehicle number, brand, or model
      - Date filter to find sales by sold date
      - Clear filters button for quick reset
    - **Comprehensive Table Display**:
      - Vehicle Number, Brand, Model, Year
      - Payment Type (with colored badges: Cash, Leasing, Bank Transfer, Check)
      - Sales Agent name
      - Sold Out Date (formatted as YYYY.MM.DD)
    - **Action Buttons**:
      - **View Details**: Opens modal with complete sale information
      - **Print Invoice**: Generates formatted invoice for printing/PDF
    - **Smart Pagination**:
      - Rows per page selector (5, 10, 20, 50)
      - Page navigation with Previous/Next
      - Smart page numbers with ellipsis
    - **Automatic Data Sync**:
      - Vehicles automatically move from Pending to Sold Out when marked as sold
      - Real-time updates across both tabs
      - Vehicle status updates to "Sold" in inventory
- **Print Invoice Feature** (NEW):
  - Professional invoice format with company header
  - Complete vehicle details (number, brand, model, year)
  - Customer information (name, NIC, contact, address)
  - Payment breakdown (selling amount, advance, balance)
  - Sales agent information
  - Opens in new window with print dialog
  - Can save as PDF
- **View Detail Modal** (Enhanced):
  - **Image Carousel**: Navigate through vehicle gallery images (3 at a time)
  - **Download CR Paper**: One-click download of vehicle documents
  - **Comprehensive Details Display**:
    - Selling information (price, payment type, sales agent, down payment)
    - Seller details (name, address, contact)
    - Buyer details (name, address, contact)
    - Vehicle specifications (year, country, fuel type, transmission, engine, color)
    - Vehicle options with checkmark indicators
  - **Data Integration**:
    - Fetches seller from `sellers` table via vehicle_id
    - Fetches country name from `countries` table
    - Fetches vehicle options with master option names
    - Gallery images separate from documents
- **Delete Confirmation Modal** (NEW):
  - Professional confirmation popup (replaces browser confirm)
  - Clear warning message
  - Red delete button with loading state
  - Cancel option to prevent accidental deletions
  - Automatically restores vehicle to "In Sale" status
- **Automatic Inventory Management**:
  - Vehicle status automatically changes to "Pending Sale" when sold
  - Vehicles disappear from inventory after sale
  - Vehicles reappear in inventory if sale is deleted
  - Status changes to "Sold" when marked as sold out
- **Database Integration**:
  - New `pending_vehicle_sales` table with customer and sale data
  - Foreign key relationships with vehicles and sales_agents
  - Row Level Security (RLS) policies for data protection
  - Real-time updates across all pages

### 🚀 Comprehensive Edit Vehicle Modal (October 2025)
✅ **Full-Featured Edit Functionality in Inventory**:
- **4-Tab Modal Interface**:
  - Vehicle Details: Complete vehicle info editing with image management
  - Seller Details: Full seller information updates
  - Options: Dynamic option selection and custom options
  - Notes: Tag notes and print notes editing
- **Advanced Features**:
  - Real-time form validation and updates
  - Image upload with preview and delete
  - CR Paper/Document management
  - Brand-Model cascading dropdowns
  - All dropdowns populated from database
  - Existing data pre-filled for easy editing
- **Database Integration**:
  - Updates vehicles table with all changes
  - Updates/creates seller records
  - Manages vehicle options (add/remove)
  - Handles custom options
  - Image upload to AWS S3
  - Transactional updates for data integrity
- **User Experience**:
  - Opens directly from Edit button in inventory table
  - Loading states for all operations
  - Success/error notifications
  - Auto-refresh inventory after update
  - Cancel functionality with state reset
  - Consistent black theme UI

### 🎨 UI/UX Improvements (Latest - October 2025)
✅ **Inventory Page Black Theme & Enhanced Search**:
- **Black Theme Implementation**:
  - Primary buttons changed from blue to black for modern aesthetic
  - Updated "Add New Vehicle" button with black background
  - Pagination active state changed from blue to black/gray
  - Consistent black theme across all primary actions
  - Pure black (0 0% 0%) with white text for maximum contrast
- **Enhanced Search Functionality**:
  - Smart search filtering by Vehicle Number, Brand, and Model
  - Clear search button (X icon) appears when typing
  - Real-time search results counter showing matches
  - Improved placeholder text for better user guidance
  - Fixed search box width (500px) for optimal layout
- **UI Polish**:
  - Removed Package icon from header for cleaner look
  - Changed table border from shadow to simple border
  - Updated focus ring colors from blue to gray throughout
  - Modified view icon color from blue to gray for consistency
  - Better spacing and layout in header section

✅ Enhanced styling and layout consistency:
- **Modal Improvements**: Optimized vehicle details modal with clean spacing
- **Form Layout**: Improved button alignment in add vehicle form
- **Spacing Updates**: Better padding and margins across dashboard pages
- **Responsive Design**: Consistent styling across all screen sizes

### 🚗 Complete Vehicle Management System
✅ Full vehicle inventory management with:
- **Add Vehicle Module**: 6-step wizard for adding vehicles
  - Step 1: Vehicle Information (Brand, Model, Year, Images)
  - Step 2: Seller Information (Contact details, documentation)
  - Step 3: Vehicle Options (Standard, Special, Custom features)
  - Step 4: Selling Details (Price, Mileage, Entry info)
  - Step 5: Special Notes (Tag notes, Print notes)
  - Step 6: Review & Publish (Preview before submission)
- **Inventory Page**: Complete vehicle listing with search and filters
  - Real-time search across brands, models, vehicle numbers
  - Pagination with customizable rows per page
  - **Interactive Vehicle Details Modal**:
    - Image carousel showing 3 images at a time with navigation
    - Complete vehicle specifications
    - Seller information with icons
    - Vehicle options with checkmarks
    - Download CR paper functionality
- **Database Integration**: Complete Supabase setup with 9 tables
- **Image Storage**: AWS S3 for vehicle and document images
- **Form Validation**: Comprehensive validation with React Hook Form & Zod

### 📊 Database Schema
✅ Complete database setup with:
- `vehicles` - Main vehicle inventory
- `sellers` - Seller information
- `vehicle_brands` - Vehicle brands (Toyota, Honda, etc.)
- `vehicle_models` - Models linked to brands
- `vehicle_options` - Standard & special options
- `vehicle_custom_options` - Custom features
- `vehicle_images` - Image storage references
- `vehicle_options_master` - Master list of available options
- `countries` - Country data for vehicle origin
- Row Level Security (RLS) enabled for all tables
- Storage bucket for vehicle images with public access

### ⚙️ Settings Module Enhancements
✅ Optimized Vehicle Brands tab with:
- Fast data loading with parallel database queries
- Optimistic UI updates for instant feedback
- Advanced search across brands and models
- Full CRUD operations (Create, Read, Update, Delete)
- Pagination with customizable rows per page
- Clean white background design
- Improved performance with React memoization

### 🎨 UI/UX Improvements
- Modern 6-step wizard interface for vehicle addition
- Real-time form validation with helpful error messages
- Image preview and management with drag & drop
- Progress indicator showing completion status
- **Interactive Vehicle Details Modal**:
  - Image carousel with left/right navigation
  - Clean card-based layout for information sections
  - Icon-based seller details presentation
  - Organized data display with proper spacing
- Responsive design for all screen sizes
- Toast notifications for user feedback
- Consistent spacing and padding across all pages
- Streamlined button layouts for better UX

### Performance Improvements
- Reduced database queries by fetching all data in parallel
- Implemented optimistic UI updates to avoid full page refreshes
- Used React `useMemo` for efficient filtering and pagination
- Eliminated N+1 query problems
- Optimized image upload with AWS S3 direct upload

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "PCN System . 2.0"
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Dependencies for all workspaces will be installed automatically
   ```

3. **Set up Supabase**
   - Create a project at https://supabase.com
   - Run the database migration script (see [Database Setup](#database-setup))
   - Copy your credentials:
     - Project URL
     - Anon/Public Key
     - Service Role Key (for API)

4. **Configure environment variables**
   
   Dashboard (.env.local):
   ```bash
   cd dashboard
   cp .env.example .env.local
   ```
   Add the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   Web (.env.local):
   ```bash
   cd web
   cp .env.example .env.local
   ```
   Add the same Supabase credentials
   
   API (.env):
   ```bash
   cd api
   cp .env.example .env
   ```
   Add your Supabase service role key

5. **Database Setup**
   
   **IMPORTANT**: Run the complete database setup script first!
   
   ```bash
   # Navigate to dashboard directory
   cd dashboard
   ```
   
   **Method 1: Via Supabase Dashboard (Recommended)**
   1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
   2. Open file `RUN_THIS_SCRIPT.sql` in VS Code
   3. Copy all content (Ctrl+A, Ctrl+C)
   4. Paste into Supabase SQL Editor (Ctrl+V)
   5. Click **"Run"** button
   6. Wait 10-15 seconds ⏳
   7. Verify success message: ✅ DATABASE SETUP COMPLETE!
   
   **Method 2: Via Supabase CLI**
   ```bash
   npx supabase db execute --file RUN_THIS_SCRIPT.sql
   ```
   
   **What this creates:**
   - ✅ 9 essential tables (vehicles, sellers, brands, models, etc.)
   - ✅ Sample data (brands, models, countries, vehicle options)
   - ✅ Storage bucket for vehicle images
   - ✅ Row Level Security policies
   - ✅ Database indexes for performance
   - ✅ Triggers for automatic timestamp updates
   - ✅ Inventory view for easy querying
   
   **Verification:**
   The script will show a success message with:
   - Tables created count
   - Sample data counts (Brands, Models, Countries, Options)
   - Storage bucket status
   - Ready to add vehicles confirmation

6. **Run development servers**
   ```bash
   # Dashboard only (recommended for development)
   cd dashboard
   npm run dev  # Runs on http://localhost:3001
   
   # Website
   cd web
   npm run dev  # Runs on http://localhost:3000
   
   # API
   cd api
   npm run dev  # Runs on http://localhost:4000
   ```

### Quick Start (Dashboard)

The fastest way to get started with the dashboard:

```bash
cd dashboard
npm install
npm run dev
```

Then open http://localhost:3001 in your browser.

## Development

### Dashboard Structure
```
dashboard/src/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── add-vehicle/     # Add vehicle page
│   │   ├── inventory/       # Inventory management
│   │   ├── sell-vehicle/    # Sales transaction
│   │   ├── sales-transactions/
│   │   ├── reports/         # Reports & analytics
│   │   ├── user-management/ # User management
│   │   └── settings/        # System settings
│   └── layout.tsx           # Root layout
├── components/
│   ├── settings/            # Settings components
│   │   ├── VehicleBrandsTab.tsx
│   │   ├── PriceCategoryTab.tsx
│   │   ├── SalesAgentTab.tsx
│   │   └── CountriesTab.tsx
│   └── ui/                  # Shadcn/ui components
└── lib/
    ├── supabase-client.ts   # Supabase client
    ├── database.types.ts    # Database types
    └── utils.ts             # Utility functions
```

### Available Scripts

Dashboard:
```bash
npm run dev        # Start development server (port 3001)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

### Database Schema

Key tables:
- `users` - System users and authentication (NEW - October 28, 2025)
  - Personal information (first_name, last_name, username)
  - Contact details (email)
  - Role-based permissions (admin, manager, sales, viewer)
  - Account status (active/inactive)
  - Synced with Supabase Auth users
  - Created/Updated timestamps
- `vehicles` - Vehicle inventory with complete specifications
  - Vehicle information (VIN, brand, model, year)
  - Technical specs (engine, transmission, fuel type)
  - Pricing and mileage
  - Entry details and status tracking
- `sellers` - Seller contact and documentation
  - Personal information (name, address, NIC)
  - Contact details (mobile, email, landline)
  - Linked to vehicles
- `vehicle_brands` - Vehicle brand information
  - Brand names (Toyota, Honda, Nissan, etc.)
  - Active/inactive status
- `vehicle_models` - Vehicle models linked to brands
  - Model names (Prius, Civic, Leaf, etc.)
  - Brand relationships
- `vehicle_options` - Standard and special vehicle features
  - Linked to vehicle_options_master
  - Tracks enabled/disabled options per vehicle
- `vehicle_options_master` - Master list of available options
  - Standard options (A/C, Bluetooth, Alloy Wheels, etc.)
  - Special options (Full Option, Crystal Light, etc.)
  - Custom option support
- `vehicle_custom_options` - Custom features per vehicle
  - Free-text custom options
- `vehicle_images` - Vehicle image storage
  - Gallery images
  - CR paper/document images
  - Primary image designation
  - Display order management
- `countries` - Country data for vehicle origin
  - Japan, UK, Germany, USA, etc.
- `pending_vehicle_sales` - Pending sales transactions
  - Customer information (buyer details)
  - Sale details (payment type, down payment, sales agent)
  - Linked to vehicles table
- `sales` - Completed sales transactions
- `sales_agents` - Sales agent information

**Database Features:**
- Row Level Security (RLS) for data protection
- Automatic timestamp updates (created_at, updated_at)
- Foreign key relationships with cascading deletes
- Optimized indexes for fast queries
- Inventory view for simplified data access

## Features Documentation

### Settings Module

#### Vehicle Brands
- **Search**: Search across brand names and model names
- **Add Brand**: Create new vehicle brands
- **Edit Brand**: Update brand names
- **Delete Brand**: Remove brands (also deletes associated models)
- **Sync Models**: Add models to existing brands
- **View All Models**: View all models for a specific brand
- **Pagination**: Navigate through large datasets with customizable rows per page

#### Performance Features
- Optimized database queries (parallel fetching)
- Optimistic UI updates for instant feedback
- Efficient filtering with React memoization
- Smart pagination with page number controls

## Deployment

### Vercel (Recommended for Next.js apps)

1. **Dashboard**
   ```bash
   cd dashboard
   vercel
   ```

2. **Website**
   ```bash
   cd web
   vercel
   ```

### Environment Variables

Make sure to set all environment variables in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Common Issues

**"Could not find the table 'public.vehicles' in the schema cache":**
- This means the database setup hasn't been run yet
- Solution: Run the `RUN_THIS_SCRIPT.sql` file in Supabase SQL Editor
- Follow the steps in [Database Setup](#database-setup) section
- Refresh your app after running the script

**Port already in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Supabase connection issues:**
- Verify your environment variables in `.env.local`
- Check if your Supabase project is active
- Ensure RLS policies are configured correctly
- Make sure you've run the database setup script

**Slow data loading:**
- Check your internet connection
- Verify database indexes are created (they are in the setup script)
- Consider implementing caching

**Image upload failures:**
- Check if the storage bucket `vehicle-images` exists
- Verify storage policies allow uploads
- Check file size limits (Supabase free tier has limits)
- Ensure proper CORS settings in Supabase

**Form validation errors:**
- All required fields must be filled
- VIN/Chassis number must be unique
- Year values must be valid (1900-2100)
- Check console for specific validation errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, email support@pcnvehicles.com or create an issue in the repository.

## License

Proprietary - All rights reserved © 2025 PCN Vehicle Selling System

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting platform
- Supabase for the backend infrastructure
- Shadcn for the UI component library
