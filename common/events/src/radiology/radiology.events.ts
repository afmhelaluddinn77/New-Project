/**
 * Radiology Domain Events
 *
 * FHIR R4 Compliant Imaging Events
 * Used by: radiology-service, aggregation-service, notification-service
 */

import { DomainEvent } from '../base/domain-event';

/**
 * Imaging Order Created Event
 * Published when: Provider orders imaging study
 */
export interface ImagingOrderCreatedEvent extends DomainEvent {
  eventType: 'radiology.order.created';
  aggregateType: 'ServiceRequest';
  data: {
    orderId: string;
    patientId: string;
    providerId: string;
    modality: 'CT' | 'MR' | 'US' | 'XR' | 'NM' | 'PT';
    bodyPart: string;
    indication: string;
    priority: 'routine' | 'urgent' | 'stat';
    fhirResource: any;
  };
}

/**
 * Imaging Study Complete Event
 * Published when: Images uploaded, study ready for review
 */
export interface ImagingStudyCompleteEvent extends DomainEvent {
  eventType: 'radiology.study.complete';
  aggregateType: 'ImagingStudy';
  data: {
    studyId: string;
    orderId: string;
    patientId: string;
    modality: string;
    bodyPart: string;
    imageCount: number;
    studyDate: string;
    pacsUrl?: string;
    thumbnailUrl?: string;
    fhirResource: any;
  };
}

/**
 * Image Uploaded Event
 * Published when: Individual DICOM image uploaded
 * Internal event for tracking upload progress
 */
export interface ImageUploadedEvent extends DomainEvent {
  eventType: 'radiology.image.uploaded';
  aggregateType: 'ImagingStudy';
  data: {
    studyId: string;
    patientId: string;
    instanceUid: string;
    imageUrl: string;
    thumbnailUrl: string;
    fileSize: number;
    uploadedAt: string;
  };
}

/**
 * Radiology Report Finalized Event
 * Published when: Radiologist completes report
 */
export interface RadiologyReportFinalizedEvent extends DomainEvent {
  eventType: 'radiology.report.finalized';
  aggregateType: 'DiagnosticReport';
  data: {
    reportId: string;
    studyId: string;
    patientId: string;
    radiologistId: string;
    orderingProviderId: string;
    findings: string;
    impression: string;
    criticalFindings: boolean;
    fhirResource: any;
  };
}

/**
 * Critical Imaging Finding Event
 * Published when: Urgent findings require immediate attention
 */
export interface CriticalImagingFindingEvent extends DomainEvent {
  eventType: 'radiology.critical.alert';
  aggregateType: 'DiagnosticReport';
  data: {
    reportId: string;
    studyId: string;
    patientId: string;
    patientName: string;
    orderingProviderId: string;
    finding: string;
    urgency: 'high';
  };
}
