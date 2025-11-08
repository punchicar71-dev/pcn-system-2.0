# PCN Vehicle Selling System v2.0

A comprehensive vehicle selling management system with a public-facing website and an internal management dashboard. Built with modern technologies for optimal performance and user experience.

**Status**: ✅ Production Ready | Last Updated: November 8, 2025 | Version: 2.0.13

---

## 📢 LATEST UPDATE - November 8, 2025 (Phone Verification OTP System - WORKING!)

### ✅ PHONE VERIFICATION OTP - FULLY FUNCTIONAL!

**Major Achievement: Complete phone verification system with SMS OTP via Text.lk!**

#### What's Working Now:

1. **📱 Phone Verification OTP System**:
   - ✅ OTP generation (6-digit random codes)
   - ✅ SMS delivery via Text.lk gateway
   - ✅ Direct API approach (no Edge Function complexity)
   - ✅ Database storage with 15-minute expiration
   - ✅ One-time use enforcement
   - ✅ Sri Lankan phone number validation
   - ✅ User interface integration in User Management
   - ✅ User status tracking (phone_verified column)

2. **🔧 OTP System Architecture**:
   - Simplified direct API approach (proven and reliable)
   - Reuses existing `password_reset_otps` table
   - No foreign key constraint issues (user_id = NULL)
   - Comprehensive error handling
   - Detailed logging for debugging

3. **📡 SMS Integration Status**:
   - ✅ Text.lk API fully integrated
   - ✅ Sender ID "Punchi Car" ACTIVE and WORKING
   - ✅ SMS delivery CONFIRMED and TESTED
   - ✅ Live test: OTP 163957 delivered successfully
   - ⏳ Pending: Full production testing

#### Files Created/Updated:

**Phone Verification OTP:**
- `dashboard/src/app/api/users/send-phone-otp/route.ts` - Send OTP endpoint ✅
- `dashboard/src/app/api/users/verify-phone-otp/route.ts` - Verify OTP endpoint ✅
- `dashboard/migrations/2025_11_08_fix_password_reset_otps_fk.sql` - FK fix migration
- `dashboard/migrations/2025_11_08_add_phone_verification_otps.sql` - Phone verification table

**Documentation (Complete!):**
- `PHONE_OTP_IMPLEMENTATION_COMPLETE.md` - Full technical overview ✅
- `PHONE_OTP_QUICK_START.md` - Quick reference guide ✅
- `PHONE_OTP_SIMPLIFIED.md` - Architecture details ✅
- `PHONE_OTP_LIVE_TEST_REPORT.md` - Live test evidence ✅
- `PHONE_OTP_FIX_SUMMARY.md` - Problem & solution ✅
- `SMS_OTP_FULLY_WORKING.md` - SMS delivery confirmation ✅
- `SMS_OTP_SYSTEM_COMPLETE.md` - Final summary ✅

---

## 📢 PREVIOUS UPDATE - November 8, 2025 (SMS Gateway Integration + Reports UI Enhancement)

### 🎯 SMS Gateway Integration (Text.lk)

**Major Feature: Complete SMS gateway integration with Text.lk for automated notifications and OTP delivery!**

#### What's New:

1. **📱 Text.lk SMS Service Integration**:
   - Full API v3 integration with Text.lk SMS gateway
   - SMS service library with reusable functions
   - Phone number validation and formatting for Sri Lankan numbers
   - Support for multiple phone formats (0771234567, 94771234567, +94771234567)
   - Secure Bearer token authentication
   - Comprehensive error handling and logging

2. **🔧 SMS Service Features**:
   - Send SMS via API endpoint: `/api/sms`
   - Phone number validation and auto-formatting
   - SMS templates for various scenarios:
     * Welcome messages for new users
     * Password reset OTP codes
     * Account status notifications
     * Account deletion confirmations
   - Test scripts for SMS gateway verification

3. **📊 Reports Dashboard UI Enhancement**:
   - Redesigned report summary cards with modern styling
   - Updated inventory reports tab with cleaner interface
   - Changed "Current Stock List" to "Showroom Available Vehicles"
   - Improved button styling (black background for export)
   - Refined badge colors for metrics
   - Removed redundant header from reports page

#### Files Created/Updated:

**SMS Integration:**
- `dashboard/src/lib/sms-service.ts` - SMS service library with Text.lk integration
- `dashboard/src/app/api/sms/route.ts` - API endpoint for SMS sending
- `dashboard/test-sms-service.js` - SMS service test script
- `dashboard/comprehensive-sms-test.js` - Comprehensive SMS gateway testing suite

**Reports UI:**
- `dashboard/src/app/(dashboard)/reports/page.tsx` - Removed header section
- `dashboard/src/components/reports/InventoryReportsTab.tsx` - Updated UI styling and labels

**Documentation:**
- `SMS_GATEWAY_DIAGNOSTIC_REPORT.md` - Comprehensive diagnostic report
- `SMS_GATEWAY_FIX_APPLIED.md` - Implementation details and setup guide

#### SMS Service Configuration:

```env
# Text.lk SMS Gateway Configuration
TEXTLK_API_TOKEN=your_api_token_here
TEXTLK_API_URL=https://app.text.lk/api/v3/sms/send
TEXTLK_SENDER_ID=your_approved_sender_id
```

#### SMS Service Usage:

```typescript
// Send SMS
import { sendSMS } from '@/lib/sms-service'

const result = await sendSMS({
  to: '0771234567',
  message: 'Your message here'
})

// Format phone number
import { formatPhoneNumber } from '@/lib/sms-service'
const formatted = formatPhoneNumber('0771234567') // Returns: '94771234567'

// Validate phone number
import { isValidSriLankanPhone } from '@/lib/sms-service'
const isValid = isValidSriLankanPhone('0771234567') // Returns: true

// Use SMS templates
import { smsTemplates } from '@/lib/sms-service'
const message = smsTemplates.welcome('John', 'john@example.com', 'temp123')
```

#### Technical Features:

**SMS Gateway:**
- Bearer token authentication with Text.lk API v3
- Required parameters: `recipient`, `sender_id`, `type`, `message`
- Phone number validation for Sri Lankan format (07X XXXX XXX)
- Automatic phone number formatting to international format
- Comprehensive error handling with detailed logging
- SMS templates for consistent messaging
- Test scripts for gateway verification

**API Specification:**
```json
{
  "recipient": "94771234567",
  "sender_id": "YourSenderID",
  "type": "plain",
  "message": "Your message here"
}
```

#### Next Steps:

**⚠️ IMPORTANT: Sender ID Approval Required**

To enable SMS sending, you must:
1. Login to Text.lk dashboard (https://app.text.lk)
2. Request a Sender ID (e.g., "PunchiCar", "PCN-System", "PCNLK")
3. Wait for approval (1-3 business days)
4. Update `.env.local` with approved Sender ID
5. Restart development server and test

**Testing Commands:**
```bash
# Test SMS service
cd dashboard
node test-sms-service.js

# Comprehensive test suite
node comprehensive-sms-test.js

# Test via API
curl -X POST http://localhost:3001/api/sms \
  -H "Content-Type: application/json" \
  -d '{"to":"94771234567","message":"Test SMS"}'
```

---

## 📢 PREVIOUS UPDATE - November 5, 2025 (Reports & Analytics Dashboard + Password Reset Flow)

### 🎯 Comprehensive Reports & Analytics Dashboard

**Major Feature Addition: Complete reporting system with advanced analytics and data visualization!**

#### What's New:

1. **📊 Advanced Reports Module**:
   - Inventory Reports: Stock aging, brand distribution, turnover rates
   - Sales & Profitability: Period analysis, salesperson performance, time-to-sell
   - Financial Reports: Revenue/profit trends, payment types, leasing analysis
   - Customer & Staff Reports: Sales agent leaderboards, commission tracking, customer database
   - Real-time data visualization with interactive charts

2. **🔐 Password Reset Flow (SMS OTP)**:
   - Complete password reset flow with SMS OTP verification
   - Integration with Text.lk SMS service
   - Secure JWT token-based reset process
   - Pages: Forget Password → OTP Verification → Change Password → Success
   - Database table: `password_reset_otps` with expiration tracking
   - API routes: `/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/auth/reset-password`
   - SMS service utility: `dashboard/src/lib/sms-service.ts`

3. **📈 Data Visualization**:
   - Multiple chart types: Area, Bar, Pie, Line charts
   - Recharts library integration
   - Export to CSV functionality for all reports
   - Date range filters (Week, Month, Quarter, Year)
   - Interactive tooltips and legends

4. **📱 SMS Integration**:
   - Text.lk SMS gateway integration
   - SMS templates for various notifications
   - Phone number validation and formatting
   - Test script: `dashboard/test-sms-service.js`

#### Files Created/Updated:

**Reports Components:**
- `dashboard/src/app/(dashboard)/reports/page.tsx` - Main reports page
- `dashboard/src/components/reports/InventoryReportsTab.tsx` - Inventory analytics
- `dashboard/src/components/reports/SalesProfitabilityTab.tsx` - Sales performance
- `dashboard/src/components/reports/FinancialReportsTab.tsx` - Financial analytics
- `dashboard/src/components/reports/CustomerStaffReportsTab.tsx` - Staff & customer analytics

**Password Reset Flow:**
- `dashboard/src/app/(auth)/forget-password/page.tsx` - Password reset initiation
- `dashboard/src/app/(auth)/verify-otp/page.tsx` - OTP verification
- `dashboard/src/app/(auth)/change-password/page.tsx` - New password setup
- `dashboard/src/app/(auth)/password-reset-success/page.tsx` - Success confirmation

**API Routes:**
- `dashboard/src/app/api/auth/send-otp/route.ts` - Send OTP via SMS
- `dashboard/src/app/api/auth/verify-otp/route.ts` - Verify OTP code
- `dashboard/src/app/api/auth/reset-password/route.ts` - Update password
- `dashboard/src/app/api/sms/route.ts` - General SMS sending endpoint

**Utilities:**
- `dashboard/src/lib/sms-service.ts` - SMS service integration
- `dashboard/test-sms-service.js` - SMS testing script

#### Database Changes:
```sql
-- New table for OTP tracking
CREATE TABLE password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number VARCHAR(15) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  user_id UUID REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Environment Variables Required:
```env
# Text.lk SMS Configuration
TEXTLK_API_TOKEN=your_api_token_here
TEXTLK_API_URL=https://app.text.lk/api/v3/sms/send
TEXTLK_SENDER_ID=your_approved_sender_id (optional)

# JWT for password reset tokens
JWT_SECRET=your-secret-key-change-in-production
```

#### Technical Features:

**Reports Module:**
- Dynamic date range filtering
- Real-time data aggregation from multiple tables
- Responsive design for mobile and desktop
- Export functionality for all report types
- Color-coded metrics and status indicators
- Performance optimized queries

**Password Reset:**
- 6-digit OTP generation
- 15-minute expiration window
- SMS delivery via Text.lk
- JWT token-based security
- Supabase Admin API integration
- Automatic cleanup of expired OTPs

#### Visual Enhancements:
- Gradient backgrounds for summary cards
- Icon-based navigation
- Loading states with animations
- Empty state handling
- Responsive tables with horizontal scroll
- Interactive charts with hover effects

---

## 📢 PREVIOUS UPDATE - November 5, 2025 (User Management Icons Fix)

### 🎯 User Management Edit/Delete Icons Fix

**Critical Fix: Admin users can now see edit and delete icons in User Management table!**

#### What Was Fixed:

1. **🔧 Supabase Client Issue**:
   - Fixed incorrect Supabase client import causing authentication failure
   - Changed from `@supabase/supabase-js` to proper `@/lib/supabase-client`
   - Current user authentication now works correctly
   - Icons appear instantly for admin users

2. **⚡ Component Lifecycle Optimization**:
   - Split useEffect hooks for better load timing
   - Current user fetches first before rendering table
   - Separate effect for user list fetching
   - Prevents race conditions and state issues

3. **🎨 Better State Management**:
   - Added comprehensive console logging for debugging
   - Added access_level trimming to handle whitespace
   - Strengthened conditional rendering checks
   - More explicit admin verification logic

4. **🐛 Bug Fixes**:
   - Fixed payload type error in realtime subscription
   - Removed debugging UI elements after testing
   - Cleaned up console logs for production
   - Verified all TypeScript compilation passes

#### Visual Changes:
```markdown
BEFORE ❌:
- Edit icon: Not visible
- Delete icon: Not visible
- Warning banner: "Current user not loaded"

AFTER ✅:
- Edit icon: Visible for admins (blue pencil)
- Delete icon: Visible for admins (red trash)
- Self-deletion: Prevented
- Banner: Removed
```

#### Technical Details:
- **Root Cause**: Using wrong Supabase client in client component
- **Solution**: Import from `@/lib/supabase-client` instead
- **Impact**: Fixes user management for all admin users
- **Backwards Compatible**: Yes, no data migration needed

#### Files Modified:
- `dashboard/src/app/(dashboard)/user-management/page.tsx` - Fixed Supabase client import, optimized useEffect hooks

---

## 📢 PREVIOUS UPDATE - November 4, 2025 (Sales Agent & Modal Enhancements)

### 🎯 Sales Transaction Agent Fields Enhancement

**Major Updates: Fixed agent fields display, enhanced sell vehicle flow, and improved modal layouts across sales transaction system!**

#### What's New:

1. **👔 Agent Fields Display Fix**:
   - Fixed Vehicle Showroom Agent and Office Sales Agent display in modals
   - Changed from storing Agent ID (UUID) to storing Agent Name in sell-vehicle flow
   - Added UUID-to-name resolution for backwards compatibility with old data
   - Enhanced modal layouts with clear 2-column grid structure
   - Renamed field labels for better clarity and UX
   - Added comprehensive debug logging for troubleshooting
   - Documentation: `AGENT_FIELDS_COMPLETE_SOLUTION.md`, `AGENT_FIELDS_VERIFICATION_GUIDE.md`

2. **🏢 Sales Agent Type Classification**:
   - Added agent_type field to sales_agents table with two values:
     * Office Sales Agent (In-house sales staff)
     * Vehicle Showroom Agent (Third-party/showroom representatives)
   - Enhanced Settings → Sales Agent tab with Agent Type dropdown
   - Updated Sell Vehicle form to filter agents by type
   - Database migration: `2025_11_add_agent_type_to_sales_agents.sql`
   - Documentation: `AGENT_TYPE_FEATURE_README.md`, `DEPLOYMENT_CHECKLIST_AGENT_TYPE.md`

3. **🗑️ S3 Image Deletion on Sold Out**:
   - Automatic deletion of vehicle images from S3 when vehicle is marked as sold out
   - Deletes all S3 images before moving vehicle to sold status
   - Cleans up vehicle_images table after S3 deletion
   - Comprehensive error handling and logging
   - Fallback to continue sold process even if S3 deletion fails

4. **✨ Modal & Table Improvements**:
   - Removed redundant "Sales Agent" column from Pending and Sold Out tables
   - Enhanced PendingVehicleModal with proper agent field display
   - Enhanced ViewDetailModal with 2-column layout for selling information
   - Added UUID resolution logic for legacy data display
   - Improved field labels: "Vehicle Showroom Agent" and "Office Sales Agent"
   - Better CSV export with separate agent columns

#### Files Modified:

**Sell Vehicle Flow:**
- `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx`
  - Added showroom agent name fetch before saving
  - Now stores agent NAME instead of UUID in database
  
- `dashboard/src/components/sell-vehicle/SellingInfo.tsx`
  - Renamed "In-House Sales Agent" → "Office Sales Agent"
  - Renamed "Third Party Sales Agent" → "Vehicle Showroom Agent"
  - Changed from text input to dropdown for Vehicle Showroom Agent
  - Filtered agents by agent_type for each dropdown

**Sales Transactions:**
- `dashboard/src/app/(dashboard)/sales-transactions/page.tsx`
  - Added S3 image deletion logic before marking as sold out
  - Enhanced logging for S3 deletion process
  
- `dashboard/src/components/sales-transactions/PendingVehicleModal.tsx`
  - Added UUID-to-name resolution for legacy showroom agents
  - Enhanced agent field display with debug logging
  
- `dashboard/src/components/sales-transactions/ViewDetailModal.tsx`
  - Added UUID-to-name resolution for backwards compatibility
  - Reorganized selling info section to 2-column grid
  - Updated CSV export with separate agent columns
  
- `dashboard/src/components/sales-transactions/PendingVehiclesTable.tsx`
  - Removed "Sales Agent" column (redundant)
  
- `dashboard/src/components/sales-transactions/SoldOutVehicleModal.tsx`
  - Enhanced agent field labels and layout
  
- `dashboard/src/components/sales-transactions/SoldOutVehiclesTable.tsx`
  - Removed "Sales Agent" column (redundant)

**Settings:**
- `dashboard/src/components/settings/SalesAgentTab.tsx`
  - Added Agent Type dropdown in "Add new seller" dialog
  - Added Agent Type column to sales agents table
  - Integrated Select UI components for agent type selection

**Database & Types:**
- `dashboard/migrations/2025_11_add_agent_type_to_sales_agents.sql` (NEW)
  - Added agent_type column with ENUM type
  - Default value: 'Office Sales Agent'
  
- `dashboard/src/lib/database.types.ts`
  - Updated SalesAgent interface with agent_type field

#### Documentation Created:

**Agent Fields Fix:**
- `AGENT_FIELDS_BEFORE_AFTER.md` - Visual comparisons and code diffs
- `AGENT_FIELDS_COMPLETE_SOLUTION.md` - Complete technical overview
- `AGENT_FIELDS_FIX_SUMMARY.md` - Root cause and solutions
- `AGENT_FIELDS_GIT_COMMIT.md` - Git commit template
- `AGENT_FIELDS_QUICK_REFERENCE.md` - Quick reference guide
- `AGENT_FIELDS_VERIFICATION_GUIDE.md` - Step-by-step testing

**Agent Type Feature:**
- `AGENT_TYPE_FEATURE_README.md` - Complete feature overview
- `AGENT_TYPE_GIT_COMMIT_TEMPLATE.md` - Git commit details
- `AGENT_TYPE_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- `AGENT_TYPE_QUICK_GUIDE.md` - Quick setup guide
- `AGENT_TYPE_UPDATE_COMPLETE.md` - Change documentation
- `AGENT_TYPE_VISUAL_GUIDE.md` - Visual diagrams
- `DEPLOYMENT_CHECKLIST_AGENT_TYPE.md` - Deployment checklist

**Vehicle Showroom Agent Fix:**
- `VEHICLE_SHOWROOM_AGENT_FIX.md` - UUID resolution fix summary
- `VEHICLE_SHOWROOM_AGENT_VISUAL_GUIDE.md` - Visual before/after guide

---

## 📢 PREVIOUS UPDATE - November 4, 2025 (Action Column Enhancement)

### 📋 Sales Transaction Sold Out Table - Enhanced Actions Column

**Major Updates: Replaced "Print Invoice" button with compact print icon and added delete functionality with verification modal!**

#### What's New:

1. **🖨️ Print Icon Integration**:
   - Replaced "Print Invoice" text button with compact printer icon
   - Direct integration with PrintDocumentModal
   - Clean, professional icon-based UI
   - Hover effect: Blue border and background on hover
   - Cleaner action column layout

2. **🗑️ Delete Functionality**:
   - New delete icon (Trash2) in action column
   - Integrated with DeleteConfirmModal (NOT console popup)
   - Professional verification modal instead of window.alert()
   - One-click deletion from database
   - Auto-refresh table after successful deletion
   - Hover effect: Red border and text on hover
   - Safety confirmation before permanent deletion

3. **✨ UI/UX Improvements**:
   - Icon-only action buttons (more compact)
   - Better spacing between actions (gap-3)
   - Improved hover states with color changes
   - Title tooltips on icon buttons
   - Professional modal dialogs for confirmations
   - Loading states during delete operations

4. **🔧 Code Changes**:
   - Added `Trash2` icon import from lucide-react
   - Integrated `DeleteConfirmModal` component
   - New state management: `deleteConfirmOpen`, `selectedSaleForDelete`, `isDeleting`
   - New handler functions: `handleDeleteClick()`, `handleConfirmDelete()`
   - Simplified `handlePrintInvoice()` to open PrintDocumentModal

#### Files Modified:

- `dashboard/src/components/sales-transactions/SoldOutVehiclesTable.tsx`
  - Removed "Print Invoice" button text
  - Added print icon with modal integration
  - Added delete icon with confirmation modal
  - Enhanced action column styling and spacing

- `dashboard/src/app/(dashboard)/sales-transactions/page.tsx`
  - Simplified `handlePrintInvoice()` function
  - Removed old console-based printing logic
  - Now delegates to PrintDocumentModal component

#### Previous Update (Print Document Feature & Finance Company Enhancements) ⬇️

---

## 📢 PREVIOUS UPDATE - November 4, 2025 (Enhanced)

### 🖨️ Print Document Feature & Finance Company Enhancements

**Major Updates: Enhanced PrintDocumentModal with detailed leasing company debugging, improved field positioning, and comprehensive error handling!**

#### What's New:

1. **🖨️ Print Document System** (Enhanced):
   - Print 5 different document types: Cash Seller, Cash Dealer, Advance Note, Finance Seller, Finance Dealer
   - Auto-populated data from database (vehicle, customer, seller, amounts)
   - Canvas-based document generation with precise field positioning
   - **NEW**: Enhanced leasing company data fetching with detailed debugging
   - **NEW**: Comprehensive error logging for finance company tracking
   - **NEW**: Support for both finance_company and leasing_company_name fields
   - **NEW**: Added customer landphone field support for all document types
   - Professional document templates with company branding
   - Print or save as PDF functionality
   - Documentation: `PRINT_DOCUMENT_COMPLETE.md`, `PRINT_DOCUMENT_VISUAL_GUIDE.md`, `FINANCE_SELLER_LEASING_COMPANY_FIX.md`

2. **🏢 Leasing Company Management** (Stable):
   - Complete leasing company management in Settings
   - Add/Edit/Delete leasing companies
   - Track which leasing company finances each sale
   - Auto-generated 5-digit company IDs
   - Active/Inactive status toggle
   - Integration with Sell Vehicle flow
   - 33 pre-loaded Sri Lankan leasing companies
   - Documentation: `dashboard/LEASING_COMPANY_FEATURE.md`

3. **💰 Price Category Enhancements** (Stable):
   - Added PCN Advance Amount field
   - Optional field (works with or without migration)
   - Auto-calculation and display
   - Graceful fallback for missing data
   - Migration script: `apply-pcn-advance-migration.sh`
   - Documentation: `PCN_ADVANCE_AMOUNT_COMPLETE.md`

4. **🔧 Sell Vehicle Bug Fixes** (Stable):
   - Fixed customer_title schema error
   - Added leasing_company_id tracking
   - Updated "To Pay Amount" display
   - Simplified Payment Method (Cash/Leasing only)
   - Conditional leasing company selection
   - Database migrations included
   - Documentation: `SELL_VEHICLE_BUG_FIX_COMPLETE.md`

#### Files Created/Modified:

**New Components:**
- `dashboard/src/components/sales-transactions/PrintDocumentModal.tsx`
- `dashboard/src/components/settings/LeasingCompanyTab.tsx`

**Database Migrations:**
- `dashboard/migrations/2025_11_add_leasing_companies.sql`
- `dashboard/migrations/2025_11_add_pcn_advance_amount_to_price_categories.sql`
- `dashboard/migrations/2025_11_02_add_leasing_company_to_pending_sales.sql`
- `dashboard/migrations/2025_11_02_complete_pending_sales_migration.sql`
- `dashboard/migrations/FIX_pending_vehicle_sales_schema.sql`

**Helper Scripts:**
- `apply-pcn-advance-migration.sh`
- `apply-leasing-company-migration.sh`
- `apply-complete-pending-sales-migration.sh`
- `fix-sell-vehicle-error.sh`
- `dashboard/scripts/add-leasing-companies.js`

**Documentation:**
- `PRINT_DOCUMENT_COMPLETE.md` - Complete print feature documentation
- `PRINT_DOCUMENT_IMPLEMENTATION.md` - Technical implementation details
- `PRINT_DOCUMENT_VISUAL_GUIDE.md` - Visual UI guide
- `PRINT_DOCUMENT_TESTING_GUIDE.md` - Testing procedures
- `FINANCE_SELLER_LEASING_COMPANY_FIX.md` - **NEW** Finance seller leasing company debugging guide
- `PRICE_CATEGORY_FIX.md` - Price category fixes
- `SELL_VEHICLE_BUG_FIX_COMPLETE.md` - Sell vehicle bug fixes
- `SELL_VEHICLE_STEP2_UPDATES.md` - Step 2 enhancements
- `dashboard/LEASING_COMPANY_FEATURE.md` - Leasing company feature

#### 🔧 Technical Enhancements to PrintDocumentModal:

**Enhanced Data Fetching:**
- ✅ Improved leasing company data retrieval with error handling
- ✅ Added price category matching for PCN Advance Amount calculation
- ✅ Robust null/undefined checks with detailed console logging
- ✅ Support for both `finance_company` and `leasing_company_name` fallback

**Field Positioning Refinements:**
- ✅ Adjusted seller NIC position in CASH_SELLER (350 → 550, 825 → 2330)
- ✅ Adjusted customer NIC position in CASH_SELLER (500 → 550, 3030 → 3030)
- ✅ Added customer_landphone field to CASH_DEALER document
- ✅ Added customer_landphone field to ADVANCE_NOTE document
- ✅ Added customer_landphone field to FINANCE_DEALER document
- ✅ Fixed vehicle info x-coordinate in ADVANCE_NOTE (260 → 220)
- ✅ Fixed vehicle info x-coordinate in FINANCE_DEALER (1800 → 1730)
- ✅ Optimized FINANCE_SELLER field positions with explicit string conversion
- ✅ Updated finance company position in FINANCE_DEALER (1200 → 750, 1355 → 1320)

**Debug Logging Features:**
- 📊 Leasing company fetch logging with UUID tracking
- 📊 Price category matching logs with min/max price ranges
- 📊 Finance company data type and value validation logs
- 📊 Final text conversion logs before canvas drawing
- 📊 Complete sale data snapshot for troubleshooting

**Console Output Examples:**
```
👤 Seller data: { ... }
📋 Seller title: [title-value]
💰 PCN Advance Amount: 50000
📊 Price Category: [category-name]
📌 Fetching leasing company with ID: [uuid]
🏢 Leasing Company Data: { ... }
💼 Finance Company Final Value: [company-name]
🏦 Final Text to Draw: [company-name]
```

---

## 📋 Previous Update - November 2, 2025

### 🔔 Notification System - Complete Implementation

**New Feature: Real-time notifications for all vehicle operations! Stay informed about every vehicle action with instant notifications and detailed activity tracking.**

#### Recent Changes:
- 🔔 **Real-time Notifications**: Instant notifications for all vehicle operations
- ✅ **5 Notification Types**: Add, Update, Delete, Move to Sales, Sold Out
- 🎨 **Color-Coded Display**: Green, Yellow, Red, Blue, Emerald indicators
- 📢 **Notification Bell**: Badge counter showing unread count in header
- 💬 **Detailed Messages**: User name, vehicle info, and action context
- ⚡ **Performance Fixes**: AWS S3 timeout configuration and error handling
- 🔧 **Upload Optimization**: Request timeouts and retry logic improvements

#### What Was Added:

1. **Notification System Components**:
   - **NotificationContext** (`dashboard/src/contexts/NotificationContext.tsx`):
     - Global state management for notifications
     - Real-time Supabase subscriptions
     - Auto-refresh notification count
   
   - **NotificationDropdown** (`dashboard/src/components/notifications/NotificationDropdown.tsx`):
     - Bell icon with unread badge
     - Dropdown with recent notifications
     - Color-coded notification cards
     - Mark as read / Clear all functionality
   
   - **Notification Service** (`dashboard/src/lib/notificationService.ts`):
     - CRUD operations for notifications
     - Helper functions for vehicle actions
     - Real-time subscription management

2. **Notification Integration** (All 5 Actions):
   - **Add Vehicle** (`add-vehicle/page.tsx`):
     - Creates notification after successful vehicle insertion
     - Message: "[User] added [Vehicle] to the Inventory."
   
   - **Update Vehicle** (`EditVehicleModal.tsx`):
     - Creates notification after successful update
     - Message: "[User] updated details of [Vehicle] in the Inventory."
   
   - **Delete Vehicle** (`inventory/page.tsx`):
     - Creates notification after successful deletion
     - Message: "[User] deleted [Vehicle] from the Inventory."
   
   - **Move to Sales** (`sell-vehicle/page.tsx`):
     - Creates notification when vehicle moves to pending
     - Message: "[User] moved [Vehicle] to the Selling Process — now listed in Sales Transactions (Pending)."
   
   - **Sold Out** (`sales-transactions/page.tsx`):
     - Creates notification when sale is completed
     - Message: "[User] completed the sale of [Vehicle] — vehicle moved to Sold Out."

3. **AWS S3 Performance Fixes**:
   - **Request Timeouts**: 30-second timeout on presigned URL requests
   - **S3 Client Timeout**: 10-second timeout for S3 operations
   - **Retry Logic**: Reduced retry attempts from default to 2
   - **Error Logging**: Detailed timing logs for debugging
   - **Abort Controllers**: Proper request cancellation on timeout

4. **Database Schema**:
   ```sql
   CREATE TABLE notifications (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     type TEXT NOT NULL, -- 'added', 'updated', 'deleted', 'moved_to_sales', 'sold'
     title TEXT NOT NULL,
     message TEXT NOT NULL,
     vehicle_number TEXT,
     vehicle_brand TEXT,
     vehicle_model TEXT,
     is_read BOOLEAN DEFAULT false,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Documentation Created**:
   - `NOTIFICATION_FIX_COMPLETE.md` - Complete technical documentation
   - `NOTIFICATION_FLOW_VISUAL.md` - Visual flow diagrams and testing guide
   - Migration SQL for notifications table

---

## 📋 Previous Updates

### ✅ Inventory Print Functionality - Document Generation Enhancement (November 2, 2025)

**New Feature: Print documents directly from inventory with a single click! Generate acceptance documents and price tags for any vehicle in your inventory.**

#### Recent Changes:
- ✅ **Print Documents Modal**: New modal interface for printing vehicle documents
- ✅ **Print Icon**: Added green printer icon in inventory action column
- ✅ **Print Acceptance**: Generate and print vehicle acceptance documents with seller details
- ✅ **Print Price Tag**: Generate and print professional price tags with vehicle specs
- ✅ **Auto-Print**: Opens print dialog automatically when document is ready
- ✅ **Data Validation**: Handles missing seller data gracefully with clear warnings
- ✅ **Template Integration**: Uses existing document templates from Step 7 success flow

### ✅ S3 Image Deletion Bug Fix & Enhanced Error Handling (November 1, 2025)

**Critical fix: Vehicle deletion now properly removes ALL images from AWS S3, preventing orphaned files and storage waste!**

#### Recent Changes:
- ✅ **S3 Deletion Fix**: Vehicle deletion now properly removes images from AWS S3
- ✅ **Enhanced Logging**: Comprehensive emoji-based logging for better debugging
- ✅ **Error Tracking**: Detailed error messages and success/failure feedback
- ✅ **Batch Processing**: Efficient handling of multiple images (up to 1000 per batch)
- ✅ **User Feedback**: Clear alerts showing deletion status and any issues
- ✅ **Audit Trail**: Complete logging of what was deleted from S3 and database
   - **EditVehicleModal.tsx**: Updated transmission dropdown (Manual → M, Automatic → A)
   - **Form Validation**: Improved validation for all updated fields

3. **Web Application Updates**:
   - **Vehicles Page**: Enhanced filtering and display
   - **Brand Logo Marquee**: Optimized performance and styling
   - **Footer & Header**: Minor styling improvements
   - **Responsive Design**: Improved mobile experience

4. **Documentation Added**:
   - **S3_DELETE_BUG_FIX.md**: Comprehensive S3 deletion fix documentation
   - **TESTING_S3_DELETE.md**: Complete testing guide for S3 deletion
   - **SELLER_TITLE_UPDATE.md**: Complete implementation guide
   - **SELLER_TITLE_VISUAL_GUIDE.md**: Visual reference for changes
   - **TRANSMISSION_UPDATE_SUMMARY.md**: Transmission standardization details
   - **SELLER_BUG_FIX_SUMMARY.md**: Bug fix documentation
   - **STEP7_UPDATES_SUMMARY.md**: Success component updates
   - **Migration Scripts**: SQL files for database updates
   - **Quick Fix Guide**: Rapid deployment instructions

5. **Previous Features** (Still Active):
   - Brand Logo Marquee with infinite scrolling
   - 360-degree image viewer for detailed vehicle inspection
   - Image carousel with multiple viewing angles
   - Advanced vehicle filtering and search functionality
   - Professional footer and UI separators
   - Upload management interface
   - Responsive vehicle cards with detailed information
   - Countries API endpoint for international support

2. **Dashboard Enhancements**:
   - Complete vehicle management system with title fields
   - Multi-step vehicle adding workflow (7 steps)
   - Document generation (acceptance forms)
   - Image management with AWS S3 integration
   - Inventory tracking and sales analytics
   - Enhanced seller and customer details forms

3. **Backend Integration**:
   - S3 image upload and management endpoints
   - Vehicle CRUD operations
   - Authentication and authorization
   - Sales and analytics tracking

4. **Documentation Added**:
   - 360 View Implementation Guide
   - Carousel Fix Summary
   - Filters Activation Guide
   - Search Implementation Documentation
   - Upload UI Structure Guide
   - Web Footer Update Instructions
   - Separator Installation Guide
   - Seller Title Update Guide
   - Transmission Update Summary
   - Bug Fix Documentation
   - Migration Scripts and SQL Files

#### Services Status:

#### Services Status:
- ✅ **Dashboard**: http://localhost:3001 (Next.js - Vehicle Management & Admin)
- ✅ **Web**: http://localhost:3002 (Next.js - Public Website & Listings)
- ✅ **API**: http://localhost:4000 (Node.js/Express - RESTful Backend)
- ✅ **Database**: Supabase PostgreSQL with 9 tables
- ✅ **Storage**: AWS S3 for vehicle images

#### How to Run:
```bash
# Navigate to project root
cd "/Users/asankaherath/Projects/PCN System . 2.0"

# Start all services concurrently
npm run dev

# Or start services individually
npm run dev:dashboard  # Port 3001 - Admin Dashboard
npm run dev:web       # Port 3002 - Public Website  
npm run dev:api       # Port 4000 - Backend API
```

#### Git Information:
- **Repository**: pcn-system-2.0
- **Owner**: punchicar71-dev
- **Branch**: main
- **Latest Commit**: Database schema updates & bug fixes complete
- **Status**: Ready for production deployment

#### Project Metrics:
- 📁 **Total Files**: 60+ active files
- 📝 **Lines Added**: 10,000+ lines of code and documentation
- 📚 **Documentation Files**: 32+ implementation guides
- 🗂️ **Database Tables**: 9 (with enhanced schema including title fields)
- 🗄️ **Migration Scripts**: 7+ versioned migration files
- 🖼️ **Components**: 60+ React components
- 🔧 **API Endpoints**: 27+ RESTful endpoints
- 🏢 **Brand Logos**: Dynamic brand showcase with 20+ manufacturers
- 🐛 **Bug Fixes**: Multiple fixes for form validation and data persistence

---

## � Quick Start Guide

### Prerequisites:
- Node.js 18+ and npm
- Git for version control
- PostgreSQL (via Supabase)
- AWS S3 credentials for image storage
- Supabase project setup

### Installation:
```bash
# 1. Clone the repository
git clone https://github.com/punchicar71-dev/pcn-system-2.0.git
cd "PCN System . 2.0"

# 2. Install dependencies for all services
npm install

# 3. Setup environment variables
# Copy .env.example to .env.local for each service (dashboard, web, api)
# Add your Supabase, AWS S3, and other credentials

# 4. Run database migrations
cd dashboard
npm run db:setup

# 5. Start all services
cd ..
npm run dev
```

### Key Directories:
```
├── api/                    # Node.js Express backend
│   ├── src/config/        # AWS, database config
│   ├── src/routes/        # API endpoints
│   └── src/utils/         # S3 upload utilities
│
├── dashboard/             # Admin management interface
│   ├── src/app/          # Next.js app directory
│   ├── src/components/   # React components
│   ├── migrations/       # Database setup scripts
│   └── scripts/          # Utility scripts
│
├── web/                   # Public facing website
│   ├── src/app/          # Next.js app directory
│   ├── src/components/   # Reusable React components
│   └── src/lib/          # Utilities and types
│
└── shared/               # Shared types and constants
    ├── types.ts         # TypeScript type definitions
    └── constants.ts     # Shared constants
```

### Environment Variables:
See `.env.example` files in each service directory:
- `api/.env.example` - Backend configuration
- `dashboard/.env.example` - Dashboard configuration
- `web/.env.example` - Website configuration

---

## 📚 Documentation Reference

### Quick Start Guides:
- [QUICK_START.md](QUICK_START.md) - Getting started immediately
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing procedures
- [TESTING_S3_DELETE.md](TESTING_S3_DELETE.md) - S3 deletion testing guide

### Feature Guides:
- [360_VIEW_QUICK_GUIDE.md](360_VIEW_QUICK_GUIDE.md) - 360-degree viewer setup
- [SEARCH_QUICK_GUIDE.md](SEARCH_QUICK_GUIDE.md) - Search functionality
- [VEHICLE_CARD_SLIDER_GUIDE.md](VEHICLE_CARD_SLIDER_GUIDE.md) - Image carousel
- [WEB_FOOTER_UPDATE.md](WEB_FOOTER_UPDATE.md) - Footer component

### Implementation Guides:
- [360_VIEW_IMPLEMENTATION.md](360_VIEW_IMPLEMENTATION.md) - Detailed 360 viewer setup
- [SEARCH_IMPLEMENTATION.md](SEARCH_IMPLEMENTATION.md) - Search system details
- [FILTERS_ACTIVATION_COMPLETE.md](FILTERS_ACTIVATION_COMPLETE.md) - Filter system
- [web/UPLOAD_UI_IMPLEMENTATION.md](web/UPLOAD_UI_IMPLEMENTATION.md) - Upload interface

### Technical Documentation:
- [api/README.md](api/README.md) - Backend API documentation
- [dashboard/README.md](dashboard/README.md) - Dashboard documentation
- [web/README.md](web/README.md) - Website documentation
- [S3_DELETE_BUG_FIX.md](S3_DELETE_BUG_FIX.md) - S3 deletion bug fix details

---

## 🎯 Core Features

### 1. **Vehicle Management**
- Add vehicles with multi-step form
- Upload multiple images per vehicle
- Assign vehicle options and features
- Publish/unpublish vehicles
- Track vehicle details and history
- Generate acceptance documents

### 2. **Image Management**
- AWS S3 integration for image storage
- Complete image lifecycle management (upload, view, delete)
- Proper S3 deletion when vehicles are removed
- 360-degree image viewer for vehicle inspection
- Image carousel with multiple viewing angles
- Drag-and-drop upload interface
- Batch image operations (up to 1000 images per batch)
- Secure image retrieval with S3 keys
- Comprehensive logging and error tracking

### 3. **Document Generation & Printing**
- **Print Acceptance Documents**: Generate vehicle acceptance forms with seller details
- **Print Price Tags**: Professional price tags with vehicle specifications
- Template-based document generation
- Auto-print functionality for quick workflow
- Print directly from inventory page
- Handles multiple document types
- Date and data formatting for professional output
- Support for multi-page documents (options overflow)

### 4. **Search & Filtering**
- Full-text search on vehicle attributes
- Filter by brand, model, price range
- Filter by vehicle condition and features
- Advanced option-based filtering
- Real-time search results
- Paginated results display

### 5. **User Management**
- Role-based access control (Admin, Staff, User)
- User authentication via Supabase
- Session persistence and security
- User profile management
- Password reset functionality

### 6. **Analytics & Reporting**
- Sales transaction tracking
- Vehicle listing analytics
- User activity monitoring
- Dashboard statistics
- Report generation

### 7. **Public Website**
- Responsive vehicle listings
- Detailed vehicle cards
- Customer inquiry system
- Mobile-optimized design
- Professional footer and navigation

---

## 🛠️ Technology Stack

### Frontend:
- **Next.js 14** - React framework with SSR
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **React Hook Form** - Form state management

### Backend:
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database and auth
- **AWS S3** - Image storage and CDN

### Database:
- **PostgreSQL** - Primary data store (Supabase)
- **9 Tables** - vehicles, users, sales, analytics, etc.
- **Full ACID compliance** - Transaction support

### Infrastructure:
- **Git** - Version control
- **npm** - Package management
- **Nodemon** - Development server
- **Environment variables** - Configuration management

---

## 🔒 Security Features

- ✅ **Supabase Authentication** - Secure login with PKCE flow
- ✅ **Role-Based Access Control** - Permission levels
- ✅ **HttpOnly Cookies** - Secure session storage
- ✅ **AWS S3 Security** - Encrypted image storage
- ✅ **Database Encryption** - Data at rest protection
- ✅ **CORS Protection** - Cross-origin security
- ✅ **Environment Secrets** - Secure credential storage
- ✅ **SQL Injection Prevention** - Parameterized queries

---

## 📊 Database Schema

### Core Tables:
1. **vehicles** - Vehicle inventory and details
2. **users** - User accounts and authentication
3. **vehicle_images** - S3 image references
4. **vehicle_options** - Vehicle features and options
5. **sales_transactions** - Sales records
6. **analytics** - Usage and activity tracking
7. **user_roles** - Role definitions
8. **vehicle_history** - Change tracking
9. **settings** - System configuration

---

## 🚢 Deployment

### For Production:
1. Set environment variables for production
2. Run database migrations
3. Build Next.js applications: `npm run build`
4. Start API server: `npm run start:api`
5. Deploy to hosting platform (Vercel, AWS, etc.)

### Docker Support (Optional):
- Dockerfile templates can be created for each service
- Docker Compose for multi-container orchestration

---

## 📞 Support & Contact

For issues, questions, or contributions:
- **Repository**: https://github.com/punchicar71-dev/pcn-system-2.0
- **Issues**: GitHub Issues tracker
- **Documentation**: See README files in each service directory

---

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: November 1, 2025  
**Version**: 2.0.1  
**Status**: ✅ Production Ready

### ✅ Vehicle Publishing & Options - Critical Fixes Applied

**Fixed NOT NULL constraint violations and vehicle options not saving to database!**

#### Issues Fixed:

1. **🔴 NOT NULL Constraint Violation** - Vehicle Publishing Failed
   - **Problem**: Body Type, Fuel Type, and Transmission were marked as optional in UI but required in database
   - **Error**: `null value in column "body_type" of relation "vehicles" violates not-null constraint`
   - **Solution**: 
     - Added red asterisk (*) to required fields in Step 1
     - Enhanced validation in Step 1 form submission
     - Added comprehensive pre-publish validation
     - Removed null fallbacks for required fields in database insert
     - Added specific error handling for constraint violations (23502, 23514)

2. **🔴 Vehicle Options Not Saving** - Step 3 Options Lost
   - **Problem**: SQL constraint mismatch and silent failures
   - **Root Cause**: `ON CONFLICT (option_name)` vs `UNIQUE(option_name, option_type)` constraint
   - **Solution**:
     - Fixed SQL migration with correct `ON CONFLICT (option_name, option_type)`
     - Enhanced error tracking with failed options arrays
     - Added detailed console logging for all option operations
     - Created verification script for master data setup

#### What's Fixed:

- ✅ **Required Field Validation** - 3-layer validation system
  - UI indicators with red asterisks
  - Step-level validation on "Next" click
  - Final validation before database insert
  - Database constraints as last resort
  
- ✅ **Vehicle Options Master Data** - Proper SQL setup
  - Fixed insert script: `insert_all_vehicle_options.sql`
  - Created verification script: `verify_and_setup_vehicle_options.sql`
  - 28 Standard Options + 21 Special Options
  - Proper handling of UNIQUE constraint

- ✅ **Enhanced Error Messages** - Clear, actionable feedback
  - NOT NULL violations show friendly field names
  - CHECK constraint violations show allowed values
  - Failed options reported with guidance to run SQL migration
  - Detailed console logging for debugging

#### Technical Implementation:

**Step1VehicleDetails.tsx:**
```typescript
// Added required indicators
<Label htmlFor="bodyType">
  Body Type <span className="text-red-500">*</span>
</Label>

// Enhanced validation
const missingFields: string[] = [];
if (!data.bodyType) missingFields.push('Body Type');
if (!data.fuelType) missingFields.push('Fuel Type');
if (!data.transmission) missingFields.push('Transmission');
// ...show all missing fields
```

**add-vehicle/page.tsx:**
```typescript
// Pre-publish comprehensive validation
const validationErrors: string[] = [];
if (!vehicleDetails.bodyType) validationErrors.push('Body Type');
// ... validate all required fields

// Database insert without null fallbacks
body_type: vehicleDetails.bodyType, // Required - validated above
fuel_type: vehicleDetails.fuelType, // Required - validated above
transmission: vehicleDetails.transmission, // Required - validated above

// Enhanced error handling
if (vehicleError.code === '23502') {
  // NOT NULL constraint - show friendly error with field name
}
if (vehicleError.code === '23514') {
  // CHECK constraint - show allowed values
}
```

**Vehicle Options Fix:**
```typescript
// Track failed options
const failedStandardOptions: string[] = [];
const failedSpecialOptions: string[] = [];

// Enhanced lookup with is_active filter
.eq('is_active', true)

// Report results with counts
console.log(`✅ Options inserted: ${standardInsertCount}/${standardOptions.length} standard`);
if (failedStandardOptions.length > 0) {
  console.warn(`⚠️  Failed: ${failedStandardOptions.join(', ')}`);
  console.warn('Please run: dashboard/migrations/insert_all_vehicle_options.sql');
}
```

#### SQL Migrations:

1. **insert_all_vehicle_options.sql** - Fixed constraint handling
2. **verify_and_setup_vehicle_options.sql** - Comprehensive setup & verification

#### Documentation:
- [VEHICLE_PUBLISH_NOT_NULL_FIX.md](VEHICLE_PUBLISH_NOT_NULL_FIX.md) - NOT NULL constraint fix
- [VEHICLE_OPTIONS_FIX_COMPLETE.md](VEHICLE_OPTIONS_FIX_COMPLETE.md) - Vehicle options fix
- [VEHICLE_OPTIONS_FIX_QUICK_START.md](VEHICLE_OPTIONS_FIX_QUICK_START.md) - Quick reference

#### Required Fields (Now Properly Validated):
- ✅ Vehicle Number
- ✅ Vehicle Brand
- ✅ Model Name
- ✅ Manufacture Year
- ✅ Country
- ✅ **Body Type** (Fixed)
- ✅ **Fuel Type** (Fixed)
- ✅ **Transmission** (Fixed)
- ✅ Selling Amount
- ✅ Entry Type

#### Benefits:
- ✅ Users cannot publish incomplete vehicles
- ✅ Clear error messages at every validation layer
- ✅ Vehicle options save correctly to database
- ✅ Detailed logging for debugging
- ✅ Proper SQL constraint handling
- ✅ 49 vehicle options available (28 standard + 21 special)

---

## 📢 Previous Update - October 31, 2025

### ✅ Supabase Authentication System Upgrade - SSR Package Migration

**Complete authentication system modernization with official Supabase SSR package for Next.js 14!**

#### What's New:
- 🔐 **Modern Authentication** - Migrated from deprecated `@supabase/auth-helpers-nextjs` to `@supabase/ssr`
  - Fixed login issues with correct credentials
  - Proper session persistence across page refreshes
  - Automatic cookie-based authentication
  - No more manual session token management
  
- 🚀 **Improved User Experience** - Seamless authentication flow
  - Direct login without session conflicts
  - Client-side navigation with router.push()
  - Better error messages for login failures
  - Automatic session refresh via middleware
  
- 🛡️ **Enhanced Security** - HttpOnly cookies and proper session management
  - Secure cookie handling with SameSite=Lax
  - No tokens stored in localStorage
  - Automatic PKCE flow for enhanced security
  - Session validation in middleware

#### Technical Implementation:
- **New Supabase Clients**:
  - `supabase-client.ts`: Browser client using `createBrowserClient` from @supabase/ssr
  - `supabase-server.ts`: Server client with proper cookie handling
  - `supabase-middleware.ts`: Middleware helper for session validation
  
- **Updated Authentication Files**:
  - `login/page.tsx`: Simplified login flow without manual session management
  - `middleware.ts`: Modern session validation with updateSession()
  - `api/auth/logout/route.ts`: Clean logout with automatic cookie clearing
  - `api/auth/session/route.ts`: Session API using new SSR client
  - `api/users/route.ts` & `api/users/[id]/route.ts`: Updated to use new clients
  
- **Vehicle Delete Enhancement**:
  - `inventory/page.tsx`: Fixed S3 image deletion with proper key tracking
  - `api/upload/delete-vehicle/[vehicleId]/route.ts`: New proxy endpoint for S3 deletion
  - Backend `upload.routes.ts`: Enhanced to accept S3 keys array for bulk deletion
  - Backend `s3-upload.ts`: Improved deleteVehicleImages() to handle key arrays

#### Documentation:
- [SUPABASE_AUTH_FIX_COMPLETE.md](SUPABASE_AUTH_FIX_COMPLETE.md) - Complete migration guide
- Test script: `test-delete-function.js` - Tests vehicle deletion with S3 integration

#### Benefits:
- ✅ Login works correctly with valid credentials
- ✅ Sessions persist after page refresh
- ✅ No random logouts
- ✅ Clean, maintainable authentication code
- ✅ Future-proof with official Supabase SSR package
- ✅ Enhanced vehicle image deletion with S3 key tracking

---

## 📢 Previous Update - October 31, 2025

### ✅ Vehicle Acceptance Document Generation & Printing

**Complete acceptance document generation system with precise positioning and professional printing support!**

#### What's New:
- 📄 **Acceptance Document Generation** - Professional document creation for vehicle transactions
  - Pre-designed template with exact positioning for all fields
  - Automatic data population from vehicle and seller information
  - Professional formatting with proper spacing and alignment
  - Integrated into Step 7 (Success screen) of vehicle add workflow
  
- 🖨️ **Print-Optimized Design** - Perfect for physical documentation
  - CSS print styles for accurate positioning
  - Letter size (8.5" x 11") with proper margins
  - Fields positioned to match physical acceptance form template
  - Hidden elements during print (buttons, navigation)
  - Optimized for standard office printers
  
- 📋 **Complete Field Coverage** - All required vehicle and seller information
  - Vehicle Details: Brand, Model, Year, Body Type, Color, Mileage, Chassis #, Engine #
  - Seller Information: Name, NIC, Address, Phone
  - Transaction Details: Date, Vehicle Number, Selling Price
  - Terms & Conditions: Pre-populated standard terms
  - Signature Areas: Seller, Buyer, Witness sections with date fields

#### Technical Implementation:
- **Step7Success.tsx**: Enhanced success screen with document generation
  - Location: `dashboard/src/components/vehicle/Step7Success.tsx`
  - Integrated print functionality with window.print()
  - Dynamic data binding from vehicle submission
  - Conditional rendering for print vs screen view
  
- **Print Stylesheet**: Dedicated CSS for accurate printing
  - Media query @media print for print-specific styles
  - Precise positioning measurements (mm, inches)
  - Page break controls and margin settings
  - Element visibility controls (hide navigation, show document)

#### Documentation:
- [ACCEPTANCE_DOC_QUICK_START.md](ACCEPTANCE_DOC_QUICK_START.md) - Quick start guide
- [ACCEPTANCE_DOC_VISUAL_GUIDE.md](ACCEPTANCE_DOC_VISUAL_GUIDE.md) - Visual walkthrough
- [ACCEPTANCE_DOC_POSITIONING_GUIDE.md](ACCEPTANCE_DOC_POSITIONING_GUIDE.md) - Technical positioning details
- [ACCEPTANCE_DOC_PRINTING.md](ACCEPTANCE_DOC_PRINTING.md) - Printing instructions

#### User Experience:
- One-click document generation from success screen
- Preview before printing
- Print button prominently displayed
- Professional output suitable for legal documentation
- Seamless integration with vehicle add workflow

---

## 📢 Previous Update - October 31, 2025

### ✅ Vehicle Image Management System - Full AWS S3 Integration

**Complete vehicle image management system with dedicated modal for uploading, viewing, and deleting images!**

#### What's New:
- 🖼️ **Dedicated Image Upload Modal** - Comprehensive image management interface
  - Separate upload sections for Vehicle Images, 360 Images, and CR Papers
  - Multiple file upload support with drag-and-drop
  - Real-time upload progress tracking with status indicators
  - Grid view of current images (3 columns) with hover actions
  - Delete images with confirmation
  - AWS S3 configuration status check with warning banner
  
- 🎨 **Enhanced Inventory Table** - New image edit action button
  - Added ImageIcon button (4th button in action column)
  - Quick access to image management for any vehicle
  - Opens modal with vehicle context (Brand, Model, Year, Vehicle Number)
  
- ☁️ **Direct S3 Upload** - Browser-to-S3 uploads using presigned URLs
  - Faster uploads (no server processing)
  - Comprehensive error logging throughout the upload chain
  - Database integration with `file_name`, `image_url`, `s3_key`, `image_type`, `is_primary`, `display_order`
  - Automatic S3 configuration validation
  
#### Technical Implementation:
- **VehicleImageUploadModal.tsx**: New comprehensive image management component
  - Location: `dashboard/src/components/inventory/VehicleImageUploadModal.tsx`
  - Supports: Gallery images, 360° views, CR/Paper documents
  - Features: Upload progress, success/error states, image preview, delete functionality
  - S3 Status: Real-time configuration check with visual warning
  
- **Enhanced Upload Pipeline**:
  - **s3-client.ts**: Added detailed logging for presigned URL flow
  - **hybrid-storage.ts**: Enhanced error tracking for S3 operations
  - **Database**: Fixed constraint violations with complete field mapping
  
- **Inventory Page Updates**:
  - Added ImageIcon import from lucide-react
  - New modal state management (imageUploadVehicleId, imageUploadVehicleInfo)
  - Image edit button positioned between Eye and Pencil icons

#### User Experience:
- Visual feedback during upload process (uploading/success/error badges)
- Clear error messages for failed uploads
- Warning banner when AWS S3 is not configured
- Elegant grid layout for current images with delete on hover
- Auto-clearing of successful uploads after 5 seconds
- Manual clear option for failed uploads

#### Previous Update - Inventory Edit Modal Enhancement & Success Popup
- 🎯 **Simplified Edit Modal** - Removed image upload/management from edit modal
- ✨ **Custom Success Popup** - Beautiful success confirmation after updates
- See full details in previous update section below

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
