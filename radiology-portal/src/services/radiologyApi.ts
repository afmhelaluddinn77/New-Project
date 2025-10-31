import { radiologyClient } from './httpClient';
import type { RadiologyOrder, CreateReportPayload } from '../types/radiology';

export async function fetchPendingStudies(): Promise<RadiologyOrder[]> {
  const response = await radiologyClient.get<RadiologyOrder[]>('/orders/pending');
  return response.data;
}

export async function submitRadiologyReport(orderId: string, payload: CreateReportPayload): Promise<RadiologyOrder> {
  const response = await radiologyClient.post<RadiologyOrder>(`/orders/${orderId}/report`, payload);
  return response.data;
}

