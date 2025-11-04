#!/bin/bash

# Apply Leasing Company ID Migration to Pending Vehicle Sales
# This script helps apply the database migration that adds leasing_company_id to pending_vehicle_sales

echo ""
echo "================================================"
echo "  ADD LEASING COMPANY ID TO PENDING SALES"
echo "================================================"
echo ""
echo "This migration adds the 'leasing_company_id' column to the"
echo "pending_vehicle_sales table, allowing tracking of which"
echo "leasing company is financing a sale."
echo ""
echo "Changes:"
echo "  ✓ Adds leasing_company_id column (UUID, nullable)"
echo "  ✓ Creates foreign key to leasing_companies table"
echo "  ✓ Adds index for better query performance"
echo "  ✓ Allows NULL (for non-leasing sales)"
echo ""
echo "================================================"
echo ""
echo "📋 MIGRATION STEPS:"
echo ""
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to: SQL Editor"
echo "3. Copy and paste the migration file content"
echo "4. Execute the SQL"
echo ""
echo "Migration file location:"
echo "   $(pwd)/dashboard/migrations/2025_11_02_add_leasing_company_to_pending_sales.sql"
echo ""
echo "================================================"
echo ""

# Ask if user wants to view the migration file
read -p "Would you like to view the migration file now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "--- Migration File Content ---"
    cat "dashboard/migrations/2025_11_02_add_leasing_company_to_pending_sales.sql"
    echo ""
    echo "--- End of Migration File ---"
    echo ""
fi

echo "✅ After running the migration, you can select leasing companies"
echo "   when processing vehicle sales with Leasing payment type!"
echo ""
echo "Navigate to: Dashboard → Sell Vehicle → Step 2 to see the changes."
echo ""
