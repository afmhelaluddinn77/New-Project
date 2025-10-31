import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RadiologyOrder, CreateReportPayload } from '../types/radiology';
import { fetchPendingStudies, submitRadiologyReport } from '../services/radiologyApi';

interface RadiologyState {
  orders: RadiologyOrder[];
  loading: boolean;
  error?: string;
  fetchOrders: () => Promise<void>;
  refreshOrder: (orderId: string) => Promise<void>;
  submitReport: (orderId: string, payload: CreateReportPayload) => Promise<void>;
}

export const useRadiologyStore = create<RadiologyState>()(
  devtools((set, get) => ({
    orders: [],
    loading: false,
    error: undefined,
    async fetchOrders() {
      set({ loading: true, error: undefined });
      try {
        const orders = await fetchPendingStudies();
        set({ orders, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    },
    async refreshOrder(orderId: string) {
      try {
        const orders = await fetchPendingStudies();
        set({ orders });
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },
    async submitReport(orderId, payload) {
      await submitRadiologyReport(orderId, payload);
      await get().refreshOrder(orderId);
    },
  })),
);

