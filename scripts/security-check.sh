#!/bin/bash

# Security Check Script for EMR/HMS System
# Run this before committing code or deploying

echo "🔒 EMR/HMS Security Check"
echo "========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file
check_file() {
    local file=$1
    local pattern=$2
    local message=$3
    local severity=$4
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        if [ "$severity" == "error" ]; then
            echo -e "${RED}❌ ERROR${NC}: $message"
            echo "   File: $file"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠️  WARNING${NC}: $message"
            echo "   File: $file"
            ((WARNINGS++))
        fi
    fi
}

# 1. Check for unprotected routes
echo "1️⃣  Checking for unprotected routes..."
for portal in patient-portal provider-portal admin-portal lab-portal pharmacy-portal billing-portal radiology-portal; do
    if [ -f "$portal/src/App.tsx" ]; then
        if grep -q 'path="/dashboard"' "$portal/src/App.tsx" && ! grep -q 'ProtectedRoute' "$portal/src/App.tsx"; then
            echo -e "${RED}❌ ERROR${NC}: Unprotected dashboard route found in $portal"
            ((ERRORS++))
        fi
    fi
done
echo -e "${GREEN}✓${NC} Route protection check complete"
echo ""

# 2. Check for hardcoded secrets
echo "2️⃣  Checking for hardcoded secrets..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -not -path "*/node_modules/*" -not -path "*/dist/*" | while read file; do
    check_file "$file" "password.*=.*['\"][^'\"]*['\"]" "Possible hardcoded password" "error"
    check_file "$file" "secret.*=.*['\"][^'\"]*['\"]" "Possible hardcoded secret" "error"
    check_file "$file" "api[_-]?key.*=.*['\"][^'\"]*['\"]" "Possible hardcoded API key" "error"
done
echo -e "${GREEN}✓${NC} Secret scanning complete"
echo ""

# 3. Check for missing ProtectedRoute validation
echo "3️⃣  Checking ProtectedRoute implementations..."
for portal in patient-portal provider-portal admin-portal lab-portal pharmacy-portal billing-portal radiology-portal; do
    if [ -f "$portal/src/components/ProtectedRoute.tsx" ]; then
        if ! grep -q "isTokenValidForPortal" "$portal/src/components/ProtectedRoute.tsx"; then
            echo -e "${RED}❌ ERROR${NC}: Missing token validation in $portal/src/components/ProtectedRoute.tsx"
            ((ERRORS++))
        fi
        if ! grep -q "payload.exp" "$portal/src/components/ProtectedRoute.tsx"; then
            echo -e "${RED}❌ ERROR${NC}: Missing expiration check in $portal/src/components/ProtectedRoute.tsx"
            ((ERRORS++))
        fi
        if ! grep -q "payload.portal" "$portal/src/components/ProtectedRoute.tsx"; then
            echo -e "${RED}❌ ERROR${NC}: Missing portal claim check in $portal/src/components/ProtectedRoute.tsx"
            ((ERRORS++))
        fi
    fi
done
echo -e "${GREEN}✓${NC} ProtectedRoute validation complete"
echo ""

# 4. Check CORS configuration
echo "4️⃣  Checking CORS configuration..."
if [ -f "services/authentication-service/src/main.ts" ]; then
    if grep -q "origin:.*\*" "services/authentication-service/src/main.ts"; then
        echo -e "${RED}❌ ERROR${NC}: Wildcard CORS origin found in authentication-service"
        ((ERRORS++))
    fi
    if ! grep -q "enableCors" "services/authentication-service/src/main.ts"; then
        echo -e "${YELLOW}⚠️  WARNING${NC}: CORS not configured in authentication-service"
        ((WARNINGS++))
    fi
fi
echo -e "${GREEN}✓${NC} CORS configuration check complete"
echo ""

# 5. Check for console.log of sensitive data
echo "5️⃣  Checking for console.log of sensitive data..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/dist/*" | while read file; do
    if grep -i "console.log.*password" "$file" 2>/dev/null | grep -v "HIPAA_AUDIT" > /dev/null; then
        echo -e "${YELLOW}⚠️  WARNING${NC}: Console.log of password in $file"
        ((WARNINGS++))
    fi
    if grep -i "console.log.*token" "$file" 2>/dev/null | grep -v "HIPAA_AUDIT" > /dev/null; then
        echo -e "${YELLOW}⚠️  WARNING${NC}: Console.log of token in $file"
        ((WARNINGS++))
    fi
done
echo -e "${GREEN}✓${NC} Console.log check complete"
echo ""

# 6. Check for HIPAA audit logging
echo "6️⃣  Checking for HIPAA audit logging..."
if [ -f "services/patient-service/src/patient/patient.controller.ts" ]; then
    if ! grep -q "HIPAA_AUDIT" "services/patient-service/src/patient/patient.controller.ts"; then
        echo -e "${RED}❌ ERROR${NC}: Missing HIPAA audit logging in patient-service"
        ((ERRORS++))
    fi
fi
echo -e "${GREEN}✓${NC} HIPAA audit logging check complete"
echo ""

# 7. Check for portal authorization in auth service
echo "7️⃣  Checking portal authorization..."
if [ -f "services/authentication-service/src/auth/auth.service.ts" ]; then
    if ! grep -q "user.portals.includes" "services/authentication-service/src/auth/auth.service.ts"; then
        echo -e "${RED}❌ ERROR${NC}: Missing portal authorization check in auth.service.ts"
        ((ERRORS++))
    fi
fi
echo -e "${GREEN}✓${NC} Portal authorization check complete"
echo ""

# Summary
echo "========================="
echo "📊 Security Check Summary"
echo "========================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    exit 0
else
    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}❌ Found $ERRORS error(s)${NC}"
    fi
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s)${NC}"
    fi
    echo ""
    echo "Please fix errors before committing."
    echo "Review SECURITY.md for guidelines."
    
    if [ $ERRORS -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
fi

