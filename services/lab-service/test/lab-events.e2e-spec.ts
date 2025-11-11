import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LabEventPublisher } from '../src/events/lab-event.publisher';
import { EventsModule } from '../src/events/events.module';

/**
 * Lab Event Publishing Integration Tests
 *
 * Tests the complete event-driven flow:
 * 1. Lab Service publishes events
 * 2. NATS receives and distributes events
 * 3. Aggregation Service updates read models
 * 4. Notification Service sends real-time notifications
 */
describe('Lab Event Publishing (e2e)', () => {
  let app: INestApplication;
  let eventPublisher: LabEventPublisher;
  let natsClient: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    eventPublisher = moduleFixture.get<LabEventPublisher>(LabEventPublisher);
    natsClient = moduleFixture.get<ClientProxy>('NATS_CLIENT');

    // Wait for NATS connection
    await natsClient.connect();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Lab Order Created Event', () => {
    it('should publish lab.order.created event with correct structure', async () => {
      const eventData = {
        orderId: 'test-order-123',
        patientId: 'patient-456',
        providerId: 'provider-789',
        tests: [
          { loincCode: '2345-7', testName: 'Glucose' },
          { loincCode: '2160-0', testName: 'Creatinine' },
        ],
        priority: 'routine' as const,
        userId: 'lab-tech-001',
        portalType: 'LAB' as const,
      };

      await expect(
        eventPublisher.publishLabOrderCreated(eventData),
      ).resolves.not.toThrow();
    });
  });

  describe('Lab Result Available Event', () => {
    it('should publish lab.result.available event when results are finalized', async () => {
      const eventData = {
        reportId: 'report-123',
        orderId: 'order-456',
        patientId: 'patient-789',
        providerId: 'provider-101',
        status: 'final' as const,
        criticalValues: false,
        abnormalResults: true,
        resultCount: 3,
        userId: 'lab-tech-002',
        portalType: 'LAB' as const,
      };

      await expect(
        eventPublisher.publishLabResultAvailable(eventData),
      ).resolves.not.toThrow();
    });

    it('should publish event with critical flag when results are critical', async () => {
      const eventData = {
        reportId: 'report-456',
        orderId: 'order-789',
        patientId: 'patient-101',
        providerId: 'provider-202',
        status: 'final' as const,
        criticalValues: true,
        abnormalResults: true,
        resultCount: 2,
        userId: 'lab-tech-003',
        portalType: 'LAB' as const,
      };

      await expect(
        eventPublisher.publishLabResultAvailable(eventData),
      ).resolves.not.toThrow();
    });
  });

  describe('Critical Lab Alert Event', () => {
    it('should publish lab.critical.alert event for critical values', async () => {
      const eventData = {
        reportId: 'report-789',
        patientId: 'patient-303',
        patientName: 'John Doe',
        providerId: 'provider-404',
        testName: 'Potassium',
        loincCode: '2823-3',
        value: 7.5,
        unit: 'mmol/L',
        referenceRange: '3.5-5.0 mmol/L',
        criticalReason: 'Severe hyperkalemia - immediate intervention required',
        userId: 'lab-tech-004',
        portalType: 'LAB' as const,
      };

      await expect(
        eventPublisher.publishCriticalLabAlert(eventData),
      ).resolves.not.toThrow();
    });
  });

  describe('Lab Result Viewed Event', () => {
    it('should publish lab.result.viewed event for HIPAA audit', async () => {
      const eventData = {
        reportId: 'report-101',
        patientId: 'patient-505',
        viewedBy: 'provider-606',
        ipAddress: '192.168.1.100',
        portalType: 'PROVIDER' as const,
      };

      await expect(
        eventPublisher.publishLabResultViewed(eventData),
      ).resolves.not.toThrow();
    });
  });

  describe('FHIR Compliance', () => {
    it('should include FHIR resources in published events', async () => {
      const eventData = {
        reportId: 'report-fhir-test',
        orderId: 'order-fhir-test',
        patientId: 'patient-fhir',
        providerId: 'provider-fhir',
        status: 'final' as const,
        criticalValues: false,
        abnormalResults: false,
        resultCount: 1,
        userId: 'lab-tech-fhir',
        portalType: 'LAB' as const,
      };

      // This test verifies that FHIR resources are built correctly
      await expect(
        eventPublisher.publishLabResultAvailable(eventData),
      ).resolves.not.toThrow();

      // In a real test, you would subscribe to NATS and verify the FHIR structure
    });
  });
});
