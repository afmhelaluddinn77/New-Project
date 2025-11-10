import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryClient";
import { fetchUnifiedOrders } from "../../services/workflowApi";
import type { UnifiedOrder } from "../../types/workflow";

/**
 * Fetch all unified orders
 *
 * Features:
 * - Automatic caching with 30s stale time
 * - Background refetching on window focus
 * - Automatic retry on failure
 * - React Query DevTools integration
 *
 * @example
 * ```tsx
 * function OrdersList() {
 *   const { data: orders, isLoading, error } = useOrdersQuery();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return orders.map(order => <OrderCard key={order.id} order={order} />);
 * }
 * ```
 */
export function useOrdersQuery(
  options?: Omit<UseQueryOptions<UnifiedOrder[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<UnifiedOrder[], Error>({
    queryKey: queryKeys.orders.lists(),
    queryFn: fetchUnifiedOrders,
    ...options,
  });
}
