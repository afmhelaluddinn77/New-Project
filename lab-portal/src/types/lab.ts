export type LabOrderPriority = 'ROUTINE' | 'URGENT' | 'STAT';
export type LabOrderStatus = 'NEW' | 'IN_PROGRESS' | 'RESULT_READY' | 'VERIFIED' | 'CANCELLED';
export type LabTestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CRITICAL';
export type AbnormalFlag = 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';

export interface LabResult {
  id: string;
  labOrderTestId: string;
  value: string;
  unit: string;
  referenceRange?: string | null;
  abnormalFlag: AbnormalFlag;
  comment?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
}

export interface LabOrderTest {
  id: string;
  labOrderId: string;
  loincCode: string;
  testName: string;
  specimenType?: string | null;
  status: LabTestStatus;
  performedAt?: string | null;
  result?: LabResult | null;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  providerId: string;
  encounterId: string;
  priority: LabOrderPriority;
  status: LabOrderStatus;
  orderedAt: string;
  tests: LabOrderTest[];
}

export interface SubmitLabResultInput {
  testId: string;
  value: string;
  unit: string;
  referenceRange?: string;
  abnormalFlag?: AbnormalFlag;
  comment?: string;
}

