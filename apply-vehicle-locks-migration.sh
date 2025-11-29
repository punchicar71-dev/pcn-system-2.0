#!/bin/bash

# Vehicle Locking System - Database Migration Script
# This script applies the vehicle locks table migration to your database

set -e  # Exit on error

echo "🔒 Vehicle Locking System - Database Migration"
echo "=============================================="
echo ""

# Load environment variables
if [ -f "dashboard/.env.local" ]; then
    source dashboard/.env.local
    echo "✅ Loaded environment variables from dashboard/.env.local"
else
    echo "❌ Error: dashboard/.env.local not found"
    echo "Please create it with your Supabase credentials"
    exit 1
fi

# Check if SUPABASE_URL and SUPABASE_ANON_KEY are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set in .env.local"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] && [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠️  Warning: Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY found"
    echo "You'll need to apply the migration manually via Supabase Dashboard"
    echo ""
    echo "Manual steps:"
    echo "1. Go to Supabase Dashboard → SQL Editor"
    echo "2. Copy contents of: dashboard/migrations/2025_11_25_add_vehicle_locks.sql"
    echo "3. Paste and run the SQL"
    exit 1
fi

echo "📍 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Check if supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found"
    echo ""
    echo "Applying migration..."
    
    cd dashboard
    supabase db push
    
    echo ""
    echo "✅ Migration applied successfully!"
else
    echo "⚠️  Supabase CLI not found"
    echo ""
    echo "Please apply the migration manually:"
    echo ""
    echo "Option 1: Via Supabase Dashboard (Recommended)"
    echo "--------------------------------------------"
    echo "1. Go to: $NEXT_PUBLIC_SUPABASE_URL/project/_/sql"
    echo "2. Copy contents of: dashboard/migrations/2025_11_25_add_vehicle_locks.sql"
    echo "3. Paste into SQL Editor"
    echo "4. Click 'Run'"
    echo ""
    echo "Option 2: Install Supabase CLI"
    echo "------------------------------"
    echo "npm install -g supabase"
    echo "supabase login"
    echo "supabase link --project-ref <your-project-ref>"
    echo "supabase db push"
    echo ""
fi

echo ""
echo "📚 Documentation: VEHICLE_LOCKING_SYSTEM.md"
echo "🧪 Test the implementation with two browsers after migration"
echo ""
echo "✨ Done!"
