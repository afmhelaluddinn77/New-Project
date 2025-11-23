import axios from "axios";

const API_BASE_URL = "http://localhost:3007"; // Pharmacy service

export interface Medication {
  id: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  route: string;
  frequency: string;
  scheduledTime: string;
  status: "pending" | "given" | "held" | "refused" | "overdue";
  prescribedBy: string;
  notes?: string;
  prn?: boolean;
  prnReason?: string;
}

export interface MedicationAdministrationRecord {
  medicationId: string;
  patientId: string;
  administeredAt: string;
  administeredBy: string;
  status: string;
  notes?: string;
  vitalsBeforeAdmin?: {
    bloodPressure?: string;
    heartRate?: number;
    painLevel?: number;
  };
  vitalsAfterAdmin?: {
    bloodPressure?: string;
    heartRate?: number;
    painLevel?: number;
  };
}

class MedicationService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async getMedicationsDue(timeWindow = 60): Promise<Medication[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/medications/due?window=${timeWindow}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching medications due:", error);
      // Return mock data for now
      const now = new Date();
      return [
        {
          id: "med1",
          patientId: "1",
          patientName: "John Smith - 301A",
          medicationName: "Metformin",
          dosage: "500mg",
          route: "PO",
          frequency: "BID",
          scheduledTime: new Date(now.getTime() + 30 * 60000).toISOString(),
          status: "pending",
          prescribedBy: "Dr. Johnson",
        },
        {
          id: "med2",
          patientId: "2",
          patientName: "Mary Johnson - 305B",
          medicationName: "Insulin Lispro",
          dosage: "10 units",
          route: "SubQ",
          frequency: "AC",
          scheduledTime: new Date(now.getTime() - 10 * 60000).toISOString(),
          status: "overdue",
          prescribedBy: "Dr. Smith",
        },
        {
          id: "med3",
          patientId: "1",
          patientName: "John Smith - 301A",
          medicationName: "Acetaminophen",
          dosage: "650mg",
          route: "PO",
          frequency: "PRN",
          scheduledTime: now.toISOString(),
          status: "pending",
          prescribedBy: "Dr. Johnson",
          prn: true,
          prnReason: "Pain/Fever",
        },
      ];
    }
  }

  async administerMedication(
    record: MedicationAdministrationRecord
  ): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/api/medications/administer`, record, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error("Error administering medication:", error);
      throw error;
    }
  }

  async holdMedication(medicationId: string, reason: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/api/medications/${medicationId}/hold`,
        { reason },
        {
          headers: this.getAuthHeaders(),
        }
      );
    } catch (error) {
      console.error("Error holding medication:", error);
      throw error;
    }
  }

  async getMedicationHistory(
    patientId: string,
    days = 7
  ): Promise<MedicationAdministrationRecord[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/patients/${patientId}/medication-history?days=${days}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching medication history:", error);
      return [];
    }
  }

  async checkInteractions(medications: string[]): Promise<any[]> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/medications/check-interactions`,
        { medications },
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking interactions:", error);
      return [];
    }
  }
}

export default new MedicationService();
