import { create } from 'zustand';

export interface HistoryData {
  chiefComplaint: string;
  historyOfPresentIllness: {
    onset: string;
    character: string;
    quality: string;
    radiation: string;
    severity: number;
    timing: string;
    context: string;
  };
  pastMedicalHistory: Array<{
    condition: string;
    yearDiagnosed: string;
    status: 'active' | 'resolved';
  }>;
  medicationHistory: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    indication: string;
    startDate: string;
    endDate?: string;
  }>;
  familyHistory: Array<{
    relation: string;
    condition: string;
    age?: string;
  }>;
  socialHistory: {
    occupation: string;
    tobacco: string;
    alcohol: string;
    drugs: string;
    livingConditions: string;
  };
  reviewOfSystems: {
    general: string;
    cardiovascular: string;
    respiratory: string;
    gastrointestinal: string;
    genitourinary: string;
    neurological: string;
    psychiatric: string;
    musculoskeletal: string;
    skin: string;
    endocrine: string;
  };
}

export interface ExaminationData {
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    temperature: number;
    spO2: number;
    bmi: number;
  };
  generalExamination: {
    appearance: string;
    consciousness: string;
    nutritionalStatus: string;
    hydration: string;
  };
  cardiovascularExam: {
    heartSounds: string;
    pulses: string;
    bloodPressure: string;
    edema: string;
  };
  respiratoryExam: {
    breathSounds: string;
    chestExpansion: string;
    percussion: string;
    fremitus: string;
  };
  abdominalExam: {
    inspection: string;
    palpation: string;
    percussion: string;
    auscultation: string;
  };
  neurologicalExam: {
    cranialNerves: string;
    motorFunction: string;
    sensory: string;
    reflexes: string;
    gait: string;
  };
  musculoskeletalExam: {
    joints: string;
    rangeOfMotion: string;
    muscleStrength: string;
    deformities: string;
  };
}

export interface InvestigationData {
  investigations: Array<{
    testName: string;
    testCode: string;
    urgency: 'routine' | 'urgent' | 'stat';
    notes: string;
  }>;
  results: Array<{
    testName: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'pending' | 'completed' | 'abnormal';
  }>;
}

export interface MedicationData {
  prescriptions: Array<{
    medicationName: string;
    genericName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    indication: string;
    notes: string;
  }>;
}

export interface EncounterState {
  // Encounter metadata
  encounterId: string;
  patientId: string;
  providerId: string;
  encounterDate: string;
  encounterType: string;
  
  // History data
  history: HistoryData;
  setHistory: (history: Partial<HistoryData>) => void;
  updateHistory: (key: keyof HistoryData, value: any) => void;
  
  // Examination data
  examination: ExaminationData;
  setExamination: (examination: Partial<ExaminationData>) => void;
  updateExamination: (key: keyof ExaminationData, value: any) => void;
  
  // Investigation data
  investigations: InvestigationData;
  setInvestigations: (investigations: Partial<InvestigationData>) => void;
  updateInvestigations: (key: keyof InvestigationData, value: any) => void;
  
  // Medication data
  medications: MedicationData;
  setMedications: (medications: Partial<MedicationData>) => void;
  updateMedications: (key: keyof MedicationData, value: any) => void;
  
  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  
  // Actions
  resetEncounter: () => void;
  saveEncounter: () => Promise<void>;
  loadEncounter: (encounterId: string) => Promise<void>;
}

const initialHistoryState: HistoryData = {
  chiefComplaint: '',
  historyOfPresentIllness: {
    onset: '',
    character: '',
    quality: '',
    radiation: '',
    severity: 5,
    timing: '',
    context: '',
  },
  pastMedicalHistory: [],
  medicationHistory: [],
  familyHistory: [],
  socialHistory: {
    occupation: '',
    tobacco: '',
    alcohol: '',
    drugs: '',
    livingConditions: '',
  },
  reviewOfSystems: {
    general: '',
    cardiovascular: '',
    respiratory: '',
    gastrointestinal: '',
    genitourinary: '',
    neurological: '',
    psychiatric: '',
    musculoskeletal: '',
    skin: '',
    endocrine: '',
  },
};

const initialExaminationState: ExaminationData = {
  vitalSigns: {
    bloodPressure: '',
    heartRate: 0,
    respiratoryRate: 0,
    temperature: 0,
    spO2: 0,
    bmi: 0,
  },
  generalExamination: {
    appearance: '',
    consciousness: '',
    nutritionalStatus: '',
    hydration: '',
  },
  cardiovascularExam: {
    heartSounds: '',
    pulses: '',
    bloodPressure: '',
    edema: '',
  },
  respiratoryExam: {
    breathSounds: '',
    chestExpansion: '',
    percussion: '',
    fremitus: '',
  },
  abdominalExam: {
    inspection: '',
    palpation: '',
    percussion: '',
    auscultation: '',
  },
  neurologicalExam: {
    cranialNerves: '',
    motorFunction: '',
    sensory: '',
    reflexes: '',
    gait: '',
  },
  musculoskeletalExam: {
    joints: '',
    rangeOfMotion: '',
    muscleStrength: '',
    deformities: '',
  },
};

const initialInvestigationState: InvestigationData = {
  investigations: [],
  results: [],
};

const initialMedicationState: MedicationData = {
  prescriptions: [],
};

export const useEncounterStore = create<EncounterState>((set) => ({
  // Initial state
  encounterId: '',
  patientId: '',
  providerId: '',
  encounterDate: new Date().toISOString(),
  encounterType: 'OUTPATIENT',
  
  history: initialHistoryState,
  examination: initialExaminationState,
  investigations: initialInvestigationState,
  medications: initialMedicationState,
  
  activeTab: 'history',
  isSaving: false,
  
  // History setters
  setHistory: (history) => set((state) => ({
    history: { ...state.history, ...history },
  })),
  
  updateHistory: (key, value) => set((state) => ({
    history: { ...state.history, [key]: value },
  })),
  
  // Examination setters
  setExamination: (examination) => set((state) => ({
    examination: { ...state.examination, ...examination },
  })),
  
  updateExamination: (key, value) => set((state) => ({
    examination: { ...state.examination, [key]: value },
  })),
  
  // Investigation setters
  setInvestigations: (investigations) => set((state) => ({
    investigations: { ...state.investigations, ...investigations },
  })),
  
  updateInvestigations: (key, value) => set((state) => ({
    investigations: { ...state.investigations, [key]: value },
  })),
  
  // Medication setters
  setMedications: (medications) => set((state) => ({
    medications: { ...state.medications, ...medications },
  })),
  
  updateMedications: (key, value) => set((state) => ({
    medications: { ...state.medications, [key]: value },
  })),
  
  // UI state
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsSaving: (saving) => set({ isSaving: saving }),
  
  // Actions
  resetEncounter: () => set({
    history: initialHistoryState,
    examination: initialExaminationState,
    investigations: initialInvestigationState,
    medications: initialMedicationState,
    activeTab: 'history',
  }),
  
  saveEncounter: async () => {
    set({ isSaving: true });
    try {
      const state = useEncounterStore.getState();
      const payload = {
        patientId: state.patientId,
        providerId: state.providerId,
        encounterType: state.encounterType,
        encounterClass: 'AMBULATORY',
        chiefComplaint: state.history.chiefComplaint,
        historyOfPresentIllness: state.history.historyOfPresentIllness,
        pastMedicalHistory: state.history.pastMedicalHistory,
        medicationHistory: state.history.medicationHistory,
        familyHistory: state.history.familyHistory,
        socialHistory: state.history.socialHistory,
        reviewOfSystems: state.history.reviewOfSystems,
        vitalSigns: state.examination.vitalSigns,
        generalExamination: state.examination.generalExamination,
        cardiovascularExam: state.examination.cardiovascularExam,
        respiratoryExam: state.examination.respiratoryExam,
        abdominalExam: state.examination.abdominalExam,
        neurologicalExam: state.examination.neurologicalExam,
        musculoskeletalExam: state.examination.musculoskeletalExam,
        investigations: state.investigations,
        medications: state.medications,
        createdBy: state.providerId,
      };

      // Dynamic import to avoid circular dependency
      const { encounterService } = await import('../services/encounterService');
      
      if (state.encounterId) {
        await encounterService.updateEncounter(state.encounterId, payload);
      } else {
        const response = await encounterService.createEncounter(payload);
        set({ encounterId: response.id });
      }
      
      console.log('Encounter saved successfully');
    } catch (error) {
      console.error('Failed to save encounter:', error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },
  
  loadEncounter: async (encounterId) => {
    set({ isSaving: true });
    try {
      const { encounterService } = await import('../services/encounterService');
      const data = await encounterService.getEncounter(encounterId);
      
      set({
        encounterId: data.id,
        patientId: data.patientId,
        providerId: data.providerId,
        encounterType: data.encounterType,
        history: {
          chiefComplaint: data.chiefComplaint || '',
          historyOfPresentIllness: data.historyOfPresentIllness || {},
          pastMedicalHistory: data.pastMedicalHistory || [],
          medicationHistory: data.medicationHistory || [],
          familyHistory: data.familyHistory || [],
          socialHistory: data.socialHistory || {},
          reviewOfSystems: data.reviewOfSystems || {},
        },
        examination: {
          vitalSigns: data.vitalSigns || {},
          generalExamination: data.generalExamination || {},
          cardiovascularExam: data.cardiovascularExam || {},
          respiratoryExam: data.respiratoryExam || {},
          abdominalExam: data.abdominalExam || {},
          neurologicalExam: data.neurologicalExam || {},
          musculoskeletalExam: data.musculoskeletalExam || {},
        },
        investigations: data.investigations || {},
        medications: data.medications || {},
      });
      
      console.log('Encounter loaded successfully');
    } catch (error) {
      console.error('Failed to load encounter:', error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },
}));
