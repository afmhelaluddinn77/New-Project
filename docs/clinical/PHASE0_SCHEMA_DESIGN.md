# Phase 0: Clinical Services Schema Design

This document captures the database schema design for the new clinical microservices. Each service owns its own schema and database connection. Relationships between services are handled via IDs (patient, provider, encounter) supplied by upstream master data systems.

> **Note:** All IDs referenced (`patientId`, `providerId`, `encounterId`) are treated as opaque strings/UUIDs provided by the existing EMR master data service. Every table includes audit columns (`createdAt`, `updatedAt`) for compliance logging.

## 1. Pharmacy Service Schema

### 1.1 Tables

#### `PrescriptionOrder`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) | Primary key |
| `orderNumber` | String | Human-friendly order number |
| `patientId` | String | External patient identifier |
| `providerId` | String | Ordering provider identifier |
| `encounterId` | String | Encounter/visit identifier |
| `orderType` | Enum(`OPD`, `IPD`) | Outpatient vs inpatient |
| `priority` | Enum(`ROUTINE`, `URGENT`, `STAT`) | Priority selection |
| `status` | Enum(`NEW`, `REVIEW_PENDING`, `VERIFIED`, `DISPENSED`, `CANCELLED`) | Overall order lifecycle |
| `notes` | Text | Provider notes to pharmacy |
| `submittedAt` | Timestamp | When provider placed order |
| `verifiedAt` | Timestamp (nullable) | Pharmacist verification timestamp |
| `dispensedAt` | Timestamp (nullable) | When medication was dispensed |
| `createdAt` | Timestamp | Audit |
| `updatedAt` | Timestamp | Audit |

#### `MedicationItem`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `prescriptionOrderId` | UUID (FK) | References `PrescriptionOrder.id` |
| `rxNormId` | String | RxNorm identifier for the drug |
| `drugName` | String | Display name |
| `dosage` | String | e.g. "500 mg" |
| `route` | String | e.g. "Oral" |
| `frequency` | String | e.g. "BID" |
| `duration` | String | e.g. "30 days" |
| `quantity` | Integer | Total units |
| `instructions` | Text | Patient instructions |
| `status` | Enum(`ACTIVE`, `MODIFIED`, `DISCONTINUED`) | Item-level tracking |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

#### `DrugInteractionCheck`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `prescriptionOrderId` | UUID (FK) | Link to the order |
| `severity` | Enum(`MINOR`, `MODERATE`, `MAJOR`, `CONTRAINDICATED`) |
| `description` | Text | Summary returned by RxNorm API |
| `recommendation` | Text | Action guidance |
| `checkedAt` | Timestamp | When the check was performed |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

### 1.2 Indices & Constraints
- `MedicationItem.prescriptionOrderId` FK with cascade delete
- Unique index on `orderNumber`

---

## 2. Lab Service Schema

### 2.1 Tables

#### `LabOrder`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `orderNumber` | String |
| `patientId` | String |
| `providerId` | String |
| `encounterId` | String |
| `priority` | Enum(`ROUTINE`, `URGENT`, `STAT`) |
| `status` | Enum(`NEW`, `IN_PROGRESS`, `RESULT_READY`, `VERIFIED`, `CANCELLED`) |
| `clinicalNotes` | Text |
| `orderedAt` | Timestamp |
| `resultedAt` | Timestamp (nullable) |
| `verifiedAt` | Timestamp (nullable) |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

#### `LabOrderTest`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `labOrderId` | UUID (FK) | References `LabOrder.id` |
| `loincCode` | String | LOINC identifier |
| `testName` | String | Display name |
| `specimenType` | String |
| `status` | Enum(`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CRITICAL`) |
| `performedAt` | Timestamp (nullable) |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

#### `LabResult`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `labOrderTestId` | UUID (FK) | References `LabOrderTest.id` |
| `value` | String | Result value |
| `unit` | String | Measurement unit |
| `referenceRange` | String | e.g. "4.5 - 11.0 x10^9/L" |
| `abnormalFlag` | Enum(`NORMAL`, `LOW`, `HIGH`, `CRITICAL`) |
| `comment` | Text |
| `verifiedBy` | String | User ID of verifying technologist or pathologist |
| `verifiedAt` | Timestamp |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

### 2.2 Indices & Constraints
- `LabOrderTest.labOrderId` FK with cascade delete
- `LabResult.labOrderTestId` unique (one result per test)

---

## 3. Radiology Service Schema

### 3.1 Tables

#### `RadiologyOrder`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `orderNumber` | String |
| `patientId` | String |
| `providerId` | String |
| `encounterId` | String |
| `studyType` | Enum(`XRAY`, `CT`, `MRI`, `ULTRASOUND`, `OTHER`) |
| `bodyPart` | String |
| `contrast` | Boolean |
| `priority` | Enum(`ROUTINE`, `URGENT`, `STAT`) |
| `status` | Enum(`NEW`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `REPORTED`, `CANCELLED`) |
| `clinicalIndication` | Text |
| `orderedAt` | Timestamp |
| `reportedAt` | Timestamp (nullable) |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

#### `RadiologyReport`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `radiologyOrderId` | UUID (FK) |
| `reportText` | Text |
| `impression` | Text |
| `criticalFinding` | Boolean |
| `reportingRadiologistId` | String |
| `reportStatus` | Enum(`DRAFT`, `FINAL`, `AMENDED`) |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

#### `ImagingAsset`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `radiologyOrderId` | UUID (FK) |
| `uri` | String | Location of DICOM/image |
| `mimeType` | String |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

---

## 4. Clinical Workflow Service Schema

This service stores aggregate order tracking data so providers can view overall status without querying each specialized service directly.

### 4.1 Tables

#### `UnifiedOrder`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `orderNumber` | String | Shared order number |
| `patientId` | String |
| `providerId` | String |
| `encounterId` | String |
| `priority` | Enum(`ROUTINE`, `URGENT`, `STAT`) |
| `status` | Enum(`NEW`, `PARTIALLY_FULFILLED`, `COMPLETED`, `CANCELLED`) |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

#### `UnifiedOrderItem`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `unifiedOrderId` | UUID (FK) |
| `itemType` | Enum(`PHARMACY`, `LAB`, `RADIOLOGY`, `PROCEDURE`) |
| `targetServiceOrderId` | String | ID returned by specialized service |
| `status` | Enum(`REQUESTED`, `IN_PROGRESS`, `COMPLETED`, `ERROR`) |
| `metadata` | JSONB | Additional data (e.g., order summary) |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

#### `WorkflowEvent`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID (PK) |
| `unifiedOrderId` | UUID (FK) |
| `eventType` | String | e.g. `LAB_ORDER_SUBMITTED` |
| `payload` | JSONB | Event data |
| `createdAt` | Timestamp |

---

## 5. Shared Enumerations

To keep enums consistent across services, the following values should be mirrored in each service's codebase and validation layer.

- Priority: `ROUTINE`, `URGENT`, `STAT`
- Order Statuses: service-specific as defined above
- Abnormal Flags: `NORMAL`, `LOW`, `HIGH`, `CRITICAL`

---

## 6. Implementation Notes

1. **UUID Generation:** Use database-generated UUIDs (`uuid-ossp`) or Prisma/Drizzle client-side generation for all primary keys.
2. **Audit Columns:** Enforce automatic timestamps (`createdAt`, `updatedAt`) via ORM middleware.
3. **Soft Deletes:** Not required initially; cancelled orders remain in the database with status `CANCELLED` for audit.
4. **Referential Integrity:** Each service enforces integrity within its own schema only.
5. **Indexing:** Add indices on foreign keys (`patientId`, `providerId`) for faster lookups in dashboards.
6. **HIPAA Logging:** The `WorkflowEvent` table is the foundation for audit logging in `clinical-workflow-service`.

---

This schema document should be kept in sync with future migrations. All changes must be reviewed for regulatory compliance before implementation.
