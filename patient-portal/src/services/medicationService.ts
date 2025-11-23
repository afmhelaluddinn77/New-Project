import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface Medication {
  id: string;
  patientId: string;
  medicationName: string;
  genericName: string;
  rxcui?: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedDate: string;
  startDate: string;
  endDate?: string;
  status: "Active" | "Discontinued" | "Completed" | "OnHold";
  prescriberId: string;
  prescriberName: string;
  refillsRemaining: number;
  refillsAuthorized: number;
  lastFilledDate?: string;
  nextRefillDate?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  instructions?: string;
  indication?: string;
  sideEffects?: string[];
  interactions?: string[];
  isControlled: boolean;
  isPRN: boolean;
}

export interface RefillRequest {
  medicationId: string;
  pharmacyId?: string;
  notes?: string;
}

export interface MedicationHistory {
  medicationId: string;
  action: "Prescribed" | "Filled" | "Refilled" | "Discontinued" | "Modified";
  date: string;
  performedBy: string;
  notes?: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "Minor" | "Moderate" | "Major" | "Contraindicated";
  description: string;
  recommendation: string;
}

export const medicationService = {
  async getMedications(patientId: string): Promise<Medication[]> {
    const response = await apiClient.get<Medication[]>(
      `/pharmacy/medications/patient/${patientId}`
    );
    return response.data;
  },

  async getActiveMedications(patientId: string): Promise<Medication[]> {
    const response = await apiClient.get<Medication[]>(
      `/pharmacy/medications/patient/${patientId}/active`
    );
    return response.data;
  },

  async getMedication(medicationId: string): Promise<Medication> {
    const response = await apiClient.get<Medication>(
      `/pharmacy/medications/${medicationId}`
    );
    return response.data;
  },

  async requestRefill(
    request: RefillRequest
  ): Promise<{ requestId: string; status: string }> {
    const response = await apiClient.post("/pharmacy/refill-requests", request);
    return response.data;
  },

  async getRefillRequests(patientId: string): Promise<any[]> {
    const response = await apiClient.get(
      `/pharmacy/refill-requests/patient/${patientId}`
    );
    return response.data;
  },

  async cancelRefillRequest(requestId: string): Promise<void> {
    await apiClient.delete(`/pharmacy/refill-requests/${requestId}`);
  },

  async getMedicationHistory(
    medicationId: string
  ): Promise<MedicationHistory[]> {
    const response = await apiClient.get<MedicationHistory[]>(
      `/pharmacy/medications/${medicationId}/history`
    );
    return response.data;
  },

  async checkInteractions(medicationIds: string[]): Promise<DrugInteraction[]> {
    const response = await apiClient.post<DrugInteraction[]>(
      "/pharmacy/interactions/check",
      { medicationIds }
    );
    return response.data;
  },

  async updateMedicationAdherence(
    medicationId: string,
    taken: boolean,
    timestamp?: string
  ): Promise<void> {
    await apiClient.post(`/pharmacy/medications/${medicationId}/adherence`, {
      taken,
      timestamp: timestamp || new Date().toISOString(),
    });
  },

  async getMedicationAdherence(
    medicationId: string,
    period?: "week" | "month" | "year"
  ): Promise<{
    adherenceRate: number;
    missedDoses: number;
    takenDoses: number;
  }> {
    const response = await apiClient.get(
      `/pharmacy/medications/${medicationId}/adherence`,
      { params: { period } }
    );
    return response.data;
  },

  async setMedicationReminder(
    medicationId: string,
    reminderTimes: string[]
  ): Promise<void> {
    await apiClient.post(`/pharmacy/medications/${medicationId}/reminders`, {
      reminderTimes,
    });
  },

  async searchMedications(query: string): Promise<
    Array<{
      rxcui: string;
      name: string;
      genericName: string;
      dosageForms: string[];
    }>
  > {
    const response = await apiClient.get("/pharmacy/medications/search", {
      params: { q: query },
    });
    return response.data;
  },

  async getPreferredPharmacy(patientId: string): Promise<{
    pharmacyId: string;
    name: string;
    address: string;
    phone: string;
  } | null> {
    const response = await apiClient.get(
      `/patients/${patientId}/preferred-pharmacy`
    );
    return response.data;
  },

  async setPreferredPharmacy(
    patientId: string,
    pharmacyId: string
  ): Promise<void> {
    await apiClient.put(`/patients/${patientId}/preferred-pharmacy`, {
      pharmacyId,
    });
  },
};
