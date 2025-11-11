import {
  MedicationDispensedEvent,
  MedicationPrescribedEvent,
} from "@emr-hms/events";
import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { PrismaService } from "../prisma/prisma.service";

@Controller()
export class PharmacyEventHandler {
  constructor(private readonly prisma: PrismaService) {}

  @EventPattern("pharmacy.medication.prescribed")
  async handleMedicationPrescribed(
    @Payload() event: MedicationPrescribedEvent
  ) {
    console.log(
      `📥 Received event: ${event.eventType} for request ${event.data.requestId}`
    );

    // Create medication view
    await this.prisma.medicationView.create({
      data: {
        requestId: event.data.requestId,
        patientId: event.data.patientId,
        prescriberId: event.data.prescriberId,
        medicationName: event.data.medicationName,
        rxNormCode: event.data.rxNormCode,
        dosage: event.data.dosage,
        frequency: event.data.frequency,
        route: event.data.route,
        duration: event.data.duration,
        refills: event.data.refills,
        status: "active",
        fhirRequest: event.data.fhirResource,
        prescribedAt: new Date(),
      },
    });

    // Update patient aggregate
    const patient = await this.prisma.patientAggregateView.findUnique({
      where: { patientId: event.data.patientId },
    });

    if (patient) {
      const medications = (patient.medications as any[]) || [];
      medications.push({
        requestId: event.data.requestId,
        medicationName: event.data.medicationName,
        rxNormCode: event.data.rxNormCode,
        dosage: event.data.dosage,
        frequency: event.data.frequency,
      });

      await this.prisma.patientAggregateView.update({
        where: { patientId: event.data.patientId },
        data: {
          medications,
          lastUpdated: new Date(),
        },
      });
    }

    console.log(`✅ Created medication view and updated patient aggregate`);
  }

  @EventPattern("pharmacy.medication.dispensed")
  async handleMedicationDispensed(@Payload() event: MedicationDispensedEvent) {
    console.log(
      `📥 Received event: ${event.eventType} for dispense ${event.data.dispenseId}`
    );

    // Update medication view with dispense info
    await this.prisma.medicationView.update({
      where: { requestId: event.data.requestId },
      data: {
        dispensed: true,
        dispenseId: event.data.dispenseId,
        dispensedAt: new Date(event.data.dispensedAt),
        quantityDispensed: event.data.quantityDispensed,
        lastUpdated: new Date(),
      },
    });

    console.log(`✅ Updated medication view with dispense information`);
  }
}
