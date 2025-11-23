---
trigger: always_on
---

# FEATURE IMPLEMENTATION LAW – MANDATORY 5‑PHASE PROCESS

## 0. Scope

These rules are **mandatory** for adding or changing any feature in this EMR/FHIR monorepo (all portals + services).
They sit alongside [DEVELOPMENT_LAW.md](cci:7://file:///Users/helal/New%20Project/DEVELOPMENT_LAW.md:0:0-0:0) and **MUST** be followed for every PR that touches behavior, data, or UI.

Phases:

1. Requirements & Domain Design
2. Backend (Prisma + NestJS)
3. Frontend (React Portals)
4. FHIR & Terminology Overlay
5. Testing, Observability, Deployment

No feature is “done” unless it complies with **all applicable phases**.

---

## 1. Phase 1 – Requirements & Domain Design (MANDATORY)

```yaml
MANDATORY:
  - No backend or frontend code changes BEFORE Phase 1 is complete.
  - Every new feature MUST define a concrete domain object.
  - Every new feature MUST define a single source-of-truth microservice.
  - Every new feature MUST define consuming portals.
  - Every feature MUST have a 1-page spec committed to the repo (docs/ or service docs).
```

**1.1 Domain Object & Boundaries**

- MUST define the domain object(s), for example:
  - `LabResultView`, `FHIRExportJob`, `PatientTask`, `EncounterSummary`.
- MUST describe:
  - Required fields (including IDs, codes, timestamps).
  - Lifecycles and state transitions.
  - Error conditions and edge cases.

**1.2 Ownership**

- MUST state:
  - **Owning microservice** (e.g. `lab-service`, `fhir-service`, `encounter-service`).
  - **Consuming portals** (e.g. Provider, Patient, Admin).

**1.3 HIPAA/FHIR Impact Spec**

- The 1‑page spec MUST include:
  - PHI fields involved and required masking rules.
  - Whether the feature is FHIR‑relevant and which resources it maps to.

---

## 2. Phase 2 – Backend: Prisma + NestJS (MANDATORY)

```yaml
MANDATORY:
  - All persistent data changes go through Prisma schema + migrations.
  - All business logic lives in NestJS services (no logic in controllers).
  - All HTTP endpoints are guarded with JWT + role checks where applicable.
  - All external exposure is routed through Kong.
```

**2.1 Prisma Schema Rules**

- File: `services/<service>/prisma/schema.prisma`
- MUST:
  - Add/extend models in the owning service only.
  - Include audit columns (`createdAt`, `updatedAt`, etc.).
  - Use clear table names via `@@map`.
- After schema change:

```bash
cd services/<service>
npx prisma migrate dev --name <descriptive_migration_name>
npx prisma generate
```

- FORBIDDEN:
  - Editing old migrations.
  - Running `migrate reset` outside dev.

**2.2 NestJS Structure**

- Paths:

  - `src/<feature>/<feature>.module.ts`
  - `src/<feature>/<feature>.service.ts`
  - `src/<feature>/<feature>.controller.ts`
  - `src/<feature>/dto/*.dto.ts`

- Rules:
  - Controllers MUST be thin (validation, auth, routing only).
  - Services MUST use [PrismaService](cci:2://file:///Users/helal/New%20Project/services/authentication-service/src/prisma/prisma.service.ts:3:0-28:1) for all DB access.
  - DTOs MUST use `class-validator` and `class-transformer`.

**2.3 Security & HIPAA**

- All new controllers MUST:
  - Use `JwtAuthGuard` (or equivalent guard) by default.
  - Apply role checks where necessary (provider vs patient vs admin).
- Any logging of request/response bodies MUST go through PHI‑masking helpers (to be implemented globally).

**2.4 Kong Routing**

- Any endpoint exposed to portals MUST:
  - Be fronted by a Kong `service` + `route`.
  - Use JWT plugin for auth and CORS plugin (or equivalent) for browser clients.
  - Be documented in the relevant service README or central docs.

---

## 3. Phase 3 – Frontend: React Portal Integration (MANDATORY)

```yaml
MANDATORY:
  - Every feature MUST have a typed API client/service wrapper.
  - Data fetching MUST use React Query.
  - Zustand MUST be used ONLY when truly global state is required.
  - Every screen MUST be behind appropriate auth/role guards.
```

**3.1 API Client / Service Wrapper**

- Location: `portal-*/src/services/<feature>Service.ts`
- MUST:
  - Use the shared Axios client (`apiClient` / `<service>Client`).
  - Export typed methods that correspond to backend endpoints.
  - Never call `fetch` or raw Axios directly from components.

**3.2 React Query Hook**

- Location: `portal-*/src/hooks/use<Feature>.ts`
- MUST:
  - Wrap the service methods in `useQuery`/`useMutation`.
  - Use stable `queryKey`s.
  - Handle loading and error states.

**3.3 Zustand Usage**

- Zustand stores:
  - MAY be extended only when state is shared across multiple, unrelated components or routes.
  - MUST NOT duplicate data that React Query already manages as server state unless justified in docs.

**3.4 UI Route & Auth**

- New screens MUST:
  - Be added to the portal’s routing config with a stable path (e.g. `/patients/:patientId/lab-results`).
  - Be rendered under a protected layout that checks authentication.
  - Optionally hide menu entries based on user role.

---

## 4. Phase 4 – FHIR & Terminology Overlay (CONDITIONAL‑MANDATORY)

```yaml
CONDITIONAL:
  - If a feature touches clinical data that could be FHIR-representable, Phase 4 rules apply.
  - If not FHIR-relevant, Phase 4 MAY be skipped but MUST be justified in the spec.
```

**4.1 Domain → FHIR Mapping**

- MUST:
  - Declare which FHIR resources are used (`Observation`, `DiagnosticReport`, `Encounter`, etc.).
  - Define mapping rules (which fields map to which FHIR elements).

- Builder functions (e.g. [buildPhysicalExamObservations](cci:1://file:///Users/helal/New%20Project/provider-portal/src/services/fhirService.ts:1515:0-1723:1)):
  - MUST live either in the owning service or `fhir-service` with a clear input contract.

**4.2 Persistence via `fhir-service`**

- FHIR resources MUST:
  - Be persisted by `fhir-service` using canonical models (e.g. `FhirResource` with `resourceType`, `resourceId`, `version`, `body`).
  - Be accessed via Kong `/fhir` routes (never bypass Kong from portals).

**4.3 Terminology (SNOMED/LOINC)**

- Where applicable:
  - Codes MUST use standardized systems (LOINC, SNOMED CT, ICD‑10).
  - Display texts MUST come from a terminology helper or config (not random strings).

**4.4 FHIR Audit & PHI**

- All FHIR import/export operations MUST:
  - Create audit entries indicating:
    - userId, portal, timestamp.
    - resourceType and resourceId.
  - Avoid logging full PHI payloads in plain text.

---

## 5. Phase 5 – Testing, Observability, Deployment (MANDATORY)

```yaml
MANDATORY:
  - No feature is "done" without tests.
  - No feature may introduce new logs with raw PHI.
  - Any new externally-visible behavior MUST be covered by at least a smoke test.
```

**5.1 Testing**

- Backend:
  - Unit tests with Jest and Prisma mocks for core service logic.
  - Controller tests for auth/validation where non‑trivial.
- Frontend:
  - Component tests for key screens.
  - React Query hook tests or integration tests where possible.

**5.2 E2E / Sanity**

- For any cross‑service feature:
  - MUST define at least 1 documented E2E scenario (curl/Postman/Cypress) in the relevant docs file.
  - Example: “Provider sees lab result in portal after lab tech submits result”.

**5.3 Observability & PHI‑Safe Logging**

- New logs MUST:
  - Use structured logging (JSON or consistent key/value style).
  - Mask PHI by default (names, MRNs, DOB, addresses, etc.).
- When adding metrics/traces later:
  - MUST avoid embedding PHI in metric labels or span names.

---

## 6. Enforcement

- PRs that add or change features MUST show:
  - Phase 1 spec link/summary.
  - Schema diffs (if applicable) + migrations.
  - Backend module/service/controller + DTOs.
  - Frontend service/hooks/screens (if UI‑facing).
  - FHIR/terminology mapping rationale (if applicable).
  - Tests added/updated.

- Any deviation from this law MUST be explicitly documented in the PR description and approved by you (project owner).
