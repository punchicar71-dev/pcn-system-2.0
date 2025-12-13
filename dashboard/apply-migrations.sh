#!/bin/bash

# ==========================================
# Apply Database Migrations for Multiple Sold-Out Records Feature
# ==========================================

echo "🚀 Applying database migrations..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Extract Supabase URL from .env.local
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d ' ')

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    exit 1
fi

# Extract the host from the URL (remove https:// and any path)
SUPABASE_HOST=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|http://||' | cut -d '/' -f1)

echo "📍 Supabase Host: $SUPABASE_HOST"
echo ""
echo "ℹ️  You will need to enter your database password when prompted"
echo ""

# Apply first migration (add snapshot columns)
echo "1️⃣  Applying: 2025_12_13_add_vehicle_snapshot_to_pending_sales.sql"
psql -h "$SUPABASE_HOST" -U postgres -d postgres -f migrations/2025_12_13_add_vehicle_snapshot_to_pending_sales.sql

if [ $? -eq 0 ]; then
    echo "✅ Snapshot columns migration applied successfully"
else
    echo "❌ Failed to apply snapshot columns migration"
    exit 1
fi

echo ""

# Apply second migration (allow multiple sold-out records)
echo "2️⃣  Applying: 2025_12_13_allow_multiple_soldout_records.sql"
psql -h "$SUPABASE_HOST" -U postgres -d postgres -f migrations/2025_12_13_allow_multiple_soldout_records.sql

if [ $? -eq 0 ]; then
    echo "✅ Multiple sold-out records migration applied successfully"
else
    echo "❌ Failed to apply multiple sold-out records migration"
    exit 1
fi

echo ""
echo "🎉 All migrations applied successfully!"
echo ""
echo "✅ Next steps:"
echo "   1. Refresh your browser (the app should already have hot-reloaded)"
echo "   2. Try marking a vehicle as sold out"
echo "   3. Check that it works without errors"
