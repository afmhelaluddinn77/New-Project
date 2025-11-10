# Phase 4 Quick Reference

## 🚀 Quick Start

### Using Queries (Fetch Data)

```typescript
import { useOrdersQuery } from '@/hooks';

function Component() {
  const { data: orders, isLoading, error } = useOrdersQuery();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return orders.map(order => <div key={order.id}>{order.orderNumber}</div>);
}
```

### Using Mutations (Modify Data)

```typescript
import { useCreateOrder } from '@/hooks';

function Component() {
  const createOrder = useCreateOrder();

  const handleCreate = () => {
    createOrder.mutate(payload, {
      onSuccess: (order) => alert(`Created ${order.id}`),
      onError: (error) => alert(error.message),
    });
  };

  return (
    <button onClick={handleCreate} disabled={createOrder.isPending}>
      {createOrder.isPending ? 'Creating...' : 'Create Order'}
    </button>
  );
}
```

### Using UI State (Zustand)

```typescript
import { useOrdersStore } from '@/store/ordersStore';

function Component() {
  const selectedOrderId = useOrdersStore(state => state.selectedOrderId);
  const selectOrder = useOrdersStore(state => state.selectOrder);

  return (
    <button onClick={() => selectOrder('123')}>
      Select Order
    </button>
  );
}
```

## 📚 Available Hooks

### Queries

- `useOrdersQuery()` - Fetch all orders
- `useOrderQuery(id)` - Fetch single order

### Mutations

- `useCreateOrder()` - Create new order

## 🔧 Common Patterns

### Refetch on Demand

```typescript
const { data, refetch } = useOrdersQuery();

<button onClick={() => refetch()}>Refresh</button>
```

### Conditional Fetching

```typescript
const { data } = useOrderQuery(orderId, {
  enabled: !!orderId, // Only fetch if ID exists
});
```

### Manual Cache Invalidation

```typescript
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
```

## 🐛 Debugging

### React Query DevTools

1. App is running
2. Press F12 (Developer Tools)
3. Look for "React Query" tab
4. See all queries, cache, and status

### Common Issues

**Problem**: Data not updating
**Solution**: Check if query key is correct, try invalidating

**Problem**: Infinite re-renders
**Solution**: Don't call mutations in render, use event handlers

**Problem**: Stale data showing
**Solution**: Adjust staleTime in queryClient config or invalidate

## 📝 Migration Checklist

When migrating a component from Zustand to React Query:

- [ ] Replace `useStore(state => state.data)` with `useQuery().data`
- [ ] Replace `useStore(state => state.loading)` with `useQuery().isLoading`
- [ ] Replace `useStore(state => state.error)` with `useQuery().error`
- [ ] Remove `useEffect` that calls fetch functions
- [ ] Replace store mutations with mutation hooks
- [ ] Keep only UI state in Zustand
- [ ] Update WebSocket handlers to invalidate queries
- [ ] Test loading, error, and success states

## ⚡ Performance Tips

1. **Use select for transformations**

```typescript
const orderIds = useOrdersQuery({
  select: (data) => data.map((o) => o.id), // Only re-render when IDs change
});
```

2. **Prefetch data**

```typescript
const queryClient = useQueryClient();
queryClient.prefetchQuery({
  queryKey: queryKeys.orders.detail(id),
  queryFn: () => fetchUnifiedOrder(id),
});
```

3. **Share cache between queries**

- React Query automatically deduplicates requests
- Same query key = shared cache

---

**Updated**: November 7, 2025
**See**: PHASE_4_COMPLETE.md for full documentation
