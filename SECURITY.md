# Security Guidelines & Checklist

## 🔒 EMR/HMS Security Standards

This document outlines mandatory security practices for this project to prevent unauthorized access and ensure HIPAA compliance.

---

## Table of Contents

1. [Frontend Security Rules](#frontend-security-rules)
2. [Backend Security Rules](#backend-security-rules)
3. [Authentication & Authorization](#authentication--authorization)
4. [Common Security Pitfalls](#common-security-pitfalls)
5. [Pre-Deployment Checklist](#pre-deployment-checklist)
6. [Security Testing Procedures](#security-testing-procedures)

---

## Frontend Security Rules

### 🚨 CRITICAL: Route Protection

**RULE 1: ALL Protected Routes MUST Use `ProtectedRoute` Component**

❌ **NEVER DO THIS:**
```tsx
// BAD - Unprotected route
<Route path="/dashboard" element={<DashboardPage />} />
```

✅ **ALWAYS DO THIS:**
```tsx
// GOOD - Protected route
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>
```

---

### 🚨 CRITICAL: Token Validation

**RULE 2: Token Validation MUST Check 3 Things**

Every `ProtectedRoute` component MUST validate:

1. ✅ **Token exists** in localStorage
2. ✅ **Token is not expired** (check `exp` claim)
3. ✅ **Token portal matches** the current portal

**Standard Implementation:**
```tsx
const isTokenValidForPortal = (jwt: string | null, expectedPortal: string) => {
  if (!jwt) return false
  const parts = jwt.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(atob(parts[1])) as { exp?: number; portal?: string }
    if (!payload.exp) return false
    const nowSeconds = Math.floor(Date.now() / 1000)
    if (payload.exp <= nowSeconds) return false
    if (payload.portal !== expectedPortal) return false
    return true
  } catch {
    return false
  }
}
```

---

### 🚨 CRITICAL: Portal Isolation

**RULE 3: Each Portal MUST Validate Its Own Portal Type**

- **Patient Portal:** `expectedPortal = 'PATIENT'`
- **Provider Portal:** `expectedPortal = 'PROVIDER'`
- **Admin Portal:** `expectedPortal = 'ADMIN'`
- **Lab Portal:** `expectedPortal = 'LAB'`
- **Pharmacy Portal:** `expectedPortal = 'PHARMACY'`
- **Billing Portal:** `expectedPortal = 'BILLING'`
- **Radiology Portal:** `expectedPortal = 'RADIOLOGY'`

❌ **NEVER:** Accept tokens from other portals
✅ **ALWAYS:** Validate portal claim matches

---

### 🚨 CRITICAL: Token Cleanup

**RULE 4: Invalid Tokens MUST Be Removed**

When validation fails, ALWAYS clear the token:

```tsx
if (!isTokenValidForPortal(token, 'PATIENT')) {
  if (typeof window !== 'undefined') localStorage.removeItem('token')
  return <Navigate to="/login" state={{ from: location }} replace />
}
```

---

## Backend Security Rules

### 🚨 CRITICAL: CORS Configuration

**RULE 5: CORS MUST Be Explicitly Configured**

❌ **NEVER:** Use `origin: '*'` in production
✅ **ALWAYS:** Whitelist specific portal URLs

```typescript
app.enableCors({
  origin: [
    'http://localhost:5172', // common-portal
    'http://localhost:5173', // patient-portal
    // ... all other portals
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
})
```

---

### 🚨 CRITICAL: Portal Authorization

**RULE 6: Backend MUST Validate Portal Access**

In `auth.service.ts`, ALWAYS check user's authorized portals:

```typescript
// CRITICAL: Validate portal authorization
if (!user.portals.includes(loginDto.portalType)) {
  throw new UnauthorizedException(
    `User is not authorized to access ${loginDto.portalType} portal`
  )
}
```

---

### 🚨 CRITICAL: JWT Claims

**RULE 7: JWT MUST Include Portal Type**

Every JWT payload MUST contain:

```typescript
const payload = {
  sub: user.id,           // User ID
  email: user.email,      // User email
  role: user.role,        // User role
  portal: loginDto.portalType, // ⚠️ CRITICAL: Portal type
}
```

---

### 🚨 CRITICAL: API Gateway (Kong)

**RULE 8: Kong MUST Inject Trusted Headers**

Kong configuration MUST:
1. Validate JWT tokens
2. Strip `Authorization` header
3. Inject trusted headers: `X-User-ID`, `X-User-Role`, `X-Portal`

```yaml
plugins:
  - name: request-transformer
    config:
      remove:
        headers:
          - authorization
      add:
        headers:
          - "X-User-ID:$(jwt.sub)"
          - "X-User-Role:$(jwt.role)"
          - "X-Portal:$(jwt.portal)"
```

---

### 🚨 CRITICAL: HIPAA Audit Logging

**RULE 9: ALL Patient Data Access MUST Be Logged**

```typescript
console.log(
  `HIPAA_AUDIT: Provider ${authContext.userId} (${authContext.role}) accessed Patient ${patientId} via ${authContext.portal} portal at ${new Date().toISOString()}`
)
```

**Requirements:**
- Log WHO (userId + role)
- Log WHAT (resource accessed)
- Log WHEN (timestamp)
- Log WHERE (portal type)

---

## Authentication & Authorization

### Login Flow Security Checklist

- [ ] User credentials validated
- [ ] Password hashed (bcrypt in production)
- [ ] Portal type sent in login payload
- [ ] Backend validates user authorized for portal
- [ ] JWT includes `portal` claim
- [ ] Token expiration set (24h default)
- [ ] Token stored in localStorage (client-side)
- [ ] Login redirects to `/dashboard`

### Protected Route Checklist

- [ ] Route wrapped in `<ProtectedRoute>`
- [ ] Token existence checked
- [ ] Token expiration validated
- [ ] Portal claim validated
- [ ] Invalid tokens cleared
- [ ] Redirect to `/login` on failure

---

## Common Security Pitfalls

### ❌ PITFALL 1: Unprotected Routes
**Problem:** Directly rendering protected pages without `ProtectedRoute`
**Impact:** Anyone can access sensitive data by typing URL
**Solution:** Always wrap with `<ProtectedRoute>`

### ❌ PITFALL 2: Token Not Validated
**Problem:** Only checking if token exists, not validating contents
**Impact:** Expired or malformed tokens grant access
**Solution:** Validate token structure, expiration, and claims

### ❌ PITFALL 3: Portal Claim Ignored
**Problem:** Not checking if token's portal matches current portal
**Impact:** Cross-portal access (provider accessing patient portal with provider token)
**Solution:** Validate `portal` claim against expected portal type

### ❌ PITFALL 4: Frontend Dev Server Not Restarted
**Problem:** Code changes not applied because Vite cache
**Impact:** Old vulnerable code still running
**Solution:** Always restart dev servers after security changes

### ❌ PITFALL 5: Missing CORS Configuration
**Problem:** Backend doesn't allow frontend requests
**Impact:** Login fails, users can't authenticate
**Solution:** Configure CORS with explicit portal origins

### ❌ PITFALL 6: Backend Trust Frontend
**Problem:** Accepting user claims from frontend without validation
**Impact:** Privilege escalation, unauthorized access
**Solution:** Backend validates everything, never trust client

### ❌ PITFALL 7: No Audit Logging
**Problem:** Patient data accessed without logging
**Impact:** HIPAA violation, no audit trail
**Solution:** Log every patient data access with full context

---

## Pre-Deployment Checklist

### Frontend Security

- [ ] All protected routes use `<ProtectedRoute>`
- [ ] Token validation includes expiration check
- [ ] Portal claim validation implemented
- [ ] Invalid tokens cleared from localStorage
- [ ] No sensitive data in localStorage except token
- [ ] HTTPS enforced (production)
- [ ] Content Security Policy configured

### Backend Security

- [ ] CORS configured with explicit origins (no wildcards)
- [ ] Portal authorization check in login flow
- [ ] JWT secret is strong and environment-based
- [ ] Password hashing enabled (bcrypt)
- [ ] Rate limiting configured
- [ ] SQL injection prevention (parameterized queries)
- [ ] Input validation on all endpoints
- [ ] HIPAA audit logging on patient data access

### Infrastructure Security

- [ ] Kong JWT validation plugin enabled
- [ ] Kong strips Authorization headers
- [ ] Kong injects trusted X-* headers
- [ ] Database credentials in environment variables
- [ ] API keys rotated and secured
- [ ] HTTPS/TLS certificates valid
- [ ] Firewall rules configured
- [ ] Backup encryption enabled

---

## Security Testing Procedures

### Manual Testing

#### Test 1: Direct URL Access (Without Login)
1. Open incognito/private browser window
2. Navigate to `http://localhost:5173/dashboard`
3. **Expected:** Redirect to `/login`
4. **Failure:** Dashboard loads → CRITICAL SECURITY BUG

#### Test 2: Expired Token Access
1. Login to get valid token
2. Wait for token expiration (or manually edit exp claim to past)
3. Try accessing `/dashboard`
4. **Expected:** Redirect to `/login`, token cleared
5. **Failure:** Dashboard loads → CRITICAL SECURITY BUG

#### Test 3: Cross-Portal Token Access
1. Login to Patient Portal (get PATIENT token)
2. Navigate to Provider Portal `/dashboard`
3. **Expected:** Redirect to `/login`
4. **Failure:** Dashboard loads → CRITICAL SECURITY BUG

#### Test 4: Malformed Token
1. Set `localStorage.setItem('token', 'invalid.token.here')`
2. Navigate to `/dashboard`
3. **Expected:** Redirect to `/login`, token cleared
4. **Failure:** Dashboard loads → CRITICAL SECURITY BUG

#### Test 5: CORS Validation
1. Open browser console
2. Attempt login from portal
3. **Expected:** Successful login, no CORS errors
4. **Failure:** CORS error → Authentication blocked

#### Test 6: Portal Authorization
1. Create user with only PATIENT portal access
2. Try logging in via PROVIDER portal
3. **Expected:** Login fails with "not authorized" error
4. **Failure:** Login succeeds → CRITICAL SECURITY BUG

### Automated Testing (Future Implementation)

```typescript
// Example test structure
describe('Protected Route Security', () => {
  it('should redirect to login when no token exists', () => {
    localStorage.clear()
    // navigate to /dashboard
    // expect URL to be /login
  })

  it('should reject expired tokens', () => {
    // set expired token
    // navigate to /dashboard
    // expect redirect to /login
    // expect localStorage to be cleared
  })

  it('should reject cross-portal tokens', () => {
    // set PROVIDER token
    // navigate to PATIENT dashboard
    // expect redirect to /login
  })
})
```

---

## Incident Response

### If Security Breach Detected

1. **Immediate Actions:**
   - [ ] Rotate all JWT secrets
   - [ ] Force logout all users
   - [ ] Review audit logs for unauthorized access
   - [ ] Patch vulnerability
   - [ ] Deploy fix immediately

2. **Investigation:**
   - [ ] Identify affected users
   - [ ] Review HIPAA audit logs
   - [ ] Document breach timeline
   - [ ] Assess data exposure

3. **Notification:**
   - [ ] Notify security team
   - [ ] File incident report
   - [ ] Notify affected users (if PHI exposed)
   - [ ] Report to authorities (HIPAA requirement)

---

## Maintenance

### Regular Security Reviews

- [ ] **Weekly:** Review audit logs for suspicious activity
- [ ] **Monthly:** Update dependencies for security patches
- [ ] **Quarterly:** Penetration testing
- [ ] **Annually:** Full security audit

### Code Review Guidelines

Before merging any PR:
- [ ] All protected routes have `<ProtectedRoute>` wrapper
- [ ] Token validation includes all 3 checks
- [ ] No hardcoded secrets or credentials
- [ ] HIPAA audit logging present for patient data
- [ ] Input validation on all user inputs
- [ ] Error messages don't leak sensitive info

---

## Contact

For security concerns or to report vulnerabilities:
- **Email:** security@your-organization.com
- **Emergency:** +1-XXX-XXX-XXXX

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-31 | Initial security guidelines created |

---

**⚠️ REMEMBER: Security is not a feature, it's a requirement. Every shortcut in security is a potential breach.**

