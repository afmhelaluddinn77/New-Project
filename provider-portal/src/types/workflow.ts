export type OrderPriority = "ROUTINE" | "URGENT" | "STAT";
export enum UnifiedOrderStatus {
  NEW = "NEW",
  PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED",
  COMPLETED = "COMPLETED",
  VERIFIED = "VERIFIED",
  CANCELLED = "CANCELLED",
}
export type OrderItemType = "PHARMACY" | "LAB" | "RADIOLOGY" | "PROCEDURE";
export type OrderItemStatus =
  | "REQUESTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ERROR";

export interface UnifiedOrderItem {
  id: string;
  unifiedOrderId: string;
  itemType: OrderItemType;
  targetServiceOrderId: string;
  status: OrderItemStatus;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowEvent {
  id: string;
  unifiedOrderId: string;
  eventType: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

export interface UnifiedOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  providerId: string;
  encounterId: string;
  priority: OrderPriority;
  status: UnifiedOrderStatus;
  diagnosisCodes?: string[] | null; // Added diagnosisCodes
  createdAt: string;
  updatedAt: string;
  items: UnifiedOrderItem[];
  events: WorkflowEvent[];
}

export interface OrderItemPayload {
  type: OrderItemType;
  payload: Record<string, unknown>;
}

export interface CreateUnifiedOrderInput {
  patientId: string;
  providerId: string;
  encounterId: string;
  priority: OrderPriority;
  notes?: string;
  items: OrderItemPayload[];
}
