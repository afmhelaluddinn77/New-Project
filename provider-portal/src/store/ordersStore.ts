import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Orders UI State Store (Zustand)
 *
 * PHASE 4 REFACTOR: This store now contains ONLY UI state.
 * Server state (orders data) has been moved to React Query hooks.
 *
 * What's here:
 * - selectedOrderId: Which order is currently selected in the UI
 *
 * What's NOT here (moved to React Query):
 * - orders: Use useOrdersQuery() hook instead
 * - loading/error: Use isLoading/error from React Query
 * - fetchOrders/createOrder/refreshOrder: Use mutation hooks instead
 *
 * Migration guide:
 * - Old: useOrdersStore(state => state.orders)
 * - New: useOrdersQuery().data
 *
 * - Old: useOrdersStore(state => state.loading)
 * - New: useOrdersQuery().isLoading
 *
 * - Old: useOrdersStore(state => state.createOrder)(payload)
 * - New: useCreateOrder().mutate(payload)
 */
interface OrdersUIState {
  /** Currently selected order ID in the UI */
  selectedOrderId: string | null;

  /** Select an order (updates UI only, doesn't fetch data) */
  selectOrder: (orderId: string | null) => void;
}

export const useOrdersStore = create<OrdersUIState>()(
  devtools(
    (set) => ({
      selectedOrderId: null,

      selectOrder(orderId) {
        set({ selectedOrderId: orderId });
      },
    }),
    { name: "OrdersUIStore" }
  )
);
