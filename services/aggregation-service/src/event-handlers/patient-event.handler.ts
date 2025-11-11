import {
  AllergyAddedEvent,
  AllergyRemovedEvent,
  PatientCreatedEvent,
  PatientUpdatedEvent,
} from "@emr-hms/events";
import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { PrismaService } from "../prisma/prisma.service";

@Controller()
export class PatientEventHandler {
  constructor(private readonly prisma: PrismaService) {}

  @EventPattern("patient.created")
  async handlePatientCreated(@Payload() event: PatientCreatedEvent) {
    console.log(
      `📥 Received event: ${event.eventType} for patient ${event.data.patientId}`
    );

    await this.prisma.patientAggregateView.create({
      data: {
        patientId: event.data.patientId,
        mrn: event.data.mrn,
        fullName: event.data.fullName,
        dateOfBirth: new Date(event.data.dateOfBirth),
        gender: event.data.gender,
        fhirPatient: event.data.fhirResource,
      },
    });

    console.log(`✅ Created patient aggregate view for ${event.data.mrn}`);
  }

  @EventPattern("patient.updated")
  async handlePatientUpdated(@Payload() event: PatientUpdatedEvent) {
    console.log(
      `📥 Received event: ${event.eventType} for patient ${event.data.patientId}`
    );

    await this.prisma.patientAggregateView.update({
      where: { patientId: event.data.patientId },
      data: {
        mrn: event.data.mrn,
        fhirPatient: event.data.fhirResource,
        lastUpdated: new Date(),
      },
    });

    console.log(`✅ Updated patient aggregate view for ${event.data.mrn}`);
  }

  @EventPattern("patient.allergy.added")
  async handleAllergyAdded(@Payload() event: AllergyAddedEvent) {
    console.log(
      `⚠️ Received CRITICAL event: ${event.eventType} for patient ${event.data.patientId}`
    );

    const patient = await this.prisma.patientAggregateView.findUnique({
      where: { patientId: event.data.patientId },
    });

    if (!patient) {
      console.error(`❌ Patient not found: ${event.data.patientId}`);
      return;
    }

    const allergies = (patient.allergies as any[]) || [];
    allergies.push({
      allergyId: event.data.allergyId,
      substance: event.data.substance,
      snomedCode: event.data.snomedCode,
      criticality: event.data.criticality,
      reaction: event.data.reaction,
    });

    await this.prisma.patientAggregateView.update({
      where: { patientId: event.data.patientId },
      data: {
        allergies,
        criticalAlerts:
          patient.criticalAlerts + (event.data.criticality === "high" ? 1 : 0),
        lastUpdated: new Date(),
      },
    });

    console.log(
      `✅ Added allergy ${event.data.substance} to patient aggregate`
    );
  }

  @EventPattern("patient.allergy.removed")
  async handleAllergyRemoved(@Payload() event: AllergyRemovedEvent) {
    console.log(
      `📥 Received event: ${event.eventType} for patient ${event.data.patientId}`
    );

    const patient = await this.prisma.patientAggregateView.findUnique({
      where: { patientId: event.data.patientId },
    });

    if (!patient) {
      console.error(`❌ Patient not found: ${event.data.patientId}`);
      return;
    }

    const allergies = (patient.allergies as any[]) || [];
    const updatedAllergies = allergies.filter(
      (allergy: any) => allergy.allergyId !== event.data.allergyId
    );

    await this.prisma.patientAggregateView.update({
      where: { patientId: event.data.patientId },
      data: {
        allergies: updatedAllergies,
        lastUpdated: new Date(),
      },
    });

    console.log(`✅ Removed allergy from patient aggregate`);
  }
}
