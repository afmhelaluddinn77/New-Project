import { z } from 'zod';

// ============================================================================
// BASIC FIELD SCHEMAS
// ============================================================================

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const dateStringSchema = z.string().datetime('Invalid date format');

export const bloodPressureSchema = z
  .string()
  .regex(/^\d{2,3}\/\d{2,3}$/, 'Blood pressure must be in format XXX/XX (e.g., 120/80)');

export const heartRateSchema = z
  .number()
  .int('Heart rate must be an integer')
  .min(30, 'Heart rate must be at least 30 bpm')
  .max(300, 'Heart rate cannot exceed 300 bpm');

export const temperatureSchema = z
  .number()
  .min(35, 'Temperature must be at least 35°C')
  .max(42, 'Temperature cannot exceed 42°C');

export const spO2Schema = z
  .number()
  .int('SpO2 must be an integer')
  .min(0, 'SpO2 cannot be negative')
  .max(100, 'SpO2 cannot exceed 100%');

export const respiratoryRateSchema = z
  .number()
  .int('Respiratory rate must be an integer')
  .min(8, 'Respiratory rate must be at least 8')
  .max(60, 'Respiratory rate cannot exceed 60');

// ============================================================================
// HISTORY SCHEMAS
// ============================================================================

export const chiefComplaintSchema = z.object({
  chiefComplaint: z
    .string()
    .min(1, 'Chief complaint is required')
    .max(500, 'Chief complaint cannot exceed 500 characters'),
});

export const historyOfPresentIllnessSchema = z.object({
  onset: z.string().optional(),
  character: z.string().optional(),
  quality: z.string().optional(),
  radiation: z.string().optional(),
  severity: z.number().min(1).max(10).optional(),
  timing: z.string().optional(),
  context: z.string().optional(),
});

export const pastMedicalHistorySchema = z.array(
  z.object({
    condition: z.string().min(1, 'Condition is required'),
    yearDiagnosed: z.string(),
    status: z.enum(['active', 'resolved']),
  })
);

export const medicationHistorySchema = z.array(
  z.object({
    medicationName: z.string().min(1, 'Medication name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().optional(),
    indication: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
);

export const familyHistorySchema = z.array(
  z.object({
    relation: z.string().min(1, 'Relation is required'),
    condition: z.string().min(1, 'Condition is required'),
    age: z.string().optional(),
  })
);

export const socialHistorySchema = z.object({
  occupation: z.string().optional(),
  tobacco: z.enum(['never', 'former', 'current']).optional(),
  alcohol: z.enum(['none', 'occasional', 'regular', 'heavy']).optional(),
  drugs: z.enum(['none', 'former', 'current']).optional(),
  livingConditions: z.string().optional(),
});

export const reviewOfSystemsSchema = z.object({
  general: z.string().optional(),
  cardiovascular: z.string().optional(),
  respiratory: z.string().optional(),
  gastrointestinal: z.string().optional(),
  genitourinary: z.string().optional(),
  neurological: z.string().optional(),
  psychiatric: z.string().optional(),
  musculoskeletal: z.string().optional(),
  skin: z.string().optional(),
  endocrine: z.string().optional(),
});

// ============================================================================
// EXAMINATION SCHEMAS
// ============================================================================

export const vitalSignsSchema = z.object({
  bloodPressure: bloodPressureSchema.optional(),
  heartRate: heartRateSchema.optional(),
  respiratoryRate: respiratoryRateSchema.optional(),
  temperature: temperatureSchema.optional(),
  spO2: spO2Schema.optional(),
  bmi: z.number().optional(),
});

export const generalExaminationSchema = z.object({
  appearance: z.string().optional(),
  consciousness: z.enum(['alert', 'drowsy', 'lethargic', 'stuporous', 'comatose']).optional(),
  nutritionalStatus: z.enum(['well-nourished', 'adequately-nourished', 'malnourished', 'obese']).optional(),
  hydration: z.enum(['well-hydrated', 'adequately-hydrated', 'dehydrated', 'severely-dehydrated']).optional(),
});

export const cardiovascularExamSchema = z.object({
  heartSounds: z.string().optional(),
  pulses: z.string().optional(),
  bloodPressure: z.string().optional(),
  edema: z.enum(['none', 'mild', 'moderate', 'severe']).optional(),
});

export const respiratoryExamSchema = z.object({
  breathSounds: z.string().optional(),
  chestExpansion: z.string().optional(),
  percussion: z.string().optional(),
  fremitus: z.string().optional(),
});

export const abdominalExamSchema = z.object({
  inspection: z.string().optional(),
  palpation: z.string().optional(),
  percussion: z.string().optional(),
  auscultation: z.string().optional(),
});

export const neurologicalExamSchema = z.object({
  cranialNerves: z.string().optional(),
  motorFunction: z.string().optional(),
  sensory: z.string().optional(),
  reflexes: z.string().optional(),
  gait: z.string().optional(),
});

export const musculoskeletalExamSchema = z.object({
  joints: z.string().optional(),
  rangeOfMotion: z.string().optional(),
  muscleStrength: z.string().optional(),
  deformities: z.string().optional(),
});

// ============================================================================
// INVESTIGATION SCHEMAS
// ============================================================================

export const investigationSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  testCode: z.string().optional(),
  urgency: z.enum(['routine', 'urgent', 'stat']).default('routine'),
  notes: z.string().optional(),
});

export const investigationResultSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  value: z.string().min(1, 'Value is required'),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  status: z.enum(['pending', 'completed', 'abnormal']).default('pending'),
});

export const investigationsSchema = z.object({
  investigations: z.array(investigationSchema).default([]),
  results: z.array(investigationResultSchema).default([]),
});

// ============================================================================
// MEDICATION SCHEMAS
// ============================================================================

export const prescriptionSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required'),
  genericName: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().optional(),
  route: z.enum(['Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical', 'Inhalation', 'Rectal']).default('Oral'),
  indication: z.string().optional(),
  notes: z.string().optional(),
});

export const medicationsSchema = z.object({
  prescriptions: z.array(prescriptionSchema).default([]),
});

// ============================================================================
// FULL ENCOUNTER SCHEMAS
// ============================================================================

export const encounterSchema = z.object({
  patientId: uuidSchema,
  providerId: uuidSchema,
  encounterType: z.enum(['OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'TELEMEDICINE', 'HOME_VISIT']).default('OUTPATIENT'),
  encounterClass: z.string().default('AMBULATORY'),
  chiefComplaint: z.string().min(1, 'Chief complaint is required'),
  historyOfPresentIllness: historyOfPresentIllnessSchema.optional(),
  pastMedicalHistory: pastMedicalHistorySchema.optional(),
  medicationHistory: medicationHistorySchema.optional(),
  familyHistory: familyHistorySchema.optional(),
  socialHistory: socialHistorySchema.optional(),
  reviewOfSystems: reviewOfSystemsSchema.optional(),
  vitalSigns: vitalSignsSchema.optional(),
  generalExamination: generalExaminationSchema.optional(),
  cardiovascularExam: cardiovascularExamSchema.optional(),
  respiratoryExam: respiratoryExamSchema.optional(),
  abdominalExam: abdominalExamSchema.optional(),
  neurologicalExam: neurologicalExamSchema.optional(),
  musculoskeletalExam: musculoskeletalExamSchema.optional(),
  investigations: investigationsSchema.optional(),
  medications: medicationsSchema.optional(),
  createdBy: uuidSchema,
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ChiefComplaint = z.infer<typeof chiefComplaintSchema>;
export type HistoryOfPresentIllness = z.infer<typeof historyOfPresentIllnessSchema>;
export type PastMedicalHistory = z.infer<typeof pastMedicalHistorySchema>;
export type MedicationHistory = z.infer<typeof medicationHistorySchema>;
export type FamilyHistory = z.infer<typeof familyHistorySchema>;
export type SocialHistory = z.infer<typeof socialHistorySchema>;
export type ReviewOfSystems = z.infer<typeof reviewOfSystemsSchema>;

export type VitalSigns = z.infer<typeof vitalSignsSchema>;
export type GeneralExamination = z.infer<typeof generalExaminationSchema>;
export type CardiovascularExam = z.infer<typeof cardiovascularExamSchema>;
export type RespiratoryExam = z.infer<typeof respiratoryExamSchema>;
export type AbdominalExam = z.infer<typeof abdominalExamSchema>;
export type NeurologicalExam = z.infer<typeof neurologicalExamSchema>;
export type MusculoskeletalExam = z.infer<typeof musculoskeletalExamSchema>;

export type Investigation = z.infer<typeof investigationSchema>;
export type InvestigationResult = z.infer<typeof investigationResultSchema>;
export type Investigations = z.infer<typeof investigationsSchema>;

export type Prescription = z.infer<typeof prescriptionSchema>;
export type Medications = z.infer<typeof medicationsSchema>;

export type Encounter = z.infer<typeof encounterSchema>;
