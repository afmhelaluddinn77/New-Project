#!/bin/bash

echo "🧪 Testing All Portal Logins..."
echo "================================"
echo ""

AUTH_SERVICE="http://localhost:3001/api/auth/login"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_login() {
    local portal=$1
    local email=$2
    local password=$3
    local portal_type=$4

    echo -e "${YELLOW}Testing $portal...${NC}"

    response=$(curl -s -w "\n%{http_code}" -X POST "$AUTH_SERVICE" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\",\"portalType\":\"$portal_type\"}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ $portal login successful${NC}"
        echo "   Email: $email"
        echo ""
        return 0
    else
        echo -e "${RED}❌ $portal login failed (HTTP $http_code)${NC}"
        echo "   Email: $email"
        echo "   Response: $body"
        echo ""
        return 1
    fi
}

# Test all portals
echo "Testing portal logins..."
echo ""

test_login "Admin Portal" "admin@example.com" "password123" "ADMIN"
test_login "IT Portal" "it@example.com" "password123" "ADMIN"
test_login "Engineering Portal" "engineer@example.com" "password123" "ADMIN"
test_login "HR Portal" "hr@example.com" "password123" "ADMIN"
test_login "Nurses Portal" "nurse@example.com" "password123" "PROVIDER"

echo "================================"
echo "Testing complete!"
echo ""
echo "Portal URLs:"
echo "  Admin: http://localhost:5175"
echo "  IT: http://localhost:5181"
echo "  Engineering: http://localhost:5183"
echo "  HR: http://localhost:5182"
echo "  Nurses: http://localhost:5180"
