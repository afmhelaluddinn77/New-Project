export type PrescriptionStatus = 'NEW' | 'REVIEW_PENDING' | 'VERIFIED' | 'DISPENSED' | 'CANCELLED';
export type OrderPriority = 'ROUTINE' | 'URGENT' | 'STAT';

export interface MedicationItem {
  id: string;
  prescriptionOrderId: string;
  rxNormId: string;
  drugName: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string | null;
  status: 'ACTIVE' | 'MODIFIED' | 'DISCONTINUED';
}

export interface PrescriptionOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  providerId: string;
  encounterId: string;
  priority: OrderPriority;
  status: PrescriptionStatus;
  notes?: string | null;
  submittedAt: string;
  verifiedAt?: string | null;
  dispensedAt?: string | null;
  items: MedicationItem[];
}

export interface VerificationPayload {
  action: 'VERIFY' | 'REJECT' | 'DISPENSE';
  notes?: string;
}

