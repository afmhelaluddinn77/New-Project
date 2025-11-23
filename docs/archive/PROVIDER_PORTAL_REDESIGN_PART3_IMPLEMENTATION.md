# Provider Portal Redesign - Part 3: Implementation Plan

**Status:** ⚠️ AWAITING USER APPROVAL
**Part:** 3 of 3

---

## Complete Routing Structure

### Updated App.tsx Routes

```typescript
// Add to existing routes in App.tsx
<Route path="/dashboard" element={<DashboardHomePage />} /> // ✅ EXISTS
<Route path="/patients" element={<PatientListPage />} /> // 🆕 NEW
<Route path="/patients/search" element={<PatientSearchPage />} /> // 🆕 NEW
<Route path="/patients/new" element={<NewPatientPage />} /> // 🆕 NEW
<Route path="/patients/:patientId" element={<PatientChartPage />} /> // 🆕 NEW

<Route path="/clinical-docs" element={<Navigate to="/clinical-docs/soap" />} /> // 🆕 NEW
<Route path="/clinical-docs/soap" element={<SOAPNotesList />} /> // 🆕 NEW
<Route path="/clinical-docs/soap/:encounterId" element={<EncounterEditorPage />} /> // ✅ EXISTS (move from /encounter/editor)
<Route path="/clinical-docs/progress" element={<ProgressNotesPage />} /> // 🆕 NEW
<Route path="/clinical-docs/templates" element={<TemplatesPage />} /> // 🆕 NEW
<Route path="/clinical-docs/coding" element={<CodingPage />} /> // 🆕 NEW
<Route path="/clinical-docs/signatures" element={<SignaturesPage />} /> // 🆕 NEW

<Route path="/prescriptions" element={<Navigate to="/prescriptions/queue" />} /> // 🆕 NEW
<Route path="/prescriptions/queue" element={<PrescriptionQueuePage />} /> // 🆕 NEW
<Route path="/prescriptions/new" element={<NewPrescriptionPage />} /> // 🆕 NEW
<Route path="/prescriptions/epcs" element={<EPCSPage />} /> // 🆕 NEW
<Route path="/prescriptions/refills" element={<RefillRequestsPage />} /> // 🆕 NEW
<Route path="/prescriptions/history" element={<PrescriptionHistoryPage />} /> // 🆕 NEW
<Route path="/prescriptions/pdmp" element={<PDMPCheckPage />} /> // 🆕 NEW
<Route path="/prescription/preview" element={<PrescriptionPreviewPage />} /> // ✅ EXISTS
<Route path="/prescription/preview/:prescriptionId" element={<PrescriptionPreviewPage />} /> // ✅ EXISTS

<Route path="/orders" element={<OrdersPage />} /> // ✅ EXISTS
<Route path="/orders/lab" element={<LabOrdersPage />} /> // 🆕 NEW (enhance existing)
<Route path="/orders/radiology" element={<RadiologyOrdersPage />} /> // 🆕 NEW (enhance existing)
<Route path="/orders/referrals" element={<ReferralManagementPage />} /> // 🆕 NEW
<Route path="/orders/dme" element={<DMEOrdersPage />} /> // 🆕 NEW
<Route path="/results" element={<ResultsPage />} /> // ✅ EXISTS
<Route path="/lab-results/:orderId" element={<LabResultDetailPage />} /> // ✅ EXISTS
<Route path="/radiology-results/:orderId" element={<RadiologyResultDetailPage />} /> // ✅ EXISTS

<Route path="/messaging" element={<Navigate to="/messaging/inbox" />} /> // 🆕 NEW
<Route path="/messaging/inbox" element={<MessagingInboxPage />} /> // 🆕 NEW
<Route path="/messaging/team" element={<CareTeamPage />} /> // 🆕 NEW
<Route path="/messaging/patients" element={<PatientMessagesPage />} /> // 🆕 NEW
<Route path="/messaging/tasks" element={<TasksPage />} /> // 🆕 NEW

<Route path="/telemedicine" element={<Navigate to="/telemedicine/visits" />} /> // 🆕 NEW
<Route path="/telemedicine/visits" element={<VirtualVisitsPage />} /> // 🆕 NEW
<Route path="/telemedicine/waiting" element={<WaitingRoomPage />} /> // 🆕 NEW
<Route path="/telemedicine/history" element={<SessionHistoryPage />} /> // 🆕 NEW
<Route path="/telemedicine/links" element={<MeetingLinksPage />} /> // 🆕 NEW

<Route path="/reports" element={<Navigate to="/reports/cqm" />} /> // 🆕 NEW
<Route path="/reports/cqm" element={<CQMReportsPage />} /> // 🆕 NEW
<Route path="/reports/mips" element={<MIPSReportingPage />} /> // 🆕 NEW
<Route path="/reports/population" element={<PopulationHealthPage />} /> // 🆕 NEW
<Route path="/reports/custom" element={<CustomReportsPage />} /> // 🆕 NEW

<Route path="/cds" element={<Navigate to="/cds/alerts" />} /> // 🆕 NEW
<Route path="/cds/alerts" element={<ClinicalAlertsPage />} /> // 🆕 NEW
<Route path="/cds/guidelines" element={<GuidelinesPage />} /> // 🆕 NEW
<Route path="/cds/quality" element={<QualityMeasuresPage />} /> // 🆕 NEW
<Route path="/cds/care-gaps" element={<CareGapsPage />} /> // 🆕 NEW

<Route path="/mobile" element={<MobileAccessPage />} /> // 🆕 NEW
<Route path="/settings" element={<Navigate to="/settings/profile" />} /> // 🆕 NEW
<Route path="/settings/profile" element={<ProfileSettingsPage />} /> // 🆕 NEW
<Route path="/settings/preferences" element={<PreferencesPage />} /> // 🆕 NEW
<Route path="/settings/templates" element={<TemplateSettingsPage />} /> // 🆕 NEW
<Route path="/settings/notifications" element={<NotificationSettingsPage />} /> // 🆕 NEW
<Route path="/help" element={<HelpPage />} /> // 🆕 NEW
```

**Total Routes:**

- ✅ Existing: 8 routes
- 🆕 New: 47 routes
- **Total: 55 routes**

---

## Updated Navigation (ProviderDashboardLayout.tsx)

```typescript
// src/layouts/ProviderDashboardLayout.tsx

import {
  LayoutDashboard,
  Users,
  FileText,
  Pill,
  ClipboardList,
  MessageSquare,
  Video,
  BarChart3,
  Lightbulb,
  Smartphone,
  Settings,
  HelpCircle,
  Activity,
} from "lucide-react";

const NAV_ITEMS: SidebarSection[] = [
  {
    section: "CLINICAL",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "patients",
        label: "Patient Management",
        path: "/patients",
        icon: Users,
        badge: "12", // Dynamic from store
        subItems: [
          { label: "Patient List", path: "/patients" },
          { label: "Search Patients", path: "/patients/search" },
          { label: "New Patient", path: "/patients/new" },
        ],
      },
      {
        id: "clinical-docs",
        label: "Clinical Documentation",
        path: "/clinical-docs/soap",
        icon: FileText,
        badge: "3",
        subItems: [
          { label: "SOAP Notes", path: "/clinical-docs/soap" },
          { label: "Progress Notes", path: "/clinical-docs/progress" },
          { label: "Templates", path: "/clinical-docs/templates" },
          { label: "ICD-10/11 Coding", path: "/clinical-docs/coding" },
          { label: "Digital Signatures", path: "/clinical-docs/signatures" },
        ],
      },
      {
        id: "prescriptions",
        label: "E-Prescribing",
        path: "/prescriptions/queue",
        icon: Pill,
        badge: "5",
        subItems: [
          { label: "Prescription Queue", path: "/prescriptions/queue" },
          { label: "New Prescription", path: "/prescriptions/new" },
          { label: "EPCS", path: "/prescriptions/epcs" },
          { label: "Refill Requests", path: "/prescriptions/refills" },
          { label: "Medication History", path: "/prescriptions/history" },
          { label: "PDMP Check", path: "/prescriptions/pdmp" },
        ],
      },
      {
        id: "orders",
        label: "Orders Management",
        path: "/orders",
        icon: ClipboardList,
        badge: "8",
        subItems: [
          { label: "Unified Orders", path: "/orders" },
          { label: "Lab Orders", path: "/orders/lab" },
          { label: "Radiology Orders", path: "/orders/radiology" },
          { label: "Referrals", path: "/orders/referrals" },
          { label: "DME Orders", path: "/orders/dme" },
          { label: "Results Timeline", path: "/results" },
        ],
      },
    ],
  },
  {
    section: "COMMUNICATION",
    items: [
      {
        id: "messaging",
        label: "Secure Messaging",
        path: "/messaging/inbox",
        icon: MessageSquare,
        badge: "23",
        subItems: [
          { label: "Inbox", path: "/messaging/inbox" },
          { label: "Care Team", path: "/messaging/team" },
          { label: "Patient Messages", path: "/messaging/patients" },
          { label: "Tasks", path: "/messaging/tasks" },
        ],
      },
      {
        id: "telemedicine",
        label: "Telemedicine",
        path: "/telemedicine/waiting",
        icon: Video,
        badge: "2",
        subItems: [
          { label: "Virtual Visits", path: "/telemedicine/visits" },
          { label: "Waiting Room", path: "/telemedicine/waiting" },
          { label: "Session History", path: "/telemedicine/history" },
          { label: "Meeting Links", path: "/telemedicine/links" },
        ],
      },
    ],
  },
  {
    section: "INSIGHTS",
    items: [
      {
        id: "reports",
        label: "Reports & Analytics",
        path: "/reports/cqm",
        icon: BarChart3,
        subItems: [
          { label: "Clinical Quality", path: "/reports/cqm" },
          { label: "MIPS Reporting", path: "/reports/mips" },
          { label: "Population Health", path: "/reports/population" },
          { label: "Custom Reports", path: "/reports/custom" },
        ],
      },
      {
        id: "cds",
        label: "Clinical Decision Support",
        path: "/cds/alerts",
        icon: Lightbulb,
        badge: "4",
        subItems: [
          { label: "Active Alerts", path: "/cds/alerts" },
          { label: "Guidelines", path: "/cds/guidelines" },
          { label: "Quality Measures", path: "/cds/quality" },
          { label: "Care Gaps", path: "/cds/care-gaps" },
        ],
      },
    ],
  },
  {
    section: "TOOLS",
    items: [
      {
        id: "mobile",
        label: "Mobile Access",
        path: "/mobile",
        icon: Smartphone,
      },
      {
        id: "settings",
        label: "Settings",
        path: "/settings/profile",
        icon: Settings,
        subItems: [
          { label: "Profile", path: "/settings/profile" },
          { label: "Preferences", path: "/settings/preferences" },
          { label: "Templates", path: "/settings/templates" },
          { label: "Notifications", path: "/settings/notifications" },
        ],
      },
      { id: "help", label: "Help & Support", path: "/help", icon: HelpCircle },
    ],
  },
];
```

---

## Component Architecture

### New Components to Create

#### Patient Management

```
src/pages/patients/
├── PatientListPage.tsx
├── PatientSearchPage.tsx
├── NewPatientPage.tsx
└── PatientChartPage.tsx

src/components/patients/
├── PatientHeader.tsx
├── PatientTabs.tsx
├── PatientSearchBar.tsx
├── PatientFilters.tsx
├── PatientListTable.tsx
├── ProblemList.tsx
├── VitalsChart.tsx
└── CarePlanWidget.tsx
```

#### Clinical Documentation

```
src/pages/clinical-docs/
├── SOAPNotesList.tsx
├── ProgressNotesPage.tsx
├── TemplatesPage.tsx
├── CodingPage.tsx
└── SignaturesPage.tsx

src/components/clinical-docs/
├── VoiceDictation.tsx (NEW - Web Speech API)
├── SNOMEDSearch.tsx (NEW - autocomplete)
├── ICD10Search.tsx (NEW - autocomplete)
├── TemplateSelector.tsx
├── DigitalSignaturePad.tsx
└── DiagnosisCodePicker.tsx
```

#### E-Prescribing

```
src/pages/prescriptions/
├── PrescriptionQueuePage.tsx
├── NewPrescriptionPage.tsx
├── EPCSPage.tsx
├── RefillRequestsPage.tsx
├── PrescriptionHistoryPage.tsx
└── PDMPCheckPage.tsx

src/components/prescriptions/
├── PrescriptionQueue.tsx
├── RefillRequestsList.tsx
├── EPCSForm.tsx
├── TwoFactorAuth.tsx
├── PDMPChecker.tsx
├── PDMPReport.tsx
├── PharmacySelector.tsx
├── FormularyChecker.tsx
└── PricingWidget.tsx
```

#### Orders

```
src/pages/orders/
├── ReferralManagementPage.tsx
└── DMEOrdersPage.tsx

src/components/orders/
├── ReferralList.tsx
├── ReferralForm.tsx
├── SpecialistSearch.tsx
├── DMEOrderForm.tsx
└── SupplierSelector.tsx
```

#### Communication

```
src/pages/messaging/
├── MessagingInboxPage.tsx
├── CareTeamPage.tsx
├── PatientMessagesPage.tsx
└── TasksPage.tsx

src/components/messaging/
├── MessageList.tsx
├── MessageDetail.tsx
├── MessageComposer.tsx
└── ConversationThread.tsx

src/pages/telemedicine/
├── VirtualVisitsPage.tsx
├── WaitingRoomPage.tsx
├── SessionHistoryPage.tsx
└── MeetingLinksPage.tsx

src/components/telemedicine/
├── WaitingRoomList.tsx
├── VideoLauncher.tsx
└── SessionControls.tsx
```

#### Reports & Analytics

```
src/pages/reports/
├── CQMReportsPage.tsx
├── MIPSReportingPage.tsx
├── PopulationHealthPage.tsx
└── CustomReportsPage.tsx

src/components/reports/
├── QualityMeasureCard.tsx
├── MIPSScoreWidget.tsx
├── ReportFilters.tsx
└── ChartBuilder.tsx
```

#### Clinical Decision Support

```
src/pages/cds/
├── ClinicalAlertsPage.tsx
├── GuidelinesPage.tsx
├── QualityMeasuresPage.tsx
└── CareGapsPage.tsx

src/components/cds/
├── AlertList.tsx
├── AlertCard.tsx
├── GuidelineViewer.tsx
└── CareGapIndicator.tsx
```

---

## Implementation Phases

### Phase 1: Navigation Enhancement (Week 1)

**Goal:** Update sidebar with new structure

**Tasks:**

1. Update `ProviderDashboardLayout.tsx` with new nav items
2. Enhance `Sidebar.tsx` to support section grouping
3. Add badge system for notification counts
4. Add sub-item expansion/collapse
5. Create placeholder pages for all routes
6. Test navigation flow

**Files Modified:**

- `src/layouts/ProviderDashboardLayout.tsx`
- `src/components/shared/Sidebar.tsx`
- `src/components/shared/Sidebar.css`
- `src/App.tsx` (add all routes)

**Deliverable:** Functional navigation with all routes accessible

---

### Phase 2: Patient Management (Week 2-3)

**Goal:** Complete patient chart and list

**Tasks:**

1. Create patient list page with search/filter
2. Create patient chart with tabbed interface
3. Implement problem list (ICD-10 coded)
4. Add medication list display
5. Create vitals chart with trend visualization
6. Implement care plan widget

**API Requirements:**

- GET `/api/patients` - list patients
- GET `/api/patients/:id` - patient detail
- GET `/api/patients/:id/problems` - problem list
- GET `/api/patients/:id/medications` - med list
- GET `/api/patients/:id/vitals` - vitals history

**Deliverable:** Fully functional patient management

---

### Phase 3: Clinical Documentation Enhancement (Week 4)

**Goal:** Enhance existing SOAP editor

**Tasks:**

1. Add voice dictation button (Web Speech API)
2. Implement SNOMED CT autocomplete
3. Add ICD-10/11 code search
4. Create template system
5. Add digital signature pad
6. Keep all existing functionality

**Enhancement Areas:**

- `src/pages/encounter/EncounterEditorPage.tsx`
- `src/features/clinical-documentation/SOAPEditor.tsx`

**New Components:**

- `VoiceDictation.tsx`
- `SNOMEDSearch.tsx`
- `ICD10Search.tsx`
- `DigitalSignaturePad.tsx`

**Deliverable:** Enhanced SOAP editor with new features

---

### Phase 4: E-Prescribing Enhancement (Week 5-6)

**Goal:** Add EPCS and PDMP features

**Tasks:**

1. Create prescription queue page
2. Implement EPCS workflow with 2FA
3. Add PDMP integration (mock initially)
4. Build refill request management
5. Add formulary checking
6. Implement cost comparison

**API Requirements:**

- GET `/api/prescriptions/queue` - prescription list
- POST `/api/prescriptions/epcs` - controlled substance Rx
- GET `/api/pdmp/:patientId` - PDMP check
- GET `/api/prescriptions/refills` - refill requests
- POST `/api/prescriptions/:id/approve` - approve refill

**Deliverable:** Complete e-prescribing with EPCS

---

### Phase 5: Orders Enhancement (Week 7)

**Goal:** Add referrals and DME

**Tasks:**

1. Create referral management page
2. Add specialist directory
3. Implement DME order form
4. Add prior authorization workflow

**API Requirements:**

- GET `/api/referrals` - referral list
- POST `/api/referrals` - create referral
- GET `/api/dme-orders` - DME list
- POST `/api/dme-orders` - create DME order

**Deliverable:** Complete orders management

---

### Phase 6: Communication Modules (Week 8-9)

**Goal:** Build messaging and telemedicine

**Tasks:**

1. Create messaging inbox with threading
2. Implement secure message composer
3. Add care team messaging
4. Build telemedicine waiting room
5. Add video integration (WebRTC or third-party)

**API Requirements:**

- GET `/api/messages` - message list
- POST `/api/messages` - send message
- GET `/api/telemedicine/sessions` - session list
- POST `/api/telemedicine/sessions` - create session

**Deliverable:** Communication platform

---

### Phase 7: Reports & Analytics (Week 10)

**Goal:** Quality measures and reports

**Tasks:**

1. Create CQM dashboard
2. Implement MIPS reporting
3. Add population health analytics
4. Build custom report builder

**API Requirements:**

- GET `/api/reports/cqm` - quality measures
- GET `/api/reports/mips` - MIPS data
- GET `/api/reports/population` - population health

**Deliverable:** Reporting system

---

### Phase 8: Clinical Decision Support (Week 11)

**Goal:** Alerts and guidelines

**Tasks:**

1. Create alerts dashboard
2. Implement guideline viewer
3. Add care gap identification
4. Build quality measure tracking

**API Requirements:**

- GET `/api/cds/alerts` - active alerts
- GET `/api/cds/guidelines` - clinical guidelines
- GET `/api/cds/care-gaps` - care gaps

**Deliverable:** CDS system

---

### Phase 9: Settings & Mobile (Week 12)

**Goal:** User preferences and mobile

**Tasks:**

1. Create settings pages
2. Add profile management
3. Build template editor
4. Create mobile access page (QR codes)

**Deliverable:** Complete system

---

## Testing Strategy

### Unit Tests

- All new components
- Utility functions
- Form validation

### Integration Tests

- Route navigation
- API integration
- State management

### E2E Tests

- Critical workflows (SOAP note, prescription, orders)
- User authentication
- Data persistence

---

## Success Criteria

✅ All 55 routes functional
✅ Zero breaking changes to existing features
✅ All new pages with placeholder content minimum
✅ Navigation flows smoothly
✅ Mobile responsive
✅ Passes accessibility audit
✅ API integration complete
✅ Unit test coverage >70%
✅ E2E tests for critical paths

---

## Estimated Timeline

- **Total Duration:** 12 weeks
- **Team Size:** 2-3 developers
- **Phases:** 9 phases
- **Sprints:** 6 two-week sprints

---

**Next Action:** Get user approval to proceed with Phase 1
