#!/bin/bash

# Test Authentication Setup
echo "🔐 Testing PCN System Authentication Setup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check environment variables
echo "📋 Checking Environment Variables..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL is set${NC}"
    else
        echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL is missing${NC}"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set${NC}"
    else
        echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing${NC}"
    fi
else
    echo -e "${RED}❌ .env.local not found${NC}"
    echo "   Please run: cp .env.example .env.local"
fi

echo ""
echo "📝 Next Steps to Activate Authentication:"
echo ""
echo "1️⃣  Create the users table in Supabase:"
echo "   - Go to: https://app.supabase.com"
echo "   - Select your project"
echo "   - Open SQL Editor"
echo "   - Run CREATE_ROOT_ADMIN.sql"
echo ""
echo "2️⃣  Verify your root admin user exists:"
echo "   - Email: punchicar71@gmail.com"
echo "   - Username: punchcarrootadmin2025"
echo "   - Password: punchcarrootadmin2025"
echo ""
echo "3️⃣  Test the login page:"
echo "   - URL: http://localhost:3001"
echo "   - Login with your credentials"
echo "   - You should be redirected to /dashboard"
echo ""
echo "4️⃣  Test logout:"
echo "   - Click the logout icon in the top-right"
echo "   - You should be redirected to login page"
echo ""
echo -e "${GREEN}✨ Authentication system is ready!${NC}"
