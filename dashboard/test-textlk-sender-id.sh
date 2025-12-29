#!/bin/bash

# Test Text.lk Sender ID - Quick Testing Script
# After you get an approved Sender ID, use this script to test

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Text.lk Sender ID Testing Script"
echo "===================================="
echo ""

# Load from .env.local if exists
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Configuration - Use environment variables (no hardcoded tokens)
API_TOKEN="${TEXTLK_API_TOKEN}"
TEST_PHONE="${TEST_PHONE_NUMBER:-94771234567}"

if [ -z "$API_TOKEN" ]; then
    echo -e "${RED}❌ TEXTLK_API_TOKEN environment variable is required${NC}"
    echo "Please set it in your .env.local file"
    exit 1
fi

# Prompt for Sender ID
echo -e "${YELLOW}Enter the Sender ID you want to test:${NC}"
read SENDER_ID

if [ -z "$SENDER_ID" ]; then
    echo -e "${RED}Error: Sender ID cannot be empty${NC}"
    exit 1
fi

echo ""
echo "Testing with:"
echo "  Sender ID: $SENDER_ID"
echo "  Phone: $TEST_PHONE"
echo ""

# Test the API
echo -e "${YELLOW}Sending test SMS...${NC}"
RESPONSE=$(curl -s --request POST 'https://app.text.lk/api/v3/sms/send' \
  --header "Authorization: Bearer $API_TOKEN" \
  --header 'Content-Type: application/json' \
  --data "{
    \"recipient\": \"$TEST_PHONE\",
    \"sender_id\": \"$SENDER_ID\",
    \"type\": \"plain\",
    \"message\": \"Test from PCN System. Your verification code is: 123456\"
  }")

echo ""
echo "Response:"
echo "$RESPONSE" | jq .

# Check if successful
if echo "$RESPONSE" | jq -e '.status == "success"' > /dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}✅ SUCCESS! SMS sent successfully!${NC}"
    echo -e "${GREEN}Check your phone: $TEST_PHONE${NC}"
    echo ""
    echo "🎉 This Sender ID is APPROVED: $SENDER_ID"
    echo ""
    echo "Next steps:"
    echo "1. Update Supabase Edge Function:"
    echo "   supabase secrets set TEXTLK_SENDER_ID=\"$SENDER_ID\""
    echo ""
    echo "2. Update .env.local:"
    echo "   TEXTLK_SENDER_ID=$SENDER_ID"
    echo ""
    echo "3. Redeploy Edge Function:"
    echo "   supabase functions deploy send-sms-otp"
else
    echo ""
    echo -e "${RED}❌ FAILED${NC}"
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.message // "Unknown error"')
    echo "Error: $ERROR_MSG"
    echo ""
    echo "Common issues:"
    echo "1. Sender ID not approved - Check Text.lk dashboard"
    echo "2. Account expired - Recharge at app.text.lk"
    echo "3. Invalid format - Use alphanumeric, max 11 chars"
fi

echo ""
echo "===================================="
