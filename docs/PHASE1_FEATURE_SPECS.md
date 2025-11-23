# Phase 1: Requirements & Domain Design Specifications

**Following FEATURE_IMPLEMENTATION_LAW.md**

## Remaining 5% Features (20 Critical Features)

---

## 1. CPOE (Computerized Provider Order Entry) System

### Domain Object: `ProviderOrder`

**Owning Service**: `order-service`
**Consuming Portals**: Provider, Nurses, Pharmacy, Lab

**Fields**:

- orderId: UUID
- patientId: string
- providerId: string
- orderType: 'medication' | 'lab' | 'imaging' | 'procedure' | 'consult'
- orderDetails: JSON
- priority: 'stat' | 'urgent' | 'routine' | 'timed'
- orderDateTime: DateTime
- scheduledDateTime?: DateTime
- status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'discontinued'
- clinicalIndication: string
- allergiesReviewed: boolean
- interactionsChecked: boolean
- cosignRequired: boolean
- cosignedBy?: string

**HIPAA Impact**: Contains PHI - requires audit logging
**FHIR Resource**: MedicationRequest, ServiceRequest

---

## 2. Clinical Decision Support (CDS) Engine

### Domain Object: `ClinicalAlert`

**Owning Service**: `cds-service`
**Consuming Portals**: Provider, Nurses, Pharmacy

**Fields**:

- alertId: UUID
- patientId: string
- alertType: 'drug-interaction' | 'allergy' | 'duplicate' | 'dosage' | 'contraindication'
- severity: 'info' | 'warning' | 'critical'
- sourceSystem: string
- alertMessage: string
- recommendations: string[]
- evidenceLinks: string[]
- acknowledgedBy?: string
- overrideReason?: string
- firedAt: DateTime

**HIPAA Impact**: Contains PHI - requires encryption
**FHIR Resource**: DetectedIssue, ClinicalImpression

---

## 3. Sepsis Detection Algorithm (Epic-style)

### Domain Object: `SepsisRiskScore`

**Owning Service**: `clinical-intelligence-service`
**Consuming Portals**: Provider, Nurses, IT

**Fields**:

- scoreId: UUID
- patientId: string
- calculatedAt: DateTime
- sirs_criteria: number (0-4)
- qsofa_score: number (0-3)
- lactate_level?: number
- risk_level: 'low' | 'moderate' | 'high' | 'critical'
- vital_signs: JSON
- lab_values: JSON
- organ_dysfunction: boolean
- recommended_actions: string[]
- alert_sent: boolean

**HIPAA Impact**: Contains PHI - critical health data
**FHIR Resource**: RiskAssessment, Observation

---

## 4. Nursing Acuity Scoring System

### Domain Object: `PatientAcuity`

**Owning Service**: `nursing-service`
**Consuming Portals**: Nurses, Admin

**Fields**:

- acuityId: UUID
- patientId: string
- unitId: string
- assessmentDateTime: DateTime
- mobility_score: number (1-4)
- cognitive_score: number (1-4)
- elimination_score: number (1-4)
- nutrition_score: number (1-4)
- medication_complexity: number (1-4)
- total_acuity_score: number
- recommended_nurse_ratio: string
- fall_risk: boolean
- pressure_injury_risk: boolean

**HIPAA Impact**: Contains PHI
**FHIR Resource**: Observation, RiskAssessment

---

## 5. Real-time Location System (RTLS)

### Domain Object: `AssetLocation`

**Owning Service**: `rtls-service`
**Consuming Portals**: IT, Nurses, Admin

**Fields**:

- trackingId: UUID
- assetType: 'equipment' | 'staff' | 'patient'
- assetId: string
- locationId: string
- floor: string
- room?: string
- coordinates: { x: number, y: number }
- lastSeen: DateTime
- battery_level?: number
- temperature?: number
- is_moving: boolean
- alerts: string[]

**HIPAA Impact**: May contain patient location data
**FHIR Resource**: Location, Device

---

## 6. Smart Infusion Pump Integration

### Domain Object: `InfusionData`

**Owning Service**: `device-integration-service`
**Consuming Portals**: Nurses, Provider, Pharmacy

**Fields**:

- infusionId: UUID
- pumpId: string
- patientId: string
- drugName: string
- concentration: string
- rate: number
- volume_infused: number
- volume_remaining: number
- start_time: DateTime
- projected_end: DateTime
- alarms: JSON[]
- dose_error_reduction: boolean
- barcode_verified: boolean

**HIPAA Impact**: Contains PHI and medication data
**FHIR Resource**: MedicationAdministration, Device

---

## 7. Automated Dispensing Cabinet (ADC) Integration

### Domain Object: `DispensingTransaction`

**Owning Service**: `pharmacy-service`
**Consuming Portals**: Pharmacy, Nurses

**Fields**:

- transactionId: UUID
- cabinetId: string
- userId: string
- patientId?: string
- medicationId: string
- quantity: number
- transaction_type: 'dispense' | 'return' | 'waste' | 'restock'
- witness_required: boolean
- witnessed_by?: string
- override_used: boolean
- override_reason?: string
- timestamp: DateTime

**HIPAA Impact**: Contains controlled substance tracking
**FHIR Resource**: MedicationDispense, SupplyDelivery

---

## 8. Surgical Safety Checklist (WHO Standard)

### Domain Object: `SurgicalChecklist`

**Owning Service**: `surgery-service`
**Consuming Portals**: Provider, Nurses, Admin

**Fields**:

- checklistId: UUID
- surgeryId: string
- patientId: string
- phase: 'sign-in' | 'time-out' | 'sign-out'
- patient_identity_confirmed: boolean
- site_marked: boolean
- anesthesia_safety_check: boolean
- pulse_oximeter_functioning: boolean
- allergies_confirmed: boolean
- difficult_airway_risk: boolean
- blood_loss_risk: boolean
- all_team_members_introduced: boolean
- antibiotics_given: boolean
- essential_imaging_displayed: boolean
- completed_by: string
- completed_at: DateTime

**HIPAA Impact**: Contains PHI and surgical data
**FHIR Resource**: Procedure, QuestionnaireResponse

---

## 9. Bed Management & Patient Flow

### Domain Object: `BedAssignment`

**Owning Service**: `bed-management-service`
**Consuming Portals**: Admin, Nurses, Provider

**Fields**:

- assignmentId: UUID
- bedId: string
- unitId: string
- roomNumber: string
- patientId?: string
- status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'blocked'
- isolation_type?: 'contact' | 'droplet' | 'airborne' | 'protective'
- features: string[] // telemetry, oxygen, suction
- last_cleaned: DateTime
- estimated_discharge?: DateTime
- pending_admission?: string

**HIPAA Impact**: Contains patient location
**FHIR Resource**: Location, Encounter

---

## 10. Antimicrobial Stewardship Program

### Domain Object: `AntimicrobialOrder`

**Owning Service**: `antimicrobial-service`
**Consuming Portals**: Provider, Pharmacy, Lab

**Fields**:

- orderId: UUID
- patientId: string
- antibioticId: string
- indication: string
- culture_results?: JSON
- empiric_therapy: boolean
- de_escalation_planned: boolean
- duration_days: number
- review_date: DateTime
- renal_adjustment: boolean
- therapeutic_monitoring: boolean
- stewardship_approved: boolean
- resistance_pattern?: JSON

**HIPAA Impact**: Contains PHI and treatment data
**FHIR Resource**: MedicationRequest, MedicationStatement

---

## 11. Telemetry Monitoring System

### Domain Object: `TelemetryAlert`

**Owning Service**: `telemetry-service`
**Consuming Portals**: Nurses, Provider, IT

**Fields**:

- alertId: UUID
- patientId: string
- monitorId: string
- alert_type: 'bradycardia' | 'tachycardia' | 'asystole' | 'vfib' | 'vtach' | 'artifact'
- heart_rate: number
- rhythm: string
- st_elevation?: number
- pvc_count?: number
- alert_time: DateTime
- acknowledged_by?: string
- response_time_seconds?: number

**HIPAA Impact**: Contains critical PHI
**FHIR Resource**: Observation, DeviceMetric

---

## 12. Nutrition & Dietetics Management

### Domain Object: `NutritionAssessment`

**Owning Service**: `nutrition-service`
**Consuming Portals**: Provider, Nurses, Patient

**Fields**:

- assessmentId: UUID
- patientId: string
- dietitianId: string
- bmi: number
- albumin_level?: number
- prealbumin_level?: number
- malnutrition_risk: 'low' | 'moderate' | 'high'
- diet_order: string
- texture_modification?: string
- fluid_restriction?: string
- calorie_target: number
- protein_target: number
- supplements: string[]
- reassessment_date: DateTime

**HIPAA Impact**: Contains PHI
**FHIR Resource**: NutritionOrder, Observation

---

## 13. Pressure Injury Prevention System

### Domain Object: `PressureInjuryAssessment`

**Owning Service**: `wound-care-service`
**Consuming Portals**: Nurses, Provider

**Fields**:

- assessmentId: UUID
- patientId: string
- braden_score: number
- risk_level: 'low' | 'moderate' | 'high' | 'very-high'
- skin_inspection: JSON
- existing_injuries: JSON[]
- interventions: string[]
- turning_schedule: string
- surface_type: string
- nutrition_status: string
- moisture_management: string
- reassessment_due: DateTime

**HIPAA Impact**: Contains PHI and clinical images
**FHIR Resource**: Observation, Condition

---

## 14. Discharge Planning Module

### Domain Object: `Dischargeplan`

**Owning Service**: `discharge-service`
**Consuming Portals**: Provider, Nurses, Patient

**Fields**:

- planId: UUID
- patientId: string
- estimated_discharge_date: DateTime
- discharge_destination: 'home' | 'snf' | 'rehab' | 'hospice' | 'other'
- barriers: string[]
- medication_reconciliation: boolean
- follow_up_appointments: JSON[]
- dme_needs: string[]
- home_health_ordered: boolean
- education_completed: string[]
- readmission_risk: 'low' | 'moderate' | 'high'

**HIPAA Impact**: Contains PHI
**FHIR Resource**: CarePlan, ServiceRequest

---

## 15. Vaccine Administration Record (VAR)

### Domain Object: `VaccineAdministration`

**Owning Service**: `immunization-service`
**Consuming Portals**: Provider, Nurses, Patient, Admin

**Fields**:

- administrationId: UUID
- patientId: string
- vaccineCode: string
- cvx_code: string
- lot_number: string
- expiration_date: Date
- manufacturer: string
- dose_number: number
- series_complete: boolean
- site: string
- route: string
- administered_by: string
- vis_provided: boolean
- adverse_reaction?: string

**HIPAA Impact**: Contains PHI
**FHIR Resource**: Immunization, ImmunizationRecommendation

---

## 16. Blood Bank Management

### Domain Object: `BloodProduct`

**Owning Service**: `blood-bank-service`
**Consuming Portals**: Lab, Provider, Nurses

**Fields**:

- productId: UUID
- unit_number: string
- product_type: 'prbc' | 'ffp' | 'platelets' | 'cryo'
- blood_type: string
- expiration: DateTime
- crossmatch_patientId?: string
- crossmatch_result?: 'compatible' | 'incompatible'
- issued_to?: string
- transfusion_start?: DateTime
- transfusion_end?: DateTime
- reactions?: JSON[]

**HIPAA Impact**: Critical PHI and traceability required
**FHIR Resource**: BiologicallyDerivedProduct, Procedure

---

## 17. Infection Control Surveillance

### Domain Object: `InfectionSurveillance`

**Owning Service**: `infection-control-service`
**Consuming Portals**: Admin, Nurses, Provider, IT

**Fields**:

- surveillanceId: UUID
- patientId: string
- infection_type: 'hai' | 'mdro' | 'clabsi' | 'cauti' | 'ssi' | 'vae'
- pathogen: string
- specimen_source: string
- onset_date: DateTime
- isolation_required: boolean
- isolation_type?: string
- outbreak_investigation: boolean
- reported_to_health_dept: boolean
- interventions: string[]

**HIPAA Impact**: Contains PHI, reportable to health departments
**FHIR Resource**: Condition, Observation

---

## 18. Operating Room Scheduling

### Domain Object: `SurgerySchedule`

**Owning Service**: `or-scheduling-service`
**Consuming Portals**: Provider, Admin, Nurses

**Fields**:

- scheduleId: UUID
- roomId: string
- patientId: string
- surgeonId: string
- procedure_name: string
- cpt_codes: string[]
- scheduled_start: DateTime
- estimated_duration_minutes: number
- anesthesia_type: string
- equipment_needs: string[]
- implants_needed: string[]
- blood_products_reserved: boolean
- status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

**HIPAA Impact**: Contains PHI
**FHIR Resource**: Appointment, Procedure

---

## 19. Patient Education Tracking

### Domain Object: `PatientEducation`

**Owning Service**: `education-service`
**Consuming Portals**: Nurses, Provider, Patient

**Fields**:

- educationId: UUID
- patientId: string
- topic: string
- method: 'verbal' | 'written' | 'video' | 'demonstration'
- materials_provided: string[]
- language: string
- interpreter_used: boolean
- barriers: string[]
- understanding_level: 'full' | 'partial' | 'minimal'
- teach_back_completed: boolean
- family_included: boolean
- educator_id: string
- completed_at: DateTime

**HIPAA Impact**: Contains PHI
**FHIR Resource**: Communication, DocumentReference

---

## 20. Emergency Department Tracking Board

### Domain Object: `EDTracker`

**Owning Service**: `ed-service`
**Consuming Portals**: Provider, Nurses, Admin

**Fields**:

- trackerId: UUID
- patientId: string
- arrival_time: DateTime
- triage_level: 1 | 2 | 3 | 4 | 5
- chief_complaint: string
- bed_assigned?: string
- provider_assigned?: string
- labs_ordered: boolean
- imaging_ordered: boolean
- disposition: 'pending' | 'admit' | 'discharge' | 'transfer' | 'ama'
- door_to_doc_minutes?: number
- total_los_minutes?: number
- left_without_being_seen: boolean

**HIPAA Impact**: Contains PHI
**FHIR Resource**: Encounter, Observation
