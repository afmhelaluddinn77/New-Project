# Clinical Encounter Management System - Architecture Design

## Executive Summary
Comprehensive encounter management system for Provider Portal with full EMR capabilities including history taking, physical examination, investigations, medications, and prescription generation with HIPAA compliance, SNOMED CT, LOINC, HL7 FHIR compatibility.

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Provider Portal (React)                   │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  Encounter │  │  Medication  │  │   Prescription    │   │
│  │   Editor   │  │   Database   │  │     Preview       │   │
│  └────────────┘  └──────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (Kong)                      │
│              RBAC • Rate Limiting • Auth                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Microservices Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Encounter   │  │  Medication  │  │  Terminology     │  │
│  │   Service    │  │   Service    │  │    Service       │  │
│  │  (NestJS)    │  │  (NestJS)    │  │  (SNOMED/LOINC)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (PostgreSQL)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Encounters  │  │  Medications │  │  Terminologies   │  │
│  │   Schema     │  │   Schema     │  │    Schema        │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Feature Modules

### 2.1 History Taking Module
**Location**: `provider-portal/src/features/encounter/components/history/`

#### Components:
- `ChiefComplaintInput.tsx` - Primary complaint entry
- `HistoryOfPresentIllness.tsx` - HPI with OPQRST format
- `PastMedicalHistory.tsx` - Previous conditions, surgeries
- `MedicationHistory.tsx` - Current/past medications
- `FamilyHistory.tsx` - Hereditary conditions
- `SocialHistory.tsx` - Lifestyle, occupation, habits
- `ReviewOfSystems.tsx` - System-wise symptom review

#### Data Model:
```typescript
interface EncounterHistory {
  chiefComplaint: string
  hpi: {
    onset: string
    provocation: string
    quality: string
    radiation: string
    severity: number
    timing: string
  }
  pastMedicalHistory: MedicalCondition[]
  medicationHistory: Medication[]
  familyHistory: FamilyCondition[]
  socialHistory: {
    smoking: string
    alcohol: string
    occupation: string
    exercise: string
  }
  reviewOfSystems: SystemReview[]
}
```

### 2.2 Physical Examination Module
**Location**: `provider-portal/src/features/encounter/components/examination/`

#### Components:
- `VitalSigns.tsx` - BP, HR, RR, Temp, SpO2, BMI
- `GeneralExamination.tsx` - Appearance, consciousness
- `SystemicExamination.tsx` - System-wise examination
  - `CardiovascularExam.tsx`
  - `RespiratoryExam.tsx`
  - `AbdominalExam.tsx`
  - `NeurologicalExam.tsx`
  - `MusculoskeletalExam.tsx`

#### Data Model:
```typescript
interface PhysicalExamination {
  vitals: {
    bloodPressure: { systolic: number; diastolic: number }
    heartRate: number
    respiratoryRate: number
    temperature: number
    oxygenSaturation: number
    bmi: number
  }
  general: {
    appearance: string
    consciousness: string
    nutrition: string
  }
  systems: {
    cardiovascular: CardiovascularFindings
    respiratory: RespiratoryFindings
    abdominal: AbdominalFindings
    neurological: NeurologicalFindings
    musculoskeletal: MusculoskeletalFindings
  }
}
```

### 2.3 Investigations Module
**Location**: `provider-portal/src/features/encounter/components/investigations/`

#### Components:
- `InvestigationSearch.tsx` - Search LOINC-coded tests
- `InvestigationOrders.tsx` - Order management
- `InvestigationResults.tsx` - Results entry
- `ImagingOrders.tsx` - Radiology orders

#### Data Model (LOINC Compatible):
```typescript
interface Investigation {
  id: string
  loincCode: string
  name: string
  category: 'laboratory' | 'imaging' | 'procedure'
  status: 'ordered' | 'completed' | 'cancelled'
  orderedDate: Date
  result?: {
    value: string
    unit: string
    referenceRange: string
    interpretation: 'normal' | 'abnormal' | 'critical'
  }
}
```

### 2.4 Medication Module
**Location**: `provider-portal/src/features/encounter/components/medications/`

#### Components:
- `MedicationSearch.tsx` - Search drug database
- `MedicationPrescription.tsx` - Prescription entry
- `MedicationList.tsx` - Active medications
- `DrugInteractionChecker.tsx` - Safety checks

#### Data Model (RxNorm Compatible):
```typescript
interface Medication {
  id: string
  rxNormCode?: string
  genericName: string
  brandName?: string
  dosage: string
  route: string
  frequency: string
  duration: string
  instructions: string
  quantity: number
  refills: number
}
```

### 2.5 Prescription Preview & Print
**Location**: `provider-portal/src/features/encounter/components/prescription/`

#### Components:
- `PrescriptionPreview.tsx` - Live preview
- `PrescriptionPrint.tsx` - Print layout
- `PrescriptionSettings.tsx` - Print preferences

---

## 3. Backend Services Architecture

### 3.1 Encounter Service
**Location**: `services/encounter-service/`

#### Endpoints:
```
POST   /api/encounters                 - Create encounter
GET    /api/encounters/:id             - Get encounter
PUT    /api/encounters/:id             - Update encounter
GET    /api/encounters/patient/:id     - Get patient encounters
POST   /api/encounters/:id/finalize    - Finalize encounter
GET    /api/encounters/:id/fhir        - Export as FHIR
```

#### Database Schema:
```sql
CREATE TABLE encounters (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  encounter_date TIMESTAMP NOT NULL,
  encounter_type VARCHAR(50),
  status VARCHAR(20),
  chief_complaint TEXT,
  history_data JSONB,
  examination_data JSONB,
  assessment TEXT,
  plan TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_provider FOREIGN KEY (provider_id) REFERENCES providers(id)
);

CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_provider ON encounters(provider_id);
CREATE INDEX idx_encounters_date ON encounters(encounter_date);
```

### 3.2 Medication Service
**Location**: `services/medication-service/`

#### Endpoints:
```
GET    /api/medications/search         - Search medications
POST   /api/prescriptions              - Create prescription
GET    /api/prescriptions/:id          - Get prescription
GET    /api/medications/interactions   - Check interactions
GET    /api/medications/formulary      - Get formulary
```

#### Database Schema:
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY,
  generic_name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255),
  rx_norm_code VARCHAR(50),
  dosage_forms TEXT[],
  strengths TEXT[],
  route VARCHAR(50),
  therapeutic_class VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY,
  encounter_id UUID NOT NULL,
  medication_id UUID NOT NULL,
  dosage VARCHAR(100),
  route VARCHAR(50),
  frequency VARCHAR(100),
  duration VARCHAR(50),
  instructions TEXT,
  quantity INTEGER,
  refills INTEGER,
  status VARCHAR(20),
  prescribed_date TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_encounter FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  CONSTRAINT fk_medication FOREIGN KEY (medication_id) REFERENCES medications(id)
);
```

### 3.3 Terminology Service
**Location**: `services/terminology-service/`

#### Endpoints:
```
GET    /api/terminology/snomed/search  - Search SNOMED CT
GET    /api/terminology/loinc/search   - Search LOINC
GET    /api/terminology/icd10/search   - Search ICD-10
POST   /api/terminology/map            - Map between terminologies
```

---

## 4. Security & Compliance

### 4.1 HIPAA Compliance
- **Encryption**: All PHI encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Audit Logging**: All access to PHI logged with user, timestamp, action
- **Access Controls**: RBAC with minimum necessary access
- **Data Retention**: Configurable retention policies
- **Breach Notification**: Automated breach detection and notification

### 4.2 RBAC Implementation
```typescript
enum Role {
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST'
}

enum Permission {
  ENCOUNTER_CREATE = 'encounter:create',
  ENCOUNTER_READ = 'encounter:read',
  ENCOUNTER_UPDATE = 'encounter:update',
  ENCOUNTER_DELETE = 'encounter:delete',
  PRESCRIPTION_CREATE = 'prescription:create',
  PRESCRIPTION_READ = 'prescription:read'
}

const rolePermissions = {
  [Role.DOCTOR]: [
    Permission.ENCOUNTER_CREATE,
    Permission.ENCOUNTER_READ,
    Permission.ENCOUNTER_UPDATE,
    Permission.PRESCRIPTION_CREATE,
    Permission.PRESCRIPTION_READ
  ],
  [Role.NURSE]: [
    Permission.ENCOUNTER_READ,
    Permission.ENCOUNTER_UPDATE
  ]
}
```

### 4.3 API Gateway Configuration
```yaml
# Kong Gateway Configuration
services:
  - name: encounter-service
    url: http://encounter-service:3005
    routes:
      - name: encounters
        paths:
          - /api/encounters
        plugins:
          - name: jwt
          - name: rate-limiting
            config:
              minute: 100
          - name: request-transformer
            config:
              add:
                headers:
                  - X-User-Id:$(headers.user-id)
```

---

## 5. FHIR Compatibility

### 5.1 FHIR Resources Mapping
```typescript
// Encounter → FHIR Encounter Resource
interface FHIREncounter {
  resourceType: 'Encounter'
  id: string
  status: 'planned' | 'arrived' | 'in-progress' | 'finished'
  class: {
    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode'
    code: 'AMB' // Ambulatory
  }
  subject: {
    reference: `Patient/${patientId}`
  }
  participant: [{
    individual: {
      reference: `Practitioner/${providerId}`
    }
  }]
  period: {
    start: string
    end?: string
  }
  reasonCode: [{
    coding: [{
      system: 'http://snomed.info/sct'
      code: string
      display: string
    }]
  }]
}

// Prescription → FHIR MedicationRequest Resource
interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest'
  id: string
  status: 'active' | 'completed' | 'cancelled'
  intent: 'order'
  medicationCodeableConcept: {
    coding: [{
      system: 'http://www.nlm.nih.gov/research/umls/rxnorm'
      code: string
      display: string
    }]
  }
  subject: {
    reference: `Patient/${patientId}`
  }
  encounter: {
    reference: `Encounter/${encounterId}`
  }
  authoredOn: string
  requester: {
    reference: `Practitioner/${providerId}`
  }
  dosageInstruction: [{
    text: string
    timing: {
      repeat: {
        frequency: number
        period: number
        periodUnit: string
      }
    }
    route: {
      coding: [{
        system: 'http://snomed.info/sct'
        code: string
      }]
    }
    doseAndRate: [{
      doseQuantity: {
        value: number
        unit: string
      }
    }]
  }]
}
```

---

## 6. Machine Learning Integration

### 6.1 Data Pipeline
```
Encounters → ETL → Feature Engineering → ML Models → Predictions
```

### 6.2 ML Use Cases
1. **Diagnosis Suggestion**: Based on symptoms and findings
2. **Medication Recommendation**: Evidence-based prescribing
3. **Risk Stratification**: Predict patient outcomes
4. **Clinical Decision Support**: Alert for abnormal patterns

### 6.3 ML Service Architecture
```typescript
interface MLPredictionRequest {
  encounterId: string
  features: {
    demographics: PatientDemographics
    vitals: VitalSigns
    symptoms: string[]
    labResults: LabResult[]
  }
}

interface MLPredictionResponse {
  predictions: {
    diagnosis: {
      code: string
      name: string
      confidence: number
    }[]
    riskScore: number
    recommendations: string[]
  }
}
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Create feature module structure
- ✅ Implement prescription header/footer
- 🔄 Setup encounter service backend
- 🔄 Database schema creation
- 🔄 API Gateway configuration

### Phase 2: History & Examination (Week 3-4)
- 🔄 History taking components
- 🔄 Physical examination components
- 🔄 Data validation and storage
- 🔄 Real-time preview

### Phase 3: Investigations & Medications (Week 5-6)
- 🔄 Investigation search and ordering
- 🔄 Medication database integration
- 🔄 Drug interaction checking
- 🔄 Prescription generation

### Phase 4: Integration & Testing (Week 7-8)
- 🔄 FHIR export functionality
- 🔄 Print optimization
- 🔄 Security audit
- 🔄 Performance testing
- 🔄 HIPAA compliance verification

### Phase 5: ML & Analytics (Week 9-10)
- 🔄 Data pipeline setup
- 🔄 ML model integration
- 🔄 Analytics dashboard
- 🔄 Clinical decision support

---

## 8. Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **State Management**: Zustand / React Query
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI + Tailwind CSS
- **Print**: React-to-print

### Backend
- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL 15 + Prisma ORM
- **API Gateway**: Kong
- **Authentication**: JWT + Passport
- **Validation**: Class-validator

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (future)
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

---

## 9. Next Steps

1. **Create encounter service** with Prisma schema
2. **Implement history taking UI** components
3. **Build medication database** with search
4. **Setup FHIR export** functionality
5. **Integrate ML models** for clinical decision support

---

**Status**: Design Complete ✅  
**Next**: Begin Phase 1 Implementation  
**Priority**: High  
**Compliance**: HIPAA, HL7 FHIR R4, SNOMED CT, LOINC
