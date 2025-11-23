# 🩺 Clinical Documentation Redesign - Natural Flow Schema

**Status:** ⚠️ DESIGN PROPOSAL - AWAITING APPROVAL
**Style:** Glass Morphism (from `9_gemini_fixed_final (1).html`)
**Compliance:** FHIR R4, LOINC, SNOMED CT

---

## 🎯 Design Overview

### Current State

- Tabbed interface (SOAP, History, Exam, Investigations, Medications)
- All sections visible at once
- Not following natural consultation flow

### Proposed State

- **Progressive disclosure** - Step-by-step wizard
- **Symptom-driven** - Features auto-expand based on selected symptoms
- **Natural flow** - Mimics real clinical consultation
- **Glass morphism UI** - Modern, clean design

---

## 🔄 10-Step Clinical Flow

```
1. Chief Complaint → Select symptoms
2. Symptom Features → Auto-expand features per symptom
3. Past Medical History → Select from list or custom
4. Family History → Add family member conditions
5. Social History → Smoking, alcohol, occupation
6. Drug History → Current meds + allergies
7. Physical Examination → System by system
8. Investigations → Lab orders (→ Lab Service)
9. Medications → Prescriptions (→ Pharmacy Service)
10. Advice & Follow-up → Instructions + next visit
```

---

## 🎨 Visual Design (from HTML Reference)

### Technology Stack

```
- CSS: Tailwind CSS (CDN)
- Icons: Font Awesome 6.4.0
- Font: Inter
- DB: Dexie.js (IndexedDB)
- PDF: jsPDF
- Backend: Existing services (3005, 3011, 3012, 3013, 3014)
```

### UI Components

```css
/* Glass Card */
.glass {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.05);
}

/* Section Headers */
.section-title {
  color: #1e40af;
  font-weight: 700;
  border-bottom: 2px solid #dbeafe;
}
```

---

## 📊 FHIR Resource Mapping

### Core Resources

```typescript
1. Encounter (main resource)
2. Condition (chief complaints, past history)
3. Observation (symptom features, vitals, exam findings)
4. FamilyMemberHistory
5. MedicationStatement (current meds)
6. AllergyIntolerance
7. DiagnosticReport (investigations)
8. MedicationRequest (new prescriptions)
9. CarePlan (advice & follow-up)
```

### Other Systems Enquiry - FHIR Representation

- **Positive findings (abnormal symptoms in other systems):**
  - Represented primarily as **`Observation`** resources with:
    - `category`: `"survey"` or `"exam"` (system enquiry / ROS)
    - `code`: SNOMED CT symptom or finding (e.g., cough, orthopnea)
    - `value[x]`: details such as severity/duration when structured
  - When a positive symptom is clinically significant and persists as a problem, it is also captured as a **`Condition`** linked to the same `Encounter`.
- **Normal systems (no significant symptoms reported):**
  - Represented as **summary `Observation`** resources per system, using:
    - `code`: SNOMED CT concept for "no significant abnormality" or system-specific "ROS normal" term
    - `interpretation` or `valueCodeableConcept`: a SNOMED CT code indicating "normal" / "no abnormality detected" for that system
  - This ensures that both positive and negative (normal) system enquiries are machine-readable and analyzable while remaining fully FHIR- and terminology-compliant.

### SNOMED CT Codes

- Symptoms: SNOMED Clinical Findings (e.g., 25064002 = Headache)
- Severity: SNOMED Qualifiers (e.g., 6736007 = Moderate)
- Examination: SNOMED Procedures

### LOINC Codes

- Vitals: BP (85354-9), HR (8867-4), Temp (8310-5)
- Labs: CBC (58410-2), HbA1c (4548-4)

### ICD-10 Codes

- Diagnoses: E11.9 (Diabetes), I10 (HTN)

### RxNorm Codes

- Medications: 860975 (Metformin 500mg)

---

## 🏗️ Component Architecture

### Page Structure

```
EncounterEditorPage.tsx (Main)
├── ClinicalFlowWizard.tsx (Wizard Container)
│   ├── StepIndicator.tsx (Progress bar)
│   ├── Step1_ChiefComplaint.tsx
│   │   ├── SymptomSearch.tsx (SNOMED search)
│   │   └── SymptomCard.tsx
│   ├── Step2_SymptomFeatures.tsx
│   │   └── DynamicFeatureForm.tsx (renders based on symptom)
│   ├── Step3_PastHistory.tsx
│   │   ├── ConditionSearch.tsx (ICD-10/SNOMED)
│   │   └── ConditionCard.tsx
│   ├── Step4_SurgicalHistory.tsx (NEW)
│   ├── Step5_OBGYNHistory.tsx (NEW - if applicable)
│   ├── Step6_ImmunizationHistory.tsx (NEW)
│   ├── Step7_FamilyHistory.tsx
│   ├── Step8_SocialHistory.tsx
│   ├── Step9_PersonalHistory.tsx (NEW - sexual orientation, substance use)
│   ├── Step10_DrugHistory.tsx
│   │   ├── MedicationSearch.tsx (RxNorm)
│   │   └── AllergySelector.tsx
│   ├── Step11_PhysicalExam.tsx
│   │   ├── SystemSelector.tsx
│   │   ├── VitalsForm.tsx (LOINC codes)
│   │   └── ExaminationForm.tsx (per system)
│   ├── Step12_Investigations.tsx
│   │   ├── LabOrderForm.tsx (LOINC)
│   │   └── ImagingOrderForm.tsx
│   ├── Step13_Medications.tsx
│   │   ├── MedicationSelector.tsx (RxNorm)
│   │   └── DosageForm.tsx
│   └── Step14_Advice.tsx
│   └── Step10_Advice.tsx
│       └── FollowUpScheduler.tsx
└── NavigationControls.tsx (Back/Next/Save/Sign)
```

### Shared Components

```
- GlassCard.tsx (glass morphism wrapper)
- SearchableDropdown.tsx (SNOMED/ICD/RxNorm search)
- ChecklistGroup.tsx (multi-select with checkboxes)
- VitalSignInput.tsx (BP, HR, Temp, etc.)
- SignaturePad.tsx (digital signature)
```

---

## 🔗 Inter-Portal Connectivity

### Service Integration

```typescript
// Lab Service (Port 3013)
POST /api/lab/orders
{
  encounterId: "enc-12345",
  tests: [
    { code: "58410-2", display: "CBC", loincCode: "58410-2" }
  ]
}

// Pharmacy Service (Port 3012)
POST /api/pharmacy/prescriptions
{
  encounterId: "enc-12345",
  medications: [
    {
      rxNorm: "860975",
      dosage: "500mg",
      frequency: "BID",
      duration: 30
    }
  ]
}

// Radiology Service (Port 3014)
POST /api/radiology/orders
{
  encounterId: "enc-12345",
  studies: [
    { code: "36554-4", display: "X-Ray Chest" }
  ]
}
```

---

## 💾 Data Storage Strategy

### IndexedDB Schema (Dexie.js)

```typescript
const db = new Dexie("ClinicalDB");
db.version(1).stores({
  encounters: "id, patientId, providerId, date",
  symptoms: "id, encounterId, snomedCode",
  examinations: "id, encounterId, system",
  prescriptions: "id, encounterId, rxNorm",
  investigations: "id, encounterId, loincCode",
});

// Auto-sync to backend every 30 seconds
// Offline-first capability
```

---

## 📱 Responsive Design

### Breakpoints

- Mobile: <768px (single column, collapsible sections)
- Tablet: 768-1024px (2 columns where applicable)
- Desktop: >1024px (multi-column layout)

### Mobile Optimizations

- Touch-friendly buttons (min 44px)
- Swipeable steps
- Bottom navigation bar
- Collapsible sections

---

## 🎯 Key Features

### 1. Smart Symptom Features

```typescript
// Example: "Headache" selected
const headacheFeatures = {
  duration: { type: "number+unit", required: true },
  severity: { type: "radio", options: ["Mild", "Moderate", "Severe"] },
  character: { type: "checkbox", options: ["Throbbing", "Dull", "Sharp"] },
  location: { type: "checkbox", options: ["Frontal", "Temporal", "Occipital"] },
  aggravatingFactors: {
    type: "checkbox",
    options: ["Stress", "Light", "Noise"],
  },
  relievingFactors: {
    type: "checkbox",
    options: ["Rest", "Meds", "Dark room"],
  },
  associatedSymptoms: { type: "checkbox", options: ["Nausea", "Vomiting"] },
  customNotes: { type: "textarea" },
};
```

### 2. Autocomplete Search

- SNOMED CT: 100,000+ clinical terms
- ICD-10: 70,000+ diagnosis codes
- RxNorm: 200,000+ medications
- LOINC: 90,000+ lab tests

### 3. Offline Support

- Save drafts to IndexedDB
- Sync when online
- Queue orders for transmission

### 4. Digital Signature

- Canvas-based signature capture
- Timestamp and provider ID
- Locks encounter after signing

---

## 📋 Implementation Files

### New Files to Create

```
src/pages/encounter/
├── ClinicalFlowWizard.tsx (main wizard)
├── steps/
│   ├── Step1_ChiefComplaint.tsx
│   ├── Step2_SymptomFeatures.tsx
│   ├── Step3_PastHistory.tsx
│   ├── Step4_FamilyHistory.tsx
│   ├── Step5_SocialHistory.tsx
│   ├── Step6_DrugHistory.tsx
│   ├── Step7_PhysicalExam.tsx
│   ├── Step8_Investigations.tsx
│   ├── Step9_Medications.tsx
│   └── Step10_Advice.tsx
└── components/
    ├── GlassCard.tsx
    ├── SymptomSearch.tsx
    ├── ConditionSearch.tsx
    ├── MedicationSearch.tsx
    ├── VitalSignsPanel.tsx
    ├── ExaminationSystemForm.tsx
    └── SignaturePad.tsx

src/services/
├── snomedService.ts (SNOMED CT API)
├── loincService.ts (LOINC API)
├── rxNormService.ts (RxNorm API)
└── fhirService.ts (FHIR resource builder)

src/db/
└── clinicalDB.ts (Dexie.js schema)
```

### Files to Enhance

```
- EncounterEditorPage.tsx (add wizard mode toggle)
- encounterStore.ts (add step-by-step state)
```

---

## ✅ Success Criteria

1. All 10 steps navigable
2. FHIR resources generated correctly
3. SNOMED/LOINC/RxNorm codes validated
4. Offline drafts work
5. Connects to Lab/Pharmacy/Radiology services
6. Digital signature locks encounter
7. PDF prescription generation
8. Mobile responsive
9. <2s step transition time
10. Auto-save every 30s

---

## 🚀 Next Steps (After Approval)

**Phase 1 (Week 1-2):**

- Create wizard container
- Implement Steps 1-3 (Complaints & History)
- SNOMED CT integration

**Phase 2 (Week 3-4):**

- Steps 4-6 (Family/Social/Drug history)
- AllergyIntolerance FHIR resources

**Phase 3 (Week 5-6):**

- Step 7 (Physical examination)
- System-by-system forms
- LOINC vitals

**Phase 4 (Week 7-8):**

- Steps 8-9 (Investigations & Meds)
- Lab/Pharmacy service integration
- RxNorm medication search

**Phase 5 (Week 9-10):**

- Step 10 (Advice & follow-up)
- Digital signature
- PDF generation
- Testing & polish

---

**AWAITING YOUR APPROVAL TO PROCEED** ⚠️
