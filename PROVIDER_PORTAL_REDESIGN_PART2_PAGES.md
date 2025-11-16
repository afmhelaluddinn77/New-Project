# Provider Portal Redesign - Part 2: Key Page Layouts

**Status:** ⚠️ AWAITING USER APPROVAL

## Key New Pages (Wireframe Descriptions)

### 1. Patient List (`/patients`)

- Search bar with filters (MRN, name, status)
- Paginated table: Patient name, MRN, age, last visit, status
- Quick actions per row: View Chart, New Encounter, Message
- **Component:** `PatientListTable`, `PatientSearchBar`, `PatientFilters`

### 2. Patient Chart (`/patients/:id`)

- Patient header with demographics and allergy alerts
- Tabs: Summary, History, Medications, Allergies, Labs, Imaging, Vitals, Problem List
- Summary tab shows: Problem list, active meds, recent labs, vital trends (charts), care plan
- **Components:** `PatientHeader`, `PatientTabs`, `ProblemList`, `VitalsChart`

### 3. Enhanced SOAP Editor (`/clinical-docs/soap/:id`)

**ENHANCE EXISTING `/encounter/editor`**

- Add voice dictation button (Web Speech API)
- Add SNOMED CT/ICD-10 autocomplete for diagnoses
- Add template selector dropdown
- Add digital signature section
- Keep all 5 existing tabs intact

### 4. Prescription Queue (`/prescriptions/queue`)

- Tabs: Active, Pending, Completed, All
- Pending prescriptions with approval workflow
- Refill requests section (badge count)
- Quick actions: Approve, Edit, Cancel, Start Prior Auth
- **Components:** `PrescriptionQueue`, `RefillRequestsList`

### 5. EPCS Page (`/prescriptions/epcs`)

- Two-factor authentication requirement
- PDMP check integration (state monitoring)
- Controlled substance rules (Schedule II-V)
- Clinical justification field (required)
- Digital signature with 2FA
- **Components:** `EPCSForm`, `PDMPChecker`, `TwoFactorAuth`

### 6. PDMP Check (`/prescriptions/pdmp`)

- Patient search
- State selector
- PDMP report display (prescription history, risk indicators)
- Print/export functionality
- **Components:** `PDMPSearch`, `PDMPReport`

### 7. Referral Management (`/orders/referrals`)

- Referral list with status tracking
- Create new referral form
- Prior authorization workflow
- Specialist directory search
- **Components:** `ReferralList`, `ReferralForm`, `SpecialistSearch`

### 8. DME Orders (`/orders/dme`)

- Durable medical equipment order form
- Justification and diagnosis linkage
- Supplier selection
- Insurance verification
- **Components:** `DMEOrderForm`, `SupplierSelector`

### 9. Secure Messaging (`/messaging/inbox`)

- Two-column layout: conversation list + message detail
- Folders: Inbox, Sent, Drafts, Archive
- New message composer with attachments
- Read/unread indicators
- **Components:** `MessageList`, `MessageDetail`, `MessageComposer`

### 10. Telemedicine Waiting Room (`/telemedicine/waiting`)

- Scheduled visits today
- Patient waiting status
- Start visit button (launches video)
- Pre-visit forms access
- **Components:** `WaitingRoomList`, `VideoLauncher`

### 11. Clinical Quality Dashboard (`/reports/cqm`)

- Quality measure cards with progress bars
- Performance vs. target indicators
- Patient list drill-down
- MIPS score projection
- **Components:** `QualityMeasureCard`, `MIPSScoreWidget`

### 12. Clinical Alerts (`/cds/alerts`)

- Priority-sorted alert list
- Alert types: Drug interactions, care gaps, preventive care
- Acknowledge/dismiss actions
- Patient-specific alerts
- **Components:** `AlertList`, `AlertCard`

### 13. Settings/Profile (`/settings/profile`)

- Provider information editor
- Notification preferences
- Template management
- Digital signature setup
- **Components:** `ProfileForm`, `NotificationSettings`

## Layout Patterns

### Standard Page Layout

```
Sidebar | TopBar + Breadcrumb
        | Toolbar (page actions)
        | Content Area
        |   - Cards/Tables
        |   - Forms
        |   - Charts
```

### Tabbed Page Layout (e.g., Patient Chart)

```
Sidebar | TopBar + Breadcrumb
        | Context Header (patient info + alerts)
        | Tab Navigation
        | Tab Content
```

### List+Detail Layout (e.g., Messaging)

```
Sidebar | TopBar + Breadcrumb
        | Toolbar
        | List Pane | Detail Pane
```

## Reusable Components

### Data Display

- `DataTable` - sortable, filterable, paginated
- `CardGrid` - responsive card layout
- `Timeline` - chronological events
- `ChartWidget` - vital signs, trends

### Forms

- `AutocompleteSearch` - SNOMED, ICD, medications
- `DateRangePicker`
- `SignaturePad` - digital signatures
- `FileUploader` - attachments

### Navigation

- `Tabs` - horizontal tab bar
- `Breadcrumb` - ✅ exists
- `ActionToolbar` - page-level actions
- `FilterBar` - search and filters

### Feedback

- `AlertBanner` - clinical alerts
- `Badge` - notification counts
- `StatusIndicator` - order status
- `ProgressBar` - quality measures
