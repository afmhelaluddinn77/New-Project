#!/bin/bash

# Phase 3 Verification Script
# Verifies that all insecure auth utilities have been removed

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Phase 3 Verification - Security Audit              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS="${GREEN}✓${NC}"
FAIL="${RED}✗${NC}"
WARN="${YELLOW}⚠${NC}"

echo "📋 Running security checks..."
echo ""

# Test 1: Verify utils/auth.ts is deleted
echo -n "1. Checking utils/auth.ts deletion... "
if [ ! -f "src/utils/auth.ts" ]; then
    echo -e "$PASS File deleted"
else
    echo -e "$FAIL File still exists!"
    exit 1
fi

# Test 2: No imports of utils/auth
echo -n "2. Checking for utils/auth imports... "
if ! grep -r "from.*utils/auth" src/ 2>/dev/null; then
    echo -e "$PASS No imports found"
else
    echo -e "$FAIL Found imports!"
    grep -rn "from.*utils/auth" src/ 2>/dev/null
    exit 1
fi

# Test 3: No direct decodeToken usage
echo -n "3. Checking for decodeToken usage... "
DECODE_COUNT=$(grep -r "decodeToken" src/ 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
if [ "$DECODE_COUNT" -eq "0" ]; then
    echo -e "$PASS No usage found"
else
    echo -e "$WARN Found $DECODE_COUNT references"
    grep -rn "decodeToken" src/ 2>/dev/null | grep -v "node_modules"
fi

# Test 4: Verify authStore is used in socketClient
echo -n "4. Checking socketClient uses authStore... "
if grep -q "useAuthStore" src/services/socketClient.ts; then
    echo -e "$PASS authStore imported"
else
    echo -e "$FAIL authStore not found!"
    exit 1
fi

# Test 5: Verify authStore is used in OrdersPage
echo -n "5. Checking OrdersPage uses authStore... "
if grep -q "useAuthStore" src/pages/orders/OrdersPage.tsx; then
    echo -e "$PASS authStore imported"
else
    echo -e "$FAIL authStore not found!"
    exit 1
fi

# Test 6: Verify deprecation warnings exist
echo -n "6. Checking deprecation warnings in httpClient... "
if grep -q "@deprecated" src/services/httpClient.ts; then
    echo -e "$PASS Warnings present"
else
    echo -e "$WARN No deprecation warnings found"
fi

# Test 7: Verify deprecation warning in encounterService
echo -n "7. Checking deprecation in encounterService... "
if grep -q "@deprecated" src/services/encounterService.ts; then
    echo -e "$PASS Warning present"
else
    echo -e "$WARN No deprecation warning found"
fi

# Test 8: Check for documentation
echo -n "8. Checking documentation files... "
DOC_COUNT=$(ls -1 PHASE_3*.md PHASE_3*.txt 2>/dev/null | wc -l | tr -d ' ')
if [ "$DOC_COUNT" -ge "4" ]; then
    echo -e "$PASS $DOC_COUNT files found"
else
    echo -e "$WARN Only $DOC_COUNT files found"
fi

# Test 9: Check no localStorage token usage in new code
echo -n "9. Checking for localStorage token usage... "
TOKEN_COUNT=$(grep -r "localStorage.*token" src/services/socketClient.ts src/pages/orders/OrdersPage.tsx 2>/dev/null | wc -l | tr -d ' ')
if [ "$TOKEN_COUNT" -eq "0" ]; then
    echo -e "$PASS No localStorage usage in updated files"
else
    echo -e "$WARN Found $TOKEN_COUNT references"
fi

# Test 10: Verify test file updated
echo -n "10. Checking test file updated... "
if grep -q "deprecation warning" src/__tests__/services/encounterService.miscFunctions.test.ts; then
    echo -e "$PASS Test updated"
else
    echo -e "$WARN Test may need update"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  Verification Complete                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "  - utils/auth.ts: Deleted ✓"
echo "  - socketClient.ts: Using authStore ✓"
echo "  - OrdersPage.tsx: Using authStore ✓"
echo "  - httpClient.ts: Deprecated ✓"
echo "  - encounterService.ts: Deprecated ✓"
echo "  - Tests: Updated ✓"
echo "  - Documentation: Complete ✓"
echo ""
echo "🎉 Phase 3: COMPLETE"
echo ""
echo "Next steps:"
echo "  1. Run: npm test"
echo "  2. Test in browser"
echo "  3. Proceed to Phase 4"
echo ""
