#!/bin/bash

# JBelt Doctor Web - API Connection Test Script
# Tests the backend API connectivity and authentication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 JBelt Doctor Web - API Connection Test${NC}"
echo "============================================="

# Read environment configuration
if [ -f ".env.development" ] && [ "$NODE_ENV" = "development" ]; then
    echo -e "${YELLOW}📁 Loading .env.development${NC}"
    source .env.development
elif [ -f ".env.production" ] && [ "$NODE_ENV" = "production" ]; then
    echo -e "${YELLOW}📁 Loading .env.production${NC}"
    source .env.production
elif [ -f ".env" ]; then
    echo -e "${YELLOW}📁 Loading .env (fallback)${NC}"
    source .env
else
    echo -e "${RED}❌ No .env file found${NC}"
    exit 1
fi

# Extract API host and port from NUXT_PUBLIC_API_BASE
API_BASE=${NUXT_PUBLIC_API_BASE:-"http://localhost:8080"}
echo -e "${YELLOW}🌐 API Base URL: ${API_BASE}${NC}"

# Test 1: Health Check
echo -e "\n${YELLOW}🏥 Testing Health Endpoint...${NC}"
if curl -f -s "${API_BASE}/management/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check successful${NC}"
    HEALTH_RESPONSE=$(curl -s "${API_BASE}/management/health")
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "   Backend may not be running on ${API_BASE}"
    exit 1
fi

# Test 2: Authentication
echo -e "\n${YELLOW}🔐 Testing Authentication...${NC}"
AUTH_RESPONSE=$(curl -s -X POST "${API_BASE}/api/authenticate" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin"}' \
    -w "%{http_code}")

HTTP_CODE="${AUTH_RESPONSE: -3}"
JSON_RESPONSE="${AUTH_RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Authentication successful${NC}"
    if echo "$JSON_RESPONSE" | grep -q "id_token"; then
        echo "   JWT Token received"
        TOKEN=$(echo "$JSON_RESPONSE" | grep -o '"id_token":"[^"]*"' | cut -d'"' -f4)
        echo "   Token length: ${#TOKEN} characters"
    else
        echo -e "${YELLOW}⚠️  No token in response${NC}"
    fi
else
    echo -e "${RED}❌ Authentication failed (HTTP $HTTP_CODE)${NC}"
    echo "   Response: $JSON_RESPONSE"
    exit 1
fi

# Test 3: Account endpoint (requires authentication)
echo -e "\n${YELLOW}👤 Testing Account Endpoint...${NC}"
if [ -n "$TOKEN" ]; then
    ACCOUNT_RESPONSE=$(curl -s "${API_BASE}/api/account" \
        -H "Authorization: Bearer $TOKEN" \
        -w "%{http_code}")
    
    HTTP_CODE="${ACCOUNT_RESPONSE: -3}"
    JSON_RESPONSE="${ACCOUNT_RESPONSE%???}"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Account endpoint accessible${NC}"
        if echo "$JSON_RESPONSE" | grep -q '"login"'; then
            LOGIN=$(echo "$JSON_RESPONSE" | grep -o '"login":"[^"]*"' | cut -d'"' -f4)
            echo "   Logged in as: $LOGIN"
        fi
    else
        echo -e "${RED}❌ Account endpoint failed (HTTP $HTTP_CODE)${NC}"
        echo "   Response: $JSON_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping account test (no token)${NC}"
fi

# Test 4: CORS preflight
echo -e "\n${YELLOW}🌍 Testing CORS Configuration...${NC}"
CORS_RESPONSE=$(curl -s -X OPTIONS "${API_BASE}/api/authenticate" \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -w "%{http_code}")

HTTP_CODE="${CORS_RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
    echo -e "${GREEN}✅ CORS configuration OK${NC}"
else
    echo -e "${YELLOW}⚠️  CORS may need configuration (HTTP $HTTP_CODE)${NC}"
fi

# Summary
echo -e "\n${GREEN}🎉 API Connection Test Complete${NC}"
echo "============================================="
echo -e "API Base URL: ${GREEN}${API_BASE}${NC}"
echo -e "Environment: ${GREEN}${NODE_ENV:-development}${NC}"
echo -e "Health Status: ${GREEN}OK${NC}"
echo -e "Authentication: ${GREEN}OK${NC}"

echo -e "\n${YELLOW}💡 Next Steps:${NC}"
echo "1. Start the frontend: ${GREEN}pnpm dev${NC}"
echo "2. Access the application: ${GREEN}http://localhost:3000${NC}"
echo "3. Login with: ${GREEN}admin / admin${NC}"

echo -e "\n${YELLOW}🔧 Troubleshooting:${NC}"
echo "- If health check fails: Verify backend is running"
echo "- If auth fails: Check backend user management"
echo "- If CORS fails: Check backend CORS configuration"