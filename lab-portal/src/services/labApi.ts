import { labClient } from './httpClient';
import type { LabOrder, SubmitLabResultInput } from '../types/lab';

export async function fetchPendingLabOrders(): Promise<LabOrder[]> {
  const response = await labClient.get<LabOrder[]>('/orders/pending');
  return response.data;
}

export async function submitLabResult(orderId: string, payload: SubmitLabResultInput): Promise<void> {
  await labClient.post(`/orders/${orderId}/results`, payload);
}

