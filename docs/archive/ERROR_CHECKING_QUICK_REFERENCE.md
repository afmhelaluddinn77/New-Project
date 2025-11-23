# Error Checking Rules - Quick Reference

## Common Issues & Solutions

### 1. CSS Vendor Prefixes

**Issue**: Missing or incorrect order of vendor prefixes
**Fix**: Always include `-webkit-` before standard properties

```css
-webkit-backdrop-filter: blur(10px); /* First */
backdrop-filter: blur(10px); /* Second */
```

### 2. Form Accessibility

**Issue**: Inputs without labels
**Fix**: Always use `<label htmlFor="id">` or `aria-label`

```tsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### 3. Unused Imports/Variables

**Issue**: Dead code cluttering files
**Fix**: Remove immediately or use `_` prefix for intentionally unused

```ts
// ❌ Bad
import { UnusedType } from "./types";

// ✅ Good
import { UsedType } from "./types";
// or
const _unusedVar = something; // Intentionally unused
```

### 4. Duplicate Code Blocks

**Issue**: Copy-paste errors creating duplicate JSX
**Fix**: Review code after copying, use ESLint to catch

```tsx
// ❌ Bad - duplicate
<input type="checkbox" />
<input type="checkbox" />

// ✅ Good
<input type="checkbox" />
```

### 5. TypeScript Type Errors

**Issue**: Using undefined types
**Fix**: Define types before use or import from correct location

```ts
// ❌ Bad
const status: WorkflowItemStatus = "COMPLETED"; // Type not defined

// ✅ Good
const status = "COMPLETED" as const; // or define type first
```

### 6. JSON Duplicate Keys

**Issue**: Same key appears twice in JSON
**Fix**: Review package.json manually, use JSON validator

```json
// ❌ Bad
{
  "dependencies": {
    "@nestjs/axios": "^4.0.1",
    "@nestjs/axios": "^4.0.1" // Duplicate!
  }
}
```

### 7. ARIA Attributes

**Issue**: Invalid ARIA values or redundant attributes
**Fix**: Use valid values or remove for native controls

```tsx
// ❌ Bad - aria-checked redundant for native checkbox
<input type="checkbox" aria-checked={enabled ? 'true' : 'false'} />

// ✅ Good - native checkbox handles this
<input type="checkbox" checked={enabled} />
```

## Quick Commands

```bash
# Lint all code
npm run lint:all

# Format all code
npm run format:all

# Validate JSON files
npm run validate:json

# Run all validations
npm run validate

# Check specific service
cd services/clinical-workflow-service && npm run lint
```

## Pre-Commit Checklist

- [ ] Run `npm run lint:all`
- [ ] Run `npm run format:all`
- [ ] Run `npm run validate:json` (NEW!)
- [ ] Check for duplicate code blocks
- [ ] Verify form inputs have labels
- [ ] Check CSS vendor prefixes are correct
- [ ] Remove unused imports
- [ ] Verify TypeScript types are defined
- [ ] Verify JSON files have required properties (NEW!)

## VS Code Extensions

Install these for automatic checking:

- ESLint
- Prettier
- Stylelint (for CSS)
- TypeScript and JavaScript Language Features

## CI/CD Integration

Add to your CI pipeline:

```yaml
- run: npm run validate
```

This will catch errors before they reach production.
