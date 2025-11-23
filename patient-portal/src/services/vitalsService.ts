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

export interface VitalSigns {
  id: string;
  patientId: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  painScore?: number;
  bloodGlucose?: number;
  measurementDate: string;
  measurementLocation: "home" | "clinic" | "hospital" | "other";
  measuredBy?: string;
  measuredByType: "self" | "provider" | "caregiver";
  notes?: string;
  fhirResourceIds?: string[];
}

export interface VitalTrend {
  vitalType: string;
  data: Array<{
    date: string;
    value: number;
    unit: string;
    flag?: "Normal" | "High" | "Low";
  }>;
  statistics?: {
    average: number;
    min: number;
    max: number;
    trend: "increasing" | "decreasing" | "stable";
  };
}

export interface VitalRanges {
  bloodPressureSystolic: { min: number; max: number };
  bloodPressureDiastolic: { min: number; max: number };
  heartRate: { min: number; max: number };
  temperature: { min: number; max: number };
  oxygenSaturation: { min: number; max: number };
  bloodGlucose: { min: number; max: number };
}

export const vitalsService = {
  async getVitals(patientId: string): Promise<VitalSigns[]> {
    const response = await apiClient.get<VitalSigns[]>(
      `/patients/${patientId}/vitals`
    );
    return response.data;
  },

  async getLatestVitals(patientId: string): Promise<VitalSigns> {
    const response = await apiClient.get<VitalSigns>(
      `/patients/${patientId}/vitals/latest`
    );
    return response.data;
  },

  async getVitalsByDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<VitalSigns[]> {
    const response = await apiClient.get<VitalSigns[]>(
      `/patients/${patientId}/vitals/range`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  },

  async addVitals(vitals: Partial<VitalSigns>): Promise<VitalSigns> {
    const response = await apiClient.post<VitalSigns>(
      `/patients/${vitals.patientId}/vitals`,
      vitals
    );
    return response.data;
  },

  async updateVitals(
    vitalId: string,
    updates: Partial<VitalSigns>
  ): Promise<VitalSigns> {
    const response = await apiClient.put<VitalSigns>(
      `/vitals/${vitalId}`,
      updates
    );
    return response.data;
  },

  async deleteVitals(vitalId: string): Promise<void> {
    await apiClient.delete(`/vitals/${vitalId}`);
  },

  async getVitalTrends(
    patientId: string,
    vitalTypes: string[],
    period?: "week" | "month" | "3months" | "6months" | "year"
  ): Promise<VitalTrend[]> {
    const response = await apiClient.get<VitalTrend[]>(
      `/patients/${patientId}/vitals/trends`,
      {
        params: { vitalTypes: vitalTypes.join(","), period },
      }
    );
    return response.data;
  },

  async getBloodPressureTrend(
    patientId: string,
    period?: "week" | "month" | "year"
  ): Promise<VitalTrend> {
    const response = await apiClient.get<VitalTrend>(
      `/patients/${patientId}/vitals/trends/blood-pressure`,
      { params: { period } }
    );
    return response.data;
  },

  async getWeightTrend(
    patientId: string,
    period?: "week" | "month" | "year"
  ): Promise<VitalTrend> {
    const response = await apiClient.get<VitalTrend>(
      `/patients/${patientId}/vitals/trends/weight`,
      { params: { period } }
    );
    return response.data;
  },

  async getBloodGlucoseTrend(
    patientId: string,
    period?: "week" | "month" | "year"
  ): Promise<VitalTrend> {
    const response = await apiClient.get<VitalTrend>(
      `/patients/${patientId}/vitals/trends/blood-glucose`,
      { params: { period } }
    );
    return response.data;
  },

  async getNormalRanges(patientId: string): Promise<VitalRanges> {
    const response = await apiClient.get<VitalRanges>(
      `/patients/${patientId}/vitals/ranges`
    );
    return response.data;
  },

  async checkVitalAlerts(vitals: Partial<VitalSigns>): Promise<
    Array<{
      vitalType: string;
      value: number;
      status: "Normal" | "High" | "Low" | "Critical";
      message: string;
      recommendation?: string;
    }>
  > {
    const response = await apiClient.post("/vitals/check-alerts", vitals);
    return response.data;
  },

  async exportVitals(
    patientId: string,
    format: "pdf" | "csv" | "json",
    startDate?: string,
    endDate?: string
  ): Promise<Blob> {
    const response = await apiClient.get(
      `/patients/${patientId}/vitals/export`,
      {
        params: { format, startDate, endDate },
        responseType: "blob",
      }
    );
    return response.data;
  },

  async syncWithDevice(
    patientId: string,
    deviceType:
      | "fitbit"
      | "apple-watch"
      | "blood-pressure-monitor"
      | "glucometer",
    data: any
  ): Promise<{ synced: number; errors: number }> {
    const response = await apiClient.post(
      `/patients/${patientId}/vitals/sync-device`,
      { deviceType, data }
    );
    return response.data;
  },

  async getVitalGoals(patientId: string): Promise<
    Array<{
      vitalType: string;
      targetValue: number;
      unit: string;
      setBy: string;
      setDate: string;
    }>
  > {
    const response = await apiClient.get(`/patients/${patientId}/vitals/goals`);
    return response.data;
  },

  async setVitalGoal(
    patientId: string,
    vitalType: string,
    targetValue: number,
    unit: string
  ): Promise<void> {
    await apiClient.post(`/patients/${patientId}/vitals/goals`, {
      vitalType,
      targetValue,
      unit,
    });
  },
};
