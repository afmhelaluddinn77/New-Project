# Phase 6: FHIR & Terminology Integration

**Priority:** MEDIUM  
**Duration:** 6 days  
**Status:** ⏳ Ready for Implementation  
**Owner:** Backend + Integration Team

---

## 🎯 Objectives

1. Implement FHIR R4 resource mapping for 7 core resources.  
2. Build a terminology service that supports SNOMED CT, LOINC, RxNorm, and ICD-10.  
3. Provide reusable code patterns for FHIR conversion, validation, and terminology lookup.  
4. Ensure interoperability with external EHR systems and FHIR servers.

---

## 🗓️ Timeline & Milestones

| Day | Milestone | Deliverables |
|-----|-----------|--------------|
| 1 | Architecture & Data Model Audit | Data mapping spreadsheet, schema gap analysis |
| 2 | Encounter & Patient Mapping | FHIR mappers, validation tests |
| 3 | Practitioner, Condition Mapping | Mapper functions, sample fixtures |
| 4 | MedicationRequest & Observation Mapping | Medication & lab FHIR converters |
| 5 | DiagnosticReport Mapping & Terminology Setup | Terminology ingestion scripts |
| 6 | Terminology Search API & Integration Testing | Search endpoints, Postman collection |

---

## 🧱 Prerequisites

- ✅ Phase 4 API endpoints available.  
- ✅ Phase 5 security framework ready for authentication.  
- 🔄 Access to SNOMED CT, LOINC, RxNorm, ICD-10 datasets.  
- 🔄 FHIR server (HAPI or AWS HealthLake) credentials for testing.

---

## 🏗️ System Architecture

```
Encounter Service (NestJS)
    ├─ FHIR Module
    │   ├─ Resource Mappers (Encounter, Patient, Practitioner...)
    │   ├─ FHIR Validator (Ajv / fhir-validator)
    │   ├─ Terminology Client
    │   └─ Export Controller (/fhir/export, /fhir/resource/:id)
    └─ Terminology Module
        ├─ SNOMED Repository
        ├─ LOINC Repository
        ├─ RxNorm Repository
        ├─ ICD-10 Repository
        └─ Search Controller (/terminology/search)
```

---

## 🧩 Resource Mapping (7 Resources)

### 1. Encounter (R4)

**Fields:**
- `Encounter.id` ← `encounter.id`
- `Encounter.status` ← map `EncounterStatus`
- `Encounter.class` ← map `EncounterClass`
- `Encounter.type[0]` ← SNOMED code for visit reason
- `Encounter.subject` ← `Patient/{patientId}`
- `Encounter.participant` ← Provider references
- `Encounter.period` ← `encounterDate` & `updatedAt`

```typescript
import { Encounter as EncounterResource } from 'fhir/r4';

export const mapEncounterToFhir = (encounter: EncounterModel): EncounterResource => ({
  resourceType: 'Encounter',
  id: encounter.id,
  status: mapStatus(encounter.status),
  class: mapClass(encounter.encounterClass),
  type: [mapChiefComplaint(encounter.chiefComplaint)],
  subject: { reference: `Patient/${encounter.patientId}` },
  participant: [
    {
      individual: {
        reference: `Practitioner/${encounter.providerId}`,
      },
    },
  ],
  period: {
    start: encounter.encounterDate.toISOString(),
    end: encounter.updatedAt?.toISOString(),
  },
});
```

### 2. Patient
- Map demographic data (from Patient service or FHIR server)
- Use extensions for local identifiers

### 3. Practitioner
- Provider roles, specialties (SNOMED)

### 4. Condition
- Map diagnoses from `diagnosisCodes` (SNOMED → ICD-10 crosswalk)

### 5. MedicationRequest
- Map prescriptions to FHIR medication orders
- Use RxNorm codes and dosage instructions

```typescript
export const mapPrescriptionToMedicationRequest = (
  prescription: PrescriptionModel,
): MedicationRequest => ({
  resourceType: 'MedicationRequest',
  id: prescription.id,
  status: mapPrescriptionStatus(prescription.status),
  intent: 'order',
  medicationCodeableConcept: {
    coding: [
      {
        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
        code: prescription.rxNormCode,
        display: prescription.genericName,
      },
    ],
    text: prescription.brandName ?? prescription.genericName,
  },
  subject: {
    reference: `Patient/${prescription.encounter.patientId}`,
  },
  authoredOn: prescription.prescribedDate.toISOString(),
  requester: {
    reference: `Practitioner/${prescription.prescribedBy}`,
  },
  dosageInstruction: [
    {
      text: `${prescription.dosage} ${prescription.frequency}`,
      timing: mapFrequencyToTiming(prescription.frequency),
      route: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/route-codes',
            code: mapRouteCode(prescription.route),
            display: prescription.route,
          },
        ],
      },
    },
  ],
  dispenseRequest: {
    quantity: {
      value: prescription.quantity,
    },
    numberOfRepeatsAllowed: prescription.refills,
    expectedSupplyDuration: mapDuration(prescription.duration),
  },
});
```

### 6. Observation
- Vital signs and lab results (LOINC-coded)

### 7. DiagnosticReport
- Imaging summaries with DICOM references and SNOMED findings

---

## 🔍 Terminology Service

### Data Sources

| Standard | Description | Source |
|----------|-------------|--------|
| SNOMED CT | Clinical terms | SNOMED International |
| LOINC | Lab test codes | Regenstrief Institute |
| RxNorm | Drug codes | UMLS (NLM) |
| ICD-10 | Diagnosis codes | WHO |

### Data Ingestion

```bash
# SNOMED RF2 import
node scripts/terminology/import-snomed.ts --path ./data/SNOMEDCT_RF2_FULL.zip

# LOINC CSV
node scripts/terminology/import-loinc.ts --path ./data/LoincTableCore.csv
```

### Terminology Repository

```typescript
@Injectable()
export class TerminologyRepository {
  constructor(private prisma: PrismaService) {}

  searchSNOMED(term: string, limit = 25) {
    return this.prisma.snomedConcept.findMany({
      where: {
        OR: [
          { term: { contains: term, mode: 'insensitive' } },
          { conceptId: { contains: term } },
        ],
      },
      take: limit,
    });
  }

  mapSnomedToICD10(conceptId: string) {
    return this.prisma.snomedIcd10Map.findMany({
      where: { snomedConceptId: conceptId },
    });
  }

  searchLOINC(term: string, limit = 25) {
    return this.prisma.loinc.findMany({
      where: {
        OR: [
          { longCommonName: { contains: term, mode: 'insensitive' } },
          { loincNumber: { contains: term } },
        ],
      },
      take: limit,
    });
  }
}
```

### Terminology Controller

```typescript
@Controller('terminology')
export class TerminologyController {
  constructor(private readonly terminology: TerminologyService) {}

  @Get('search')
  search(@Query('term') term: string, @Query('system') system: string) {
    switch (system) {
      case 'snomed':
        return this.terminology.searchSNOMED(term);
      case 'loinc':
        return this.terminology.searchLOINC(term);
      case 'rxnorm':
        return this.terminology.searchRxNorm(term);
      case 'icd10':
        return this.terminology.searchICD10(term);
      default:
        throw new BadRequestException('Unsupported terminology system');
    }
  }

  @Get('map/snomed/:conceptId/icd10')
  mapSnomedToIcd10(@Param('conceptId') conceptId: string) {
    return this.terminology.mapSnomedToICD10(conceptId);
  }
}
```

---

## 🧪 Validation & Testing

1. **FHIR Validator**  
   - Use `fhir-works` or `hl7-fhir-validator` CLI.  
   - Validate generated JSON resources against R4 profiles.

2. **Terminology Testing**  
   - Unit tests for repository search functions.  
   - Integration tests with sample SNOMED/LOINC datasets.

3. **Contract Tests**  
   - Ensure `/fhir/export` endpoints produce valid bundles.  
   - Verify linked references (Patient, Practitioner) exist.

---

## 📤 Export & Integration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fhir/encounters/:id` | Export single encounter as FHIR Encounter |
| GET | `/fhir/bundle/encounter/:id` | Export encounter bundle (Encounter + related resources) |
| POST | `/fhir/terminology/search` | Search terminology systems |
| GET | `/fhir/codesets/:system/:code` | Retrieve terminology metadata |

---

## ✅ Completion Checklist

- [ ] FHIR mappers implemented for 7 resources.  
- [ ] Terminology repositories populated (SNOMED, LOINC, RxNorm, ICD-10).  
- [ ] FHIR export endpoints returning valid bundles.  
- [ ] Unit and integration tests for terminology lookups.  
- [ ] Documentation for external EHR integration.  
- [ ] Postman collection updated with FHIR routes.

---

## 📚 Reference Resources

- [HL7 FHIR R4 Specification](https://www.hl7.org/fhir/)  
- [SNOMED CT Browser](https://browser.ihtsdotools.org/)  
- [LOINC Database](https://loinc.org/downloads/)  
- [UMLS / RxNorm API](https://documentation.uts.nlm.nih.gov/)

---

**Next Phase:** Phase 7 – Testing & Quality Assurance
