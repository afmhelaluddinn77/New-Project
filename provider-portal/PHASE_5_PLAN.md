# Phase 5: Gateway Route Updates - Implementation Plan

## 🎯 Objective

Configure Kong API Gateway to handle all authentication routes and update the frontend to use the gateway exclusively.

## 📊 Current State

### Kong Configuration

- ✅ JWT validation on protected routes
- ✅ CORS configured
- ✅ Request transformer adding user headers
- ❌ Missing auth endpoints (login, refresh, logout, CSRF)
- ❌ Auth routes not configured

### Frontend

- ✅ API client at `src/lib/api.ts`
- ✅ Uses environment variable `VITE_API_GATEWAY_URL`
- ✅ Default: `http://localhost:3001/api`
- ⚠️ Some services bypass gateway (direct URLs)

## 🔧 Required Changes

### 1. Update Kong Configuration (kong.yml)

**Add Authentication Routes:**

```yaml
services:
  - name: authentication-service
    url: http://localhost:3000
    routes:
      # Existing
      - name: auth-login
        paths:
          - /api/auth/login
        strip_path: false

      # NEW - Add these routes
      - name: auth-csrf
        paths:
          - /api/auth/csrf-token
        strip_path: false

      - name: auth-refresh
        paths:
          - /api/auth/refresh
        strip_path: false

      - name: auth-logout
        paths:
          - /api/auth/logout
        strip_path: false
```

**Add CORS for Auth:**

```yaml
plugins:
  - name: cors
    config:
      credentials: true # ✅ Already set
      exposed_headers:
        - Set-Cookie # NEW - needed for refresh token
```

### 2. Update Frontend Services

**Files to Update:**

- `src/services/httpClient.ts` - Remove if not needed
- `src/services/workflowApi.ts` - Use api.ts instead
- `src/services/encounterService.ts` - Use api.ts instead

**Changes:**

- All API calls go through `/api` gateway prefix
- Remove direct service URLs
- Use unified `api` client from `lib/api.ts`

### 3. Environment Variables

**Create/Update `.env` files:**

`.env.development`:

```env
VITE_API_GATEWAY_URL=http://localhost:3001/api
```

`.env.production`:

```env
VITE_API_GATEWAY_URL=https://your-domain.com/api
```

### 4. Docker Compose Updates

**Ensure Kong is properly configured:**

- Kong port: 3001
- Admin API: 8001
- Services accessible from Kong

## 📝 Implementation Steps

### Step 1: Update Kong Configuration ✅

1. Add CSRF token route
2. Add refresh token route
3. Add logout route
4. Update CORS exposed headers

### Step 2: Verify Gateway Routing

1. Test login through gateway
2. Test CSRF token endpoint
3. Test refresh endpoint
4. Test protected endpoints

### Step 3: Update Frontend Services

1. Audit all API calls
2. Ensure all use `api` from `lib/api.ts`
3. Remove direct service URLs
4. Test all endpoints

### Step 4: Environment Configuration

1. Create `.env.development`
2. Create `.env.production`
3. Document environment variables

### Step 5: Testing

1. Manual testing all flows
2. Test authentication
3. Test protected resources
4. Verify CORS headers
5. Check cookies set properly

## 🔍 Validation Checklist

### Kong Routes

- [ ] GET /api/auth/csrf-token → authentication-service
- [ ] POST /api/auth/login → authentication-service
- [ ] POST /api/auth/refresh → authentication-service
- [ ] POST /api/auth/logout → authentication-service
- [ ] GET /api/workflow/\* → workflow-service (JWT protected)
- [ ] GET /api/encounters/\* → encounter-service (JWT protected)
- [ ] GET /api/pharmacy/\* → pharmacy-service (JWT protected)
- [ ] GET /api/lab/\* → lab-service (JWT protected)
- [ ] GET /api/radiology/\* → radiology-service (JWT protected)

### Frontend

- [ ] All API calls use gateway URL
- [ ] No hardcoded service URLs
- [ ] Environment variables working
- [ ] CORS working (credentials)
- [ ] Cookies set/sent properly
- [ ] JWT in Authorization header
- [ ] CSRF token in X-XSRF-TOKEN header

### End-to-End

- [ ] Login flow works
- [ ] Token refresh works
- [ ] Logout works
- [ ] Protected routes work
- [ ] WebSocket connections work
- [ ] File uploads work (if any)

## 🚨 Common Issues & Solutions

### Issue: CORS errors

**Solution:** Ensure `credentials: true` and proper `origins` in Kong CORS config

### Issue: Cookies not set

**Solution:** Check `withCredentials: true` in axios config

### Issue: 401 on all requests

**Solution:** Verify JWT plugin config and secret matches backend

### Issue: CSRF token missing

**Solution:** Ensure XSRF-TOKEN cookie is set and read correctly

## 📊 Success Criteria

✅ All API calls go through Kong gateway
✅ No direct service URLs in frontend
✅ Authentication works end-to-end
✅ Token refresh works automatically
✅ All protected routes accessible
✅ CORS configured correctly
✅ Environment variables properly set
✅ Docker services communicate correctly

## 🔄 Rollback Plan

If issues occur:

1. Keep direct service URLs as fallback
2. Use environment variable to toggle gateway
3. Document issues encountered
4. Fix and retry

---

**Status**: Ready to implement
**Estimated Time**: 1-2 hours
**Risk**: Low (gateway already exists, just adding routes)
