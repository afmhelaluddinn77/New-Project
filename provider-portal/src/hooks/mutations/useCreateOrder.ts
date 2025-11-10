import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryClient";
import { createUnifiedOrder } from "../../services/workflowApi";
import type {
  CreateUnifiedOrderInput,
  UnifiedOrder,
} from "../../types/workflow";

/**
 * Create a new unified order with optimistic updates
 *
 * Features:
 * - Optimistic UI updates (instant feedback)
 * - Automatic cache invalidation
 * - Rollback on error
 * - Toast notifications (can be added)
 *
 * @example
 * ```tsx
 * function CreateOrderButton() {
 *   const createOrder = useCreateOrder();
 *
 *   const handleCreate = () => {
 *     createOrder.mutate({
 *       type: 'LAB',
 *       patientId: '123',
 *       tests: ['CBC', 'CMP']
 *     }, {
 *       onSuccess: (order) => {
 *         toast.success(`Order ${order.id} created`);
 *       },
 *       onError: (error) => {
 *         toast.error(error.message);
 *       }
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={createOrder.isPending}>
 *       {createOrder.isPending ? 'Creating...' : 'Create Order'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateOrder(
  options?: Omit<
    UseMutationOptions<
      UnifiedOrder,
      Error,
      CreateUnifiedOrderInput,
      { previousOrders?: UnifiedOrder[] }
    >,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    UnifiedOrder,
    Error,
    CreateUnifiedOrderInput,
    { previousOrders?: UnifiedOrder[] }
  >({
    mutationFn: createUnifiedOrder,

    // Optimistic update
    onMutate: async (newOrder) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.lists() });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData<UnifiedOrder[]>(
        queryKeys.orders.lists()
      );

      // Optimistically update cache with temporary order
      if (previousOrders) {
        queryClient.setQueryData<UnifiedOrder[]>(
          queryKeys.orders.lists(),
          (old) => {
            const optimisticOrder = {
              id: `temp-${Date.now()}`,
              orderNumber: `TEMP-${Date.now()}`,
              ...newOrder,
              status: "NEW" as const,
              events: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as unknown as UnifiedOrder;
            return [optimisticOrder, ...(old || [])];
          }
        );
      }

      return { previousOrders };
    },

    // On error, rollback to previous value
    onError: (_error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          queryKeys.orders.lists(),
          context.previousOrders
        );
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },

    ...options,
  });
}
