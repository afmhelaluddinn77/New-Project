# Project Laws & Best Practices - Lessons from CBC Workflow

## Date: November 11, 2025
## Status: 📜 OFFICIAL PROJECT LAWS

---

## 🎯 Purpose

This document codifies all lessons learned from building and debugging the CBC workflow into **project laws** that MUST be followed to prevent similar issues in future development.

---

## 📋 Table of Contents

1. [Import Management Laws](#import-management-laws)
2. [CORS Configuration Laws](#cors-configuration-laws)
3. [RBAC Header Management Laws](#rbac-header-management-laws)
4. [Authentication & Session Laws](#authentication--session-laws)
5. [API Client Configuration Laws](#api-client-configuration-laws)
6. [Environment Variable Laws](#environment-variable-laws)
7. [Error Handling Laws](#error-handling-laws)
8. [Testing Laws](#testing-laws)
9. [Documentation Laws](#documentation-laws)
10. [Debugging Laws](#debugging-laws)

---

## 🔐 API RESPONSE FIELD NAME LAWS

### **LAW #0: ALWAYS Verify API Response Field Names (CRITICAL)**
**Rule:** NEVER assume API response field names. Always verify the exact field names returned by the backend.

**What Went Wrong:**
```typescript
// ❌ WRONG - Assumed snake_case field name
setAuthToken(response.data.access_token)
// Result: undefined value, login succeeds but no token saved, silent failure

// Backend actually returned:
{
  "accessToken": "eyJhbGci...",  // camelCase!
  "user": {...}
}
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Use exact field name from API
setAuthToken(response.data.accessToken)  // camelCase matches backend

// ✅ BETTER - Test the endpoint first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}'
// Check the actual response structure!
```

**Why This Is Critical:**
- Silent failures are the hardest to debug
- Login appears to work (200 OK) but token never saves
- No console errors (undefined is a valid value)
- User stays on login page with no feedback
- Wastes hours debugging the wrong layer

**Enforcement:**
1. ✅ **ALWAYS** test auth endpoints with curl FIRST
2. ✅ **ALWAYS** log response.data in dev mode
3. ✅ **NEVER** assume field names match other projects
4. ✅ **DOCUMENT** all API response schemas
5. ✅ **USE TypeScript interfaces** for API responses

**Prevention:**
```typescript
// Define response interface
interface LoginResponse {
  accessToken: string;  // Not access_token!
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Use it
const response = await axios.post<LoginResponse>('/api/auth/login', data);
setAuthToken(response.data.accessToken);  // TypeScript will catch errors!
```

---

## 🔐 IMPORT MANAGEMENT LAWS

### **LAW #1: Import Before Use**
**Rule:** ALWAYS import icons/components BEFORE using them in JSX.

**What Went Wrong:**
```typescript
// ❌ WRONG - Used Eye without importing
<Eye size={14} />
// Result: ReferenceError: Eye is not defined, blank screen
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Import first
import { Eye, Activity, ClipboardCheck } from "lucide-react";

// Then use
<Eye size={14} />
```

**Enforcement:**
- [ ] Always check imports when adding new icons
- [ ] Use IDE auto-import features
- [ ] Run linter before committing
- [ ] Test in browser immediately after adding new components

---

### **LAW #2: Alphabetize Imports**
**Rule:** Keep imports alphabetized for easy scanning and duplicate detection.

**Correct Pattern:**
```typescript
import {
  Activity,
  ClipboardCheck,
  Eye,          // ✅ Alphabetical order
  FlaskConical,
  Pill,
  Scan,
} from "lucide-react";
```

**Enforcement:**
- [ ] Use ESLint with import sorting plugin
- [ ] Pre-commit hook to sort imports
- [ ] Code review checklist item

---

## 🌐 CORS CONFIGURATION LAWS

### **LAW #3: Explicit Header Whitelisting**
**Rule:** ALWAYS explicitly whitelist ALL custom headers in CORS configuration.

**What Went Wrong:**
```typescript
// ❌ WRONG - Missing custom headers
app.enableCors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Missing: x-user-role, x-user-id, x-portal, X-XSRF-TOKEN
});
// Result: "Request header field x-user-role is not allowed"
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Whitelist ALL custom headers
app.enableCors({
  origin: [
    'http://localhost:5172',
    'http://localhost:5173',
    'http://localhost:5174',
    // ... all portal ports
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-role',      // ✅ Custom RBAC headers
    'x-user-id',
    'x-portal',
    'X-XSRF-TOKEN',     // ✅ CSRF protection
  ],
});
```

**Enforcement:**
- [ ] Document ALL custom headers in API specification
- [ ] Create CORS configuration template
- [ ] Add to service setup checklist
- [ ] Test CORS with actual frontend requests

---

### **LAW #4: Match Frontend and Backend Origins**
**Rule:** Backend CORS origins MUST match frontend dev server ports exactly.

**Correct Pattern:**
```typescript
// Backend CORS config
origin: ['http://localhost:5174', 'http://localhost:5176']

// Must match frontend dev servers
// provider-portal: npm run dev -- --port 5174
// lab-portal: npm run dev -- --port 5176
```

**Enforcement:**
- [ ] Document all portal ports in README
- [ ] Use environment variables for origins
- [ ] Add port validation in startup script

---

## 🔑 RBAC HEADER MANAGEMENT LAWS

### **LAW #5: Always Send User ID and Role**
**Rule:** EVERY API request MUST include `x-user-id` AND `x-user-role` headers.

**What Went Wrong:**
```typescript
// ❌ WRONG - Missing headers
axios.get('/api/workflow/orders', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Result: 403 Forbidden - RolesGuard requires x-user-role
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Include all required headers
axios.get('/api/workflow/orders', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-user-id': userId,
    'x-user-role': 'PROVIDER',
    'x-portal': 'PROVIDER',
  }
});
```

**Enforcement:**
- [ ] Use centralized AuthHeaderManager
- [ ] Never hardcode user IDs (extract from JWT)
- [ ] Add request interceptor to ALL axios clients
- [ ] Log headers in development mode

---

### **LAW #6: Service-to-Service Role Mapping**
**Rule:** When one service calls another, use the SERVICE role, not the user's role.

**What Went Wrong:**
```typescript
// ❌ WRONG - Workflow service sending user's role
headers: { 'x-user-role': 'LAB_TECH' }
// Lab service expects: CLINICAL_WORKFLOW or PROVIDER
// Result: 403 Forbidden
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Service-to-service role
const resolveServiceRole = (itemType) => {
  switch (itemType) {
    case 'LAB':
      return 'CLINICAL_WORKFLOW'; // Service role!
    case 'PHARMACY':
      return 'PHARMACIST';
    default:
      return 'SYSTEM';
  }
};
```

**Role Mapping Table:**

| Source | Target Service | Required Role |
|--------|---------------|---------------|
| Workflow → Lab | POST /orders | CLINICAL_WORKFLOW or PROVIDER |
| Workflow → Pharmacy | POST /prescriptions | CLINICAL_WORKFLOW or PHARMACIST |
| Provider Portal → Workflow | Any endpoint | PROVIDER |
| Lab Portal → Lab Service | Any endpoint | LAB_TECH |

**Enforcement:**
- [ ] Document role requirements for EVERY endpoint
- [ ] Create role mapping configuration file
- [ ] Add role validation in RolesGuard
- [ ] Test inter-service calls with correct roles

---

### **LAW #7: Extract User ID from JWT**
**Rule:** If `user.id` is undefined, ALWAYS extract it from the JWT token.

**Correct Pattern:**
```typescript
// ✅ CORRECT - Fallback to JWT extraction
const getUserId = (user, token) => {
  // Try user object first
  if (user?.id) return user.id;
  
  // Fallback: Extract from JWT
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.userId || payload.id;
  } catch {
    throw new AuthenticationError('Unable to determine user ID');
  }
};
```

**Enforcement:**
- [ ] Never use hardcoded fallback IDs in production
- [ ] Always log when JWT extraction is used
- [ ] Fix auth store to include user.id on login

---

## 🔐 AUTHENTICATION & SESSION LAWS

### **LAW #8: Run SessionLoader Only Once**
**Rule:** SessionLoader MUST run only once on app mount, never on route changes.

**What Went Wrong:**
```typescript
// ❌ WRONG - Runs on every render
useEffect(() => {
  init();
}, [setStatus, setUserAndToken, status]); // Dependencies cause re-runs
// Result: Repeated logout, session thrashing
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Run once with guard
const [hasRun, setHasRun] = useState(false);

useEffect(() => {
  if (hasRun) return; // Guard against re-runs
  setHasRun(true);
  
  init();
}, []); // Empty dependencies = run ONCE
```

**Enforcement:**
- [ ] Use `hasRun` state in all init effects
- [ ] Empty dependency array for one-time operations
- [ ] Test by navigating between routes

---

### **LAW #9: Skip CSRF for Refresh Endpoint**
**Rule:** The `/auth/refresh` endpoint MUST skip CSRF validation.

**What Went Wrong:**
```typescript
// ❌ WRONG - Global CSRF applied to everything
app.use(csurf({ cookie: {...} }));
// Result: "invalid csrf token" on refresh
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Conditional CSRF middleware
app.use((req, res, next) => {
  if (req.path === '/api/auth/refresh') {
    return next(); // Skip CSRF for refresh
  }
  csurf({ cookie: {...} })(req, res, next);
});
```

**Rationale:** Refresh endpoint is already protected by HttpOnly refresh cookie.

**Enforcement:**
- [ ] Document CSRF-exempt endpoints
- [ ] Test refresh flow specifically
- [ ] Add comment explaining why CSRF is skipped

---

## 🌐 API CLIENT CONFIGURATION LAWS

### **LAW #10: Separate Axios Instances for Each Service**
**Rule:** Create DEDICATED axios instances for each backend service.

**What Went Wrong:**
```typescript
// ❌ WRONG - Absolute URL bypasses interceptors
axios.get('http://localhost:3004/api/workflow/orders');
// Interceptors not applied!
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - Dedicated client with interceptors
const workflowClient = axios.create({
  baseURL: 'http://localhost:3004',
  withCredentials: true,
});

workflowClient.interceptors.request.use((config) => {
  const headers = headerManager.getRequiredHeaders('PROVIDER');
  config.headers = { ...config.headers, ...headers };
  return config;
});

// Use relative URLs
workflowClient.get('/api/workflow/orders'); // ✅ Interceptors applied
```

**Required Axios Clients:**
- `api` → Auth service (3001)
- `workflowClient` → Workflow service (3004)
- `encounterClient` → Encounter service (3005)
- `labClient` → Lab service (3013)

**Enforcement:**
- [ ] Never use absolute URLs with axios
- [ ] Create client in separate file (e.g., `workflowApi.ts`)
- [ ] Test that headers are applied (console.log in interceptor)

---

### **LAW #11: Centralized Auth Header Management**
**Rule:** Use AuthHeaderManager class for ALL header generation.

**Correct Pattern:**
```typescript
// ✅ CORRECT - Centralized header manager
const headerManager = createAuthHeaderManager(() => useAuthStore.getState());

// In interceptor
try {
  const headers = headerManager.getRequiredHeaders('PROVIDER');
  config.headers = { ...config.headers, ...headers };
} catch (error) {
  if (error instanceof AuthenticationError) {
    window.location.href = '/login';
  }
  throw error;
}
```

**Benefits:**
- Single source of truth for header logic
- Consistent error handling
- Easy to update all clients at once
- Type-safe header generation

**Enforcement:**
- [ ] Never manually construct auth headers
- [ ] Import AuthHeaderManager in all API files
- [ ] Add fallback redirect to login on auth errors

---

## 🔧 ENVIRONMENT VARIABLE LAWS

### **LAW #12: Validate Environment Variables on Startup**
**Rule:** Validate ALL required environment variables before app starts.

**Correct Pattern:**
```typescript
// ✅ CORRECT - Zod validation on startup
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_GATEWAY_URL: z.string().url(),
  VITE_AUTH_SERVICE_URL: z.string().url(),
  VITE_WORKFLOW_SERVICE_URL: z.string().url(),
});

export const config = envSchema.parse(import.meta.env);
// Throws clear error if variables missing or invalid
```

**Enforcement:**
- [ ] Create `.env.example` with all variables
- [ ] Add validation in `src/config.ts`
- [ ] Document each variable's purpose
- [ ] Fail fast on missing variables

---

### **LAW #13: Restart Dev Server After .env Changes**
**Rule:** ALWAYS restart Vite dev server after changing `.env` files.

**What Went Wrong:**
```bash
# Changed .env file
VITE_API_GATEWAY_URL=http://localhost:3001/api

# Didn't restart - old value still cached!
# Result: Requests still going to wrong URL
```

**Correct Procedure:**
```bash
# 1. Stop dev server (Ctrl+C)
# 2. Change .env file
# 3. Restart dev server
npm run dev -- --port 5174
```

**Enforcement:**
- [ ] Add reminder comment in .env file
- [ ] Document in README
- [ ] Add to troubleshooting guide

---

## 🚨 ERROR HANDLING LAWS

### **LAW #14: User-Friendly Error Messages**
**Rule:** NEVER show technical errors to users. Translate to user-friendly messages.

**Correct Pattern:**
```typescript
// ✅ CORRECT - User-friendly error handler
const errorMap = {
  401: {
    title: 'Session Expired',
    message: 'Please log in again.',
    action: 'LOGIN',
  },
  403: {
    title: 'Access Denied',
    message: 'You don\'t have permission for this action.',
    action: 'CONTACT_SUPPORT',
  },
  500: {
    title: 'System Error',
    message: 'An unexpected error occurred. Please try again later.',
    action: 'RETRY',
  },
};

// Show user-friendly message
toast.error(errorMap[error.status].title);

// Log technical details for debugging
console.error('Technical details:', error.message, error.stack);
```

**Enforcement:**
- [ ] Create ErrorHandler utility class
- [ ] Map all HTTP status codes
- [ ] Always log technical details separately
- [ ] Test error scenarios

---

### **LAW #15: Comprehensive Error Logging**
**Rule:** Log errors with FULL context (request, user, timestamp, headers).

**Correct Pattern:**
```typescript
// ✅ CORRECT - Comprehensive error logging
this.logger.error({
  message: error.message,
  stack: error.stack,
  request: {
    method,
    url,
    headers: sanitizeHeaders(headers),
    body: sanitizeBody(body),
  },
  user: {
    id: headers['x-user-id'],
    role: headers['x-user-role'],
    portal: headers['x-portal'],
  },
  timestamp: new Date().toISOString(),
});
```

**Enforcement:**
- [ ] Create ErrorLoggingInterceptor
- [ ] Apply to all NestJS services
- [ ] Store errors in database for analytics
- [ ] Set up error monitoring (Sentry, etc.)

---

## 🧪 TESTING LAWS

### **LAW #16: Test Critical Paths End-to-End**
**Rule:** EVERY critical user journey MUST have an E2E test.

**Required E2E Tests:**
1. **Login Flow** - Provider & Lab portals
2. **Order Creation** - From provider portal
3. **Order Fulfillment** - Lab tech enters results
4. **Result Viewing** - Provider sees results

**Correct Pattern:**
```typescript
// ✅ CORRECT - E2E test for CBC workflow
test('Complete CBC workflow', async ({ page }) => {
  // 1. Provider login
  await page.goto('http://localhost:5174/login');
  await page.fill('[name="email"]', 'provider@example.com');
  await page.click('button[type="submit"]');
  
  // 2. Create CBC order
  await page.goto('http://localhost:5174/orders');
  await page.check('[name="laboratory"]');
  await page.click('button:has-text("Launch")');
  
  // 3. Extract order ID
  const orderId = await page.locator('.order-detail h2').textContent();
  
  // 4. Lab tech login (new context)
  const labContext = await browser.newContext();
  const labPage = await labContext.newPage();
  await labPage.goto('http://localhost:5176/login');
  
  // 5. Enter results
  await labPage.fill('[name="value"]', 'WBC: 7.2');
  await labPage.click('button:has-text("Submit")');
  
  // 6. Verify in provider portal
  await page.goto('http://localhost:5174/results');
  await expect(page.locator(`tr:has-text("${orderId}")`))
    .toContainText('COMPLETED');
});
```

**Enforcement:**
- [ ] Write E2E tests BEFORE implementing features
- [ ] Run E2E tests in CI/CD pipeline
- [ ] Test error scenarios, not just happy paths
- [ ] Use Playwright for cross-browser testing

---

### **LAW #17: Test RBAC Scenarios**
**Rule:** Test that each endpoint correctly enforces role requirements.

**Required RBAC Tests:**
```typescript
// ✅ CORRECT - Test role enforcement
test('403 when wrong role', async ({ request }) => {
  const response = await request.post('/api/lab/orders', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-user-role': 'PHARMACIST', // Wrong role!
    },
    data: orderData,
  });
  
  expect(response.status()).toBe(403);
  expect(await response.json()).toMatchObject({
    message: expect.stringContaining('Forbidden'),
  });
});
```

**Enforcement:**
- [ ] Test each endpoint with correct AND incorrect roles
- [ ] Document required roles in OpenAPI spec
- [ ] Add role tests to E2E suite

---

## 📚 DOCUMENTATION LAWS

### **LAW #18: Document API Contracts**
**Rule:** EVERY API endpoint MUST document required headers, roles, and responses.

**Correct Pattern:**
```typescript
/**
 * Create Unified Order
 * 
 * @route POST /api/workflow/orders/unified
 * @access PROVIDER only
 * 
 * Required Headers:
 * - Authorization: Bearer {JWT}
 * - x-user-id: {UUID}
 * - x-user-role: PROVIDER
 * - x-portal: PROVIDER
 * 
 * Request Body:
 * @param {string} patientId - Patient UUID
 * @param {string} encounterId - Encounter UUID
 * @param {UnifiedOrderItem[]} items - Order items
 * 
 * Responses:
 * - 201: Order created successfully
 * - 401: Unauthorized (missing/invalid token)
 * - 403: Forbidden (wrong role)
 * - 400: Bad Request (validation error)
 */
@Post('unified')
@Roles('PROVIDER')
createUnifiedOrder(@Body() dto: CreateUnifiedOrderDto) {
  return this.workflowService.createUnifiedOrder(dto);
}
```

**Enforcement:**
- [ ] Use OpenAPI/Swagger annotations
- [ ] Generate API documentation automatically
- [ ] Keep documentation next to code
- [ ] Review docs in code reviews

---

### **LAW #19: Create Troubleshooting Guides**
**Rule:** Document common errors and their solutions.

**Required Sections:**
- Common Errors (403, 404, 500)
- Resolution Steps
- Debugging Commands
- Contact Information

**Example:**
```markdown
## Error: 403 Forbidden

### Symptoms
API requests return 403 Forbidden

### Causes
1. Missing x-user-id header
2. Incorrect x-user-role for endpoint
3. Expired JWT token

### Resolution
1. Check browser DevTools → Network → Headers
2. Verify token is present and not expired
3. Confirm role matches endpoint requirements
4. Check backend logs for exact rejection reason
```

**Enforcement:**
- [ ] Update troubleshooting guide after each bug fix
- [ ] Include in onboarding documentation
- [ ] Link from error messages

---

## 🔍 DEBUGGING LAWS

### **LAW #20: Check Browser Console First**
**Rule:** ALWAYS check browser console for errors before debugging backend.

**Debugging Checklist:**
1. [ ] Open DevTools Console
2. [ ] Check for JavaScript errors
3. [ ] Check Network tab for failed requests
4. [ ] Inspect request headers
5. [ ] Check response bodies
6. [ ] Only then check backend logs

**Common Console Errors & Solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `ReferenceError: X is not defined` | Missing import | Add import statement |
| `CORS error` | Missing CORS header | Add header to backend CORS config |
| `403 Forbidden` | Missing/wrong role | Check x-user-role header |
| `404 Not Found` | Wrong URL | Check baseURL and endpoint path |

---

### **LAW #21: Log Request Headers in Development**
**Rule:** In development mode, ALWAYS log request headers for debugging.

**Correct Pattern:**
```typescript
// ✅ CORRECT - Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('[WorkflowClient] Request:', {
    method: config.method,
    url: config.url,
    headers: {
      auth: config.headers['Authorization'] ? 'present' : 'missing',
      userId: config.headers['x-user-id'],
      role: config.headers['x-user-role'],
      portal: config.headers['x-portal'],
    },
  });
}
```

**Enforcement:**
- [ ] Add debug logging to all axios interceptors
- [ ] Use debug library for structured logging
- [ ] Remove or disable in production

---

## 🎯 WORKFLOW PATTERN LAWS

### **LAW #22: Standardize Workflow Structure**
**Rule:** ALL multi-service workflows MUST follow this pattern.

**Standard Workflow Pattern:**

```
1. USER ACTION (Frontend)
   ↓
2. UNIFIED SERVICE (Workflow/Orchestration)
   - Validate request
   - Create master record
   - Authorize user
   ↓
3. DISPATCH TO TARGET SERVICES
   - Use service-to-service role
   - Include all required headers
   - Handle errors gracefully
   ↓
4. TARGET SERVICE PROCESSING
   - Validate request
   - Check RBAC
   - Process business logic
   ↓
5. CALLBACK TO UNIFIED SERVICE
   - Update master record status
   - Emit events via WebSocket
   ↓
6. FRONTEND UPDATE
   - Listen for WebSocket events
   - Refresh UI
   - Show user feedback
```

**Required Components:**
- ✅ Unified Order table
- ✅ Order Items table (one per service)
- ✅ Event log table
- ✅ WebSocket gateway
- ✅ Status update webhook

**Enforcement:**
- [ ] Use this pattern for ALL new workflows
- [ ] Create workflow template/generator
- [ ] Document in architecture guide

---

## 📊 SUMMARY: TOP 10 CRITICAL LAWS

### **The Golden Rules (Never Break These)**

1. **Import Before Use** - Always import components/icons before using
2. **Whitelist Custom Headers** - Add ALL headers to CORS config
3. **Send User ID & Role** - Include in EVERY API request
4. **Service-to-Service Roles** - Use service role, not user role
5. **Separate Axios Instances** - One per backend service
6. **Validate Environment Variables** - On startup with Zod
7. **One-Time SessionLoader** - Run once, never on route changes
8. **Extract User ID from JWT** - Fallback when user.id undefined
9. **User-Friendly Errors** - Never show technical errors to users
10. **E2E Test Critical Paths** - CBC workflow must have full E2E test

---

## ✅ COMPLIANCE CHECKLIST

### **Before Starting Any New Feature:**
- [ ] Review relevant project laws
- [ ] Check existing patterns
- [ ] Plan RBAC requirements
- [ ] Document API contract
- [ ] Write E2E test outline

### **During Development:**
- [ ] Use centralized utilities (AuthHeaderManager, etc.)
- [ ] Add debug logging
- [ ] Test in browser frequently
- [ ] Check console for errors

### **Before Committing:**
- [ ] Run linter
- [ ] Fix all linter errors
- [ ] Test in browser
- [ ] Run E2E tests
- [ ] Update documentation

### **Code Review Checklist:**
- [ ] Imports complete and alphabetized
- [ ] CORS headers whitelisted
- [ ] RBAC headers included
- [ ] Error handling present
- [ ] Documentation updated
- [ ] Tests passing

---

## 🔄 CONTINUOUS IMPROVEMENT

### **After Each Bug Fix:**
1. ✅ Identify root cause
2. ✅ Create or update project law
3. ✅ Add to troubleshooting guide
4. ✅ Create test to prevent regression
5. ✅ Document in CHANGELOG

### **Monthly Review:**
- Review all project laws
- Update based on new learnings
- Remove obsolete laws
- Add examples from real issues

---

## 📞 ENFORCEMENT

### **How to Use This Document:**

1. **New Developers** - Read before starting work
2. **Code Reviews** - Reference in review comments
3. **Bug Fixes** - Check if violation of existing law
4. **Architecture Decisions** - Consider laws when designing

### **Violation Consequences:**

- **First Violation** - Code review comment with law reference
- **Second Violation** - Required re-read of project laws
- **Repeated Violations** - Additional training required

### **Suggesting New Laws:**

1. Encounter new pattern or issue
2. Document problem and solution
3. Submit PR to this document
4. Get team approval
5. Add to project laws

---

**Document Version:** 1.0  
**Last Updated:** November 11, 2025  
**Status:** 📜 OFFICIAL PROJECT LAW  
**Applies To:** All developers, all features, all services

---

**These laws exist because we learned them the hard way. Follow them to avoid repeating our mistakes.** 🎓

