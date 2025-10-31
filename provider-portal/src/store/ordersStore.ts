import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CreateUnifiedOrderInput, UnifiedOrder } from '../types/workflow';
import { createUnifiedOrder, fetchUnifiedOrder, fetchUnifiedOrders } from '../services/workflowApi';

interface OrdersState {
  orders: UnifiedOrder[];
  selectedOrderId: string | null;
  loading: boolean;
  error?: string;
  fetchOrders: () => Promise<void>;
  selectOrder: (orderId: string | null) => void;
  refreshOrder: (orderId: string) => Promise<void>;
  createOrder: (payload: CreateUnifiedOrderInput) => Promise<UnifiedOrder>;
}

export const useOrdersStore = create<OrdersState>()(
  devtools((set, get) => ({
    orders: [],
    selectedOrderId: null,
    loading: false,
    error: undefined,
    async fetchOrders() {
      set({ loading: true, error: undefined });
      try {
        const orders = await fetchUnifiedOrders();
        set({ orders, loading: false });
        if (orders.length > 0) {
          set({ selectedOrderId: orders[0].id });
        }
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    },
    selectOrder(orderId) {
      set({ selectedOrderId: orderId });
    },
    async refreshOrder(orderId) {
      try {
        const updated = await fetchUnifiedOrder(orderId);
        const { orders } = get();
        const nextOrders = orders.map((order) => (order.id === updated.id ? updated : order));
        if (!nextOrders.find((order) => order.id === updated.id)) {
          nextOrders.unshift(updated);
        }
        set({ orders: nextOrders });
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },
    async createOrder(payload) {
      const created = await createUnifiedOrder(payload);
      const { orders } = get();
      set({ orders: [created, ...orders], selectedOrderId: created.id });
      return created;
    },
  })),
);

