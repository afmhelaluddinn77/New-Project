import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { PatientService } from './patient.service'

interface GetPatientDetailsPayload {
  patientId: string
  authContext: {
    userId: string
    role: string
    portal: string
  }
}

@Controller()
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @MessagePattern({ cmd: 'get_patient_details' })
  async getPatientDetails(@Payload() data: GetPatientDetailsPayload): Promise<any> {
    const { patientId, authContext } = data

    // Authorize: Check if provider is on care team
    const isAuthorized = await this.patientService.isProviderAuthorized(
      patientId,
      authContext.userId,
      authContext.role,
    )

    if (!isAuthorized) {
      return {
        error: 'Unauthorized: Provider is not on the care team for this patient',
      }
    }

    // HIPAA Audit Log (MANDATORY)
    console.log(
      `HIPAA_AUDIT: Provider ${authContext.userId} (${authContext.role}) accessed Patient ${patientId} via ${authContext.portal} portal at ${new Date().toISOString()}`,
    )

    // Get patient data
    const patientData = await this.patientService.getPatientDetails(patientId)

    return patientData
  }
}

