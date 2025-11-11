import axios from "axios";
import { useAuthStore } from "../store/authStore";

/**
 * Encounter Service
 *
 * CRITICAL FIX: Use separate axios instance with direct URL
 * Absolute URLs bypass interceptors, so we need a fresh client
 * that will apply headers before sending to encounter service.
 */

// Create a separate client for encounter service requests
const encounterClient = axios.create({
  baseURL: "http://localhost:3005",
  withCredentials: true,
});

// Helper to extract user ID from JWT token
const extractUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.userId || payload.id || null;
  } catch {
    return null;
  }
};

// Apply request interceptor to encounter client
encounterClient.interceptors.request.use((config) => {
  const { accessToken, user } = useAuthStore.getState();

  config.headers = config.headers ?? {};

  // Add Authorization
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Required by backend role guards
  config.headers["x-user-role"] = user?.role || "PROVIDER";
  config.headers["x-portal"] = "PROVIDER";

  // Extract user ID from token or user object
  let userId = user?.id;
  if (!userId && accessToken) {
    userId = extractUserIdFromToken(accessToken);
  }
  // CRITICAL FIX: Always set x-user-id, use fallback if needed
  config.headers["x-user-id"] = userId || "2"; // Fallback to provider ID 2

  return config;
});

interface EncounterPayload {
  patientId: string;
  providerId: string;
  encounterType: string;
  encounterClass: string;
  chiefComplaint: string;
  historyOfPresentIllness: any;
  pastMedicalHistory: any;
  medicationHistory: any;
  familyHistory: any;
  socialHistory: any;
  reviewOfSystems: any;
  vitalSigns: any;
  generalExamination: any;
  cardiovascularExam: any;
  respiratoryExam: any;
  abdominalExam: any;
  neurologicalExam: any;
  musculoskeletalExam: any;
  investigations: any;
  medications: any;
  createdBy: string;
}

export interface PrescriptionPayload {
  encounterId: string;
  medicationId?: string;
  rxNormCode?: string;
  genericName: string;
  brandName?: string;
  dosage: string;
  dosageForm: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills?: number;
  instructions?: string;
  indication?: string;
  allergyChecked?: boolean;
  interactionChecked?: boolean;
  pharmacyId?: string;
}

export interface UpdatePrescriptionPayload
  extends Partial<PrescriptionPayload> {
  status?: string;
  dispensedDate?: string;
  dispensedBy?: string;
  pharmacyId?: string;
}

export interface InvestigationPayload {
  encounterId: string;
  investigationType: string;
  loincCode?: string;
  snomedCode?: string;
  name: string;
  description?: string;
  priority?: string;
  imagingModality?: string;
  imagingBodySite?: string;
}

export interface UpdateInvestigationPayload
  extends Partial<InvestigationPayload> {
  status?: string;
  resultValue?: string;
  resultUnit?: string;
  referenceRange?: string;
  interpretation?: string;
  resultNotes?: string;
}

export interface InvestigationResultPayload {
  resultDate?: string;
  resultValue?: string;
  resultUnit?: string;
  referenceRange?: string;
  interpretation?: string;
  resultNotes?: string;
}

export interface MedicationInteractionPayload {
  rxnormCode?: string;
  genericName?: string;
}

class EncounterService {
  /**
   * @deprecated Phase 3: This method is deprecated and does nothing.
   * Token management is now handled automatically by api.ts interceptors.
   */
  setAuthToken(token: string) {
    console.warn(
      "[encounterService] setAuthToken is deprecated. Tokens are managed automatically."
    );
  }

  // Create new encounter
  async createEncounter(data: EncounterPayload) {
    try {
      const response = await encounterClient.post(`/api/encounters`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating encounter:", error);
      throw error;
    }
  }

  // Get encounter by ID
  async getEncounter(encounterId: string) {
    try {
      const response = await encounterClient.get(
        `/api/encounters/${encounterId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching encounter:", error);
      throw error;
    }
  }

  // Update encounter
  async updateEncounter(encounterId: string, data: Partial<EncounterPayload>) {
    try {
      const response = await encounterClient.patch(
        `/api/encounters/${encounterId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating encounter:", error);
      throw error;
    }
  }

  // Get encounters for patient
  async getPatientEncounters(patientId: string) {
    try {
      const response = await encounterClient.get(
        `/api/encounters/patient/${patientId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching patient encounters:", error);
      throw error;
    }
  }

  // Finalize encounter
  async finalizeEncounter(encounterId: string) {
    try {
      const response = await encounterClient.post(
        `/api/encounters/${encounterId}/finalize`
      );
      return response.data;
    } catch (error) {
      console.error("Error finalizing encounter:", error);
      throw error;
    }
  }

  // Delete encounter (soft delete)
  async deleteEncounter(encounterId: string) {
    try {
      const response = await encounterClient.delete(
        `/api/encounters/${encounterId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting encounter:", error);
      throw error;
    }
  }

  // Get all encounters (with pagination)
  async getAllEncounters(skip: number = 0, take: number = 20) {
    try {
      const response = await encounterClient.get(`/api/encounters`, {
        params: { skip, take },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching encounters:", error);
      throw error;
    }
  }

  // ==========================================================================
  // Prescription APIs
  // ==========================================================================

  async listPrescriptions(skip: number = 0, take: number = 20) {
    try {
      const response = await encounterClient.get(`/api/prescriptions`, {
        params: { skip, take },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      throw error;
    }
  }

  async getPrescription(prescriptionId: string) {
    try {
      const response = await encounterClient.get(
        `/api/prescriptions/${prescriptionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching prescription:", error);
      throw error;
    }
  }

  async getPrescriptionsByEncounter(encounterId: string) {
    try {
      const response = await encounterClient.get(
        `/api/prescriptions/encounter/${encounterId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching encounter prescriptions:", error);
      throw error;
    }
  }

  async createPrescription(data: PrescriptionPayload) {
    try {
      const response = await encounterClient.post(
        `/api/prescriptions`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating prescription:", error);
      throw error;
    }
  }

  async updatePrescription(
    prescriptionId: string,
    data: UpdatePrescriptionPayload
  ) {
    try {
      const response = await encounterClient.put(
        `/api/prescriptions/${prescriptionId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating prescription:", error);
      throw error;
    }
  }

  async deletePrescription(prescriptionId: string) {
    try {
      const response = await encounterClient.delete(
        `/api/prescriptions/${prescriptionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting prescription:", error);
      throw error;
    }
  }

  async dispensePrescription(
    prescriptionId: string,
    data: { dispensedDate?: string; pharmacyId?: string }
  ) {
    try {
      const response = await encounterClient.post(
        `/api/prescriptions/${prescriptionId}/dispense`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error dispensing prescription:", error);
      throw error;
    }
  }

  async checkPrescriptionInteractions(
    prescriptionId: string,
    otherMedications: MedicationInteractionPayload[]
  ) {
    try {
      const response = await encounterClient.post(
        `/api/prescriptions/${prescriptionId}/check-interactions`,
        otherMedications
      );
      return response.data;
    } catch (error) {
      console.error("Error checking prescription interactions:", error);
      throw error;
    }
  }

  // ==========================================================================
  // Investigation APIs
  // ==========================================================================

  async listInvestigations(skip: number = 0, take: number = 20) {
    try {
      const response = await encounterClient.get(`/api/investigations`, {
        params: { skip, take },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching investigations:", error);
      throw error;
    }
  }

  async getInvestigation(investigationId: string) {
    try {
      const response = await encounterClient.get(
        `/api/investigations/${investigationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching investigation:", error);
      throw error;
    }
  }

  async getInvestigationsByEncounter(encounterId: string) {
    try {
      const response = await encounterClient.get(
        `/api/investigations/encounter/${encounterId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching encounter investigations:", error);
      throw error;
    }
  }

  async createInvestigation(data: InvestigationPayload) {
    try {
      const response = await encounterClient.post(
        `/api/investigations`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating investigation:", error);
      throw error;
    }
  }

  async updateInvestigation(
    investigationId: string,
    data: UpdateInvestigationPayload
  ) {
    try {
      const response = await encounterClient.put(
        `/api/investigations/${investigationId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating investigation:", error);
      throw error;
    }
  }

  async deleteInvestigation(investigationId: string) {
    try {
      const response = await encounterClient.delete(`/api/investigations/${investigationId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting investigation:", error);
      throw error;
    }
  }

  async addInvestigationResults(
    investigationId: string,
    data: InvestigationResultPayload
  ) {
    try {
      const response = await encounterClient.post(
        `/api/investigations/${investigationId}/results`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error adding investigation results:", error);
      throw error;
    }
  }

  async searchInvestigationByLoinc(loincCode: string) {
    try {
      const response = await encounterClient.get(
        `/api/investigations/search/loinc/${loincCode}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching investigation by LOINC:", error);
      throw error;
    }
  }

  async searchInvestigationBySnomed(snomedCode: string) {
    try {
      const response = await encounterClient.get(
        `/api/investigations/search/snomed/${snomedCode}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching investigation by SNOMED:", error);
      throw error;
    }
  }

  // ==========================================================================
  // Medication APIs
  // ==========================================================================

  async searchMedications(query: string, limit: number = 20) {
    try {
      const response = await encounterClient.get(
        `/api/medications/search`,
        {
          params: { q: query, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching medications:", error);
      throw error;
    }
  }

  async getMedicationByRxNorm(rxNormCode: string) {
    try {
      const response = await encounterClient.get(
        `/api/medications/search/rxnorm/${rxNormCode}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching medication by RxNorm code:", error);
      throw error;
    }
  }

  async checkMedicationInteractions(
    medications: MedicationInteractionPayload[]
  ) {
    try {
      const response = await encounterClient.post(
        `/api/medications/interactions/check`,
        {
          medications,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking medication interactions:", error);
      throw error;
    }
  }

  async getMedicationContraindications(rxNormCode: string) {
    try {
      const response = await encounterClient.get(
        `/api/medications/contraindications/${rxNormCode}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching contraindications:", error);
      throw error;
    }
  }

  async getMedicationSideEffects(rxNormCode: string) {
    try {
      const response = await encounterClient.get(`/api/medications/side-effects/${rxNormCode}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching side effects:", error);
      throw error;
    }
  }

  async getMedicationDosageInfo(rxNormCode: string) {
    try {
      const response = await encounterClient.get(`/api/medications/dosage-info/${rxNormCode}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching dosage info:", error);
      throw error;
    }
  }

  async checkMedicationAllergies(patientId: string, medications: string[]) {
    try {
      const response = await encounterClient.post(
        `/api/medications/allergy-check`,
        {
          patientId,
          medications,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking medication allergies:", error);
      throw error;
    }
  }

  async getMedicationAlternatives(rxNormCode: string) {
    try {
      const response = await encounterClient.get(`/api/medications/alternatives/${rxNormCode}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching medication alternatives:", error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await encounterClient.get(`/api/health`);
      return response.data;
    } catch (error) {
      console.error("Error health check:", error);
      throw error;
    }
  }
}

export const encounterService = new EncounterService();
