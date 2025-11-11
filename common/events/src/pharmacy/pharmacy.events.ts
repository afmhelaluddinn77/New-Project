/**
 * Pharmacy Domain Events
 *
 * FHIR R4 Compliant Medication Events
 * Used by: pharmacy-service, aggregation-service, patient-service
 */

import { DomainEvent } from "../base/domain-event";

/**
 * Medication Prescribed Event
 * Published when: Provider writes prescription
 */
export interface MedicationPrescribedEvent extends DomainEvent {
  eventType: "pharmacy.medication.prescribed";
  aggregateType: "MedicationRequest";
  data: {
    requestId: string;
    patientId: string;
    prescriberId: string;
    medicationName: string;
    rxNormCode: string;
    dosage: string;
    frequency: string;
    route: string;
    duration: string;
    refills: number;
    fhirResource: any;
  };
}

/**
 * Drug Interaction Alert Event
 * Published when: System detects drug interaction
 * CRITICAL: Patient safety alert
 */
export interface DrugInteractionAlertEvent extends DomainEvent {
  eventType: "pharmacy.interaction.alert";
  aggregateType: "MedicationRequest";
  data: {
    requestId: string;
    patientId: string;
    prescriberId: string;
    newMedication: string;
    interactingMedications: Array<{
      medicationName: string;
      severity: "minor" | "moderate" | "major" | "contraindicated";
      description: string;
    }>;
  };
}

/**
 * Allergy Contraindication Alert Event
 * Published when: Medication conflicts with patient allergy
 * CRITICAL: Must prevent prescription
 */
export interface AllergyContraIndicationEvent extends DomainEvent {
  eventType: "pharmacy.allergy.contraindication";
  aggregateType: "MedicationRequest";
  data: {
    requestId: string;
    patientId: string;
    prescriberId: string;
    medication: string;
    allergySubstance: string;
    criticalityLevel: "high" | "medium" | "low";
  };
}

/**
 * Medication Dispensed Event
 * Published when: Pharmacy fills prescription
 */
export interface MedicationDispensedEvent extends DomainEvent {
  eventType: "pharmacy.medication.dispensed";
  aggregateType: "MedicationDispense";
  data: {
    dispenseId: string;
    requestId: string;
    patientId: string;
    pharmacyId: string;
    medicationName: string;
    quantityDispensed: number;
    daysSupply: number;
    dispensedAt: string;
    fhirResource: any;
  };
}
