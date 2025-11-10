# Phase 5: Gateway Route Updates - COMPLETE ✅

## 🎯 Objective Achieved

Successfully configured Kong API Gateway to handle all authentication routes and updated frontend services to use the gateway exclusively.

## 📦 What Was Implemented

### 1. Kong Configuration Updates ✅

**File: `kong.yml`**

**Added Authentication Routes:**

```yaml
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

**Updated CORS Configuration:**

```yaml
headers:
  - X-XSRF-TOKEN # Added for CSRF protection
exposed_headers:
  - Set-Cookie # Added for refresh token cookies
```

### 2. Environment Configuration ✅

**Created: `.env.development`**

```env
VITE_API_GATEWAY_URL=http://localhost:3001/api
```

**Created: `.env.production`**

```env
VITE_API_GATEWAY_URL=https://api.yourdomain.com/api
VITE_ENABLE_DEVTOOLS=false
```

### 3. Frontend Services Updated ✅

**File: `src/services/workflowApi.ts`**

- ✅ Removed direct service URL (`http://localhost:3004`)
- ✅ Now uses `api` from `lib/api.ts`
- ✅ Routes updated to `/workflow/orders/*`
- ✅ All requests go through Kong gateway

**Before:**

```typescript
import { workflowClient } from "./httpClient";
const response = await workflowClient.get("/orders");
```

**After:**

```typescript
import { api } from "../lib/api";
const response = await api.get("/workflow/orders");
```

**File: `src/services/encounterService.ts`**

- ✅ Removed direct axios client
- ✅ Removed hardcoded baseURL
- ✅ Now uses `api` from `lib/api.ts`
- ✅ All 32 methods updated to use gateway
- ✅ Token management automatic (no manual setAuthToken needed)

**Before:**

```typescript
private client = axios.create({
  baseURL: 'http://localhost:3005/api'
});
```

**After:**

```typescript
import { api } from "../lib/api";
const response = await api.post("/encounters", data);
```

## 🏗️ Architecture After Phase 5

```
┌─────────────────┐
│  Browser/App    │
│  (React)        │
└────────┬────────┘
         │ All API calls via /api/*
         ↓
┌─────────────────┐
│  Kong Gateway   │
│  Port: 3001     │
│  ├─ CORS        │
│  ├─ JWT Auth    │
│  └─ Routing     │
└────────┬────────┘
         │
         ├─→ /api/auth/* ─────→ Authentication Service (3000)
         ├─→ /api/workflow/* ─→ Workflow Service (3004)
         ├─→ /api/encounters/* → Encounter Service (3005)
         ├─→ /api/pharmacy/* ──→ Pharmacy Service (3012)
         ├─→ /api/lab/* ────────→ Lab Service (3013)
         └─→ /api/radiology/* ─→ Radiology Service (3014)
```

## 📊 Route Configuration

### Authentication Routes (No JWT required)

| Method | Path                 | Service                | Purpose              |
| ------ | -------------------- | ---------------------- | -------------------- |
| POST   | /api/auth/login      | authentication-service | User login           |
| GET    | /api/auth/csrf-token | authentication-service | Get CSRF token       |
| POST   | /api/auth/refresh    | authentication-service | Refresh access token |
| POST   | /api/auth/logout     | authentication-service | User logout          |

### Protected Routes (JWT required)

| Method   | Path               | Service           | Purpose              |
| -------- | ------------------ | ----------------- | -------------------- |
| GET/POST | /api/workflow/\*   | workflow-service  | Orders management    |
| GET/POST | /api/encounters/\* | encounter-service | Encounters CRUD      |
| GET/POST | /api/pharmacy/\*   | pharmacy-service  | Pharmacy operations  |
| GET/POST | /api/lab/\*        | lab-service       | Lab operations       |
| GET/POST | /api/radiology/\*  | radiology-service | Radiology operations |

## 🔧 Configuration Details

### API Client (`src/lib/api.ts`)

- ✅ Base URL from environment variable
- ✅ Default: `http://localhost:3001/api`
- ✅ `withCredentials: true` for cookies
- ✅ Automatic JWT in Authorization header
- ✅ Automatic CSRF token in X-XSRF-TOKEN header
- ✅ Automatic token refresh on 401

### CORS Configuration

- ✅ Credentials enabled
- ✅ All methods allowed (GET, POST, PUT, DELETE, OPTIONS)
- ✅ Headers: Authorization, X-XSRF-TOKEN, X-User-ID, etc.
- ✅ Exposed: Set-Cookie for refresh tokens
- ✅ Max age: 3600 seconds

### JWT Protection

- ✅ Applied to all routes except auth
- ✅ Validates access token
- ✅ Extracts user claims (sub, role, portal)
- ✅ Adds headers: X-User-ID, X-User-Role, X-Portal

## 📝 Files Changed

### Created (4 files)

1. `provider-portal/.env.development`
2. `provider-portal/.env.production`
3. `provider-portal/PHASE_5_PLAN.md`
4. `provider-portal/PHASE_5_COMPLETE.md` (this file)

### Modified (3 files)

1. `kong.yml` - Added auth routes, updated CORS
2. `provider-portal/src/services/workflowApi.ts` - Use api.ts
3. `provider-portal/src/services/encounterService.ts` - Use api.ts

## ✅ Testing Checklist

### Manual Testing

**Authentication Flow:**

- [ ] Login works through gateway
- [ ] CSRF token retrieved successfully
- [ ] Refresh token works automatically
- [ ] Logout clears cookies
- [ ] 401 triggers automatic refresh

**Protected Resources:**

- [ ] Orders page loads data
- [ ] Dashboard shows metrics
- [ ] Results timeline displays
- [ ] Can create new orders
- [ ] WebSocket connections work

**CORS & Cookies:**

- [ ] No CORS errors in console
- [ ] Cookies set properly (XSRF-TOKEN, refresh token)
- [ ] Authorization header sent
- [ ] Credentials sent with requests

### Browser DevTools Check

**Network Tab:**

```
✓ All /api/* requests go to localhost:3001
✓ Authorization: Bearer <token> header present
✓ X-XSRF-TOKEN header on mutations
✓ Cookies sent with requests
✓ No 401 errors (or auto-recovered)
```

**Application Tab > Cookies:**

```
✓ XSRF-TOKEN cookie present
✓ refresh_token cookie present (HttpOnly)
✓ Domain: localhost
```

**Console:**

```
✓ No CORS errors
✓ No 401 errors (or auto-recovered)
✓ No missing token warnings
```

## 🚀 How to Test

### 1. Start Services

```bash
# Start Kong Gateway
docker-compose up kong -d

# Start Authentication Service
cd services/authentication-service
npm run dev

# Start Workflow Service
cd services/clinical-workflow-service
npm run dev

# Start Frontend
cd provider-portal
npm run dev
```

### 2. Test Authentication

```bash
# 1. Get CSRF token
curl http://localhost:3001/api/auth/csrf-token

# 2. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"provider1","password":"password","portal":"PROVIDER"}' \
  -c cookies.txt

# 3. Test protected endpoint
curl http://localhost:3001/api/workflow/orders \
  -H "Authorization: Bearer <access_token>" \
  -b cookies.txt
```

### 3. Browser Testing

1. Navigate to `http://localhost:5174`
2. Login with provider credentials
3. Check Network tab - all requests to `localhost:3001/api/*`
4. Navigate through app - orders, dashboard, results
5. Verify data loads correctly
6. Create an order - verify optimistic update
7. Check cookies in Application tab

## 🐛 Troubleshooting

### Issue: CORS Errors

**Symptom:**

```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:5174'
has been blocked by CORS policy
```

**Solution:**

1. Restart Kong: `docker-compose restart kong`
2. Verify kong.yml loaded: `docker-compose logs kong`
3. Check CORS config has `credentials: true`

### Issue: 401 Unauthorized

**Symptom:**

```
GET /api/workflow/orders 401 Unauthorized
```

**Solution:**

1. Check access token in localStorage (should be in memory)
2. Verify JWT secret matches between auth service and Kong
3. Check token expiry (15 minutes)
4. Try logging out and back in

### Issue: Cookies Not Set

**Symptom:**
No XSRF-TOKEN or refresh_token cookies

**Solution:**

1. Check `withCredentials: true` in api.ts
2. Verify `credentials: true` in Kong CORS
3. Check SameSite/Secure cookie attributes
4. For localhost, ensure not using HTTPS

### Issue: WebSocket Connection Fails

**Symptom:**

```
WebSocket connection to 'ws://localhost:3004' failed
```

**Solution:**

1. WebSockets may need separate configuration in Kong
2. For now, WebSocket can connect directly (not through gateway)
3. Environment variable: `VITE_WORKFLOW_SOCKET_URL`

## 📈 Performance Impact

### Before (Direct Service Calls)

- ❌ Multiple CORS configurations per service
- ❌ JWT validation in each service
- ❌ No centralized rate limiting
- ❌ No request logging
- ❌ Direct service exposure

### After (Gateway)

- ✅ Centralized CORS (one configuration)
- ✅ Gateway-level JWT validation
- ✅ Ready for rate limiting
- ✅ Centralized logging possible
- ✅ Services protected behind gateway
- ✅ Easy to add caching layer
- ✅ Load balancing ready

## 🎓 Key Concepts

### API Gateway Benefits

1. **Single Entry Point**: All API calls through one URL
2. **Centralized Auth**: JWT validation at gateway level
3. **CORS Management**: One CORS config for all services
4. **Service Isolation**: Frontend doesn't know backend structure
5. **Scalability**: Easy to add load balancing, caching
6. **Security**: Services not directly exposed

### Kong Routing

- **Path-based routing**: `/api/workflow/*` → workflow-service
- **Strip path**: `false` keeps full path for backend
- **Service URL**: Backend service location
- **Plugins**: JWT, CORS, request-transformer, etc.

### Environment Variables

- **Development**: `.env.development` (Git ignored)
- **Production**: `.env.production` (Git ignored)
- **Vite prefix**: `VITE_*` exposed to browser
- **Access**: `import.meta.env.VITE_*`

## 📊 Overall Progress

```
Phase 1: Frontend Security           ✅ 100%
Phase 2: Backend Auth Hardening      ✅ 100%
Phase 3: Remove Insecure Auth        ✅ 100%
Phase 4: State Management            ✅ 100%
Phase 5: Gateway Integration         ✅ 100%
Phase 6: Polish & Testing            ❌ 0%

Overall: ████████████████████░ 83% (5/6 phases)
```

## 🎯 Next Phase: Phase 6

**Goals:**

- Add Error Boundaries
- Add Suspense boundaries
- Write E2E tests
- Performance optimization
- Security audit
- Production deployment guide

---

**Generated**: November 7, 2025
**Status**: ✅ READY FOR TESTING
**Next**: Phase 6 - Polish & Regression Fixes
