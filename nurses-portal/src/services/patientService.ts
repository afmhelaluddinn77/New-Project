import axios from "axios";

const API_BASE_URL = "http://localhost:3002"; // Patient service

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  roomNumber?: string;
  admissionDate?: string;
  primaryDiagnosis?: string;
  attendingPhysician?: string;
  allergies?: string[];
  codeStatus?: string;
  fallRisk?: boolean;
  isolationPrecautions?: string;
}

export interface PatientVitals {
  patientId: string;
  timestamp: string;
  temperature?: number;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  painLevel?: number;
  bloodGlucose?: number;
}

class PatientService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async getAssignedPatients(): Promise<Patient[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/patients/assigned`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching assigned patients:", error);
      // Return mock data for now
      return [
        {
          id: "1",
          mrn: "MRN001",
          firstName: "John",
          lastName: "Smith",
          dateOfBirth: "1955-03-15",
          gender: "Male",
          roomNumber: "301A",
          admissionDate: "2024-01-20",
          primaryDiagnosis: "Pneumonia",
          attendingPhysician: "Dr. Johnson",
          allergies: ["Penicillin", "Sulfa"],
          codeStatus: "Full Code",
          fallRisk: true,
          isolationPrecautions: "Droplet",
        },
        {
          id: "2",
          mrn: "MRN002",
          firstName: "Mary",
          lastName: "Johnson",
          dateOfBirth: "1968-07-22",
          gender: "Female",
          roomNumber: "305B",
          admissionDate: "2024-01-19",
          primaryDiagnosis: "Diabetes Type 2",
          attendingPhysician: "Dr. Smith",
          allergies: [],
          codeStatus: "Full Code",
          fallRisk: false,
        },
      ];
    }
  }

  async getPatientById(patientId: string): Promise<Patient | null> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/patients/${patientId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching patient:", error);
      return null;
    }
  }

  async recordVitals(vitals: PatientVitals): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/api/patients/${vitals.patientId}/vitals`,
        vitals,
        {
          headers: this.getAuthHeaders(),
        }
      );
    } catch (error) {
      console.error("Error recording vitals:", error);
      throw error;
    }
  }

  async getPatientVitals(
    patientId: string,
    limit = 10
  ): Promise<PatientVitals[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/patients/${patientId}/vitals?limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching patient vitals:", error);
      // Return mock data for now
      return [
        {
          patientId,
          timestamp: new Date().toISOString(),
          temperature: 98.6,
          heartRate: 72,
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          respiratoryRate: 16,
          oxygenSaturation: 98,
          painLevel: 2,
        },
      ];
    }
  }

  async updatePatientStatus(
    patientId: string,
    status: Partial<Patient>
  ): Promise<void> {
    try {
      await axios.patch(`${API_BASE_URL}/api/patients/${patientId}`, status, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error("Error updating patient status:", error);
      throw error;
    }
  }
}

export default new PatientService();
