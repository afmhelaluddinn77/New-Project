# EMR/HMS Project Lock‑Down Report

**Project:** Multi‑Portal Clinical EMR / HMS

**Generated:** 2025‑11‑22

**Scope of this document:**

- Freezes the *current* understanding of implementation status across all portals and backend services.
- Describes features, workflows, and completion level portal‑wise.
- Summarizes technology stack and key dependencies per portal.
- Summarizes backend microservices (with emphasis on **Encounter Service** and **Authentication Service**).
- Provides a concise view of **FHIR**, **HL7**, **HIPAA**, **SNOMED CT**, and **LOINC** implementation status.
- Serves as a **single source of truth** for future planning and audits.

> Percentages and feature lists are synthesized from existing design and status reports, notably:
> - `docs/archive/emr-portal-features.md`
> - `docs/archive/PORTAL_WISE_PROJECT_REPORT.md`
> - `docs/archive/FEATURE_IMPLEMENTATION_STATUS.md`
> - `docs/archive/IMPLEMENTATION_STATUS_COMPREHENSIVE.md`

---

## 0. Top-Level Summary Table

**Status legend (by completion %):**

- **Green** (≥90%) – Production-ready or near-ready within defined scope.
- **Yellow** (60–89%) – Solid foundation; important workflows still missing.
- **Red** (<60%) – Early/partial; major workflows outstanding.

### 0.1 Portals Summary

| Area / Component | Features Implemented | Missing / Gaps | Approx. Completion % | Standards Impact* |
| --- | --- | --- | --- | --- |
| Common Portal (Hub) | Hub dashboard, navigation to all portals, shared layout components | Portal health indicators, SSO session visualization, cross-portal analytics | ~95% (**Green**) | Indirect HIPAA impact (access pathways); FHIR/HL7 exposure only via linked clinical portals |
| Patient Portal | Portal shell, auth, base dashboard and navigation, initial records/appointments views | Rich profile management, full appointment management, live lab/imaging viewers, deep billing flows, full telemedicine | ~70% (**Yellow**) | Strong HIPAA impact (patient PHI access); FHIR/HL7 consumer of encounters, labs, imaging (partially/planned) |
| Provider Portal | Encounter editor, orders (lab/radiology), results review, prescriptions, role-aware UI | Longitudinal patient panel, full scheduling UI, advanced CDS, in-portal analytics | ~95% (**Green**) | High HIPAA impact; primary FHIR/LOINC/SNOMED producer for clinical data; HL7 orders/results integrations target |
| Admin Portal | Portal shell, protected routes, admin dashboard layout | User/role CRUD, permission editors, portal/config management, audit & compliance UIs | ~45% (**Red**) | HIPAA admin and governance controls once complete (RBAC, audit views); limited direct FHIR/HL7 exposure |
| Lab Portal | CBC worklist, result entry, dashboards, authentication and routing | QC module, inventory/reagents, additional lab panels, LIS/HL7 interfaces | ~80% (**Yellow**) | High LOINC and FHIR Observation/DiagnosticReport relevance; HL7 ORU/ORM interfaces planned; HIPAA lab PHI |
| Pharmacy Portal | Portal scaffold, basic prescription queue and interaction endpoints (partial) | Full dispensing workflow, inventory, barcode flows, billing linkage | ~60% (**Yellow**) | HIPAA medication PHI; future FHIR MedicationRequest/MedicationDispense mapping; drug vocabularies/terminology integration |
| Billing Portal | Portal shell; Billing Service schemas and endpoints for billing logic | Full claims and denials UI, patient payment flows, RCM analytics screens | ~70% (**Yellow**) | HIPAA financial PHI; EDI/HL7 financial interfaces planned; limited direct FHIR use |
| Radiology Portal | Radiology Service in place; basic portal structure for queues/reports | DICOM viewer, scheduling, QA workflows, rich reporting templates | ~60% (**Yellow**) | FHIR ImagingStudy/DiagnosticReport and HL7 ORM/ORU integration target; high imaging PHI once complete |
| Nurses Portal | eMAR with barcoding, patient assignment board, vitals & risk scores, shift handoff, incident logging | Deeper encounter/procedure integration; enterprise-wide nursing analytics | ~100% (**Green**) | High HIPAA impact at bedside; FHIR Observation/Procedure and medication administration mappings; safety/quality metrics |
| IT Portal | System monitoring dashboard, security/cert views, interface status panels | Full wiring to production observability stack; on-call and runbook workflows | ~100% (**Green**) (within defined scope) | Supports HIPAA and standards indirectly via security and interface monitoring; minimal direct PHI handling |

### 0.2 Backend Services Summary

| Area / Component | Features Implemented | Missing / Gaps | Approx. Completion % | Standards Impact* |
| --- | --- | --- | --- | --- |
| Authentication Service (Backend) | JWT auth, refresh tokens, portal-aware login, roles/permissions, auth audit logging | MFA, password reset, account lockout, OAuth2/social login | ~100% (**Green**) | Core HIPAA security control for all portals; gatekeeper for PHI; no direct FHIR/HL7 payloads |
| Encounter Service (Backend) | Encounter CRUD, prescriptions, investigations, medication info, audit & guards | External drug/terminology APIs, full FHIR exports, broader tests & performance tuning | ~95% (**Green**) | Primary producer of FHIR Encounter/Observation/DiagnosticReport; SNOMED/LOINC integration target; HIPAA-critical clinical data |
| Lab Service (Backend) | Lab orders and CBC results, JWT protection, basic audit | Generic panel modeling, QC endpoints, first-class LOINC terminology handling | ~83% (**Yellow**) | FHIR Observation/DiagnosticReport source; LOINC-heavy; HL7 lab messages (planned); HIPAA lab PHI |
| Pharmacy Service (Backend) | Schemas and CRUD for prescriptions, interaction endpoints, JWT | Full dispensing lifecycle, inventory management, richer interaction/allergy checks | ~70% (**Yellow**) | Medication vocabularies and HIPAA PHI; future FHIR Medication* mappings; no HL7 implemented yet |
| Radiology Service (Backend) | CRUD for radiology orders, reports, imaging assets, JWT + Prisma | DICOM metadata, MinIO/PACS integration, scheduling, QA metrics, critical-alert flows | ~70% (**Yellow**) | FHIR ImagingStudy/DiagnosticReport producer; DICOM/HL7 bridge; HIPAA imaging PHI |
| Patient Service (Backend) | Basic patient CRUD and some access audit logging | Full demographics/insurance models, advanced search, cross-portal patient views | ~40% (**Red**) | Core HIPAA entity (patient PHI) and basis for FHIR Patient resource; no HL7 directly |
| Clinical Workflow Service (Backend) | Workflow engine and persistence for key flows (e.g., CBC lifecycle) | Workflow templates for all order types, workflow analytics and monitoring | ~90% (**Green**) | Orchestrates standards-relevant workflows (orders/results) across services; indirect HIPAA/FHIR/HL7 impact |

> *“Standards Impact” summarizes how strongly each component touches HIPAA, FHIR, HL7, LOINC, and SNOMED CT concerns.

## 1. System Overview

### 1.1 Portals (Frontends)

Current portals (hub + spokes):

- **Common Portal (Hub)** – Navigation and system overview.
- **Patient Portal** – Patient‑facing access to appointments, records, billing.
- **Provider Portal** – Clinical documentation, orders, prescriptions, results.
- **Admin Portal** – User/role management, configuration, compliance tools.
- **Lab Portal** – Lab orders, result entry, QC and lab operations.
- **Pharmacy Portal** – Prescription queue, dispensing, inventory (design complete, varying implementation).
- **Billing Portal** – Revenue cycle, claims, payments.
- **Radiology Portal** – Imaging orders, PACS/RIS integration (design complete, varying implementation).
- **Nurses Portal** – eMAR, nursing workflows, shift handoff.
- **IT Portal** – System monitoring, security, infrastructure operations.

### 1.2 Backend Microservices

Primary backend services (NestJS + Prisma + PostgreSQL):

- **Authentication Service** – JWT auth, portal roles, session security.
- **Patient Service** – Core patient demographics and profiles.
- **Encounter Service** – Encounters, prescriptions, investigations, medications.
- **Lab Service** – Lab orders and results (CBC workflow complete; extended panels in progress).
- **Pharmacy Service** – Prescription verification, interactions, dispensing (partial).
- **Radiology Service** – Imaging orders, reports, assets (partial).
- **Clinical Workflow Service** – Orchestrates cross‑service clinical workflows.
- **Billing Service** – Billing and RCM backend (as per design and status docs).

---

## 2. Portal‑Wise Feature & Workflow Status

Completion estimates combine feature counts from the 410‑feature matrix and portal‑wise status reports.

### 2.1 Common Portal (Hub)

**Status:** ~95% complete (core hub functions stable).

- **Implemented features & workflows**
  - Central landing page with **cards for all portals**.
  - Hub‑and‑spoke navigation pattern; links into each portal.
  - Shared UI components: dashboard cards, layout shell, top bar, sidebar.
  - Responsive layout with glass‑morphism design system.

- **Partially implemented / pending**
  - Portal health indicators (up/down, latency) per spoke.
  - Central SSO session visualization.
  - Cross‑portal analytics/usage dashboard.

- **Stack & dependencies**
  - **Frontend:** React + TypeScript + Vite.
  - **UI:** MUI (or equivalent), shared design tokens.
  - **State:** Lightweight local state; React Query for any hub API calls.
  - **Backend dependencies:** Primarily Authentication Service + Kong routes for deep‑links.

---

### 2.2 Patient Portal

**Status:** 60–100% depending on source; conservatively **~70%** implemented.

- **Key feature areas (from feature list & reports)**
  - Account & profile: self‑registration, profile management, linked family accounts.
  - Appointments: online booking, view upcoming/past appointments, reminders.
  - Medical records: view diagnoses, visit summaries, lab results, imaging reports.
  - Prescriptions: lists, refills, reminders.
  - Billing: view statements, payments, claim status.
  - Communication: secure messaging, notifications, telemedicine entry.

- **Implemented**
  - Portal shell: login, protected routing, patient‑themed UI.
  - Base dashboard layout and navigation.
  - Integration with authentication and common layout components.

- **Not fully developed / missing workflows**
  - Rich **profile management** (insurance, emergency contacts, full demographics).
  - Full **online appointment management** flow (booking + cancellation + reminders).
  - **Lab / imaging result viewers** wired to live backend (beyond demo/CBC path).
  - Deep **billing integrations** (payment portal, claim detail views).
  - Complete **telemedicine** flows (check‑in, waiting room, WebRTC sessions).

- **Portal stack & dependencies**
  - React + Vite + TypeScript.
  - MUI‑based custom theme.
  - React Router, React Query, and possibly Zustand for auth/session state.
  - Talks to: Authentication Service, Patient Service, Encounter Service, Billing Service, Lab/Radiology services via Kong.

---

### 2.3 Provider Portal

**Status:** Among the most advanced. Early report: ~85%; feature matrix: **100% of designed features**. Realistically **~90–100% of the current defined scope**.

- **Implemented features & workflows**
  - **Authentication & security**
    - JWT‑based login with portal type enforcement.
    - Role‑aware UI; protected routes.
  - **Encounter Management (core workflow)**
    - Encounter creation & editing (tabbed editor: history, exam, assessment, plan).
    - Structured history sections: chief complaint, HPI, ROS, PMH, FH, SH, etc.
    - Examination: vital signs, physical exam sections, assessment text.
  - **Orders & Results**
    - Lab and radiology orders (CPOE) routed via Encounter / Workflow services.
    - CBC results detail page: trend tables, reference ranges, interpretation.
    - Results timeline with drill‑down.
  - **Medication & Prescription Management**
    - Prescription forms and lists.
    - Interaction checks and allergy checks (stubs + partial backend integration).
    - Dispense preview and printing.
  - **State and Data Layer**
    - React Query hooks (~18+), optimistic updates.
    - Zustand stores for encounter, orders, auth.

- **Not fully developed**
  - Comprehensive **patient panel** inside provider portal (deep demographics, full history timeline) beyond encounters themselves.
  - Appointment calendar and provider‑side scheduling UI.
  - Deep **clinical decision support**: risk scoring, guideline engines, beyond basic interactions.
  - Fully built **reporting & analytics** inside provider portal (encounter statistics, quality metrics).

- **Stack & dependencies**
  - React + Vite + TypeScript.
  - MUI, shared card/layout components.
  - React Query, Zustand.
  - Uses **Encounter Service**, **Lab Service**, **Pharmacy Service**, **Radiology Service**, Patient Service via Kong.

---

### 2.4 Admin Portal

**Status:** 40–50% (skeleton and layout present; workflows largely pending).

- **Implemented**
  - Portal shell: login, protected routes, admin‑specific theme.
  - Dashboard layout and shared components (sidebar, top bar).

- **Planned / partially done**
  - User CRUD, role assignment, permission editors.
  - Portal configuration (feature toggles, module activation).
  - System configuration (email/SMS, integration endpoints).
  - Audit and compliance reporting (HIPAA access logs, security events).

- **Stack & dependencies**
  - React stack similar to other portals.
  - Uses: Authentication Service (RBAC), possibly Admin‑specific service or cross‑service admin endpoints via Kong.

---

### 2.5 Lab Portal

**Status:** 75–85% (CBC workflow fully operational; extended lab workflow partially implemented).

- **Implemented**
  - Authentication, protected routes, lab‑specific theme.
  - Dashboard with counts & metrics.
  - Worklist of pending lab orders.
  - Completed results/history views.
  - Order detail screens for CBC.
  - Result entry forms for CBC with validation.
  - WebSocket or equivalent for real‑time updates.

- **Not fully developed**
  - Comprehensive **QC module** (quality control measurements, Westgard rules).
  - Inventory & reagent tracking.
  - Full spectrum of panels (CMP, lipid panel, thyroid, etc.).
  - HL7 ORU/ORM interfaces and LIS connectivity beyond the current CBC path.

- **Stack & dependencies**
  - React + Vite, MUI theme (Lab Teal).
  - React Query + Zustand for lab orders state.
  - Uses **Lab Service** (NestJS + Prisma), via Kong.

---

### 2.6 Pharmacy Portal

**Status:**

- Feature status matrix claims ~88–100% depending on report; implementation‑status report states **portal not fully built, design ready, backend ~50%**.
- Conservative lock‑down status: **Portal UI partially / not fully implemented**, backend present.

- **Planned features** (per design spec & feature docs)
  - Prescription queue, verification & DUR (drug utilization review).
  - Dispensing workflow with barcode scanning.
  - Inventory management (stock levels, expirations, suppliers).
  - Patient profile and medication history views.
  - Insurance verification integration.

- **Implementation reality**
  - React portal scaffold and basic pages exist (per earlier project reports), but many flows (dispensing, inventory, patient billing) are **incomplete**.
  - Pharmacy backend has schema + basic CRUD + interaction endpoints, but lacks full dispensing & inventory endpoints.

- **Stack & dependencies**
  - React + Vite + TypeScript (portal).
  - Pharmacy Service (NestJS, Prisma) on backend.
  - External planned: interaction APIs, insurance APIs, barcode scanning library.

---

### 2.7 Billing Portal

**Status:** 40–100% depending on report; feature‑status doc says **100% of planned billing features implemented**, but portal‑wise earlier report marks **~40% basic UI**. Lock‑down: **backend & design are strong; portal UI is functional but not yet feature‑complete**.

- **Core feature areas**
  - Patient billing (statements, payment history, plans).
  - Payer/claim management, denials, and posting.
  - RCM analytics: A/R days, denial rates, payer performance.

- **Implemented**
  - Portal skeleton with login, basic dashboard, shared layout.
  - Billing Service with comprehensive schema and endpoints (per billing documentation).

- **Outstanding**
  - Full claims UI, denials workflow UI, patient payment interfaces.
  - Deep reporting/analytics screens.

- **Stack & dependencies**
  - React portal uses standard stack.
  - Billing Service as core backend + integrations (clearinghouse, payment gateways) planned.

---

### 2.8 Radiology Portal

**Status:** Design complete; backend at ~50%; portal implementation partially advanced in one report and not started in another. Locked status: **foundation ready; full workflows incomplete**.

- **Planned features**
  - Worklist of imaging orders, study details.
  - Scheduling and modality assignment.
  - DICOM viewer integration, image annotations.
  - Report creation, approval, and distribution.

- **Implemented**
  - Radiology Service with database schemas and CRUD for orders/reports.
  - Some portal structure exists (queue/reports pages) per portal‑wise report, but richer viewer/reporting flows are missing.

- **Outstanding**
  - DICOM viewer and MinIO integration.
  - Study scheduling and detailed QA workflows.
  - Full reporting templates and peer‑review workflows.

- **Stack & dependencies**
  - React + Vite portal.
  - Radiology Service backend; future integration with DICOMweb, PACS, MinIO.

---

### 2.9 Nurses Portal

**Status:** Feature matrix: **100% of planned 50+ features implemented**. Portal is **production‑ready within  defined scope**.

- **Implemented features & workflows**
  - **Medication Administration (eMAR)**
    - Barcode scanning via Quagga.js.
    - 5‑Rights verification and double‑check for high‑alert meds.
    - PRN documentation including pain scores and re‑assessment.
    - Real‑time MAR updates and audit.
  - **Patient Care Management**
    - Assignment board with acuity.
    - Vitals tracking, I&O, fall‑risk and pressure‑injury scoring.
    - Wound care with photo documentation.
  - **Workflow & Quality**
    - Shift handoff reports.
    - Task lists and prioritization.
    - Incident & near‑miss logging.
    - Infection control and hand‑hygiene tracking.

- **Not fully developed**
  - Deeper integration with encounter/order services for all possible procedures.
  - Hospital‑wide reporting/analytics directly on nursing data (currently partial).

- **Stack & dependencies**
  - React + Vite + TypeScript.
  - MUI theme (emerald green, touch‑optimized).
  - React Router, React Query, local/Zustand where needed.
  - Talks to: Authentication, Encounter, Lab, Pharmacy, Workflow services.

---

### 2.10 IT Portal

**Status:** Feature matrix: **100% of planned 40+ features implemented**. IT portal is **functionally rich and close to production‑ready**.

- **Implemented features & workflows**
  - **System Monitoring Dashboard**
    - CPU, memory, disk usage, API latency, request volumes.
    - Service health tables and real‑time metrics via charts.
  - **Security and Compliance**
    - Failed login tracking.
    - Cert/expiry monitoring.
    - Views for PHI‑related audit events.
  - **Integration Monitoring**
    - HL7/FHIR interface status.
    - Kong/API gateway routing visibility.
    - Message queue/ETL job status (conceptually).

- **Not fully developed**
  - Direct wiring to all real observability data sources (some data is mocked or stubbed).
  - Full incident response workflows (on‑call rotations, runbooks) in the UI.

- **Stack & dependencies**
  - React + Vite + TypeScript.
  - Dark theme (`itTheme`) using MUI, terminal‑style typography.
  - Charts with Recharts, real‑time support via WebSockets or polling.
  - Talks to IT/infrastructure metrics endpoints and Kong.

---

## 3. Backend Services Lock‑Down

### 3.1 Authentication Service

**Status:** Reports indicate **~100% of planned functionality implemented**.

- **Implemented**
  - JWT auth with refresh tokens.
  - HttpOnly cookies and CSRF protection.
  - Portal‑aware login (portal type claims).
  - Roles and permissions wired into controllers via guards.
  - Prisma + PostgreSQL schema for users, sessions, refresh tokens.
  - Audit logging of auth‑relevant actions.

- **Pending / future**
  - Multi‑factor authentication.
  - Password reset & account lockout workflows.
  - OAuth2/social login.

---

### 3.2 Encounter Service

**Status:** ~95% complete; core encounter, prescription, investigation, and medication APIs are in place.

- **Implemented**
  - Encounter CRUD and status transitions.
  - Prescription endpoints (create, update, dispense, interactions).
  - Investigation endpoints (labs/imaging, add results, search codes).
  - Medication information endpoints (interactions, contraindications, dosage, alternatives).
  - Prisma schema with full audit fields.
  - JWT guards and DTO validation.

- **Outstanding**
  - External terminology/drug APIs (RxNav, FDA) – currently stubbed or planned.
  - FHIR R4 exports for encounters, Observations, DiagnosticReports.
  - Broader integration tests and performance tuning.

---

### 3.3 Lab Service

**Status:** 80–85% (CBC workflow complete; extended panels & QC partial).

- **Implemented**
  - Lab order models and CRUD endpoints.
  - CBC order and result flows used by Lab and Provider portals.
  - JWT protection, Prisma schema, basic audit.

- **Outstanding**
  - Detailed LabResultComponent model and generic panel definitions.
  - QC data models and endpoints.
  - LOINC integration as a first‑class terminology rather than static codes.

---

### 3.4 Pharmacy Service

**Status:** ~50–85% depending on document; lock‑down: **core schema + some endpoints present; full dispensing & inventory not done**.

- **Implemented**
  - Schema for prescription orders, medication items, interactions.
  - CRUD endpoints for prescriptions; base interactions controller.
  - JWT guards and Prisma integration.

- **Outstanding**
  - Full dispensing lifecycle and audit.
  - Inventory, stock checks, ordering.
  - Rich interaction and allergy checking.

---

### 3.5 Radiology Service

**Status:** ~50–85%; lock‑down: **schemas and basic CRUD implemented; imaging workflows incomplete**.

- **Implemented**
  - Models for radiology orders, reports, imaging assets.
  - Controllers/services for main CRUD operations.
  - JWT + Prisma integration.

- **Outstanding**
  - DICOM metadata modeling and MinIO integration.
  - Scheduling, study status transitions, QA metrics.
  - Report approval, signatures, and critical alerts.

---

### 3.6 Patient Service

**Status:** ~40% (foundational but not exhaustive).

- **Implemented**
  - Basic patient CRUD.
  - Some HIPAA audit logging for access to patient data.

- **Outstanding**
  - Rich demographic and insurance models defined in design docs but not fully implemented.
  - Search, filtering, and cross‑portal patient views.

---

### 3.7 Clinical Workflow Service

**Status:** ~90% complete.

- **Implemented**
  - Workflow controller and state machine for key flows (e.g., CBC order lifecycle).
  - Database persistence for workflow state.

- **Outstanding**
  - Workflow templates for all order types.
  - Analytics and monitoring on workflow performance.

---

## 4. Standards & Compliance Status

### 4.1 HIPAA

- **Architecture & design:**
  - Role‑based access control, JWT, portal‑specific auth flows.
  - Audit logging in critical services (Authentication, Encounter, Patient, etc.).
  - Guidance on avoiding PHI in logs and metrics (documented in project laws).

- **Implementation status:**
  - Many of the logical controls are implemented (auth, RBAC, audit trails, encryption via infra).
  - Formal HIPAA compliance **documentation & audits** are only partially represented in code; some logging/PHI‑masking helpers are still on the roadmap.

### 4.2 HL7 v2 / v3

- **Design:**
  - The feature spec (`emr-portal-features`) targets HL7 v2.x integration for lab and radiology messaging (ADT/ORM/ORU).

- **Implementation:**
  - Direct HL7 interface engines and message brokers are **mostly design‑stage**; limited or no production HL7 handling is wired into services yet.

### 4.3 FHIR R4

- **Design:**
  - Target coverage for `Observation`, `DiagnosticReport`, `ServiceRequest`, and `ImagingStudy` resources.
  - FHIR export and API gateway integration specified in docs.

- **Implementation:**
  - Some builders and mapping concepts exist (e.g., for CBC labs), but **full FHIR R4 export/import workflows are not yet complete**.
  - FHIR service boundaries are defined; actual endpoints and persistence for canonical `FhirResource` models are an identified future phase.

### 4.4 LOINC

- **Design:**
  - LOINC used as the standard coding system for lab tests and certain observations.

- **Implementation:**
  - LOINC codes appear in schemas and UIs (especially CBC and lab workflows).
  - A central terminology service or dynamic LOINC dictionary is not fully implemented; codes are primarily embedded or stubbed.

### 4.5 SNOMED CT

- **Design:**
  - SNOMED CT used for problem lists, diagnoses, and certain clinical concepts.

- **Implementation:**
  - Codes and search patterns are acknowledged in design and partially in the Encounter Service, but a complete SNOMED CT terminology server integration is still a future step.

---

## 5. Technology Stack & Dependencies (Lock‑Down Snapshot)

### 5.1 Frontend (Portal‑Wise)

Common patterns across portals:

- **Framework:** React + TypeScript, bundled with Vite.
- **Routing:** React Router.
- **Data:** React Query for server state.
- **State:** Zustand where global/shared state is required.
- **UI:** MUI component library with per‑portal themes.
- **Charts:** Chart.js or Recharts (especially in IT portal).
- **Real‑time:** WebSockets/Socket.io for lab, pharmacy, radiology, IT metrics.
- **Specialized libs:**
  - Quagga.js for barcode scanning in Nurses Portal.
  - WebRTC libs for telemedicine (patient/provider).

### 5.2 Backend

- **Framework:** NestJS (per service).
- **ORM:** Prisma with PostgreSQL.
- **Gateway:** Kong for routing, JWT verification, and CORS.
- **Auth:** Central Authentication Service with JWT and refresh tokens.
- **Messaging/Realtime:** WebSockets for select workflows.

---

## 6. Lock‑Down Conclusions

1. **Portals**
   - Provider, Nurses, IT, and Common portals are **closest to production‑ready** within their currently defined scope.
   - Patient, Admin, Lab, Pharmacy, Billing, Radiology portals each have **clear gaps** in workflow depth and completeness but have strong foundations.

2. **Backend**
   - Authentication and Encounter services are **mature** and central to the system.
   - Lab, Pharmacy, and Radiology services have solid schemas and early endpoints but require further work for full production workflows.

3. **Standards & Compliance**
   - System is **architected** for HIPAA/FHIR/HL7/LOINC/SNOMED, but **formal, end‑to‑end integrations** and audits are **not yet fully implemented**.

4. **Future Work (high‑level)**
   - Complete patient‑facing flows in Patient Portal.
   - Finish pharmacy and radiology portals and backends according to existing design specs.
   - Implement FHIR R4 export pipelines and terminology servers.
   - Expand automated testing and CI/CD, especially for cross‑service workflows.

---

**This document is the lock‑down baseline.**

Any future implementation or refactor should reference this report plus:

- `FEATURE_IMPLEMENTATION_LAW.md`
- `DEVELOPMENT_LAW.md`
- `PROJECT_LAWS_AND_BEST_PRACTICES.md`

to ensure consistency with the intended architecture and compliance targets.
