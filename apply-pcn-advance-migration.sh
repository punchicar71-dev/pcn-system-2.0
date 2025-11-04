#!/bin/bash

# Script to display migration instructions for PCN Advance Amount feature
# This script helps guide you through applying the database migration

echo "================================================"
echo "PCN Advance Amount Migration Guide"
echo "================================================"
echo ""
echo "This migration adds the 'pcn_advance_amount' column to the price_categories table."
echo ""
echo "📋 STEPS TO APPLY:"
echo ""
echo "1. Open your Supabase Dashboard"
echo "   URL: https://app.supabase.com/project/YOUR_PROJECT_ID"
echo ""
echo "2. Navigate to: SQL Editor (in left sidebar)"
echo ""
echo "3. Create a new query and paste the contents of:"
echo "   dashboard/migrations/2025_11_add_pcn_advance_amount_to_price_categories.sql"
echo ""
echo "4. Click 'Run' to execute the migration"
echo ""
echo "5. Verify the column was added by running:"
echo "   SELECT * FROM price_categories LIMIT 1;"
echo ""
echo "================================================"
echo ""
echo "📄 Migration file location:"
echo "   $(pwd)/dashboard/migrations/2025_11_add_pcn_advance_amount_to_price_categories.sql"
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
    cat "dashboard/migrations/2025_11_add_pcn_advance_amount_to_price_categories.sql"
    echo ""
    echo "--- End of Migration File ---"
    echo ""
fi

echo "✅ After running the migration, your Price Category settings will include"
echo "   the new PCN Advance Amount field!"
echo ""
echo "Navigate to: Dashboard → Settings → Price Category to see the changes."
echo ""
