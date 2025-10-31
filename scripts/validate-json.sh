#!/bin/bash

# JSON Validation Script
# Validates JSON files for syntax errors and required properties
# Usage: ./scripts/validate-json.sh [file1.json] [file2.json] ...

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Function to validate JSON syntax
validate_json_syntax() {
  local file=$1

  # Check if file exists
  if [ ! -f "$file" ]; then
    echo "${RED}❌ File not found: $file${NC}"
    return 1
  fi

  # Check if it's a JSONC file (allows comments)
  # VS Code config files are validated by VS Code itself, so we skip syntax validation
  if [[ "$file" == *".jsonc" ]] || [[ "$file" == *"/.vscode/"* ]]; then
    # Skip syntax validation for JSONC files - VS Code handles this
    # We only check for required properties in check_required_properties()
    return 0
  fi

  # Standard JSON validation for non-JSONC files
  if command -v python3 >/dev/null 2>&1; then
    if ! python3 -m json.tool "$file" >/dev/null 2>&1; then
      echo "${RED}❌ Invalid JSON syntax in $file${NC}"
      python3 -m json.tool "$file" 2>&1 | head -5
      return 1
    fi
  elif command -v node >/dev/null 2>&1; then
    if ! node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" >/dev/null 2>&1; then
      echo "${RED}❌ Invalid JSON syntax in $file${NC}"
      return 1
    fi
  elif command -v jq >/dev/null 2>&1; then
    if ! jq empty "$file" 2>/dev/null; then
      echo "${RED}❌ Invalid JSON syntax in $file${NC}"
      jq empty "$file" 2>&1 | head -5
      return 1
    fi
  else
    echo "${YELLOW}⚠️  No JSON validator found (python3, node, or jq required)${NC}"
    return 0
  fi

  return 0
}

# Function to check for duplicate keys
check_duplicate_keys() {
  local file=$1

  # Skip JSONC files for duplicate key checking (comments can cause false positives)
  if [[ "$file" == *"/.vscode/"* ]]; then
    return 0
  fi

  # Simple check for common duplicate keys
  if grep -q '"@nestjs/axios"' "$file" 2>/dev/null; then
    COUNT=$(grep -c '"@nestjs/axios"' "$file" || echo "0")
    if [ "$COUNT" -gt 1 ]; then
      echo "${RED}❌ Duplicate key '@nestjs/axios' found in $file${NC}"
      return 1
    fi
  fi

  # Check for duplicate "version" keys (but allow in JSONC and schema definitions)
  if [[ ! "$file" == *"/.vscode/"* ]]; then
    # Only check for duplicate "version" at root level, not in schemas
    if grep -q '^[[:space:]]*"version"' "$file" 2>/dev/null; then
      COUNT=$(grep -c '^[[:space:]]*"version"' "$file" || echo "0")
      if [ "$COUNT" -gt 1 ]; then
        echo "${RED}❌ Duplicate key 'version' found in $file${NC}"
        return 1
      fi
    fi
  fi

  return 0
}

# Function to check for missing required properties
check_required_properties() {
  local file=$1

  # Check if it's a VS Code tasks.json file
  if [[ "$file" == *"tasks.json" ]]; then
    if ! grep -q '"version"' "$file" 2>/dev/null; then
      echo "${RED}❌ Missing required property 'version' in $file (VS Code tasks.json requires version)${NC}"
      return 1
    fi
  fi

  # Check if it's a VS Code launch.json file
  if [[ "$file" == *"launch.json" ]]; then
    if ! grep -q '"version"' "$file" 2>/dev/null; then
      echo "${RED}❌ Missing required property 'version' in $file (VS Code launch.json requires version)${NC}"
      return 1
    fi
  fi

  # Check if it's a package.json file
  if [[ "$file" == *"package.json" ]]; then
    if ! grep -q '"name"' "$file" 2>/dev/null; then
      echo "${YELLOW}⚠️  Warning: Missing 'name' property in $file${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi

  return 0
}

# Function to check JSON structure completeness
check_json_structure() {
  local file=$1

  # Count opening and closing braces
  OPEN_BRACES=$(grep -o '{' "$file" | wc -l | tr -d ' ')
  CLOSE_BRACES=$(grep -o '}' "$file" | wc -l | tr -d ' ')

  if [ "$OPEN_BRACES" -ne "$CLOSE_BRACES" ]; then
    echo "${RED}❌ Mismatched braces in $file (found $OPEN_BRACES opening and $CLOSE_BRACES closing)${NC}"
    return 1
  fi

  # Count opening and closing brackets
  OPEN_BRACKETS=$(grep -o '\[' "$file" | wc -l | tr -d ' ')
  CLOSE_BRACKETS=$(grep -o ']' "$file" | wc -l | tr -d ' ')

  if [ "$OPEN_BRACKETS" -ne "$CLOSE_BRACKETS" ]; then
    echo "${RED}❌ Mismatched brackets in $file (found $OPEN_BRACKETS opening and $CLOSE_BRACKETS closing)${NC}"
    return 1
  fi

  # Check for trailing commas (common JSON error)
  if grep -q ',\s*}' "$file" || grep -q ',\s*]' "$file"; then
    # Check if it's JSONC (allows comments)
    if [[ "$file" != *".jsonc" ]] && [[ "$file" != *"/.vscode/"* ]]; then
      echo "${YELLOW}⚠️  Warning: Potential trailing comma in $file${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi

  return 0
}

# Main validation function
validate_json_file() {
  local file=$1
  local has_errors=0

  echo "  Checking $file..."

  # Validate JSON syntax
  if ! validate_json_syntax "$file"; then
    has_errors=1
    ERRORS=$((ERRORS + 1))
  fi

  # Check for duplicate keys
  if ! check_duplicate_keys "$file"; then
    has_errors=1
    ERRORS=$((ERRORS + 1))
  fi

  # Check for missing required properties
  if ! check_required_properties "$file"; then
    has_errors=1
    ERRORS=$((ERRORS + 1))
  fi

  # Check JSON structure
  if ! check_json_structure "$file"; then
    has_errors=1
    ERRORS=$((ERRORS + 1))
  fi

  if [ $has_errors -eq 0 ]; then
    echo "    ${GREEN}✅ Valid${NC}"
  fi

  return $has_errors
}

# Main execution
if [ $# -eq 0 ]; then
  echo "Usage: $0 [file1.json] [file2.json] ..."
  echo "Or: find . -name '*.json' -not -path '*/node_modules/*' | xargs $0"
  exit 1
fi

echo "🔍 Validating JSON files..."
echo ""

for file in "$@"; do
  validate_json_file "$file"
done

echo ""
if [ $ERRORS -gt 0 ]; then
  echo "${RED}❌ Validation failed: $ERRORS error(s), $WARNINGS warning(s)${NC}"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo "${YELLOW}⚠️  Validation passed with $WARNINGS warning(s)${NC}"
  exit 0
else
  echo "${GREEN}✅ All JSON files are valid!${NC}"
  exit 0
fi

