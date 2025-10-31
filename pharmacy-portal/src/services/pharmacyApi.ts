import { pharmacyClient } from './httpClient';
import type { PrescriptionOrder, VerificationPayload } from '../types/pharmacy';

export async function fetchPendingPrescriptions(): Promise<PrescriptionOrder[]> {
  const response = await pharmacyClient.get<PrescriptionOrder[]>('/prescriptions/pending');
  return response.data;
}

export async function verifyPrescription(id: string, payload: VerificationPayload): Promise<PrescriptionOrder> {
  const response = await pharmacyClient.post<PrescriptionOrder>(`/prescriptions/${id}/verify`, payload);
  return response.data;
}

