# Enhanced Error Checking Scripts - JSON Validation

## 🎯 Overview

Updated error checking scripts now prevent JSON syntax errors, missing required properties, and structural issues before they cause problems.

## 🆕 New Scripts

### 1. `scripts/validate-json.sh`

Comprehensive JSON validation script that:

- ✅ Validates JSON syntax (skips JSONC files - VS Code handles those)
- ✅ Checks for duplicate keys (skips JSONC files)
- ✅ Validates required properties (e.g., "version" in tasks.json)
- ✅ Checks brace/bracket balance
- ✅ Provides clear error messages

**Usage:**

```bash
# Validate specific files
bash scripts/validate-json.sh file1.json file2.json

# Validate all JSON files
find . -name '*.json' -not -path '*/node_modules/*' | xargs bash scripts/validate-json.sh
```

### 2. `scripts/validate-json-on-save.sh`

Fast validation for on-save checking:

- ✅ Quick syntax validation
- ✅ Required property checks
- ✅ Duplicate key detection
- ✅ Brace balance validation

## 🔄 Updated Scripts

### Pre-commit Hook (`.husky/pre-commit`)

Enhanced with:

- ✅ Full JSON validation using `validate-json.sh`
- ✅ JSONC-aware validation (strips comments for VS Code config files)
- ✅ Checks for missing "version" in VS Code config files
- ✅ Syntax validation using Python/Node
- ✅ Duplicate key detection

### Package.json Scripts

Added:

```json
{
  "validate:json": "bash scripts/validate-json.sh ...",
  "validate": "npm run lint:all && npm run format:all && npm run type-check && npm run validate:json"
}
```

### VS Code Tasks

Added task: **"Validate: JSON Files"**

## 🛡️ Errors Prevented

### 1. Missing Closing Braces

**Error**: `Expected comma or closing brace`
**Prevention**:

- Brace balance checking
- VS Code JSON validation
- Pre-commit hook validation

### 2. Missing Required Properties

**Error**: `Missing property "version"`
**Prevention**:

- Schema validation in VS Code settings
- Pre-commit hook checks
- Validation script checks VS Code config files

### 3. Duplicate Keys

**Error**: `Duplicate object key`
**Prevention**:

- Pre-commit hook detects duplicates
- Validation script checks common duplicates
- VS Code shows errors inline

### 4. Invalid JSON Syntax

**Error**: `Unexpected token`, `Invalid JSON`
**Prevention**:

- Python/Node JSON parser validation
- VS Code JSON validation enabled
- Pre-commit hook validation

## 📋 JSONC Handling

**JSONC files** (JSON with Comments) are handled specially:

- **VS Code config files** (`.vscode/*.json`) - Syntax validation skipped (VS Code handles this)
- **Required properties** - Still checked (e.g., "version" in tasks.json)
- **Duplicate keys** - Skipped for JSONC files (comments can cause false positives)

## 🚀 Usage

### Manual Validation

```bash
# Validate all JSON files
npm run validate:json

# Validate specific file
bash scripts/validate-json.sh .vscode/tasks.json

# Validate on save (fast check)
bash scripts/validate-json-on-save.sh .vscode/settings.json
```

### Automatic Validation

- **Pre-commit**: Runs automatically before commits
- **VS Code**: Shows errors inline via JSON language server
- **VS Code Task**: Run "Validate: JSON Files" task

## ✅ Validation Results

### Success

```
✅ All JSON files are valid!
```

### Errors Found

```
❌ Validation failed: 2 error(s), 1 warning(s)
❌ Invalid JSON syntax in package.json
❌ Missing required property 'version' in .vscode/tasks.json
```

## 🔧 Configuration

### VS Code Settings

Added JSON schema validation:

```json
{
  "json.validate.enable": true,
  "json.schemas": [
    {
      "fileMatch": ["package.json"],
      "schema": {
        "required": ["name", "version"]
      }
    },
    {
      "fileMatch": ["**/.vscode/tasks.json"],
      "schema": {
        "required": ["version", "tasks"]
      }
    }
  ]
}
```

### Pre-commit Hook

Enhanced to use validation script with fallback:

- Uses `scripts/validate-json.sh` if available
- Falls back to basic validation if script missing
- Handles JSONC files properly

## 📊 Common JSON Errors Caught

1. **Missing Closing Brace**
   - Detected by brace balance check
   - Shows mismatch count

2. **Missing Version Property**
   - Required for VS Code config files
   - Checked by schema validation

3. **Duplicate Keys**
   - Common in package.json
   - Detected by pattern matching

4. **Invalid Syntax**
   - Caught by JSON parser
   - Shows exact error location

## 💡 Best Practices

1. **Validate Before Commit**: Pre-commit hook runs automatically
2. **Use VS Code**: Errors show inline as you type
3. **Run Validation Task**: Use VS Code task for bulk validation
4. **Fix Immediately**: Don't let JSON errors accumulate
5. **Check Required Properties**: Especially for VS Code config files

## 🔄 Integration Points

- ✅ Pre-commit hook
- ✅ VS Code settings
- ✅ VS Code tasks
- ✅ Package.json scripts
- ✅ CI/CD ready (can be added to pipeline)

## 📝 Examples

### Validating Before Commit

```bash
# Pre-commit hook runs automatically
git add .vscode/settings.json
git commit -m "Update settings"
# Hook validates JSON before commit
```

### Manual Validation

```bash
# Validate all workspace JSON files
npm run validate:json

# Validate specific file
bash scripts/validate-json.sh .vscode/tasks.json
```

### VS Code Task

1. Press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows)
2. Type "Tasks: Run Task"
3. Select "Validate: JSON Files"
4. View results in terminal

## ✅ Verification

Test the validation:

```bash
# Should pass
bash scripts/validate-json.sh .vscode/tasks.json package.json

# Should fail (if there are errors)
bash scripts/validate-json.sh invalid.json
```

Your JSON files are now protected from common errors! 🎉
