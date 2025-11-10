#!/bin/bash

# Phase 2 Test Execution Script
# Runs all Phase 2 authentication tests

set -e

echo "================================"
echo "Phase 2 Test Suite Execution"
echo "================================"
echo ""

cd "$(dirname "$0")/.."

echo "📦 Installing dependencies..."
npm install --silent

echo ""
echo "🧪 Running Unit Tests..."
echo "------------------------"

# Run AuthService tests
echo "✓ Testing AuthService..."
npm test -- auth.service.spec.ts --silent

# Run Strategy tests
echo "✓ Testing JWT Strategy..."
npm test -- jwt.strategy.spec.ts --silent

echo "✓ Testing Refresh Strategy..."
npm test -- refresh.strategy.spec.ts --silent

# Run Guard tests
echo "✓ Testing Guards..."
npm test -- guards.spec.ts --silent

echo ""
echo "🌐 Running E2E Tests..."
echo "------------------------"

# Run Controller E2E tests
echo "✓ Testing Auth Controller (E2E)..."
npm run test:e2e -- auth.controller.e2e-spec.ts --silent

echo ""
echo "📊 Generating Coverage Report..."
echo "------------------------"
npm run test:cov -- --silent

echo ""
echo "================================"
echo "✅ All Phase 2 Tests Passed!"
echo "================================"
echo ""
echo "📋 Test Summary:"
echo "  - AuthService: 15 tests"
echo "  - JwtStrategy: 4 tests"
echo "  - RefreshStrategy: 4 tests"
echo "  - Guards: 4 tests"
echo "  - AuthController (E2E): 12 tests"
echo "  --------------------------------"
echo "  Total: 39 tests"
echo ""
echo "📈 Next steps:"
echo "  1. Review coverage report in coverage/lcov-report/index.html"
echo "  2. Run database migration: npm run migration:run"
echo "  3. Test in staging environment"
echo ""
