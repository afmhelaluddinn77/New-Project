# EMR/HMS Event Library

Shared TypeScript event definitions for event-driven microservices architecture.

## Overview

This package provides strongly-typed domain event interfaces following:

- **FHIR R4** resource types and terminology
- **HIPAA** audit trail requirements
- **Event Sourcing** patterns for microservices
- **TypeScript Strict Mode** for type safety

## Installation

```bash
# Install in service
cd services/aggregation-service
npm install ../../common/events
```

## Usage

```typescript
import { LabResultAvailableEvent, DomainEvent } from "@emr-hms/events";

// Publish event
const event: LabResultAvailableEvent = {
  eventId: "evt_123",
  eventType: "lab.result.available",
  aggregateId: "report_456",
  aggregateType: "DiagnosticReport",
  timestamp: new Date(),
  userId: "user_789",
  portalType: "LAB",
  data: {
    reportId: "report_456",
    orderId: "order_123",
    patientId: "patient_789",
    providerId: "provider_101",
    status: "final",
    criticalValues: true,
    abnormalResults: true,
    resultCount: 5,
    fhirResource: {
      /* FHIR DiagnosticReport */
    },
  },
};

// Consume event
function handleLabResult(event: LabResultAvailableEvent) {
  // Update aggregated view
  // Send notification to provider
}
```

## Event Categories

### Patient Events

- `patient.created` - New patient registered
- `patient.updated` - Demographics changed
- `patient.allergy.added` - New allergy documented (CRITICAL)
- `patient.allergy.removed` - Allergy resolved

### Lab Events

- `lab.order.created` - Provider ordered tests
- `lab.result.available` - Results finalized (triggers notifications)
- `lab.critical.alert` - Critical value detected (URGENT)
- `lab.result.viewed` - HIPAA audit trail

### Radiology Events

- `radiology.order.created` - Imaging study ordered
- `radiology.study.complete` - Images uploaded
- `radiology.image.uploaded` - Individual DICOM uploaded
- `radiology.report.finalized` - Radiologist report complete
- `radiology.critical.alert` - Critical finding (URGENT)

### Pharmacy Events

- `pharmacy.medication.prescribed` - Prescription written
- `pharmacy.interaction.alert` - Drug interaction detected (CRITICAL)
- `pharmacy.allergy.contraindication` - Allergy conflict (CRITICAL)
- `pharmacy.medication.dispensed` - Prescription filled

### Encounter Events

- `encounter.started` - Visit began
- `encounter.completed` - Visit ended
- `encounter.vitals.recorded` - Vital signs entered

## Standards Compliance

### FHIR R4

All events reference FHIR resource types:

- `Patient`, `Encounter`, `Observation`
- `DiagnosticReport`, `ImagingStudy`, `MedicationRequest`
- `AllergyIntolerance`, `Condition`, `Procedure`

### HIPAA Audit

Every event includes:

- `userId` - Who triggered the event
- `timestamp` - When it occurred
- `portalType` - Where it originated
- `aggregateId` - What resource was affected

### Terminology

- **SNOMED CT** - Clinical terms (allergies, diagnoses)
- **LOINC** - Lab test codes
- **RxNorm** - Medication codes

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Clean
npm run clean
```

## Architecture

Services using this library:

- **aggregation-service** - Consumes all events, builds read models
- **notification-service** - Consumes critical events, sends real-time alerts
- **lab-service** - Publishes lab events
- **radiology-service** - Publishes imaging events
- **pharmacy-service** - Publishes medication events
- **patient-service** - Publishes patient events
- **encounter-service** - Publishes encounter events

## License

PRIVATE - Internal use only
