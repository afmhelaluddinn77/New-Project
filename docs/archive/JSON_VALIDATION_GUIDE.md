# JSON Error Prevention - Updated Scripts

## Overview

Enhanced error checking scripts now catch JSON syntax errors, missing required properties, and structural issues before they cause problems.

## 🆕 New Scripts Created

### 1. `scripts/validate-json.sh`

Comprehensive JSON validation script that checks:

- ✅ JSON syntax validity
- ✅ Duplicate keys
- ✅ Missing required properties (e.g., "version" in tasks.json)
- ✅ Mismatched braces and brackets
- ✅ Trailing commas

**Usage:**

```bash
# Validate specific files
bash scripts/validate-json.sh file1.json file2.json

# Validate all JSON files
find . -name '*.json' -not -path '*/node_modules/*' | xargs bash scripts/validate-json.sh
```

### 2. `scripts/validate-json-on-save.sh`

Fast validation script for use on file save:

- ✅ Quick syntax check
- ✅ Required property validation
- ✅ Duplicate key detection
- ✅ Brace balance check

**Usage:**

```bash
bash scripts/validate-json-on-save.sh path/to/file.json
```

## 🔄 Updated Scripts

### Pre-commit Hook (`.husky/pre-commit`)

Now includes:

- ✅ Full JSON validation using `validate-json.sh`
- ✅ Fallback validation if script unavailable
- ✅ Checks for missing "version" in VS Code config files
- ✅ Syntax validation using Python/Node
- ✅ Duplicate key detection

### Package.json Scripts

Added new script:

```json
{
  "scripts": {
    "validate:json": "bash scripts/validate-json.sh ...",
    "validate": "npm run lint:all && npm run format:all && npm run type-check && npm run validate:json"
  }
}
```

### VS Code Tasks (`.vscode/tasks.json`)

Added new task:

- **"Validate: JSON Files"** - Validates all JSON files in workspace

## 🛡️ Errors Prevented

### 1. Missing Closing Braces

**Error**: `Expected comma or closing brace`
**Prevention**:

- Brace balance checking in validation script
- JSON syntax validation

### 2. Missing Required Properties

**Error**: `Missing property "version"`
**Prevention**:

- Schema validation in VS Code settings
- Pre-commit hook checks for required properties
- Validation script checks VS Code config files

### 3. Duplicate Keys

**Error**: `Duplicate object key`
**Prevention**:

- Pre-commit hook detects duplicates
- Validation script checks common duplicates

### 4. Invalid JSON Syntax

**Error**: `Unexpected token`, `Invalid JSON`
**Prevention**:

- Python/Node JSON parser validation
- VS Code JSON validation enabled

## 📋 Validation Checklist

Before saving JSON files, ensure:

- [ ] Valid JSON syntax (no syntax errors)
- [ ] All opening braces/brackets have closing pairs
- [ ] No duplicate keys
- [ ] Required properties present (e.g., "version" in tasks.json)
- [ ] No trailing commas (unless JSONC)

## 🚀 Usage

### Manual Validation

```bash
# Validate all JSON files
npm run validate:json

# Validate specific file
bash scripts/validate-json.sh .vscode/settings.json

# Validate on save (fast check)
bash scripts/validate-json-on-save.sh .vscode/tasks.json
```

### Automatic Validation

- **Pre-commit**: Runs automatically before commits
- **VS Code**: Shows errors inline via JSON language server
- **VS Code Task**: Run "Validate: JSON Files" task

### VS Code Integration

- JSON validation enabled in settings
- Schema validation for package.json, tasks.json, launch.json
- Errors shown inline and in Problems panel

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
- Checks for common errors

## 📊 Validation Results

### Success

```
✅ All JSON files are valid!
```

### Errors Found

```
❌ Validation failed: 2 error(s), 1 warning(s)
❌ Invalid JSON syntax in .vscode/settings.json
❌ Missing required property 'version' in .vscode/tasks.json
```

## 🎯 Common JSON Errors Caught

1. **Missing Closing Brace**
   - Detected by brace balance check
   - Shows mismatch count

2. **Missing Version Property**
   - Required for VS Code config files
   - Checked by schema validation

3. **Duplicate Keys**
   - Common in package.json
   - Detected by grep pattern matching

4. **Invalid Syntax**
   - Caught by JSON parser
   - Shows exact error location

## 💡 Best Practices

1. **Validate Before Commit**: Pre-commit hook runs automatically
2. **Use VS Code**: Errors show inline as you type
3. **Run Validation Task**: Use VS Code task for bulk validation
4. **Fix Immediately**: Don't let JSON errors accumulate

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
bash scripts/validate-json.sh .vscode/settings.json .vscode/tasks.json

# Should fail (if there are errors)
bash scripts/validate-json.sh invalid.json
```

Your JSON files are now protected from common errors! 🎉
