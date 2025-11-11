/**
 * Encounter Domain Events
 *
 * FHIR R4 Compliant Encounter Events
 * Used by: encounter-service, aggregation-service
 */

import { DomainEvent } from "../base/domain-event";

/**
 * Encounter Started Event
 * Published when: Patient visit begins
 */
export interface EncounterStartedEvent extends DomainEvent {
  eventType: "encounter.started";
  aggregateType: "Encounter";
  data: {
    encounterId: string;
    patientId: string;
    providerId: string;
    encounterType: string;
    encounterClass: "inpatient" | "outpatient" | "emergency" | "virtual";
    startTime: string;
    fhirResource: any;
  };
}

/**
 * Encounter Completed Event
 * Published when: Patient visit ends
 */
export interface EncounterCompletedEvent extends DomainEvent {
  eventType: "encounter.completed";
  aggregateType: "Encounter";
  data: {
    encounterId: string;
    patientId: string;
    providerId: string;
    endTime: string;
    diagnosisCodes: string[]; // SNOMED CT codes
    procedureCodes: string[];
    fhirResource: any;
  };
}

/**
 * Vital Signs Recorded Event
 * Published when: Vitals entered during encounter
 */
export interface VitalSignsRecordedEvent extends DomainEvent {
  eventType: "encounter.vitals.recorded";
  aggregateType: "Observation";
  data: {
    encounterId: string;
    patientId: string;
    vitals: {
      bloodPressure?: { systolic: number; diastolic: number };
      heartRate?: number;
      temperature?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      weight?: number;
      height?: number;
    };
    recordedAt: string;
    fhirResource: any;
  };
}
