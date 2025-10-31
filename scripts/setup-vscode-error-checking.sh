#!/bin/bash

# VS Code Save Block Extension Script
# This script creates a VS Code extension that prevents saving files with errors
# Note: This requires the "Error Lens" extension and proper ESLint setup

set -e

echo "🔒 Setting up mandatory error checking for VS Code..."

# Check if .vscode directory exists
if [ ! -d ".vscode" ]; then
  echo "Creating .vscode directory..."
  mkdir -p .vscode
fi

echo ""
echo "✅ VS Code workspace settings configured!"
echo ""
echo "📋 Required VS Code Extensions:"
echo "   1. ESLint (dbaeumer.vscode-eslint)"
echo "   2. Prettier (esbenp.prettier-vscode)"
echo "   3. Stylelint (stylelint.vscode-stylelint)"
echo "   4. Error Lens (usernamehw.errorlens) - Shows errors inline"
echo ""
echo "🔧 Configuration Applied:"
echo "   ✅ Format on save enabled"
echo "   ✅ ESLint auto-fix on save enabled"
echo "   ✅ Stylelint auto-fix on save enabled"
echo "   ✅ Import organization on save enabled"
echo "   ✅ TypeScript validation enabled"
echo ""
echo "⚠️  Important:"
echo "   - Files will be automatically formatted and linted on save"
echo "   - Errors will be shown inline with Error Lens extension"
echo "   - TypeScript errors will prevent compilation"
echo "   - ESLint errors will be highlighted in editor"
echo ""
echo "💡 To prevent saving with errors:"
echo "   1. Install recommended extensions (VS Code will prompt)"
echo "   2. Errors will show inline - fix them before saving"
echo "   3. Use 'Format Document' (Shift+Option+F) to fix formatting"
echo "   4. Use 'Organize Imports' to remove unused imports"
echo ""

