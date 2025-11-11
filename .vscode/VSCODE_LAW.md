# VS Code Development Law Configuration

## Overview

This document explains the VS Code workspace configuration that enforces the project's development standards as defined in `/DEVELOPMENT_LAW.md` and `/CURSOR_SYSTEM_PROMPT.md`.

## Configuration Files

### 1. `.vscode/settings.json`

**Purpose**: Workspace-level settings that enforce code quality and standards

**Key Enforcements:**

- ✅ **Auto-format on save** using Prettier
- ✅ **ESLint fixes on save** (mandatory)
- ✅ **Organize imports automatically**
- ✅ **TypeScript strict validation**
- ✅ **Error highlighting** via ErrorLens
- ✅ **Healthcare terminology** spell check exceptions
- ✅ **Git branch protection** (main/master)
- ✅ **File nesting** for clean project structure
- ✅ **Path intellisense** for monorepo navigation

**Technology Stack Enforcement:**

```jsonc
// Prisma ONLY (NO TypeORM)
"[prisma]": {
  "editor.formatOnSave": true
}

// Material-UI ONLY (Tailwind removed from recommendations)
// See extensions.json for blocked extensions
```

**Healthcare Standards:**

```jsonc
"cSpell.words": [
  "FHIR", "HIPAA", "SNOMED", "LOINC", "HL7",
  "Prisma", "NestJS", "Zustand", "bcrypt", "CSRF", "PHI"
]
```

---

### 2. `.vscode/extensions.json`

**Purpose**: Define required and forbidden extensions

**Required Extensions:**

```
✅ ESLint - Linting
✅ Prettier - Formatting
✅ Prisma - Database ORM
✅ ErrorLens - Inline error display
✅ TypeScript Next - Latest TS features
✅ Pretty TS Errors - Better error messages
✅ Path Intellisense - Import suggestions
✅ ES7 React Snippets - MUI-compatible snippets
✅ PostgreSQL - Database management
✅ Docker - Container management
✅ GitLens - Git history
✅ Jest - Testing
✅ Code Spell Checker - Medical terms
```

**Forbidden Extensions (Conflicts with Stack):**

```
❌ TypeORM extensions (we use Prisma)
❌ Tailwind CSS (we use Material-UI)
❌ Alternative formatters (we use Prettier)
❌ Deprecated TypeScript extensions
```

**Installation:**

```bash
# VS Code will prompt to install recommended extensions
# Or manually: Ctrl+Shift+P -> "Extensions: Show Recommended Extensions"
```

---

### 3. `.vscode/launch.json`

**Purpose**: Debug configurations for all services

**Available Debuggers:**

#### Backend Services (NestJS + Prisma)

- 🔧 **Debug: Authentication Service** (Port 3001)
- 🔧 **Debug: Patient Service** (Port 3011)
- 🔧 **Debug: Encounter Service** (Port 3005)
- 🔧 **Debug: Clinical Workflow Service** (Port 3004)
- 🔧 **Debug: Lab Service** (Port 3013)
- 🔧 **Debug: Pharmacy Service** (Port 3012)
- 🔧 **Debug: Radiology Service** (Port 3014)

#### Frontend (React + Vite + MUI)

- 🌐 **Debug: Provider Portal (Chrome)** (Port 5174)
  - Includes source maps
  - Disables web security for CORS testing

#### Testing (Jest)

- 🧪 **Debug: Current Jest Test** - Debug active test file
- 🧪 **Debug: All Jest Tests** - Debug entire test suite

#### Compound Configurations

- 🚀 **Full Stack: Auth + Patient + Frontend**
  - Starts authentication service
  - Starts provider portal
  - Runs pre-launch validation task

**Usage:**

```bash
# 1. Set breakpoints in your code
# 2. Press F5 or select debug configuration
# 3. Debugger will attach and stop at breakpoints
```

---

### 4. `.vscode/snippets.code-snippets`

**Purpose**: Code snippets that enforce DEVELOPMENT_LAW.md patterns

**Available Snippets:**

#### Backend (NestJS + Prisma)

```typescript
// Prefix: nest-service
// Creates: Complete NestJS service with Prisma
// Includes: CRUD operations, soft delete, error handling

// Prefix: fhir-patient
// Creates: FHIR R4 Patient resource interface
// Compliant with: FHIR specification

// Prefix: hipaa-audit
// Creates: HIPAA audit log entry
// Includes: userId, action, resourceType, ipAddress, timestamp

// Prefix: nest-protected-route
// Creates: JWT-protected NestJS route
// Uses: JwtAuthGuard, RolesGuard

// Prefix: prisma-model
// Creates: Prisma model with required fields
// Includes: id, timestamps, soft delete, audit fields
```

#### Frontend (React + MUI)

```typescript
// Prefix: mui-component
// Creates: Material-UI component
// Uses: MUI components ONLY (Box, Typography, etc.)

// Prefix: zustand-store
// Creates: Zustand store with persistence
// Pattern: Global state management

// Prefix: react-query-hook
// Creates: React Query hooks (useQuery + useMutation)
// Pattern: Server state management

// Prefix: protected-route
// Creates: Protected route component
// Includes: Auth check, role-based access
```

#### Error Handling

```typescript
// Prefix: try-catch-hipaa
// Creates: Try-catch with HIPAA audit logging
// Logs: Success and failure cases
```

#### Testing

```typescript
// Prefix: jest-suite
// Creates: Jest test suite for NestJS service
// Includes: Mock setup, test structure
```

---

## Automatic Enforcement

### On Save (Automatic)

1. ✅ **Format code** with Prettier
2. ✅ **Fix ESLint errors** automatically
3. ✅ **Organize imports** alphabetically
4. ✅ **Trim trailing whitespace**
5. ✅ **Insert final newline**

### On Type (Real-time)

1. ✅ **Show TypeScript errors** inline
2. ✅ **Show ESLint warnings** inline
3. ✅ **Spell check** medical terminology
4. ✅ **Import suggestions** from monorepo paths

### Pre-Commit (Manual Check)

1. ✅ Run `npm run lint:all` (all services)
2. ✅ Run `npm run format:all` (all files)
3. ✅ Run `npm run type-check` (TypeScript validation)
4. ✅ Run `npm run validate` (full check)

---

## Development Workflow

### Starting Development

```bash
# 1. Open VS Code in project root
cd "/Users/helal/New Project"
code .

# 2. Install recommended extensions (VS Code will prompt)
# Or: Ctrl+Shift+P -> "Extensions: Show Recommended Extensions"

# 3. Start Docker services
docker-compose up -d

# 4. Start backend service in debug mode
# Press F5 -> Select "Debug: Authentication Service"

# 5. Start frontend in separate terminal
cd provider-portal
npm run dev

# 6. Open browser debugger
# Press F5 -> Select "Debug: Provider Portal (Chrome)"
```

### Writing Code

```bash
# 1. Use snippets (type prefix + Tab)
#    - nest-service (NestJS service)
#    - mui-component (React component)
#    - fhir-patient (FHIR resource)
#    - hipaa-audit (Audit logging)

# 2. Save file (Ctrl+S or Cmd+S)
#    - Auto-formats with Prettier
#    - Auto-fixes ESLint errors
#    - Auto-organizes imports

# 3. Check errors
#    - Inline errors via ErrorLens
#    - Problems panel (Ctrl+Shift+M)

# 4. Test code
#    - Set breakpoints
#    - Press F5 to debug
```

### Before Committing

```bash
# 1. Run full validation
npm run validate

# 2. Check all errors fixed
#    - No TypeScript errors
#    - No ESLint errors
#    - No failing tests

# 3. Review changes
git diff

# 4. Stage and commit
git add .
git commit -m "feat: descriptive message"

# 5. Push to GitHub
git push origin main
```

---

## Enforcement Rules

### Stack Requirements (MANDATORY)

| Technology         | Required                 | Forbidden                          |
| ------------------ | ------------------------ | ---------------------------------- |
| Backend Framework  | ✅ NestJS 10+            | ❌ Express, Fastify                |
| Database ORM       | ✅ Prisma                | ❌ TypeORM, Sequelize              |
| Database           | ✅ PostgreSQL 15+        | ❌ MySQL, MongoDB                  |
| Frontend Framework | ✅ React 18.2.0          | ❌ Vue, Angular                    |
| UI Library         | ✅ Material-UI v5.14.20+ | ❌ Tailwind, Bootstrap, Ant Design |
| State Management   | ✅ Zustand 4.5.7         | ❌ Redux, MobX                     |
| HTTP Client        | ✅ Axios 1.6.2           | ❌ Fetch, got                      |

### Healthcare Standards (MANDATORY)

| Standard  | Requirement                              | Validation                  |
| --------- | ---------------------------------------- | --------------------------- |
| FHIR R4   | All patient data MUST use FHIR resources | Check interfaces, endpoints |
| HIPAA     | All PHI access MUST be logged            | Verify audit_logs entries   |
| SNOMED CT | All diagnoses MUST use SNOMED CT codes   | Validate code system        |
| LOINC     | All lab tests MUST use LOINC codes       | Validate code system        |
| HL7 v2    | Support ADT messages                     | Test message parsing        |

### Security Requirements (CRITICAL)

| Requirement      | Implementation                   | Check                  |
| ---------------- | -------------------------------- | ---------------------- |
| Authentication   | JWT tokens (15m/7d expiry)       | Test /api/auth/login   |
| Password Hashing | bcrypt (10 rounds minimum)       | Check AuthService      |
| CSRF Protection  | X-XSRF-TOKEN header              | Test with curl         |
| Audit Logging    | Every PHI access logged          | Check audit_logs table |
| Encryption       | SSN, insurance numbers encrypted | Check database         |

### Code Quality (STRICT)

| Metric              | Minimum | Check Command        |
| ------------------- | ------- | -------------------- |
| Test Coverage       | 80%     | `npm run test:cov`   |
| TypeScript Errors   | 0       | `npm run type-check` |
| ESLint Errors       | 0       | `npm run lint:all`   |
| Prettier Formatting | 100%    | `npm run format:all` |

---

## Troubleshooting

### Extensions Not Installing

```bash
# Method 1: Install from recommendations
Ctrl+Shift+P -> "Extensions: Show Recommended Extensions"

# Method 2: Install manually
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension prisma.prisma
code --install-extension usernamehw.errorlens
```

### Formatter Not Working

```bash
# 1. Check Prettier extension installed
Ctrl+Shift+P -> "Extensions: Show Installed Extensions"

# 2. Set Prettier as default formatter
Ctrl+Shift+P -> "Preferences: Open Settings (JSON)"
# Add: "editor.defaultFormatter": "esbenp.prettier-vscode"

# 3. Reload VS Code
Ctrl+Shift+P -> "Developer: Reload Window"
```

### Debugger Not Attaching

```bash
# 1. Check service is running
npm run start:dev

# 2. Check debug port is free
lsof -i :9229

# 3. Kill existing process
kill -9 <PID>

# 4. Restart debugger
Press F5
```

### Import Errors

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Restart TypeScript server
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

---

## Quick Reference

### Keyboard Shortcuts

| Action            | Windows/Linux  | macOS         |
| ----------------- | -------------- | ------------- |
| Save & Format     | `Ctrl+S`       | `Cmd+S`       |
| Command Palette   | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Problems Panel    | `Ctrl+Shift+M` | `Cmd+Shift+M` |
| Debug             | `F5`           | `F5`          |
| Stop Debugging    | `Shift+F5`     | `Shift+F5`    |
| Toggle Breakpoint | `F9`           | `F9`          |
| Step Over         | `F10`          | `F10`         |
| Step Into         | `F11`          | `F11`         |

### Snippet Prefixes

| Prefix             | Creates         | Technology     |
| ------------------ | --------------- | -------------- |
| `nest-service`     | NestJS service  | Backend        |
| `fhir-patient`     | FHIR Patient    | Healthcare     |
| `hipaa-audit`      | Audit log entry | Security       |
| `mui-component`    | MUI component   | Frontend       |
| `zustand-store`    | Zustand store   | State          |
| `react-query-hook` | Query hooks     | Data fetching  |
| `prisma-model`     | Prisma model    | Database       |
| `try-catch-hipaa`  | Error + audit   | Error handling |

### Debug Configurations

| Configuration                 | Service  | Port |
| ----------------------------- | -------- | ---- |
| Debug: Authentication Service | Auth     | 3001 |
| Debug: Patient Service        | Patient  | 3011 |
| Debug: Provider Portal        | Frontend | 5174 |
| Debug: Current Jest Test      | Testing  | -    |

---

## Resources

- **Development Law**: `/DEVELOPMENT_LAW.md` - Complete development standards
- **System Prompt**: `/CURSOR_SYSTEM_PROMPT.md` - AI-enforced coding rules
- **Tasks**: See Tasks panel (Ctrl+Shift+B) for available build/test tasks
- **Settings**: `.vscode/settings.json` - Current configuration
- **Extensions**: `.vscode/extensions.json` - Required/forbidden extensions
- **Debuggers**: `.vscode/launch.json` - Debug configurations
- **Snippets**: `.vscode/snippets.code-snippets` - Code templates

---

## Compliance Checklist

Before merging any code, verify:

- [ ] All recommended VS Code extensions installed
- [ ] Code auto-formats on save (Prettier)
- [ ] ESLint errors auto-fix on save
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint:all`)
- [ ] All tests passing (`npm test`)
- [ ] FHIR R4 compliance for patient data
- [ ] HIPAA audit logs for PHI access
- [ ] SNOMED CT codes for diagnoses
- [ ] LOINC codes for lab tests
- [ ] JWT authentication working
- [ ] Login flow not broken
- [ ] Dashboard loads successfully
- [ ] No secrets in code or .env files
- [ ] Prisma migrations applied
- [ ] Code reviewed by at least one person

---

## Emergency Contacts

If you encounter issues that prevent development:

1. **Check DEVELOPMENT_LAW.md** - Contains all mandatory rules
2. **Check CURSOR_SYSTEM_PROMPT.md** - Contains AI coding guidelines
3. **Check this file** - Contains VS Code specific help
4. **Check terminal output** - Often shows the exact error
5. **Run validation**: `npm run validate` - Shows all issues at once

**Remember**: These configurations exist to prevent violations and ensure code quality. Don't disable them to "fix" errors - fix the code instead.
