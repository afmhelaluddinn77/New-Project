# 🩺 Clinical Flow - Final Updated Plan

**Date:** November 14, 2025
**Status:** ⚠️ AWAITING APPROVAL

---

## 🎯 Updates Summary

### Enhanced Features

1. **Medications: Optional Pharmacy Send**
   - Toggle: Send to Pharmacy (Port 3012) OR Generate PDF only
   - For external purchase: Paper prescription with instructions
   - Full FHIR MedicationRequest + HL7 messaging

2. **Lab Tests: Optional Lab Send**
   - Toggle: Send to Lab Service (Port 3013) OR Generate order form
   - For external labs: PDF order form
   - LOINC coded + HL7 messaging

3. **New History Sections**
   - **Surgical History** (SNOMED procedures)
   - **OB/GYN History** (Gravida/Para, deliveries, menstrual)
   - **Immunization History** (CVX codes, vaccines)
   - **Personal History** (sexual orientation, substance use - HIPAA protected)

---

## 🔄 Final Clinical Flow (15 Steps)

```
1. Chief Complaint
2. History of Present Illness / Symptom Features
3. Other Systems Enquiry (system-wise review of other symptoms)
4. Past Medical History
5. Drug History (current medications + allergies; RxNorm + AllergyIntolerance)
6. Surgical History 🆕
7. OB/GYN History 🆕 (if applicable)
8. Immunization History 🆕
9. Family History
10. Social History
11. Personal History 🆕 (HIPAA protected)
12. Physical Examination
13. Investigations 🔄 (with optional send to lab or external form)
14. Medications 🔄 (with optional pharmacy send or paper Rx only)
15. Advice, Follow-up & Digital Signature
```

---

## 💊 Medication Section Design

### Toggle Options

- **Send to Pharmacy:** ePrescribe via Port 3012
- **Paper Rx Only:** Generate PDF for external pharmacy

### Layout

```
[💊 Ibuprofen 400mg]
Dosage: 1 tab TID × 5 days

Send to Pharmacy:
○ Yes - ePrescribe (Port 3012)
● No - Paper Rx only

Reason: ● Patient buying externally
        ○ Insurance requirement
        ○ Patient preference

[📄 Generate Prescription PDF]
```

---

## 🔬 Lab Section Design

### Toggle Options

- **Send to Lab:** Electronic order via Port 3013
- **External Lab:** Generate order form PDF

### Layout

```
[🔬 Complete Blood Count]
LOINC: 58410-2

Send to Lab Service:
● Yes (Port 3013)
○ No - External lab

If external:
Lab Name: [Quest Diagnostics___]

[📄 Generate Lab Order PDF]
```

---

## 📋 New History Sections

### Surgical History (Step 4)

- FHIR: `Procedure` resource
- SNOMED CT procedure codes
- Date, hospital, complications

### OB/GYN History (Step 5)

- FHIR: `Observation` resource
- LOINC: Gravida (11996-6), Para (11977-6)
- Pregnancy details, menstrual, contraception

### Immunization History (Step 6)

- FHIR: `Immunization` resource
- CVX codes (vaccine types)
- Date, dose number, lot, reactions

### Personal History (Step 9)

- FHIR: `Observation` (social-history)
- LOINC: Sexual orientation (76690-7)
- Substance use (detailed alcohol, drugs)
- HIPAA confidentiality tag: "Restricted"

---

## 🔗 Service Integration

### Pharmacy Service (Port 3012)

```typescript
if (sendToPharmacy) {
  POST / api / pharmacy / prescriptions;
  // ePrescribe transmission
} else {
  // Generate PDF only
  generatePrescriptionPDF();
}
```

### Lab Service (Port 3013)

```typescript
if (sendToLab) {
  POST / api / lab / orders;
  // Electronic order
} else {
  // Generate order form
  generateLabOrderPDF();
}
```

---

## ✅ Compliance

- ✅ FHIR R4 (all resources)
- ✅ HIPAA (encrypted, confidentiality tags)
- ✅ LOINC (lab tests, vitals, observations)
- ✅ SNOMED CT (symptoms, procedures)
- ✅ HL7 v2/v3 (messaging)
- ✅ ERP compatible
- ✅ CVX codes (vaccines)
- ✅ RxNorm (medications)

---

## 🌐 FHIR & Analytics Interoperability

- All clinical data captured in the 15-step flow is persisted as **FHIR R4 resources** only (no custom, non-standard schemas for clinical content).
- Standard terminologies are used everywhere:
  - **SNOMED CT** for symptoms, conditions, procedures
  - **LOINC** for lab tests, vitals, key observations
  - **ICD-10/11** for diagnosis/billing codes (where required)
  - **RxNorm** for medications
  - **CVX** for vaccines
- Every encounter can be exported as **FHIR Bundles** (e.g., `Bundle` of `Encounter`, `Condition`, `Observation`, `MedicationStatement`, `AllergyIntolerance`, `Procedure`, `Immunization`, `MedicationRequest`, `CarePlan`).
- For analytics tools like **RapidMiner** or **KNIME**:
  - Data can be exported as **FHIR Bulk Data (NDJSON)** or transformed into **tabular CSV/Parquet** while preserving codes.
  - Because all fields are coded with standard systems, downstream ML/analytics pipelines can safely aggregate, filter, and join data across encounters, patients, and time.
- Interoperability with other EMRs/HIS is guaranteed via:
  - FHIR REST endpoints for reads/writes
  - HL7 v2/v3 messaging where required by external systems
  - No deviation from FHIR + standard terminologies for any clinical data at any time in the design.

---

## 📅 Implementation Timeline

**Phase 1 (Week 1-2):** Steps 1-3 + wizard
**Phase 2 (Week 3-4):** Steps 4-6 (new history)
**Phase 3 (Week 5-6):** Steps 7-10 (existing history)
**Phase 4 (Week 7-8):** Step 11 (physical exam)
**Phase 5 (Week 9-10):** Steps 12-13 (with send toggles)
**Phase 6 (Week 11-12):** Step 14 + PDF generation + testing

**Total: 12 weeks**

---

**READY FOR APPROVAL** ⚠️

All requirements incorporated:

- ✅ Optional pharmacy/lab send
- ✅ PDF generation for external
- ✅ Surgical, OB/GYN, Immunization, Personal history
- ✅ FHIR/HIPAA/LOINC/SNOMED/HL7/ERP compliant
- ✅ Glass morphism design from HTML reference
