import { workflowClient } from './httpClient';
import type { CreateUnifiedOrderInput, UnifiedOrder } from '../types/workflow';

export async function fetchUnifiedOrders(): Promise<UnifiedOrder[]> {
  const response = await workflowClient.get<UnifiedOrder[]>('/orders');
  return response.data;
}

export async function fetchUnifiedOrder(orderId: string): Promise<UnifiedOrder> {
  const response = await workflowClient.get<UnifiedOrder>(`/orders/${orderId}`);
  return response.data;
}

export async function createUnifiedOrder(payload: CreateUnifiedOrderInput): Promise<UnifiedOrder> {
  const response = await workflowClient.post<UnifiedOrder>('/orders/unified', payload);
  return response.data;
}

