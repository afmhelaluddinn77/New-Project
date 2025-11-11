import {
  CriticalLabValueEvent,
  LabOrderCreatedEvent,
  LabResultAvailableEvent,
  LabResultViewedEvent,
} from "@emr-hms/events";
import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { PrismaService } from "../prisma/prisma.service";

@Controller()
export class LabEventHandler {
  private readonly logger = new Logger(LabEventHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  @EventPattern("lab.order.created")
  async handleLabOrderCreated(@Payload() event: LabOrderCreatedEvent) {
    this.logger.log(
      `📥 Received event: ${event.eventType} for order ${event.data.orderId}`
    );

    try {
      // Update patient aggregate with new lab order count
      const patient = await this.prisma.patientAggregateView.findUnique({
        where: { patientId: event.data.patientId },
      });

      if (patient) {
        const pendingOrders = ((patient.pendingLabOrders as any) || 0) + 1;

        await this.prisma.patientAggregateView.update({
          where: { patientId: event.data.patientId },
          data: {
            pendingLabOrders: pendingOrders,
            lastUpdated: new Date(),
          },
        });

        this.logger.log(
          `✅ Updated patient aggregate - pending lab orders: ${pendingOrders}`
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Error handling lab.order.created: ${error.message}`
      );
    }
  }

  @EventPattern("lab.result.available")
  async handleLabResultAvailable(@Payload() event: LabResultAvailableEvent) {
    this.logger.log(
      `📥 Received event: ${event.eventType} for report ${event.data.reportId}`
    );

    try {
      // Create or update lab result view
      await this.prisma.labResultView.upsert({
        where: { reportId: event.data.reportId },
        create: {
          reportId: event.data.reportId,
          orderId: event.data.orderId,
          patientId: event.data.patientId,
          providerId: event.data.providerId,
          status: event.data.status,
          criticalValues: event.data.criticalValues,
          abnormalResults: event.data.abnormalResults,
          resultCount: event.data.resultCount,
          testNames: [], // Will be populated from FHIR resource if needed
          fhirReport: event.data.fhirResource,
          resultDate: new Date(),
          viewedBy: [],
        },
        update: {
          status: event.data.status,
          criticalValues: event.data.criticalValues,
          abnormalResults: event.data.abnormalResults,
          resultCount: event.data.resultCount,
          lastUpdated: new Date(),
        },
      });

      // Update patient aggregate
      const patient = await this.prisma.patientAggregateView.findUnique({
        where: { patientId: event.data.patientId },
      });

      if (patient) {
        const unreadResults = ((patient.unreadResults as any) || 0) + 1;
        const criticalAlerts =
          ((patient.criticalAlerts as any) || 0) +
          (event.data.criticalValues ? 1 : 0);
        const pendingOrders = Math.max(
          ((patient.pendingLabOrders as any) || 1) - 1,
          0
        );

        await this.prisma.patientAggregateView.update({
          where: { patientId: event.data.patientId },
          data: {
            unreadResults,
            criticalAlerts,
            pendingLabOrders: pendingOrders,
            lastUpdated: new Date(),
          },
        });

        this.logger.log(
          `✅ Created lab result view and updated patient aggregate (unread: ${unreadResults}, critical: ${criticalAlerts})`
        );
      }
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
      // Update lab result view with critical alerts
      const labResult = await this.prisma.labResultView.findUnique({
        where: { reportId: event.data.reportId },
      });

      if (labResult) {
        const criticalAlerts = (labResult.criticalAlerts as any[]) || [];
        criticalAlerts.push({
          testName: event.data.testName,
          loincCode: event.data.loincCode,
          value: event.data.value,
          unit: event.data.unit,
          referenceRange: event.data.referenceRange,
          criticalReason: event.data.criticalReason,
          alertedAt: new Date(),
        });

        await this.prisma.labResultView.update({
          where: { reportId: event.data.reportId },
          data: {
            criticalAlerts,
            lastUpdated: new Date(),
          },
        });

        this.logger.warn(
          `✅ Updated lab result view with critical alert: ${event.data.testName} = ${event.data.value} ${event.data.unit}`
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Error handling lab.critical.alert: ${error.message}`
      );
    }
  }

  @EventPattern("lab.result.viewed")
  async handleLabResultViewed(@Payload() event: LabResultViewedEvent) {
    this.logger.log(
      `📥 Received HIPAA audit event: ${event.eventType} for report ${event.data.reportId}`
    );

    try {
      // Update lab result view with viewer info
      const labResult = await this.prisma.labResultView.findUnique({
        where: { reportId: event.data.reportId },
      });

      if (labResult) {
        const viewedBy = [...labResult.viewedBy, event.data.viewedBy];

        await this.prisma.labResultView.update({
          where: { reportId: event.data.reportId },
          data: {
            viewedBy,
            viewedAt: new Date(),
            lastUpdated: new Date(),
          },
        });
      }

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId: event.data.viewedBy,
          action: "VIEW_LAB_RESULT",
          resourceType: "LabResultView",
          resourceId: event.data.reportId,
          ipAddress: event.data.ipAddress,
          portalType: event.portalType,
        },
      });

      this.logger.log(`✅ Logged lab result view for HIPAA compliance`);
    } catch (error) {
      this.logger.error(
        `❌ Error handling lab.result.viewed: ${error.message}`
      );
    }
  }
}
