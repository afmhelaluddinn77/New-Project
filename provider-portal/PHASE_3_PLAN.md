# Phase 3 Implementation Plan - Remove Insecure Auth Utils

## 🎯 Objective

Remove all deprecated authentication utilities that use localStorage and replace them with secure, cookie-based authentication using `authStore` and `api.ts`.

## 📋 Files to Modify/Delete

### Files to DELETE:

1. ✅ `src/utils/auth.ts` - Contains insecure token decoding

### Files to UPDATE:

1. ✅ `src/services/httpClient.ts` - Remove token functions, deprecate or remove
2. ✅ `src/services/socketClient.ts` - Use authStore instead of httpClient
3. ✅ `src/services/encounterService.ts` - Remove setAuthToken, use api.ts
4. ✅ `src/pages/orders/OrdersPage.tsx` - Use authStore instead of decodeToken
5. ✅ `src/__tests__/services/encounterService.miscFunctions.test.ts` - Update tests

## 🔍 Usage Analysis

### Current Usages Found:

**1. utils/auth.ts imports:**

- `OrdersPage.tsx` - Uses `decodeToken()`

**2. httpClient.ts token functions:**

- `OrdersPage.tsx` - Uses `getAuthToken()`
- `socketClient.ts` - Uses `getAuthToken()`
- `encounterService.ts` - Defines `setAuthToken()`

**3. Direct token function calls:**

- `socketClient.ts` - `getAuthToken()` (2 calls)
- `OrdersPage.tsx` - `getAuthToken()` (1 call), `decodeToken()` (1 call)
- `encounterService.ts` - `setAuthToken()` (1 definition)
- Test file - `setAuthToken()` (2 calls)

## 🔄 Replacement Strategy

### Replace `decodeToken()` with:

```typescript
// OLD:
import { decodeToken } from "../../utils/auth";
const token = getAuthToken();
const payload = decodeToken(token);
const userId = payload?.sub ?? "";

// NEW:
import { useAuthStore } from "../../store/authStore";
const user = useAuthStore((state) => state.user);
const userId = user?.id ?? "";
```

### Replace `getAuthToken()` in Socket with:

```typescript
// OLD:
import { getAuthToken } from "./httpClient";
const token = getAuthToken();

// NEW:
import { useAuthStore } from "../store/authStore";
const token = useAuthStore.getState().accessToken;
```

### Replace `encounterService.setAuthToken()` with:

```typescript
// Remove the method entirely, use api.ts axios instance instead
// The api.ts interceptor automatically adds the token
```

### Replace `httpClient.ts` with deprecation:

```typescript
// Mark as deprecated, guide users to api.ts
// Eventually remove after migration period
```

## ✅ Implementation Steps

1. **Update OrdersPage.tsx**
   - Remove `decodeToken` import
   - Remove `getAuthToken` import
   - Use `useAuthStore` for user data

2. **Update socketClient.ts**
   - Remove `getAuthToken` import
   - Use `useAuthStore.getState().accessToken`

3. **Update encounterService.ts**
   - Remove `setAuthToken` method
   - Migrate to use `api.ts` client instead of custom axios

4. **Deprecate httpClient.ts**
   - Add deprecation warnings
   - Document migration path to `api.ts`

5. **Delete utils/auth.ts**
   - Remove file entirely
   - Update any remaining imports

6. **Update Tests**
   - Remove `setAuthToken` test cases
   - Add tests for new authStore usage

## 🧪 Testing Strategy

1. Verify no imports of `utils/auth`
2. Verify no usage of `setAuthToken`, `getAuthToken`, `clearAuthToken`
3. Test authentication flow end-to-end
4. Test socket connections with new token retrieval
5. Test orders page with authStore user data
6. Run all existing test suites

## 📊 Success Criteria

- [ ] `utils/auth.ts` deleted
- [ ] No imports from `utils/auth`
- [ ] `httpClient.ts` token functions deprecated/removed
- [ ] All components use `authStore` or `api.ts`
- [ ] Socket client uses `authStore`
- [ ] All tests passing
- [ ] No console errors on login/navigation
- [ ] Authentication flow works end-to-end

## 🚀 Execution Order

1. Update socketClient.ts (smallest change)
2. Update OrdersPage.tsx (user data from authStore)
3. Update encounterService.ts (remove setAuthToken)
4. Deprecate httpClient.ts (add warnings)
5. Delete utils/auth.ts
6. Update tests
7. Verify and test
