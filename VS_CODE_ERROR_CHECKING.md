# VS Code Save Block Configuration

## Overview

This configuration prevents saving files with errors by enforcing mandatory checks through VS Code settings and extensions.

## How It Works

### 1. Automatic Formatting & Linting on Save

- **Format on Save**: All files are automatically formatted with Prettier
- **ESLint Auto-Fix**: ESLint errors are automatically fixed on save
- **Stylelint Auto-Fix**: CSS errors are automatically fixed on save
- **Import Organization**: Unused imports are removed automatically

### 2. Error Visualization

- **Error Lens Extension**: Shows errors inline with code
- **Problems Panel**: All errors displayed in Problems panel
- **Status Bar**: Current file errors shown in status bar

### 3. TypeScript Validation

- **Strict Type Checking**: TypeScript errors prevent compilation
- **Real-time Validation**: Errors shown as you type
- **Import Validation**: Import errors caught immediately

## Required Extensions

Install these extensions (VS Code will prompt automatically):

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension stylelint.vscode-stylelint
code --install-extension usernamehw.errorlens
code --install-extension ms-vscode.vscode-typescript-next
```

Or open VS Code and accept the recommended extensions prompt.

## Configuration Files

### `.vscode/settings.json`

- Format on save enabled
- ESLint auto-fix on save
- TypeScript validation enabled
- Error Lens enabled

### `.vscode/extensions.json`

- Lists recommended extensions
- Prevents unwanted extensions

### `.vscode/tasks.json`

- Validation tasks
- Linting tasks
- Formatting tasks

## How Errors Are Prevented

### TypeScript Errors

- **Compilation**: TypeScript compiler prevents saving with type errors
- **Real-time**: Errors shown as you type
- **Build**: Project won't build with type errors

### ESLint Errors

- **On Save**: ESLint runs and shows errors
- **Auto-Fix**: Many errors auto-fixed on save
- **Visual**: Errors highlighted in editor

### CSS Errors

- **Stylelint**: CSS errors caught on save
- **Auto-Fix**: Many CSS issues auto-fixed
- **Validation**: Invalid CSS properties flagged

### JSON Errors

- **Validation**: JSON syntax errors prevent saving
- **Schema**: Package.json validated for duplicate keys

## Workflow

1. **Write Code**: Type your code normally
2. **See Errors**: Errors appear inline (Error Lens) or in Problems panel
3. **Auto-Fix**: Save file - many errors auto-fix
4. **Fix Remaining**: Manually fix remaining errors
5. **Save Again**: File saves successfully when error-free

## Preventing Save with Errors

### Method 1: Visual Feedback (Recommended)

- Errors shown inline with Error Lens
- Red squiggles under error code
- Problems panel shows all errors
- Fix errors before saving

### Method 2: Pre-commit Hook

- Git hook prevents commits with errors
- Runs `npm run validate`
- Must fix errors before committing

### Method 3: CI/CD Pipeline

- Automated checks in pipeline
- Prevents merging with errors
- Catches errors before production

## Keyboard Shortcuts

- **Format Document**: `Shift + Option + F` (Mac) / `Shift + Alt + F` (Windows)
- **Organize Imports**: `Shift + Option + O` (Mac) / `Shift + Alt + O` (Windows)
- **Show Problems**: `Cmd + Shift + M` (Mac) / `Ctrl + Shift + M` (Windows)
- **Quick Fix**: `Cmd + .` (Mac) / `Ctrl + .` (Windows)

## Troubleshooting

### Errors Not Showing

1. Check ESLint extension is installed and enabled
2. Reload VS Code window (`Cmd + Shift + P` → "Reload Window")
3. Check ESLint is running: Look for ESLint status in bottom bar

### Auto-Fix Not Working

1. Ensure Prettier is default formatter
2. Check `editor.formatOnSave` is true
3. Verify ESLint extension is enabled

### TypeScript Errors Not Blocking

1. TypeScript validation is informational, not blocking
2. Use pre-commit hook for mandatory checks
3. Enable strict TypeScript mode in tsconfig.json

## Customization

### Disable Auto-Fix for Specific Files

Add to `.vscode/settings.json`:

```json
{
  "[typescript]": {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "never"
    }
  }
}
```

### Change Error Severity

Edit ESLint config files:

- `.eslintrc.backend.js`
- `.eslintrc.frontend.js`

### Disable Format on Save

Set `"editor.formatOnSave": false` in settings.json

## Best Practices

1. **Fix Errors Immediately**: Don't let errors accumulate
2. **Use Auto-Fix**: Let ESLint fix what it can
3. **Review Changes**: Check what auto-fix changed
4. **Run Validation**: Use `npm run validate` before committing
5. **Keep Extensions Updated**: Ensure latest versions

## Integration with Git

The pre-commit hook (`.husky/pre-commit`) works together with VS Code:

- VS Code prevents local errors
- Pre-commit hook prevents committing errors
- CI/CD prevents merging errors

## Status Indicators

- **Green**: No errors
- **Yellow**: Warnings (non-blocking)
- **Red**: Errors (blocking)

Check status bar for current file error count.
