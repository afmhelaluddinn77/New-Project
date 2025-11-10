#!/bin/bash

# Helper script to push to GitHub with authentication
# Usage: ./scripts/push-to-github.sh

set -e

echo "🚀 Pushing to GitHub..."
echo ""
echo "📋 Instructions:"
echo "   1. You'll be prompted for credentials"
echo "   2. Username: afmhelaluddinn77"
echo "   3. Password: Use your GitHub Personal Access Token (NOT your GitHub password)"
echo ""
echo "💡 Don't have a Personal Access Token?"
echo "   Create one at: https://github.com/settings/tokens"
echo "   Select scopes: repo (full control)"
echo ""

# Try to push
git push -u origin main

echo ""
echo "✅ Push completed successfully!"

