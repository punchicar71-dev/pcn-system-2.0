#!/bin/bash

# Seller Title Update - Database Migration Script
# This script helps you apply the database migrations for the seller title feature

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Seller Title Update - Database Migration              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found."
    echo ""
    echo "You have two options to apply the migrations:"
    echo ""
    echo "OPTION 1: Using Supabase Dashboard (Recommended)"
    echo "  1. Go to your Supabase project dashboard"
    echo "  2. Navigate to SQL Editor"
    echo "  3. Copy and paste the SQL from these files:"
    echo "     - dashboard/migrations/2025_01_add_title_to_sellers.sql"
    echo "     - dashboard/migrations/2025_01_add_customer_title_to_pending_sales.sql"
    echo "  4. Run each SQL script"
    echo ""
    echo "OPTION 2: Install Supabase CLI"
    echo "  Run: npm install -g supabase"
    echo "  Then run this script again"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI detected"
echo ""
echo "📁 Migration files to be applied:"
echo "  1. dashboard/migrations/2025_01_add_title_to_sellers.sql"
echo "  2. dashboard/migrations/2025_01_add_customer_title_to_pending_sales.sql"
echo ""
read -p "Do you want to apply these migrations? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Applying migrations..."
    echo ""
    
    cd dashboard
    
    # Apply migrations
    supabase db push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migrations applied successfully!"
        echo ""
        echo "Next steps:"
        echo "  1. Test the Add Vehicle flow (Step 2 - Seller Details)"
        echo "  2. Test the Sell Vehicle flow (Step 1 - Customer Details)"
        echo "  3. Test Edit Vehicle (Seller tab)"
        echo ""
    else
        echo ""
        echo "❌ Migration failed. Please check the error messages above."
        echo ""
        echo "Manual application instructions:"
        echo "  1. Go to Supabase Dashboard → SQL Editor"
        echo "  2. Copy contents of each migration file"
        echo "  3. Run each SQL script separately"
        echo ""
    fi
else
    echo ""
    echo "❌ Migration cancelled."
    echo ""
    echo "To apply manually:"
    echo "  1. Go to Supabase Dashboard → SQL Editor"
    echo "  2. Copy and paste SQL from migration files"
    echo "  3. Run each script"
    echo ""
fi

echo "📖 For more information, see: SELLER_TITLE_UPDATE.md"
echo ""
