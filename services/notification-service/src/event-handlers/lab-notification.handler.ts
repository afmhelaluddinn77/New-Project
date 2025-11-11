import {
  CriticalLabValueEvent,
  LabOrderCreatedEvent,
  LabResultAvailableEvent,
} from "@emr-hms/events";
import { Controller, Injectable, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationGateway } from "../websocket/notification.gateway";

@Controller()
@Injectable()
export class LabNotificationHandler {
  private readonly logger = new Logger(LabNotificationHandler.name);

  constructor(private readonly notificationGateway: NotificationGateway) {}

  @EventPattern("lab.order.created")
  async handleLabOrderCreated(@Payload() event: LabOrderCreatedEvent) {
    this.logger.log(
      `📥 Received event: ${event.eventType} for order ${event.data.orderId}`
    );

    try {
      // Send notification to provider that order was created
      this.notificationGateway.sendToUser(
        event.data.providerId,
        "notification",
        {
          type: "lab_order_created",
          priority: event.data.priority === "stat" ? "high" : "normal",
          title: "Lab Order Created",
          message: `Lab order created with ${event.data.tests.length} test(s)`,
          patientId: event.data.patientId,
          orderId: event.data.orderId,
          timestamp: new Date(),
          action: {
            type: "view_lab_order",
            url: `/patients/${event.data.patientId}/labs/orders/${event.data.orderId}`,
          },
        }
      );

      this.logger.log(
        `✅ Sent lab order created notification to provider ${event.data.providerId}`
      );
    } catch (error) {
      this.logger.error(
        `❌ Error handling lab.order.created: ${error.message}`
      );
    }
  }

  @EventPattern("lab.result.available")
  async handleLabResultAvailable(@Payload() event: LabResultAvailableEvent) {
    this.logger.log(
      `📥 Received event: ${event.eventType} for patient ${event.data.patientId}`
    );

    try {
      // Send notification to provider
      this.notificationGateway.sendToUser(
        event.data.providerId,
        "notification",
        {
          type: "lab_result_available",
          priority: event.data.criticalValues ? "high" : "normal",
          title: "Lab Results Available",
          message: event.data.criticalValues
            ? `⚠️ CRITICAL lab results ready for review`
            : `New lab results are ready for review`,
          patientId: event.data.patientId,
          reportId: event.data.reportId,
          orderId: event.data.orderId,
          resultCount: event.data.resultCount,
          criticalValues: event.data.criticalValues,
          abnormalResults: event.data.abnormalResults,
          timestamp: new Date(),
          action: {
            type: "view_lab_result",
            url: `/patients/${event.data.patientId}/labs/${event.data.reportId}`,
          },
        }
      );

      this.logger.log(
        `✅ Sent lab result notification to provider ${event.data.providerId} (critical: ${event.data.criticalValues})`
      );
    } catch (error) {
      this.logger.error(
        `❌ Error handling lab.result.available: ${error.message}`
      );
    }
  }

  @EventPattern("lab.critical.alert")
  async handleCriticalLabValue(@Payload() event: CriticalLabValueEvent) {
    this.logger.warn(
      `🚨 Received CRITICAL event: ${event.eventType} for patient ${event.data.patientId}`
    );

    try {
      // Send URGENT notification to provider
      this.notificationGateway.sendToUser(
        event.data.providerId,
        "critical_alert",
        {
          type: "critical_lab_value",
          priority: "urgent",
          title: "🚨 CRITICAL LAB VALUE",
          message: `CRITICAL: ${event.data.testName} = ${event.data.value} ${event.data.unit}`,
          patientName: event.data.patientName,
          patientId: event.data.patientId,
          details: {
            testName: event.data.testName,
            loincCode: event.data.loincCode,
            value: event.data.value,
            unit: event.data.unit,
            referenceRange: event.data.referenceRange,
            criticalReason: event.data.criticalReason,
          },
          timestamp: new Date(),
          action: {
            type: "view_lab_result",
            url: `/patients/${event.data.patientId}/labs/${event.data.reportId}`,
          },
          requiresAcknowledgment: true,
        }
      );

      this.logger.warn(
        `✅ Sent CRITICAL lab alert to provider ${event.data.providerId}: ${event.data.testName} = ${event.data.value} ${event.data.unit}`
      );
    } catch (error) {
      this.logger.error(
        `❌ Error handling lab.critical.alert: ${error.message}`
      );
    }
  }
}
