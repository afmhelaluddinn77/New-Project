import {
  CriticalImagingFindingEvent,
  ImagingStudyCompleteEvent,
  RadiologyReportFinalizedEvent,
} from "@emr-hms/events";
import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { PrismaService } from "../prisma/prisma.service";

@Controller()
export class RadiologyEventHandler {
  constructor(private readonly prisma: PrismaService) {}

  @EventPattern("radiology.study.complete")
  async handleImagingStudyComplete(
    @Payload() event: ImagingStudyCompleteEvent
  ) {
    console.log(
      `📥 Received event: ${event.eventType} for study ${event.data.studyId}`
    );

    // Create imaging study view
    await this.prisma.imagingStudyView.create({
      data: {
        studyId: event.data.studyId,
        orderId: event.data.orderId,
        patientId: event.data.patientId,
        providerId: "", // Will be updated from order
        modality: event.data.modality,
        bodyPart: event.data.bodyPart,
        imageCount: event.data.imageCount,
        pacsUrl: event.data.pacsUrl,
        thumbnailUrl: event.data.thumbnailUrl,
        fhirStudy: event.data.fhirResource,
        studyDate: new Date(event.data.studyDate),
      },
    });

    console.log(
      `✅ Created imaging study view for study ${event.data.studyId}`
    );
  }

  @EventPattern("radiology.report.finalized")
  async handleRadiologyReportFinalized(
    @Payload() event: RadiologyReportFinalizedEvent
  ) {
    console.log(
      `📥 Received event: ${event.eventType} for report ${event.data.reportId}`
    );

    // Update imaging study view with report
    await this.prisma.imagingStudyView.update({
      where: { studyId: event.data.studyId },
      data: {
        reportId: event.data.reportId,
        findings: event.data.findings,
        impression: event.data.impression,
        criticalFindings: event.data.criticalFindings,
        radiologistId: event.data.radiologistId,
        reportFinalized: true,
        providerId: event.data.orderingProviderId,
        lastUpdated: new Date(),
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
          unreadResults: patient.unreadResults + 1,
          criticalAlerts:
            patient.criticalAlerts + (event.data.criticalFindings ? 1 : 0),
          lastUpdated: new Date(),
        },
      });
    }

    console.log(`✅ Updated imaging study view with finalized report`);
  }

  @EventPattern("radiology.critical.alert")
  async handleCriticalImagingFinding(
    @Payload() event: CriticalImagingFindingEvent
  ) {
    console.log(
      `🚨 Received CRITICAL event: ${event.eventType} for study ${event.data.studyId}`
    );

    // Update imaging study view with critical flag
    await this.prisma.imagingStudyView.update({
      where: { studyId: event.data.studyId },
      data: {
        criticalFindings: true,
        lastUpdated: new Date(),
      },
    });

    console.log(`✅ Marked imaging study as critical finding`);
  }
}
