# Linting & Error Checking Rules

## Overview
This document outlines the enhanced linting and error checking rules implemented based on real-world issues encountered during development. These rules help prevent common errors and maintain code quality.

## Issues Addressed

### 1. CSS Compatibility Issues
**Problem**: Missing vendor prefixes for CSS properties like `backdrop-filter` causing Safari compatibility issues.

**Rule**: Always include vendor prefixes before standard properties:
```css
/* ✅ Correct */
-webkit-backdrop-filter: blur(10px);
backdrop-filter: blur(10px);

/* ❌ Incorrect */
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
```

**Prevention**: Use autoprefixer or CSS linting tools to catch missing prefixes.

### 2. Form Accessibility
**Problem**: Form inputs without proper labels causing accessibility violations.

**Rule**: All form inputs must have:
- An associated `<label>` with `htmlFor` attribute
- Or `aria-label` attribute
- Or `aria-labelledby` attribute

```tsx
/* ✅ Correct */
<label htmlFor="email">Email</label>
<input id="email" type="email" />

<label htmlFor="toggle">
  <input id="toggle" type="checkbox" />
  Enable feature
</label>

/* ❌ Incorrect */
<input type="email" />
<input type="checkbox" />
```

### 3. Unused Imports and Variables
**Problem**: Unused imports and variables cluttering code and causing confusion.

**Rule**: 
- Remove unused imports immediately
- Use ESLint rule `@typescript-eslint/no-unused-vars` with error level
- Enable `no-unused-vars` for JavaScript files

### 4. Code Formatting
**Problem**: Inconsistent code formatting causing merge conflicts and readability issues.

**Rule**:
- Run Prettier before committing
- Use Prettier with consistent configuration
- Enable `prettier/prettier` as ESLint error rule

### 5. Duplicate Keys in JSON
**Problem**: Duplicate keys in `package.json` causing parsing errors.

**Rule**:
- Use JSON schema validation
- Enable ESLint rule `json/duplicate-keys` if available
- Manually review JSON files before committing

### 6. TypeScript Type Safety
**Problem**: Using undefined types or missing type definitions.

**Rule**:
- Enable strict TypeScript mode
- Use `@typescript-eslint/no-undef` rule
- Never use `any` without explicit justification
- Define types before using them

### 7. JSX/TSX Syntax Errors
**Problem**: Duplicate code blocks, unclosed tags, invalid attributes.

**Rule**:
- Enable React-specific ESLint rules
- Use `react/jsx-no-duplicate-props`
- Use `react/jsx-closing-tag-location`
- Validate JSX syntax with TypeScript compiler

### 8. ARIA Attributes
**Problem**: Invalid ARIA attribute values causing accessibility issues.

**Rule**:
- Use valid ARIA values: `true`, `false`, or valid strings
- For native form controls, ARIA attributes are often redundant
- Use `aria-checked` only for non-native checkboxes/radio buttons
- Validate ARIA attributes with accessibility linting tools

### 9. CSS Prefix Order
**Problem**: Vendor prefixes must come before standard properties.

**Rule**: Always order CSS properties:
```css
/* ✅ Correct order */
-webkit-backdrop-filter: blur(10px);
backdrop-filter: blur(10px);

/* ❌ Incorrect order */
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
```

## ESLint Configuration

### Backend Services (NestJS)
Enhanced ESLint rules for TypeScript services:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    // Enhanced rules based on experience
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

### Frontend React/TypeScript
For React portals, add React-specific rules:

```javascript
{
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:jsx-a11y/recommended', // Accessibility rules
  ],
  rules: {
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-closing-tag-location': 'error',
    'react/jsx-closing-bracket-location': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/label-has-for': 'off', // Deprecated, use label-has-associated-control
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
  },
}
```

## Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "semi": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## CSS Linting Rules

### Recommended CSS Best Practices

1. **Vendor Prefixes**: Always include `-webkit-` before standard properties
2. **Property Order**: Vendor prefixes → Standard properties
3. **CSS Variables**: Use for consistent theming
4. **Mobile-First**: Write mobile styles first, then desktop

### CSS Validation Checklist

- [ ] All `backdrop-filter` have `-webkit-backdrop-filter` before them
- [ ] Vendor prefixes come before standard properties
- [ ] No duplicate property declarations
- [ ] CSS variables are defined before use
- [ ] Responsive breakpoints are consistent

## Pre-commit Hooks

### Recommended Git Hooks

```bash
#!/bin/sh
# .husky/pre-commit

# Run linting
npm run lint

# Run Prettier
npm run format

# Run type checking
npm run type-check

# Prevent committing if any check fails
if [ $? -ne 0 ]; then
  echo "❌ Pre-commit checks failed. Please fix errors before committing."
  exit 1
fi
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Lint and Type Check

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run type-check
```

## Manual Review Checklist

Before committing code, verify:

- [ ] No unused imports or variables
- [ ] All form inputs have labels
- [ ] CSS vendor prefixes are correct
- [ ] TypeScript types are properly defined
- [ ] No duplicate code blocks
- [ ] ARIA attributes are valid (if used)
- [ ] JSON files have no duplicate keys
- [ ] Prettier formatting is applied
- [ ] ESLint passes without errors

## Common Mistakes to Avoid

1. **Copy-paste errors**: Always review code after copying, especially JSX
2. **Missing types**: Never use `any` without good reason
3. **Accessibility**: Always test with screen readers
4. **Cross-browser**: Test CSS in Safari, Chrome, Firefox
5. **Formatting**: Run Prettier before committing
6. **Imports**: Remove unused imports immediately

## Tools and Extensions

### Recommended VS Code Extensions

- ESLint
- Prettier
- Stylelint (for CSS)
- TypeScript and JavaScript Language Features
- Accessibility Insights for Web

### Package Scripts

```json
{
  "scripts": {
    "lint": "eslint \"src/**/*.{ts,tsx}\" --fix",
    "lint:check": "eslint \"src/**/*.{ts,tsx}\"",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit",
    "validate": "npm run lint:check && npm run format:check && npm run type-check"
  }
}
```

## Enforcement

These rules are enforced through:
1. ESLint configuration files
2. Prettier configuration files
3. Pre-commit hooks (recommended)
4. CI/CD pipeline checks
5. Code review process

## Updates

This document should be updated whenever new common errors are discovered or patterns emerge that could be prevented through linting rules.

