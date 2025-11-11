export type RadiologyOrderStatus =
  | "NEW"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REPORTED"
  | "CANCELLED";

export type StudyType = "XRAY" | "CT" | "MRI" | "ULTRASOUND" | "OTHER";

export interface RadiologyReport {
  id: string;
  radiologyOrderId: string;
  reportText: string;
  impression?: string | null;
  criticalFinding: boolean;
  reportingRadiologistId: string;
  reportStatus: "DRAFT" | "FINAL" | "AMENDED";
  updatedAt: string;
}

export interface RadiologyOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  providerId: string;
  encounterId: string;
  studyType: StudyType;
  bodyPart: string;
  contrast: boolean;
  priority: "ROUTINE" | "URGENT" | "STAT";
  status: RadiologyOrderStatus;
  orderedAt: string;
  report?: RadiologyReport | null;
  imagingAssets?: ImagingAsset[];
}

export interface CreateReportPayload {
  reportText: string;
  impression?: string;
  criticalFinding?: boolean;
}

export interface ImagingAsset {
  id: string;
  radiologyOrderId: string;
  uri: string;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}
