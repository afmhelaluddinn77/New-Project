# Phase 4: State Management Consolidation

## 🎯 Goal

Separate server state (React Query) from UI state (Zustand) for better performance, caching, and developer experience.

## 📋 Current State Analysis

### Zustand Stores (Mixed Concerns)

- **encounterStore.ts**: Contains both server data (encounters) + UI state (selected encounter, forms)
- **ordersStore.ts**: Contains both server data (orders) + UI state (selected order)

### Problems

❌ Manual cache invalidation
❌ No automatic refetching
❌ No optimistic updates
❌ Mixed server/UI concerns
❌ Loading states duplicated

## 🏗️ Architecture

### React Query (Server State)

- Fetching encounters/orders
- Mutations (create, update, delete)
- Automatic caching & revalidation
- Optimistic updates
- Background refetching

### Zustand (UI State Only)

- Selected encounter/order ID
- Form data (draft state)
- UI preferences (filters, view modes)
- Sidebar open/closed

## 📦 Implementation Steps

### Step 1: Setup React Query Provider ✅

- Already installed: @tanstack/react-query@5.90.7
- Add QueryClientProvider to App.tsx
- Add React Query DevTools

### Step 2: Create Query Hooks

- [ ] `hooks/useEncountersQuery.ts` - Fetch all encounters
- [ ] `hooks/useEncounterQuery.ts` - Fetch single encounter
- [ ] `hooks/useOrdersQuery.ts` - Fetch all orders
- [ ] `hooks/useOrderQuery.ts` - Fetch single order

### Step 3: Create Mutation Hooks

- [ ] `hooks/useCreateEncounter.ts`
- [ ] `hooks/useUpdateEncounter.ts`
- [ ] `hooks/useCreateOrder.ts`
- [ ] `hooks/useUpdateOrder.ts`

### Step 4: Refactor Zustand Stores

- [ ] `store/encounterStore.ts` - Remove server data, keep UI state
- [ ] `store/ordersStore.ts` - Remove server data, keep UI state

### Step 5: Update Components

- [ ] `pages/encounters/EncountersPage.tsx`
- [ ] `pages/orders/OrdersPage.tsx`
- [ ] Any other components using stores

### Step 6: Testing

- [ ] Update tests for new hooks
- [ ] Test optimistic updates
- [ ] Test error handling

## 🔄 Migration Pattern

### Before (Zustand)

```typescript
// In component
const encounters = useEncounterStore((state) => state.encounters);
const loading = useEncounterStore((state) => state.loading);
const fetchEncounters = useEncounterStore((state) => state.fetchEncounters);

useEffect(() => {
  fetchEncounters();
}, [fetchEncounters]);
```

### After (React Query)

```typescript
// In component
const { data: encounters, isLoading } = useEncountersQuery();
// That's it! Auto-fetches, caches, and refetches
```

## 📂 File Structure

```
provider-portal/src/
├── hooks/
│   ├── queries/
│   │   ├── useEncountersQuery.ts
│   │   ├── useEncounterQuery.ts
│   │   ├── useOrdersQuery.ts
│   │   └── useOrderQuery.ts
│   └── mutations/
│       ├── useCreateEncounter.ts
│       ├── useUpdateEncounter.ts
│       ├── useCreateOrder.ts
│       └── useUpdateOrder.ts
├── store/
│   ├── encounterStore.ts (UI state only)
│   └── ordersStore.ts (UI state only)
└── lib/
    └── queryClient.ts (React Query config)
```

## 🎯 Success Criteria

✅ No server data in Zustand stores
✅ All API calls through React Query
✅ Optimistic updates working
✅ Automatic cache invalidation
✅ DevTools showing cached data
✅ All tests passing
✅ Better performance (less re-renders)

## 🚀 Benefits

1. **Automatic Caching**: Data fetched once, reused everywhere
2. **Background Updates**: Fresh data without blocking UI
3. **Optimistic Updates**: Instant UI feedback
4. **Better DX**: Less boilerplate, more features
5. **Built-in DevTools**: Inspect cache, queries, mutations
6. **Type Safety**: Full TypeScript support

## ⚡ Performance Gains

- Reduced network requests (intelligent caching)
- Fewer re-renders (fine-grained subscriptions)
- Better perceived performance (optimistic updates)
- Automatic garbage collection of unused cache

---

**Status**: Ready to implement
**Estimated Time**: 2-3 hours
**Priority**: High (Foundation for Phase 5-6)
