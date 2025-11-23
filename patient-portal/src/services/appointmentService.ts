import axios from "axios";

// API Base URL - Kong Gateway
const API_BASE_URL = "http://localhost:8000/api";

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AppointmentStatus =
  | "REQUESTED"
  | "PENDING_APPROVAL"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";

export type AppointmentType =
  | "GENERAL_CHECKUP"
  | "FOLLOW_UP"
  | "URGENT_CARE"
  | "ANNUAL_PHYSICAL"
  | "SPECIALIST_CONSULTATION"
  | "LAB_WORK"
  | "RADIOLOGY"
  | "TELEMEDICINE"
  | "VACCINATION"
  | "PROCEDURE"
  | "OTHER";

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  providerId?: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  requestedDate?: string;
  requestedTime?: string;
  scheduledDate?: string;
  duration: number;
  location?: string;
  isTelemedicine: boolean;
  telemedicineUrl?: string;
  reason?: string;
  notes?: string;
  instructions?: string;
  checkInTime?: string;
  checkInSymptoms?: string;
  checkInTemp?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  providerId?: string;
  appointmentType: AppointmentType;
  requestedDate?: string;
  requestedTime?: string;
  scheduledDate?: string;
  duration?: number;
  location?: string;
  isTelemedicine?: boolean;
  reason?: string;
  notes?: string;
  instructions?: string;
}

export interface RescheduleAppointmentRequest {
  newDate: string;
  reason: string;
}

export interface CheckInRequest {
  symptoms?: string;
  temperature?: number;
}

// ============================================================================
// API SERVICE
// ============================================================================

export const appointmentService = {
  /**
   * Create a new appointment (Feature #3)
   */
  async createAppointment(
    data: CreateAppointmentRequest
  ): Promise<Appointment> {
    const response = await apiClient.post<Appointment>("/appointments", data);
    return response.data;
  },

  /**
   * Get all appointments for a patient (Feature #2)
   */
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(
      `/appointments/patient/${patientId}`
    );
    return response.data;
  },

  /**
   * Get a single appointment by ID
   */
  async getAppointment(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(
      `/appointments/${appointmentId}`
    );
    return response.data;
  },

  /**
   * Reschedule an appointment (Feature #4)
   */
  async rescheduleAppointment(
    appointmentId: string,
    data: RescheduleAppointmentRequest
  ): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(
      `/appointments/${appointmentId}/reschedule`,
      data
    );
    return response.data;
  },

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(
      `/appointments/${appointmentId}/cancel`
    );
    return response.data;
  },

  /**
   * Check-in for an appointment (Feature #20)
   */
  async checkInAppointment(
    appointmentId: string,
    data: CheckInRequest
  ): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(
      `/appointments/${appointmentId}/check-in`,
      data
    );
    return response.data;
  },
};
