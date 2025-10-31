#!/bin/bash

# VS Code Save-Time JSON Validation
# This script validates JSON files and can be triggered on save
# Usage: Called automatically by VS Code or manually: ./scripts/validate-json-on-save.sh [file]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

validate_file() {
  local file=$1

  if [ ! -f "$file" ]; then
    echo "${RED}File not found: $file${NC}"
    return 1
  fi

  # Only validate JSON files
  if [[ ! "$file" == *.json ]]; then
    return 0
  fi

  # Validate JSON syntax
  if command -v python3 >/dev/null 2>&1; then
    if ! python3 -m json.tool "$file" >/dev/null 2>&1; then
      echo "${RED}❌ Invalid JSON syntax in $file${NC}"
      python3 -m json.tool "$file" 2>&1 | head -3
      return 1
    fi
  elif command -v node >/dev/null 2>&1; then
    if ! node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" >/dev/null 2>&1; then
      echo "${RED}❌ Invalid JSON syntax in $file${NC}"
      return 1
    fi
  fi

  # Check for missing version in VS Code config files
  if [[ "$file" == *"tasks.json" ]] || [[ "$file" == *"launch.json" ]]; then
    if ! grep -q '"version"' "$file" 2>/dev/null; then
      echo "${RED}❌ Missing required 'version' property in $file${NC}"
      return 1
    fi
  fi

  # Check for duplicate keys
  if grep -q '"@nestjs/axios"' "$file" 2>/dev/null; then
    COUNT=$(grep -c '"@nestjs/axios"' "$file" || echo "0")
    if [ "$COUNT" -gt 1 ]; then
      echo "${RED}❌ Duplicate key '@nestjs/axios' in $file${NC}"
      return 1
    fi
  fi

  # Check brace balance
  OPEN_BRACES=$(grep -o '{' "$file" | wc -l | tr -d ' ')
  CLOSE_BRACES=$(grep -o '}' "$file" | wc -l | tr -d ' ')

  if [ "$OPEN_BRACES" -ne "$CLOSE_BRACES" ]; then
    echo "${RED}❌ Mismatched braces in $file (found $OPEN_BRACES opening and $CLOSE_BRACES closing)${NC}"
    return 1
  fi

  return 0
}

if [ $# -eq 0 ]; then
  echo "Usage: $0 [file.json]"
  exit 1
fi

if validate_file "$1"; then
  echo "${GREEN}✅ Valid JSON${NC}"
  exit 0
else
  exit 1
fi

