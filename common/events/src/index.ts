/**
 * EMR/HMS Event Library
 *
 * Shared event types for microservices communication
 * Follows Development Law:
 * - FHIR R4 compliance
 * - HIPAA audit trail
 * - TypeScript strict mode
 * - Event-driven architecture
 */

// Base types
export * from "./base/domain-event";

// Patient events
export * from "./patient/patient.events";

// Lab events
export * from "./lab/lab.events";

// Radiology events
export * from "./radiology/radiology.events";

// Pharmacy events
export * from "./pharmacy/pharmacy.events";

// Encounter events
export * from "./encounter/encounter.events";
