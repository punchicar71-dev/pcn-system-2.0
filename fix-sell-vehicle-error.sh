#!/bin/bash

# ==========================================
# FIX: Sell Vehicle "customer_title" Error
# ==========================================

echo ""
echo "🔧 FIXING: Sell Vehicle Flow - customer_title Column Error"
echo "=========================================================="
echo ""

# Set color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Problem:${NC}"
echo "   Failed to create sale: Could not find the 'customer_title' column"
echo "   of 'pending_vehicle_sales' in the schema cache"
echo ""

echo -e "${BLUE}🔍 Root Cause:${NC}"
echo "   The pending_vehicle_sales table is missing required columns:"
echo "   - customer_title (for customer formal titles)"
echo "   - leasing_company_id (for leasing payment tracking)"
echo ""

echo -e "${YELLOW}📂 Migration File Created:${NC}"
echo "   dashboard/migrations/FIX_pending_vehicle_sales_schema.sql"
echo ""

echo -e "${GREEN}✅ TypeScript Types Updated:${NC}"
echo "   dashboard/src/lib/database.types.ts"
echo "   - Added customer_title?: string"
echo "   - Added leasing_company_id?: string"
echo ""

echo "=========================================================="
echo -e "${YELLOW}⚡ REQUIRED ACTIONS:${NC}"
echo "=========================================================="
echo ""

echo "STEP 1: Apply Database Migration"
echo "--------------------------------"
echo "You MUST run the SQL migration in Supabase:"
echo ""
echo "Option A - Supabase Dashboard:"
echo "  1. Go to: https://supabase.com/dashboard/project/[your-project-id]/sql"
echo "  2. Copy the SQL from: dashboard/migrations/FIX_pending_vehicle_sales_schema.sql"
echo "  3. Paste and click 'Run'"
echo ""
echo "Option B - Command Line:"
echo "  cat dashboard/migrations/FIX_pending_vehicle_sales_schema.sql | pbcopy"
echo "  (Then paste in Supabase SQL Editor)"
echo ""

echo "STEP 2: Restart Development Server"
echo "-----------------------------------"
echo "After running the migration, restart your dashboard:"
echo ""
echo "  cd dashboard"
echo "  npm run dev"
echo ""

echo "=========================================================="
echo -e "${GREEN}🎉 WHAT'S BEEN FIXED:${NC}"
echo "=========================================================="
echo ""
echo "✅ TypeScript interface updated with missing fields"
echo "✅ Migration script created to add database columns"
echo "✅ All sell-vehicle code already references customer_title"
echo ""

echo "=========================================================="
echo -e "${BLUE}📝 VERIFICATION:${NC}"
echo "=========================================================="
echo ""
echo "After applying the migration, you can verify it worked:"
echo ""
echo "Run this SQL in Supabase:"
echo ""
echo "  SELECT column_name, data_type, is_nullable"
echo "  FROM information_schema.columns"
echo "  WHERE table_name = 'pending_vehicle_sales'"
echo "    AND column_name IN ('customer_title', 'leasing_company_id');"
echo ""
echo "Expected output:"
echo "  customer_title      | character varying | YES"
echo "  leasing_company_id  | uuid             | YES"
echo ""

echo "=========================================================="
echo -e "${YELLOW}⏭️  NEXT STEP:${NC}"
echo "=========================================================="
echo ""
echo "Would you like to:"
echo ""
echo "  1. Copy the SQL to clipboard"
echo "  2. Open Supabase dashboard"
echo "  3. View the migration file"
echo "  4. Exit (and apply manually)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        cat dashboard/migrations/FIX_pending_vehicle_sales_schema.sql | pbcopy
        echo ""
        echo -e "${GREEN}✅ SQL copied to clipboard!${NC}"
        echo "Now paste it in Supabase SQL Editor and click Run"
        ;;
    2)
        echo ""
        echo "Opening Supabase dashboard..."
        open "https://supabase.com/dashboard"
        echo ""
        echo "Navigate to: SQL Editor"
        echo "Then copy the migration file content"
        ;;
    3)
        echo ""
        cat dashboard/migrations/FIX_pending_vehicle_sales_schema.sql
        echo ""
        ;;
    4)
        echo ""
        echo "Exiting. Please apply the migration manually."
        ;;
    *)
        echo ""
        echo "Invalid choice. Please apply the migration manually."
        ;;
esac

echo ""
echo "=========================================================="
echo -e "${GREEN}🚀 After migration, try selling a vehicle again!${NC}"
echo "=========================================================="
echo ""
