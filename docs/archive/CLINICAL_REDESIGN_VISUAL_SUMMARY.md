# 🩺 Clinical Documentation Redesign - Visual Summary

**Reference HTML:** `9_gemini_fixed_final (1).html`
**Status:** ⚠️ AWAITING APPROVAL

---

## 🎯 Design Concept

### Natural Clinical Flow (10 Steps)

```
Chief Complaint → Symptom Features → Past History → Family History →
Social History → Drug History → Physical Exam → Investigations →
Medications → Advice & Sign
```

### UI Style: Glass Morphism

- **Background:** `rgba(255, 255, 255, 0.95)` with `backdrop-filter: blur(10px)`
- **Shadows:** Soft `0 4px 24px rgba(0, 0, 0, 0.05)`
- **Colors:** Blue theme (#1e40af for headers, #dbeafe for borders)
- **Font:** Inter, sans-serif
- **Icons:** Font Awesome 6.4.0

---

## 📊 Key Features

### 1. Progressive Disclosure

- Only show current step
- Progress indicator at top
- Back/Next navigation

### 2. Smart Symptom Features

- Auto-expand features based on selected symptom
- Each symptom gets: duration, severity, character, location, aggravating/relieving factors
- Multiple symptoms = multiple feature forms

### 3. FHIR R4 Compliance

- Encounter, Condition, Observation, MedicationStatement, AllergyIntolerance
- SNOMED CT codes for symptoms/diagnoses
- LOINC codes for vitals/lab tests
- ICD-10 for billing
- RxNorm for medications

### 4. Inter-Portal Connectivity

```typescript
Lab Service (3013) → POST /api/lab/orders
Pharmacy Service (3012) → POST /api/pharmacy/prescriptions
Radiology Service (3014) → POST /api/radiology/orders
```

### 5. Offline Support

- Dexie.js (IndexedDB)
- Auto-sync every 30s
- Queue orders when offline

---

## 🏗️ Component Structure

```
ClinicalFlowWizard/
├── StepIndicator (progress bar)
├── PatientInfoBar (demographics + allergies)
├── Step1_ChiefComplaint
│   ├── SymptomSearch (SNOMED autocomplete)
│   └── SymptomCard
├── Step2_SymptomFeatures
│   └── DynamicFeatureForm (renders per symptom)
├── Step3-6_History (past, family, social, drug)
├── Step7_PhysicalExam
│   ├── SystemSelector (tabs)
│   ├── VitalsPanel (BP, HR, Temp, RR, SpO2, Weight)
│   └── ExaminationForm (per system)
├── Step8_Investigations
│   ├── LabOrderForm (LOINC)
│   └── ImagingOrderForm
├── Step9_Medications
│   ├── MedicationSearch (RxNorm)
│   └── DosageForm
└── Step10_ReviewSign
    ├── EncounterSummary
    └── SignaturePad (canvas)
```

---

## 📱 Responsive Design

- **Desktop (>1024px):** Multi-column, all features visible
- **Tablet (768-1024px):** 2-column where needed
- **Mobile (<768px):** Single column, bottom nav bar

---

## ✅ Implementation Checklist

**Phase 1 (Week 1-2):**

- [ ] Wizard container with step navigation
- [ ] Steps 1-3 (Complaints & History)
- [ ] SNOMED CT integration

**Phase 2 (Week 3-4):**

- [ ] Steps 4-6 (Family/Social/Drug)
- [ ] Allergy management

**Phase 3 (Week 5-6):**

- [ ] Step 7 (Physical Exam)
- [ ] Vitals with LOINC codes

**Phase 4 (Week 7-8):**

- [ ] Steps 8-9 (Investigations & Meds)
- [ ] Service integration (Lab 3013, Pharmacy 3012)

**Phase 5 (Week 9-10):**

- [ ] Step 10 (Review & Sign)
- [ ] Digital signature
- [ ] PDF generation
- [ ] Testing

---

## 🔥 Quick Reference

**Style Classes:**

- `.glass` - Glass morphism card
- `.soft-shadow` - Soft shadow
- `.section-title` - Blue section headers

**Key Services:**

- SNOMED CT API (symptoms/diagnoses)
- LOINC API (lab tests/vitals)
- RxNorm API (medications)
- FHIR Builder (resource generation)

**Existing Files to Modify:**

- `EncounterEditorPage.tsx` - Add wizard mode
- `encounterStore.ts` - Add step state

---

**READY FOR YOUR APPROVAL** ⚠️

Confirm to proceed with implementation.
