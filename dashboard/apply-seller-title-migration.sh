#!/bin/bash

# Script to apply seller title migration to Supabase database
# This adds the title column to the sellers table

echo "🔧 Applying Seller Title Migration..."
echo "========================================"
echo ""
echo "This will add the 'title' column to the sellers table."
echo ""
echo "📋 Migration file: migrations/2025_01_add_title_to_sellers.sql"
echo ""
echo "Please run this SQL in your Supabase SQL Editor:"
echo ""
cat migrations/2025_01_add_title_to_sellers.sql
echo ""
echo "========================================"
echo "✅ Copy the SQL above and run it in Supabase SQL Editor"
echo ""
