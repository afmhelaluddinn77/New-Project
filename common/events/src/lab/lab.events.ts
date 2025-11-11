/**
 * Lab Domain Events
 *
 * FHIR R4 Compliant Lab Events
 * Used by: lab-service, aggregation-service, notification-service
 */

import { DomainEvent } from "../base/domain-event";

/**
 * Lab Order Created Event
 * Published when: Provider orders lab tests
 */
export interface LabOrderCreatedEvent extends DomainEvent {
  eventType: "lab.order.created";
  aggregateType: "ServiceRequest";
  data: {
    orderId: string;
    patientId: string;
    providerId: string;
    tests: Array<{
      loincCode: string;
      testName: string;
    }>;
    priority: "routine" | "urgent" | "stat";
    fhirResource: any;
  };
}

/**
 * Lab Result Available Event
 * Published when: Lab results finalized
 * CRITICAL: Triggers notifications, aggregation updates
 */
export interface LabResultAvailableEvent extends DomainEvent {
  eventType: "lab.result.available";
  aggregateType: "DiagnosticReport";
  data: {
    reportId: string;
    orderId: string;
    patientId: string;
    providerId: string;
    status: "preliminary" | "final" | "corrected";
    criticalValues: boolean;
    abnormalResults: boolean;
    resultCount: number;
    fhirResource: any;
  };
}

/**
 * Critical Lab Value Alert Event
 * Published when: Lab result has critical values
 * URGENT: Requires immediate provider notification
 */
export interface CriticalLabValueEvent extends DomainEvent {
  eventType: "lab.critical.alert";
  aggregateType: "Observation";
  data: {
    reportId: string;
    patientId: string;
    patientName: string;
    providerId: string;
    testName: string;
    loincCode: string;
    value: string | number;
    unit: string;
    referenceRange: string;
    criticalReason: string;
  };
}

/**
 * Lab Result Viewed Event
 * Published when: Provider views lab results
 * HIPAA: Audit trail for PHI access
 */
export interface LabResultViewedEvent extends DomainEvent {
  eventType: "lab.result.viewed";
  aggregateType: "DiagnosticReport";
  data: {
    reportId: string;
    patientId: string;
    viewedBy: string;
    ipAddress: string;
  };
}
