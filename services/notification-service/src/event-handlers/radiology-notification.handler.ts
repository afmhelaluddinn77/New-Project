import {
  CriticalImagingFindingEvent,
  RadiologyReportFinalizedEvent,
} from "@emr-hms/events";
import { Controller, Injectable } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationGateway } from "../websocket/notification.gateway";

@Controller()
@Injectable()
export class RadiologyNotificationHandler {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  @EventPattern("radiology.report.finalized")
  async handleRadiologyReportFinalized(
    @Payload() event: RadiologyReportFinalizedEvent
  ) {
    console.log(
      `📥 Received event: ${event.eventType} for study ${event.data.studyId}`
    );

    // Send notification to ordering provider
    this.notificationGateway.sendToUser(
      event.data.orderingProviderId,
      "notification",
      {
        type: "radiology_report_ready",
        priority: event.data.criticalFindings ? "high" : "normal",
        title: "Radiology Report Ready",
        message: event.data.criticalFindings
          ? `⚠️ CRITICAL findings in radiology report`
          : `Radiology report is ready for review`,
        patientId: event.data.patientId,
        studyId: event.data.studyId,
        reportId: event.data.reportId,
        impression: event.data.impression,
        timestamp: new Date(),
        action: {
          type: "view_radiology_report",
          url: `/patients/${event.data.patientId}/imaging/${event.data.studyId}`,
        },
      }
    );

    console.log(
      `✅ Sent radiology report notification to provider ${event.data.orderingProviderId}`
    );
  }

  @EventPattern("radiology.critical.alert")
  async handleCriticalImagingFinding(
    @Payload() event: CriticalImagingFindingEvent
  ) {
    console.log(
      `🚨 Received CRITICAL event: ${event.eventType} for study ${event.data.studyId}`
    );

    // Send URGENT notification to provider
    this.notificationGateway.sendToUser(
      event.data.orderingProviderId,
      "critical_alert",
      {
        type: "critical_imaging_finding",
        priority: "urgent",
        title: "🚨 CRITICAL IMAGING FINDING",
        message: `CRITICAL: ${event.data.finding}`,
        patientName: event.data.patientName,
        patientId: event.data.patientId,
        details: {
          studyId: event.data.studyId,
          reportId: event.data.reportId,
          finding: event.data.finding,
          urgency: event.data.urgency,
        },
        timestamp: new Date(),
        action: {
          type: "view_radiology_report",
          url: `/patients/${event.data.patientId}/imaging/${event.data.studyId}`,
        },
        requiresAcknowledgment: true,
      }
    );

    console.log(
      `✅ Sent CRITICAL imaging alert to provider ${event.data.orderingProviderId}`
    );
  }
}
