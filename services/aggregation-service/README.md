# Aggregation Service

CQRS-based aggregation service for denormalized read models.

## Purpose

Provides single-API-call access to complete patient data by consuming events from all microservices and building optimized read models.

## Development Law Compliance

✅ **NestJS 10+** - Modern TypeScript framework
✅ **Prisma ONLY** - No TypeORM or Sequelize
✅ **PostgreSQL 15+** - Aggregation schema
✅ **FHIR R4** - Event data structure
✅ **HIPAA** - Audit logging for all PHI access

## Architecture

### CQRS Pattern

- **Write Side**: Other services (lab, radiology, pharmacy)
- **Event Bus**: NATS JetStream
- **Read Side**: This service (aggregation)

### Event-Driven Updates

1. Lab service publishes `lab.result.available`
2. Aggregation service consumes event
3. Creates `LabResultView` (denormalized)
4. Updates `PatientAggregateView.unreadResults++`
5. Provider portal calls `/api/aggregate/patients/:id` → instant response

## Features

### Aggregated Views

- **PatientAggregateView** - Complete patient chart (allergies, meds, vitals, diagnoses)
- **LabResultView** - Lab results with critical value tracking
- **ImagingStudyView** - Radiology studies with MinIO image URLs
- **MedicationView** - Prescription history with dispense tracking
- **EncounterView** - Visit history with diagnoses

### Benefits

- **Single API Call** - No more 5-10 parallel requests
- **Fast Response** - Pre-computed read models
- **Cross-Service Data** - Lab + Radiology + Pharmacy in one view
- **Real-Time** - Updated via events (no polling)

## Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start service
npm run start:dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://clinical_user:clinical_password@localhost:5433/clinical?schema=aggregation"
NATS_URL="nats://localhost:4222"
PORT=3020
```

## API Endpoints

### Get Patient Aggregate

```http
GET /api/aggregate/patients/:patientId
```

**Response:**

```json
{
  "patient": {
    "id": "uuid",
    "mrn": "MRN123456",
    "fullName": "John Doe",
    "allergies": [...],
    "medications": [...],
    "latestVitals": {...},
    "alerts": {
      "critical": 2,
      "unreadResults": 5
    }
  },
  "labResults": [...],
  "imagingStudies": [...],
  "medications": [...],
  "encounters": [...]
}
```

### Get Critical Alerts

```http
GET /api/aggregate/patients/:patientId/alerts
```

## Event Handlers

### Patient Events

- `patient.created` → Create PatientAggregateView
- `patient.allergy.added` → Update allergies array

### Lab Events

- `lab.result.available` → Create LabResultView
- `lab.critical.alert` → Update critical alerts

### Radiology Events

- `radiology.study.complete` → Create ImagingStudyView
- `radiology.report.finalized` → Update with report

### Pharmacy Events

- `pharmacy.medication.prescribed` → Create MedicationView
- `pharmacy.medication.dispensed` → Update dispense info

### Encounter Events

- `encounter.started` → Create EncounterView
- `encounter.vitals.recorded` → Update patient vitals

## HIPAA Compliance

All API calls logged to `AuditLog`:

- User ID
- Action (VIEW_PATIENT_CHART)
- Resource ID
- IP Address
- Timestamp
- Portal type

## Development

```bash
# Watch mode
npm run start:dev

# Debug mode
npm run start:debug

# Prisma Studio (view data)
npm run prisma:studio
```

## Docker

```yaml
aggregation-service:
  build: ./services/aggregation-service
  ports:
    - "3020:3020"
  environment:
    - DATABASE_URL=postgresql://clinical_user:clinical_password@clinical-db:5432/clinical?schema=aggregation
    - NATS_URL=nats://nats:4222
  depends_on:
    - clinical-db
    - nats
```
