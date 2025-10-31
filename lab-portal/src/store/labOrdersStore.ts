import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { LabOrder, SubmitLabResultInput } from '../types/lab';
import { fetchPendingLabOrders, submitLabResult } from '../services/labApi';

interface LabOrdersState {
  orders: LabOrder[];
  loading: boolean;
  error?: string;
  fetchOrders: () => Promise<void>;
  updateOrder: (orderId: string) => Promise<void>;
  submitResult: (orderId: string, payload: SubmitLabResultInput) => Promise<void>;
}

export const useLabOrdersStore = create<LabOrdersState>()(
  devtools((set, get) => ({
    orders: [],
    loading: false,
    error: undefined,
    async fetchOrders() {
      set({ loading: true, error: undefined });
      try {
        const orders = await fetchPendingLabOrders();
        set({ orders, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    },
    async updateOrder(orderId: string) {
      try {
        const orders = await fetchPendingLabOrders();
        set({ orders });
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },
    async submitResult(orderId, payload) {
      await submitLabResult(orderId, payload);
      await get().updateOrder(orderId);
    },
  })),
);

