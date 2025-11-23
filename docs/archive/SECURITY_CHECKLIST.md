# Security Implementation Checklist

## Quick Reference Guide

Use this checklist before committing code or deploying to production.

---

## 🔴 CRITICAL - Frontend Route Protection

### When Adding New Protected Route

- [ ] Route wrapped in `<ProtectedRoute>` component
- [ ] `ProtectedRoute` validates token exists
- [ ] `ProtectedRoute` validates token not expired
- [ ] `ProtectedRoute` validates portal claim matches
- [ ] Invalid tokens cleared from localStorage
- [ ] Redirect to `/login` on validation failure
- [ ] Test: Direct URL access without login → redirects
- [ ] Test: Expired token → redirects and clears token
- [ ] Test: Cross-portal token → redirects

**Template:**
```tsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  } 
/>
```

---

## 🔴 CRITICAL - ProtectedRoute Component

### Required Validation Logic

```tsx
const isTokenValidForPortal = (jwt: string | null, expectedPortal: string) => {
  // 1. Check token exists
  if (!jwt) return false
  
  // 2. Check token structure
  const parts = jwt.split('.')
  if (parts.length !== 3) return false
  
  try {
    const payload = JSON.parse(atob(parts[1]))
    
    // 3. Check expiration
    if (!payload.exp) return false
    const nowSeconds = Math.floor(Date.now() / 1000)
    if (payload.exp <= nowSeconds) return false
    
    // 4. Check portal claim
    if (payload.portal !== expectedPortal) return false
    
    return true
  } catch {
    return false
  }
}
```

- [ ] All 4 checks implemented
- [ ] No shortcuts or simplified versions
- [ ] Tested with real tokens

---

## 🔴 CRITICAL - Backend Authentication

### Login Endpoint

- [ ] Email validation
- [ ] Password validation (bcrypt in production)
- [ ] PortalType enum validation
- [ ] User's portal authorization check
- [ ] JWT includes `portal` claim
- [ ] JWT includes `exp` claim
- [ ] Token expiration set (24h recommended)
- [ ] UnauthorizedException thrown for wrong portal

**Required Code:**
```typescript
// CRITICAL: Validate portal authorization
if (!user.portals.includes(loginDto.portalType)) {
  throw new UnauthorizedException(
    `User is not authorized to access ${loginDto.portalType} portal`
  )
}

// JWT payload MUST include portal
const payload = {
  sub: user.id,
  email: user.email,
  role: user.role,
  portal: loginDto.portalType, // ← CRITICAL
}
```

---

## 🔴 CRITICAL - CORS Configuration

### Backend CORS Setup

- [ ] CORS enabled in `main.ts`
- [ ] Explicit origin whitelist (no wildcards)
- [ ] All portal URLs included
- [ ] `credentials: true` set
- [ ] Tested login from each portal

**Required:**
```typescript
app.enableCors({
  origin: [
    'http://localhost:5172', // common-portal
    'http://localhost:5173', // patient-portal
    'http://localhost:5174', // provider-portal
    // ... all others
  ],
  credentials: true,
})
```

---

## 🔴 CRITICAL - Kong Gateway

### Kong Configuration

- [ ] JWT validation plugin enabled
- [ ] Authorization header stripped
- [ ] X-User-ID header injected
- [ ] X-User-Role header injected
- [ ] X-Portal header injected
- [ ] Protected routes configured
- [ ] Public routes (login) bypass JWT

---

## 🔴 CRITICAL - HIPAA Compliance

### Patient Data Access

- [ ] Audit log on every patient data access
- [ ] Log includes: userId, role, patientId, portal, timestamp
- [ ] Authorization check before data access
- [ ] Care team validation implemented

**Required Format:**
```typescript
console.log(
  `HIPAA_AUDIT: Provider ${userId} (${role}) accessed Patient ${patientId} via ${portal} portal at ${timestamp}`
)
```

---

## 🟡 IMPORTANT - Testing

### Before Committing Code

- [ ] Test: Direct URL access without token → redirect
- [ ] Test: Expired token → redirect and clear
- [ ] Test: Cross-portal token → redirect
- [ ] Test: Malformed token → redirect and clear
- [ ] Test: Login with correct portal → success
- [ ] Test: Login with wrong portal → error
- [ ] Dev servers restarted after changes
- [ ] Browser cache cleared for testing

---

## 🟡 IMPORTANT - Code Review

### Security Review Checklist

- [ ] No hardcoded secrets or tokens
- [ ] No console.log of sensitive data (except audit logs)
- [ ] No eval() or dangerous functions
- [ ] All user inputs validated
- [ ] SQL queries parameterized
- [ ] Error messages don't leak info
- [ ] HTTPS enforced in production config

---

## 🟢 RECOMMENDED - Best Practices

### General Security

- [ ] Dependencies up to date
- [ ] Vulnerability scan passed
- [ ] Environment variables used for secrets
- [ ] Git ignored sensitive files (.env)
- [ ] Rate limiting configured
- [ ] Input sanitization implemented
- [ ] Output encoding for XSS prevention

---

## Pre-Deployment Checklist

### Production Readiness

#### Frontend
- [ ] All routes protected
- [ ] Token validation complete
- [ ] HTTPS enforced
- [ ] Environment configs correct
- [ ] Source maps disabled
- [ ] Console logs removed (except audit)

#### Backend
- [ ] CORS origins updated for production
- [ ] JWT secret strong and environment-based
- [ ] Password hashing enabled
- [ ] Rate limiting active
- [ ] Database credentials secured
- [ ] HTTPS/TLS configured
- [ ] Audit logging to persistent storage

#### Infrastructure
- [ ] Kong gateway configured
- [ ] Database backups enabled
- [ ] Monitoring and alerting setup
- [ ] Firewall rules applied
- [ ] SSL certificates valid
- [ ] Incident response plan documented

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Skip token validation "to save time"
- Use `origin: '*'` in CORS
- Trust frontend data without validation
- Log passwords or tokens
- Ignore security warnings
- Deploy without testing auth flows
- Leave debug code in production

✅ **DO:**
- Validate everything from client
- Use explicit CORS origins
- Implement defense in depth
- Log all patient data access
- Fix security issues immediately
- Test all auth scenarios
- Review code for security issues

---

## Emergency Procedures

### Security Incident Response

1. **Immediate:**
   - Stop the breach (rotate secrets, disable access)
   - Preserve evidence (logs, system state)
   - Notify security team

2. **Investigation:**
   - Review audit logs
   - Identify affected data/users
   - Document timeline

3. **Remediation:**
   - Patch vulnerability
   - Deploy fix
   - Force logout all users
   - Monitor for repeat

4. **Follow-up:**
   - Post-mortem analysis
   - Update security docs
   - Notify affected parties (if PHI exposed)
   - File incident report

---

## Quick Commands

### Restart All Portals After Security Changes
```bash
pkill -f "vite.*517" && cd "/Users/helal/New Project" && \
(cd common-portal && npm run dev &) && \
(cd patient-portal && npm run dev &) && \
(cd provider-portal && npm run dev &) && \
(cd admin-portal && npm run dev &) && \
(cd lab-portal && npm run dev &) && \
(cd pharmacy-portal && npm run dev &) && \
(cd billing-portal && npm run dev &) && \
(cd radiology-portal && npm run dev &)
```

### Check All Services Running
```bash
lsof -nP -iTCP:3000-3002,5172-5179 -sTCP:LISTEN
```

### View Auth Service Logs
```bash
tail -f logs/authentication-service.log
```

---

**🔒 Security is everyone's responsibility. When in doubt, ask before deploying.**

