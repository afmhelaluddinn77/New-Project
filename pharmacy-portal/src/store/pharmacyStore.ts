import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PrescriptionOrder, VerificationPayload } from '../types/pharmacy';
import { fetchPendingPrescriptions, verifyPrescription } from '../services/pharmacyApi';

interface PharmacyState {
  orders: PrescriptionOrder[];
  loading: boolean;
  error?: string;
  fetchOrders: () => Promise<void>;
  updateOrder: (orderId: string) => Promise<void>;
  verify: (orderId: string, payload: VerificationPayload) => Promise<void>;
}

export const usePharmacyStore = create<PharmacyState>()(
  devtools((set, get) => ({
    orders: [],
    loading: false,
    error: undefined,
    async fetchOrders() {
      set({ loading: true, error: undefined });
      try {
        const orders = await fetchPendingPrescriptions();
        set({ orders, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    },
    async updateOrder(orderId: string) {
      try {
        const orders = await fetchPendingPrescriptions();
        set({ orders });
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },
    async verify(orderId, payload) {
      await verifyPrescription(orderId, payload);
      await get().updateOrder(orderId);
    },
  })),
);

