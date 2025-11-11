import {
  EncounterCompletedEvent,
  EncounterStartedEvent,
  VitalSignsRecordedEvent,
} from "@emr-hms/events";
import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { PrismaService } from "../prisma/prisma.service";

@Controller()
export class EncounterEventHandler {
  constructor(private readonly prisma: PrismaService) {}

  @EventPattern("encounter.started")
  async handleEncounterStarted(@Payload() event: EncounterStartedEvent) {
    console.log(
      `📥 Received event: ${event.eventType} for encounter ${event.data.encounterId}`
    );

    // Create encounter view
    await this.prisma.encounterView.create({
      data: {
        encounterId: event.data.encounterId,
        patientId: event.data.patientId,
        providerId: event.data.providerId,
        encounterType: event.data.encounterType,
        encounterClass: event.data.encounterClass,
        status: "in-progress",
        fhirEncounter: event.data.fhirResource,
        startTime: new Date(event.data.startTime),
      },
    });

    // Update patient aggregate
    const patient = await this.prisma.patientAggregateView.findUnique({
      where: { patientId: event.data.patientId },
    });

    if (patient) {
      await this.prisma.patientAggregateView.update({
        where: { patientId: event.data.patientId },
        data: {
          encounterCount: patient.encounterCount + 1,
          lastEncounterDate: new Date(event.data.startTime),
          lastUpdated: new Date(),
        },
      });
    }

    console.log(`✅ Created encounter view and updated patient aggregate`);
  }

  @EventPattern("encounter.completed")
  async handleEncounterCompleted(@Payload() event: EncounterCompletedEvent) {
    console.log(
      `📥 Received event: ${event.eventType} for encounter ${event.data.encounterId}`
    );

    // Update encounter view
    await this.prisma.encounterView.update({
      where: { encounterId: event.data.encounterId },
      data: {
        status: "finished",
        endTime: new Date(event.data.endTime),
        diagnosisCodes: event.data.diagnosisCodes,
        procedureCodes: event.data.procedureCodes,
        lastUpdated: new Date(),
      },
    });

    console.log(`✅ Updated encounter view with completion data`);
  }

  @EventPattern("encounter.vitals.recorded")
  async handleVitalSignsRecorded(@Payload() event: VitalSignsRecordedEvent) {
    console.log(
      `📥 Received event: ${event.eventType} for encounter ${event.data.encounterId}`
    );

    // Update encounter view with vitals
    await this.prisma.encounterView.update({
      where: { encounterId: event.data.encounterId },
      data: {
        vitals: event.data.vitals,
        lastUpdated: new Date(),
      },
    });

    // Update patient aggregate with latest vitals
    await this.prisma.patientAggregateView.update({
      where: { patientId: event.data.patientId },
      data: {
        latestVitals: event.data.vitals,
        latestVitalsDate: new Date(event.data.recordedAt),
        lastUpdated: new Date(),
      },
    });

    console.log(`✅ Updated encounter and patient aggregate with vital signs`);
  }
}
