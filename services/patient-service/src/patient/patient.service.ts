import { Injectable } from '@nestjs/common'

// Mock patient database
interface Patient {
  id: string
  name: string
  dateOfBirth: string
  email: string
  careTeam: string[] // Provider IDs
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: 'xyz-789',
    name: 'John Doe',
    dateOfBirth: '1980-01-15',
    email: 'john.doe@example.com',
    careTeam: ['2'], // Provider ID '2' is authorized
  },
]

// Mock care team assignments
const CARE_TEAM_ASSIGNMENTS: Record<string, string[]> = {
  'xyz-789': ['2'], // Patient xyz-789 has provider '2' on care team
}

@Injectable()
export class PatientService {
  async isProviderAuthorized(
    patientId: string,
    providerId: string,
    providerRole: string,
  ): Promise<boolean> {
    // Admin role has access to all patients
    if (providerRole === 'ADMIN') {
      return true
    }

    // Check if provider is on the care team
    const careTeam = CARE_TEAM_ASSIGNMENTS[patientId] || []
    return careTeam.includes(providerId)
  }

  async getPatientDetails(patientId: string): Promise<Patient | null> {
    return MOCK_PATIENTS.find((p) => p.id === patientId) || null
  }
}

