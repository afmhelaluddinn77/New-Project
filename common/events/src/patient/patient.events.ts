/**
 * Patient Domain Events
 *
 * FHIR R4 Compliant Patient Events
 * Used by: patient-service, aggregation-service
 */

import { DomainEvent } from "../base/domain-event";

/**
 * Patient Created Event
 * Published when: New patient registered
 */
export interface PatientCreatedEvent extends DomainEvent {
  eventType: "patient.created";
  aggregateType: "Patient";
  data: {
    patientId: string;
    mrn: string;
    fullName: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other" | "unknown";
    fhirResource: any; // Full FHIR Patient resource
  };
}

/**
 * Patient Updated Event
 * Published when: Patient demographics changed
 */
export interface PatientUpdatedEvent extends DomainEvent {
  eventType: "patient.updated";
  aggregateType: "Patient";
  data: {
    patientId: string;
    mrn: string;
    changedFields: string[];
    fhirResource: any;
  };
}

/**
 * Allergy Added Event
 * Published when: New allergy documented
 * HIPAA: Critical for patient safety, must be propagated immediately
 */
export interface AllergyAddedEvent extends DomainEvent {
  eventType: "patient.allergy.added";
  aggregateType: "AllergyIntolerance";
  data: {
    patientId: string;
    allergyId: string;
    substance: string;
    snomedCode: string;
    criticality: "low" | "high" | "unable-to-assess";
    reaction?: string;
    fhirResource: any;
  };
}

/**
 * Allergy Removed Event
 * Published when: Allergy marked as resolved/removed
 */
export interface AllergyRemovedEvent extends DomainEvent {
  eventType: "patient.allergy.removed";
  aggregateType: "AllergyIntolerance";
  data: {
    patientId: string;
    allergyId: string;
    reason: string;
  };
}
