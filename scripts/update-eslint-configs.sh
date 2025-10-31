#!/bin/bash

# Script to update ESLint configurations across all services and portals
# Based on enhanced linting rules from real-world experience

set -e

echo "🔧 Updating ESLint configurations..."

# Backend services
SERVICES=(
  "services/clinical-workflow-service"
  "services/lab-service"
  "services/pharmacy-service"
  "services/radiology-service"
  "services/authentication-service"
  "services/patient-service"
)

# Frontend portals
PORTALS=(
  "provider-portal"
  "patient-portal"
  "admin-portal"
  "lab-portal"
  "pharmacy-portal"
  "billing-portal"
  "radiology-portal"
  "common-portal"
)

# Update backend service ESLint configs
echo "📦 Updating backend service ESLint configs..."
for service in "${SERVICES[@]}"; do
  if [ -d "$service" ]; then
    echo "  → $service"
    cp .eslintrc.backend.js "$service/.eslintrc.js"
    
    # Add lint scripts to package.json if they don't exist
    if [ -f "$service/package.json" ]; then
      if ! grep -q '"lint"' "$service/package.json"; then
        # This would require more sophisticated JSON manipulation
        echo "    ⚠️  Consider adding lint scripts to $service/package.json"
      fi
    fi
  fi
done

# Update frontend portal ESLint configs (if they have ESLint setup)
echo "🎨 Updating frontend portal ESLint configs..."
for portal in "${PORTALS[@]}"; do
  if [ -d "$portal" ]; then
    echo "  → $portal"
    if [ -f "$portal/.eslintrc.js" ] || [ -f "$portal/.eslintrc.json" ]; then
      cp .eslintrc.frontend.js "$portal/.eslintrc.js"
    else
      echo "    ⚠️  No ESLint config found, skipping (add ESLint setup first)"
    fi
  fi
done

echo ""
echo "✅ ESLint configurations updated!"
echo ""
echo "📝 Next steps:"
echo "   1. Install ESLint dependencies in portals if not already installed:"
echo "      npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-prettier eslint-config-prettier"
echo ""
echo "   2. Add lint scripts to package.json files:"
echo "      \"lint\": \"eslint 'src/**/*.{ts,tsx}' --fix\""
echo "      \"format\": \"prettier --write 'src/**/*.{ts,tsx,css}'\""
echo ""
echo "   3. Run linting:"
echo "      npm run lint:all"
echo ""

