import { api } from "../lib/api";
import type { CreateUnifiedOrderInput, UnifiedOrder } from "../types/workflow";

/**
 * Workflow API Service
 *
 * Phase 5: Updated to use Kong API Gateway
 * All requests go through /api/workflow route configured in Kong
 */

export async function fetchUnifiedOrders(): Promise<UnifiedOrder[]> {
  const response = await api.get<UnifiedOrder[]>("/workflow/orders");
  return response.data;
}

export async function fetchUnifiedOrder(
  orderId: string
): Promise<UnifiedOrder> {
  const response = await api.get<UnifiedOrder>(`/workflow/orders/${orderId}`);
  return response.data;
}

export async function createUnifiedOrder(
  payload: CreateUnifiedOrderInput
): Promise<UnifiedOrder> {
  const response = await api.post<UnifiedOrder>(
    "/workflow/orders/unified",
    payload
  );
  return response.data;
}
