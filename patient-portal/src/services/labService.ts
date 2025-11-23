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

export interface LabResult {
  id: string;
  patientId: string;
  orderNumber: string;
  testName: string;
  testCode: string;
  category: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag: "Normal" | "High" | "Low" | "Critical";
  status: "Pending" | "InProgress" | "Completed" | "Cancelled";
  orderedDate: string;
  resultDate?: string;
  orderedBy: string;
  performedBy?: string;
  notes?: string;
  attachments?: string[];
  isCritical: boolean;
  isAbnormal: boolean;
}

export interface LabOrder {
  patientId: string;
  tests: string[];
  priority: "Routine" | "Urgent" | "STAT";
  clinicalInfo?: string;
  fastingRequired?: boolean;
  specialInstructions?: string;
}

export const labService = {
  async getLabResults(patientId: string): Promise<LabResult[]> {
    const response = await apiClient.get<LabResult[]>(
      `/lab/results/patient/${patientId}`
    );
    return response.data;
  },

  async getLabResult(resultId: string): Promise<LabResult> {
    const response = await apiClient.get<LabResult>(`/lab/results/${resultId}`);
    return response.data;
  },

  async getLabResultsByDateRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<LabResult[]> {
    const response = await apiClient.get<LabResult[]>(
      `/lab/results/patient/${patientId}/range`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  },

  async getLabResultsByCategory(
    patientId: string,
    category: string
  ): Promise<LabResult[]> {
    const response = await apiClient.get<LabResult[]>(
      `/lab/results/patient/${patientId}/category/${category}`
    );
    return response.data;
  },

  async getCriticalResults(patientId: string): Promise<LabResult[]> {
    const response = await apiClient.get<LabResult[]>(
      `/lab/results/patient/${patientId}/critical`
    );
    return response.data;
  },

  async downloadLabReport(resultId: string): Promise<Blob> {
    const response = await apiClient.get(`/lab/results/${resultId}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  async acknowledgeResult(resultId: string): Promise<void> {
    await apiClient.post(`/lab/results/${resultId}/acknowledge`);
  },

  async getLabTrends(
    patientId: string,
    testCode: string,
    period?: "week" | "month" | "year"
  ): Promise<Array<{ date: string; value: number; unit: string }>> {
    const response = await apiClient.get(
      `/lab/trends/patient/${patientId}/${testCode}`,
      {
        params: { period },
      }
    );
    return response.data;
  },

  async createLabOrder(order: LabOrder): Promise<{ orderNumber: string }> {
    const response = await apiClient.post("/lab/orders", order);
    return response.data;
  },

  async getPendingOrders(patientId: string): Promise<any[]> {
    const response = await apiClient.get(
      `/lab/orders/patient/${patientId}/pending`
    );
    return response.data;
  },
};
