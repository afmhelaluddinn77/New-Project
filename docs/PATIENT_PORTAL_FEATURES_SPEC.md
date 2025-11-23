# Patient Portal - 20 Features Implementation Spec

## Domain Objects & Ownership

### 1. **Personalized Dashboard** (✓ Exists, needs enhancement)

- **Domain**: `PatientDashboard`
- **Owner**: `aggregation-service` (read model)
- **Consumers**: Patient Portal
- **PHI**: Name, MRN, vitals, conditions
- **FHIR**: Patient, Observation resources

### 2. **View Appointments** (Partial - needs backend)

- **Domain**: `Appointment`
- **Owner**: `appointment-service` (NEW)
- **Consumers**: Patient Portal, Provider Portal
- **PHI**: Patient ID, provider, date/time, location
- **FHIR**: Appointment resource

### 3. **Schedule New Appointments** (Missing)

- **Domain**: `AppointmentRequest`
- **Owner**: `appointment-service`
- **Consumers**: Patient Portal
- **Fields**: patientId, requestedDate, requestedTime, appointmentType, reason, preferredProviderId
- **Lifecycle**: REQUESTED → PENDING_APPROVAL → CONFIRMED → CANCELLED

### 4. **Reschedule Appointments** (Missing)

- **Domain**: `AppointmentChange`
- **Owner**: `appointment-service`
- **Fields**: appointmentId, newDate, newTime, reason
- **Lifecycle**: REQUESTED → APPROVED → RESCHEDULED

### 5. **Medication List** (Partial - needs backend)

- **Domain**: `PatientMedicationView`
- **Owner**: `aggregation-service`
- **Source**: `pharmacy-service` MedicationRequest
- **PHI**: Medication names, dosages, refills
- **FHIR**: MedicationRequest, MedicationStatement

### 6. **Refill Requests** (Missing)

- **Domain**: `MedicationRefillRequest`
- **Owner**: `pharmacy-service`
- **Fields**: medicationRequestId, patientId, requestedQuantity, reason
- **Lifecycle**: REQUESTED → PENDING_APPROVAL → APPROVED → DISPENSED

### 7. **Lab Results Access** (Partial - needs backend)

- **Domain**: `PatientLabResultView`
- **Owner**: `aggregation-service`
- **Source**: `lab-service`
- **PHI**: Test names, values, ranges, dates
- **FHIR**: DiagnosticReport, Observation

### 8. **Vitals Tracking & Charting** (Partial - needs charts & backend)

- **Domain**: `PatientVitalsEntry`
- **Owner**: `patient-service` or `encounter-service`
- **Fields**: patientId, vitalType, value, unit, recordedAt, source (PATIENT_ENTERED vs PROVIDER_ENTERED)
- **Chart**: Line chart with historical trends
- **FHIR**: Observation (vital-signs category)

### 9. **Immunization Record** (Missing)

- **Domain**: `PatientImmunizationView`
- **Owner**: `aggregation-service`
- **Source**: `encounter-service` Immunization
- **PHI**: Vaccine name, date, lot number, provider
- **FHIR**: Immunization resource

### 10. **Allergies & Conditions Management** (Missing)

- **Domain**: `PatientAllergyCondition`
- **Owner**: `patient-service` or `encounter-service`
- **Fields**: patientId, type (ALLERGY|CONDITION), snomedCode, description, severity, onsetDate
- **FHIR**: AllergyIntolerance, Condition

### 11. **Secure Messaging** (Missing)

- **Domain**: `PatientMessage`
- **Owner**: `messaging-service` (NEW)
- **Fields**: fromUserId, toUserId, subject, body, attachments, readAt, sentAt
- **PHI**: Message content may contain PHI - must be encrypted
- **Lifecycle**: DRAFT → SENT → READ → ARCHIVED

### 12. **View Invoices** (Missing)

- **Domain**: `PatientInvoiceView`
- **Owner**: `billing-service` or `encounter-service`
- **Source**: Invoice model (already created in encounter-service)
- **Fields**: invoiceNumber, patientId, amount, dueDate, status, lineItems

### 13. **Online Bill Pay (Simulated)** (Missing)

- **Domain**: `Payment`
- **Owner**: `billing-service`
- **Fields**: invoiceId, amount, paymentMethod, transactionId, paidAt
- **Note**: Simulated - no real payment gateway integration

### 14. **Demographics Update** (Missing)

- **Domain**: `PatientDemographics`
- **Owner**: `patient-service`
- **Fields**: name, dateOfBirth, gender, address, phone, email, emergencyContact, insuranceInfo
- **PHI**: All fields
- **FHIR**: Patient resource

### 15. **Health Education Resources** (Missing)

- **Domain**: `HealthResource`
- **Owner**: `content-service` (NEW or use `aggregation-service`)
- **Fields**: title, category, content, url, tags, publishedDate
- **Note**: Non-PHI content library

### 16. **Forms & Documents Access** (Missing)

- **Domain**: `PatientDocument`
- **Owner**: `document-service` (NEW or use `encounter-service`)
- **Fields**: patientId, documentType, fileName, fileUrl, uploadedAt, uploadedBy
- **PHI**: Document content
- **Note**: MinIO or S3 storage for files

### 17. **Preferred Pharmacy Selection** (Missing)

- **Domain**: `PatientPreferredPharmacy`
- **Owner**: `patient-service`
- **Fields**: patientId, pharmacyName, pharmacyAddress, pharmacyPhone, isPrimary

### 18. **Personal Reminders** (Implicit)

- **Domain**: `PatientReminder`
- **Owner**: `notification-service` (NEW)
- **Fields**: patientId, reminderType, reminderText, scheduledFor, sentAt
- **Note**: Backend task scheduler

### 19. **Clinical Summaries** (Missing)

- **Domain**: `EncounterSummaryView`
- **Owner**: `aggregation-service`
- **Source**: `encounter-service`
- **Fields**: encounterId, encounterDate, provider, chiefComplaint, assessment, plan
- **FHIR**: Encounter, Composition

### 20. **Self-Check-in (Simulated)** (Missing)

- **Domain**: `PatientCheckIn`
- **Owner**: `appointment-service`
- **Fields**: appointmentId, checkInTime, symptoms, temperature
- **Lifecycle**: CHECKED_IN → READY_FOR_PROVIDER

## Backend Services Required

### New Services:

1. `appointment-service` - Handles appointments, scheduling, check-in
2. `messaging-service` - Secure patient-provider messaging
3. `content-service` OR extend `aggregation-service` - Health education content

### Extend Existing:

1. `patient-service` - Add demographics, allergies, conditions, pharmacy preference
2. `pharmacy-service` - Add refill requests
3. `encounter-service` - Already has immunizations, may need patient vitals
4. `billing-service` OR `encounter-service` - Invoices (already added to encounter-service)

## Frontend Components Required

### New Pages:

1. `/appointments` - List & manage appointments
2. `/medications` - List & request refills
3. `/lab-results` - View lab results
4. `/vitals` - Track personal vitals with charts
5. `/immunizations` - Immunization record
6. `/allergies-conditions` - Manage allergies & conditions
7. `/messages` - Inbox/compose messages
8. `/billing` - View invoices & pay bills
9. `/profile` - Update demographics
10. `/education` - Health resources library
11. `/documents` - View medical documents

### New Components:

1. `SimpleLineChart` - For vitals trending
2. `AppointmentCard` - Display appointment info
3. `MedicationCard` - Display medication with refill button
4. `LabResultCard` - Display lab results
5. `MessageThread` - Display message conversation
6. `InvoiceTable` - Display billing info
7. `DemographicsForm` - Edit personal info
8. `ResourceCard` - Health education content

## API Endpoints Required

### Appointments

- `GET /api/appointments?patientId=X` - List appointments
- `POST /api/appointments` - Schedule new appointment
- `PATCH /api/appointments/:id/reschedule` - Reschedule
- `POST /api/appointments/:id/check-in` - Self check-in

### Medications

- `GET /api/pharmacy/medications?patientId=X` - List active meds
- `POST /api/pharmacy/refill-requests` - Request refill

### Lab Results

- `GET /api/lab/results?patientId=X` - List lab results
- `GET /api/lab/results/:id` - Get detailed result

### Vitals

- `GET /api/patient-vitals?patientId=X` - List vitals history
- `POST /api/patient-vitals` - Add new vital entry

### Immunizations

- `GET /api/immunizations?patientId=X` - List immunizations

### Allergies & Conditions

- `GET /api/patient/allergies?patientId=X` - List allergies
- `POST /api/patient/allergies` - Add allergy
- `GET /api/patient/conditions?patientId=X` - List conditions
- `POST /api/patient/conditions` - Add condition

### Messaging

- `GET /api/messages?patientId=X` - List messages
- `POST /api/messages` - Send message
- `PATCH /api/messages/:id/read` - Mark as read

### Billing

- `GET /api/billing/invoices?patientId=X` - List invoices
- `POST /api/billing/payments` - Submit payment (simulated)

### Demographics

- `GET /api/patient/demographics/:patientId` - Get demographics
- `PATCH /api/patient/demographics/:patientId` - Update demographics

### Health Education

- `GET /api/content/health-resources` - List resources
- `GET /api/content/health-resources/:id` - Get resource details

### Documents

- `GET /api/documents?patientId=X` - List documents
- `GET /api/documents/:id/download` - Download document

## HIPAA/PHI Considerations

- All endpoints require JWT authentication
- All PHI must be masked in logs
- All patient data access must create audit log entries
- File uploads/downloads must be encrypted
- Messages must be encrypted at rest

## Implementation Priority

### Phase 1 (High Priority - Core Features):

1. View Appointments (enhance existing with real backend)
2. Medication List (enhance existing with real backend)
3. Lab Results Access (enhance existing with real backend)
4. Vitals Tracking & Charting
5. View Invoices

### Phase 2 (Medium Priority - Interactive Features):

6. Schedule New Appointments
7. Reschedule Appointments
8. Refill Requests
9. Secure Messaging
10. Demographics Update

### Phase 3 (Lower Priority - Supporting Features):

11. Immunization Record
12. Allergies & Conditions Management
13. Online Bill Pay
14. Health Education Resources
15. Forms & Documents Access
16. Preferred Pharmacy Selection
17. Clinical Summaries
18. Self-Check-in

## FHIR Mapping Summary

| Feature            | FHIR Resource(s)                       |
| ------------------ | -------------------------------------- |
| Appointments       | Appointment                            |
| Medications        | MedicationRequest, MedicationStatement |
| Lab Results        | DiagnosticReport, Observation          |
| Vitals             | Observation (vital-signs)              |
| Immunizations      | Immunization                           |
| Allergies          | AllergyIntolerance                     |
| Conditions         | Condition                              |
| Demographics       | Patient                                |
| Clinical Summaries | Encounter, Composition                 |
| Documents          | DocumentReference                      |
| Messages           | Communication                          |

## Next Steps

1. Create missing backend services (appointment-service, messaging-service)
2. Extend patient-service with Prisma schema
3. Implement API endpoints
4. Build frontend pages & components
5. Integrate with FHIR service
6. Add comprehensive tests
