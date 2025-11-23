# Clinical FHIR Export – Implementation Notes (Steps 1–3)

This document records the current implementation for exporting structured clinical data from the Provider Portal for **Steps 1–3** of the Clinical Flow Wizard:

1. Chief Complaint
2. History of Present Illness / Symptom Features
3. Other Systems Enquiry

It focuses on how data moves from the encounter store into **FHIR resources**, and how those resources can be exported as **FHIR Bundles**, **NDJSON**, stored locally in the browser, or sent to a future analytics API.

---

## 1. Data source (encounter store)

**File:** `provider-portal/src/store/encounterStore.ts`

Relevant shapes:

- `HistoryData` includes:
  - `chiefComplaint: string`
  - `chiefComplaintSymptoms: ChiefComplaintSymptom[]`
  - `historyOfPresentIllness: HistoryOfPresentIllnessData`
  - `systemEnquiry: { [systemKey: string]: SystemEnquiryEntry }`
  - `reviewOfSystems` (kept for backward compatibility)

- `ChiefComplaintSymptom`:
  - `id: string`
  - `snomedCode?: string` (optional – supports custom complaints)
  - `label: string`
  - `system?: string`

- `HistoryOfPresentIllnessData`:
  - Standard OPQRST-style fields (`onset`, `character`, `quality`, etc.)
  - `symptomFeatures?: { [snomedCodeOrId: string]: SymptomFeature }`

- `SymptomFeature` per symptom:
  - `durationValue?: number`
  - `durationUnit?: "hours" | "days" | "weeks" | "months"`
  - `severity?: "mild" | "moderate" | "severe"`
  - `character?: string[]`
  - `aggravatingFactors?: string[]`
  - `relievingFactors?: string[]`
  - `notes?: string`

- `SystemEnquiryEntry` per system:
  - `normal: boolean`
  - `positiveSymptoms: { snomedCode: string; label: string; notes?: string }[]`
  - `summaryText?: string`

From the store, the core encounter context used by all FHIR builders is:

```ts
interface FhirBuildContext {
  encounterId?: string;
  encounterDate?: string;
  encounterType?: string; // e.g. "OUTPATIENT" or "INPATIENT"
  patientId: string;
  providerId: string;
  history: HistoryData;
}
```

---

## 2. FHIR builders (Encounter, Condition, Observation)

**File:** `provider-portal/src/services/fhirService.ts`

### 2.1 Encounter

```ts
buildEncounterResource(ctx: FhirBuildContext): FhirEncounter
```

- `resourceType: "Encounter"`.
- `status: "in-progress"` (current default).
- `class.code` is `"IMP"` for `encounterType === "INPATIENT"`, else `"AMB"`.
- `subject.reference = "Patient/{patientId}"`.
- `participant[0].individual.reference = "Practitioner/{providerId}"`.
- `period.start = encounterDate`.

### 2.2 Chief complaints → Conditions

```ts
buildChiefComplaintConditions(ctx: FhirBuildContext): FhirCondition[]
```

For each `chiefComplaintSymptoms` entry:

- `Condition.code`:
  - SNOMED-coded if `snomedCode` present.
  - `text` is the symptom label.
- `subject` → `Patient/{patientId}`.
- `encounter` → `Encounter/{encounterId}` if available.
- `clinicalStatus.text = "active"`.
- `verificationStatus.text = "provisional"`.

### 2.3 HPI features → Observations

```ts
buildHpiObservations(ctx: FhirBuildContext): FhirObservation[]
```

For each chief complaint, an `Observation` is created:

- `status: "final"`.
- `category` = `survey` (`http://terminology.hl7.org/CodeSystem/observation-category`).
- `code` SNOMED-coded if possible.
- Components for:
  - Duration (quantity + unit).
  - Severity (codeable concept).
  - Character.
  - Aggravating factors.
  - Relieving factors.
  - Notes.

### 2.4 Other Systems Enquiry → Observations

```ts
buildSystemEnquiryObservations(ctx: FhirBuildContext): FhirObservation[]
```

For each `systemKey` in `history.systemEnquiry`:

- If `normal` and no positive symptoms:
  - A single Observation with:
    - `code.text = "Review of systems: {systemKey}"`.
    - `interpretation` → `Normal` (`code: "N"` from `v3-ObservationInterpretation`).

- If there are positive symptoms:
  - One Observation per symptom:
    - `code.text = "{systemKey}: {symptom.label}"`.
    - SNOMED-coded where possible.
    - `valueString` may contain `summaryText` for extra context.

### 2.5 Aggregated builder

```ts
export function buildAllClinicalResourcesForSteps1to3(ctx: FhirBuildContext) {
  const encounter = buildEncounterResource(ctx);
  const conditions = buildChiefComplaintConditions(ctx);
  const observations = [
    ...buildHpiObservations(ctx),
    ...buildSystemEnquiryObservations(ctx),
  ];

  return { encounter, conditions, observations };
}
```

This is the central entry point used by both Bundle and NDJSON helpers.

---

## 3. Bundle and NDJSON helpers

### 3.1 FHIR Bundle (JSON)

**Types:**

```ts
export interface FhirBundle {
  resourceType: "Bundle";
  type: "collection";
  id?: string;
  entry: { resource: FhirEncounter | FhirCondition | FhirObservation }[];
}
```

**Builder:**

```ts
export function buildFhirBundleForSteps1to3(
  ctx: FhirBuildContext,
  bundleId?: string
): FhirBundle;
```

- Wraps `Encounter`, `Condition[]`, and `Observation[]` into a FHIR `Bundle` with `type: "collection"`.
- Ensures the `Encounter` has a local `id` if it was missing so that references remain consistent.

### 3.2 NDJSON export

**Shape:**

```ts
export interface NdjsonExportForSteps1to3 {
  encounterNdjson: string;
  conditionNdjson: string;
  observationNdjson: string;
}
```

**Helper:**

```ts
export function exportEncounterNdjsonForSteps1to3(
  ctx: FhirBuildContext
): NdjsonExportForSteps1to3;
```

- Produces three NDJSON strings:
  - `encounterNdjson` (single Encounter line).
  - `conditionNdjson` (one Condition per line).
  - `observationNdjson` (one Observation per line).

These are suitable for writing into `.ndjson` files for Bulk Data export and ingest into tools like **RapidMiner** or **KNIME**.

---

## 4. UI integration – EncounterEditorPage

**File:** `provider-portal/src/pages/EncounterEditorPage.tsx`

The encounter editor header now exposes three export options:

1. **Export FHIR Bundle** (simple JSON download)
2. **Export NDJSON (Steps 1–3)** (advanced – More ▾ menu)
3. **Save FHIR export to local storage** (advanced – More ▾ menu)

### 4.1 Context from store

The following fields from `useEncounterStore()` are used to build the FHIR context:

```ts
const {
  activeTab,
  setActiveTab,
  isSaving,
  setIsSaving,
  saveEncounter,
  encounterId,
  patientId,
  providerId,
  encounterDate,
  encounterType,
  history,
} = useEncounterStore();
```

### 4.2 Export FHIR Bundle button

- Label: `⬇️ Export FHIR Bundle`.
- Handler:

```ts
const handleExportFhirBundle = () => {
  const ctx = {
    encounterId,
    encounterDate,
    encounterType,
    patientId,
    providerId,
    history,
  };
  const bundle = buildFhirBundleForSteps1to3(ctx, encounterId || undefined);
  // Download as application/fhir+json with timestamped filename
};
```

This creates a Blob from the Bundle and triggers a client-side JSON download.

### 4.3 More ▾ menu (advanced)

Under the `More ▾` button there are currently two options:

1. **Export NDJSON (Steps 1–3)**

   ```ts
   const handleExportNdjson = () => {
     const ctx = {
       encounterId,
       encounterDate,
       encounterType,
       patientId,
       providerId,
       history,
     };
     const { encounterNdjson, conditionNdjson, observationNdjson } =
       exportEncounterNdjsonForSteps1to3(ctx);
     // Each string is downloaded as *.ndjson with resource-specific filenames
   };
   ```

2. **Save FHIR export to local storage**

   ```ts
   const handleSaveExportLocally = () => {
     const ctx = {
       encounterId,
       encounterDate,
       encounterType,
       patientId,
       providerId,
       history,
     };

     const bundle = buildFhirBundleForSteps1to3(ctx, encounterId || undefined);
     const ndjson = exportEncounterNdjsonForSteps1to3(ctx);

     saveFhirExportToLocal({
       encounterId,
       patientId,
       providerId,
       bundle,
       ndjson,
       source: "provider-portal",
     });
   };
   ```

The menu is styled via `EncounterEditorPage.module.css` using `.moreMenu`, `.moreMenuPopover`, and `.moreMenuItem` for a small dropdown aligned with existing button styling.

---

## 5. Local storage store for exports

**File:** `provider-portal/src/services/localFhirExportStore.ts`

- **Key:**

  ```ts
  const STORAGE_KEY = "clinical_fhir_exports_steps1to3";
  ```

- **Stored structure:**

  ```ts
  export interface StoredFhirExport {
    id: string;
    timestamp: string;
    encounterId?: string;
    patientId?: string;
    providerId?: string;
    bundle: FhirBundle;
    ndjson?: NdjsonExportForSteps1to3;
    source?: string; // e.g. "provider-portal"
  }
  ```

- **API:**

  ```ts
  saveFhirExportToLocal(entry: Omit<StoredFhirExport, "id" | "timestamp">): StoredFhirExport
  listLocalFhirExports(): StoredFhirExport[]
  clearLocalFhirExports(): void
  ```

Implementation details:

- `saveFhirExportToLocal`:
  - Generates a unique `id` and `timestamp`.
  - Reads existing entries from `localStorage`.
  - Appends the new entry and writes back JSON.

- `listLocalFhirExports`:
  - Safely parses the stored array and returns it (or `[]` on error).

- `clearLocalFhirExports`:
  - Removes the storage key.

This allows a user to keep a history of FHIR exports in the browser for local research or manual inspection without requiring any backend.

---

## 6. Future cloud/analytics export

**File:** `provider-portal/src/services/analyticsExportService.ts`

This is a **future-facing** service that can send the same FHIR export payload to a central analytics endpoint. It does **not** modify existing encounter APIs.

```ts
import { api } from "../lib/api";
import type { FhirBundle, NdjsonExportForSteps1to3 } from "./fhirService";

export interface AnalyticsFhirExportPayload {
  encounterId?: string;
  patientId?: string;
  providerId?: string;
  bundle: FhirBundle;
  ndjson?: NdjsonExportForSteps1to3;
  source?: string; // e.g. "provider-portal"
  notes?: string;
}

export async function exportFhirToAnalytics(
  payload: AnalyticsFhirExportPayload
): Promise<any> {
  const response = await api.post("/analytics/export-fhir", payload);
  return response.data;
}
```

**Example future usage:**

```ts
const ctx: FhirBuildContext = {
  encounterId,
  encounterDate,
  encounterType,
  patientId,
  providerId,
  history,
};

const bundle = buildFhirBundleForSteps1to3(ctx, encounterId || undefined);
const ndjson = exportEncounterNdjsonForSteps1to3(ctx);

await exportFhirToAnalytics({
  encounterId,
  patientId,
  providerId,
  bundle,
  ndjson,
  source: "provider-portal",
  notes: "Steps 1–3 export for analytics",
});
```

The endpoint `/analytics/export-fhir` is intentionally not implemented here; it will be owned by a separate analytics/ETL service that can:

- Store Bundles/NDJSON in object storage.
- Expose Bulk Data or research feeds for tools like RapidMiner / KNIME.
- Enforce access control, auditing, and PHI tracking independently from the primary encounter APIs.

---

## 7. Compatibility and non-breaking guarantees

- Existing `EncounterPayload` and `EncounterService` APIs remain unchanged.
- The new FHIR builders and export helpers are **read-only views** over the encounter store.
- All export features (Bundle, NDJSON, local storage, analytics sketch) are **optional** and separate from the core save/finalize workflow.

This document should be updated as additional steps (4–15) are mapped to FHIR resources and wired into the same export pipeline.
