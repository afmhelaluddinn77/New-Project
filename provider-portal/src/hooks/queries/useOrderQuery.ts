import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryClient";
import { fetchUnifiedOrder } from "../../services/workflowApi";
import type { UnifiedOrder } from "../../types/workflow";

/**
 * Fetch a single unified order by ID
 *
 * Features:
 * - Automatically fetches when orderId changes
 * - Shares cache with useOrdersQuery
 * - Disabled when orderId is null/undefined
 *
 * @example
 * ```tsx
 * function OrderDetails({ orderId }: { orderId: string | null }) {
 *   const { data: order, isLoading } = useOrderQuery(orderId);
 *
 *   if (!orderId) return <SelectPrompt />;
 *   if (isLoading) return <Spinner />;
 *
 *   return <OrderDetailView order={order} />;
 * }
 * ```
 */
export function useOrderQuery(
  orderId: string | null,
  options?: Omit<
    UseQueryOptions<UnifiedOrder, Error>,
    "queryKey" | "queryFn" | "enabled"
  >
) {
  return useQuery<UnifiedOrder, Error>({
    queryKey: queryKeys.orders.detail(orderId || ""),
    queryFn: () => fetchUnifiedOrder(orderId!),
    enabled: !!orderId,
    ...options,
  });
}
