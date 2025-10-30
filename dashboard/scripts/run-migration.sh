#!/bin/bash

# Migration Script: Add s3_key column to vehicle_images table
# Run this script to apply the database migration

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SUPABASE DATABASE MIGRATION - S3 Key Column                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  MANUAL MIGRATION REQUIRED"
echo ""
echo "Please follow these steps to apply the migration:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Open Supabase SQL Editor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Go to: https://wnorajpknqegnnmeotjf.supabase.co/project/_/sql"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Copy the SQL below"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat migrations/2025_01_add_s3_key_to_vehicle_images.sql
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Paste and Run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Paste the SQL into the Supabase SQL Editor"
echo "2. Click the 'RUN' button"
echo "3. Wait for success confirmation"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Verify"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After running the SQL, try publishing a vehicle again."
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  The migration SQL has been copied to your clipboard!          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Try to copy to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    cat migrations/2025_01_add_s3_key_to_vehicle_images.sql | pbcopy
    echo "✅ SQL copied to clipboard - just paste it in Supabase!"
    echo ""
fi
