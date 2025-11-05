#!/bin/bash

# =============================================================================
# Complete Pending Vehicle Sales Migration Script
# =============================================================================
# This script helps apply the missing columns migration to pending_vehicle_sales
# Adds: customer_title and leasing_company_id columns
# =============================================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║     Complete Pending Vehicle Sales Migration                     ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  IMPORTANT: This migration adds missing columns to your database"
echo ""
echo "📋 This migration will:"
echo "   1. Add customer_title column (Mr., Miss., Mrs., Dr.)"
echo "   2. Add leasing_company_id column (UUID)"
echo "   3. Create foreign key constraint to leasing_companies"
echo "   4. Create performance indexes"
echo ""
echo "================================================"
echo "🎯 REQUIRED ACTIONS"
echo "================================================"
echo ""
echo "1️⃣  Open your Supabase Dashboard"
echo "    https://app.supabase.com"
echo ""
echo "2️⃣  Navigate to: SQL Editor"
echo ""
echo "3️⃣  Copy and paste the migration file content:"
echo "    📁 Location:"
echo "    $(pwd)/dashboard/migrations/2025_11_02_complete_pending_sales_migration.sql"
echo ""
echo "4️⃣  Click 'Run' button"
echo ""
echo "5️⃣  Verify the success message appears"
echo ""
echo "================================================"
echo ""

# Ask if user wants to view the migration file
read -p "Would you like to view the migration SQL now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "                    MIGRATION SQL CONTENT"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    cat "dashboard/migrations/2025_11_02_complete_pending_sales_migration.sql"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
fi

echo "📝 NOTES:"
echo "   • This migration is safe to run multiple times (uses IF NOT EXISTS)"
echo "   • customer_title is required for the sell vehicle flow"
echo "   • leasing_company_id is optional (only for Leasing payments)"
echo "   • All existing records will remain unchanged"
echo ""
echo "✅ After running the migration, your sell vehicle flow will work!"
echo ""
echo "================================================"
echo ""

# Ask if user wants to open Supabase
read -p "Would you like to open Supabase Dashboard now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "🌐 Opening Supabase Dashboard..."
    open "https://app.supabase.com"
fi

echo ""
echo "✨ Migration guide complete!"
echo ""
