import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  LabOrderCreatedEvent,
  LabResultAvailableEvent,
  CriticalLabValueEvent,
  LabResultViewedEvent,
} from '@emr-hms/events';
import { v4 as uuid } from 'uuid';

/**
 * Lab Event Publisher
 *
 * MANDATORY: Publishes domain events to NATS
 * Complies with: Development Law (event-driven architecture, HIPAA audit trail)
 */
@Injectable()
export class LabEventPublisher {
  private readonly logger = new Logger(LabEventPublisher.name);

  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  /**
   * Publish Lab Order Created Event
   */
  async publishLabOrderCreated(data: {
    orderId: string;
    patientId: string;
    providerId: string;
    tests: Array<{ loincCode: string; testName: string }>;
    priority: 'routine' | 'urgent' | 'stat';
    userId: string;
    portalType: 'PROVIDER' | 'LAB';
  }): Promise<void> {
    const event: LabOrderCreatedEvent = {
      eventId: uuid(),
      eventType: 'lab.order.created',
      aggregateId: data.orderId,
      aggregateType: 'ServiceRequest',
      timestamp: new Date(),
      userId: data.userId,
      portalType: data.portalType,
      data: {
        orderId: data.orderId,
        patientId: data.patientId,
        providerId: data.providerId,
        tests: data.tests,
        priority: data.priority,
        fhirResource: this.buildServiceRequestFHIR(data),
      },
    };

    try {
      this.natsClient.emit('lab.order.created', event);
      this.logger.log(
        `📤 Published lab.order.created event for order ${data.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish lab.order.created event: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Publish Lab Result Available Event
   * CRITICAL: Triggers aggregation and notification
   */
  async publishLabResultAvailable(data: {
    reportId: string;
    orderId: string;
    patientId: string;
    providerId: string;
    status: 'preliminary' | 'final' | 'corrected';
    criticalValues: boolean;
    abnormalResults: boolean;
    resultCount: number;
    userId: string;
    portalType: 'LAB';
  }): Promise<void> {
    const event: LabResultAvailableEvent = {
      eventId: uuid(),
      eventType: 'lab.result.available',
      aggregateId: data.reportId,
      aggregateType: 'DiagnosticReport',
      timestamp: new Date(),
      userId: data.userId,
      portalType: data.portalType,
      data: {
        reportId: data.reportId,
        orderId: data.orderId,
        patientId: data.patientId,
        providerId: data.providerId,
        status: data.status,
        criticalValues: data.criticalValues,
        abnormalResults: data.abnormalResults,
        resultCount: data.resultCount,
        fhirResource: this.buildDiagnosticReportFHIR(data),
      },
    };

    try {
      this.natsClient.emit('lab.result.available', event);
      this.logger.log(
        `📤 Published lab.result.available event for report ${data.reportId} (critical: ${data.criticalValues})`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish lab.result.available event: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Publish Critical Lab Value Alert
   * URGENT: Immediate provider notification required
   */
  async publishCriticalLabAlert(data: {
    reportId: string;
    patientId: string;
    patientName: string;
    providerId: string;
    testName: string;
    loincCode: string;
    value: string | number;
    unit: string;
    referenceRange: string;
    criticalReason: string;
    userId: string;
    portalType: 'LAB';
  }): Promise<void> {
    const event: CriticalLabValueEvent = {
      eventId: uuid(),
      eventType: 'lab.critical.alert',
      aggregateId: data.reportId,
      aggregateType: 'Observation',
      timestamp: new Date(),
      userId: data.userId,
      portalType: data.portalType,
      data: {
        reportId: data.reportId,
        patientId: data.patientId,
        patientName: data.patientName,
        providerId: data.providerId,
        testName: data.testName,
        loincCode: data.loincCode,
        value: data.value,
        unit: data.unit,
        referenceRange: data.referenceRange,
        criticalReason: data.criticalReason,
      },
    };

    try {
      this.natsClient.emit('lab.critical.alert', event);
      this.logger.warn(
        `🚨 Published lab.critical.alert event for patient ${data.patientId} - ${data.testName}: ${data.value} ${data.unit}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish lab.critical.alert event: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Publish Lab Result Viewed Event
   * HIPAA: Audit trail for PHI access
   */
  async publishLabResultViewed(data: {
    reportId: string;
    patientId: string;
    viewedBy: string;
    ipAddress: string;
    portalType: 'PROVIDER' | 'PATIENT' | 'LAB';
  }): Promise<void> {
    const event: LabResultViewedEvent = {
      eventId: uuid(),
      eventType: 'lab.result.viewed',
      aggregateId: data.reportId,
      aggregateType: 'DiagnosticReport',
      timestamp: new Date(),
      userId: data.viewedBy,
      portalType: data.portalType,
      data: {
        reportId: data.reportId,
        patientId: data.patientId,
        viewedBy: data.viewedBy,
        ipAddress: data.ipAddress,
      },
    };

    try {
      this.natsClient.emit('lab.result.viewed', event);
      this.logger.log(
        `📤 Published lab.result.viewed event for report ${data.reportId} by ${data.viewedBy}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish lab.result.viewed event: ${error.message}`,
      );
      // Don't throw - audit logging shouldn't break main flow
    }
  }

  /**
   * Build FHIR ServiceRequest resource (simplified)
   */
  private buildServiceRequestFHIR(data: any): any {
    return {
      resourceType: 'ServiceRequest',
      id: data.orderId,
      status: 'active',
      intent: 'order',
      priority: data.priority,
      subject: {
        reference: `Patient/${data.patientId}`,
      },
      requester: {
        reference: `Practitioner/${data.providerId}`,
      },
      code: {
        coding: data.tests.map((test: any) => ({
          system: 'http://loinc.org',
          code: test.loincCode,
          display: test.testName,
        })),
      },
    };
  }

  /**
   * Build FHIR DiagnosticReport resource (simplified)
   */
  private buildDiagnosticReportFHIR(data: any): any {
    return {
      resourceType: 'DiagnosticReport',
      id: data.reportId,
      status: data.status,
      subject: {
        reference: `Patient/${data.patientId}`,
      },
      performer: [
        {
          reference: `Practitioner/${data.providerId}`,
        },
      ],
      basedOn: [
        {
          reference: `ServiceRequest/${data.orderId}`,
        },
      ],
      resultsInterpreter: [
        {
          reference: `Practitioner/${data.providerId}`,
        },
      ],
    };
  }
}
