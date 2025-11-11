import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  LabOrderStatus,
  LabTestStatus,
  AbnormalFlag,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { LabTestDto } from './dto/lab-test.dto';
import { SubmitLabResultDto } from './dto/submit-lab-result.dto';
import { RequestUserContext } from '../common/decorators/user-context.decorator';
import { WorkflowIntegrationService } from '../integration/workflow-integration.service';
import { LabEventPublisher } from '../events/lab-event.publisher';

@Injectable()
export class LabOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowIntegration: WorkflowIntegrationService,
    private readonly eventPublisher: LabEventPublisher,
  ) {}

  async create(dto: CreateLabOrderDto, user: RequestUserContext) {
    if (user.userId && user.userId !== dto.providerId) {
      throw new ForbiddenException(
        'Provider mismatch between token and payload',
      );
    }

    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.labOrder.create({
      data: {
        orderNumber,
        patientId: dto.patientId,
        providerId: dto.providerId,
        encounterId: dto.encounterId,
        priority: dto.priority,
        clinicalNotes: dto.clinicalNotes,
        status: LabOrderStatus.NEW,
        tests: {
          create: dto.tests.map((test) => this.mapTest(test)),
        },
      },
      include: {
        tests: true,
      },
    });

    // MANDATORY: Publish lab order created event
    await this.eventPublisher.publishLabOrderCreated({
      orderId: order.id,
      patientId: order.patientId,
      providerId: order.providerId,
      tests: dto.tests.map((t) => ({
        loincCode: t.loincCode,
        testName: t.testName,
      })),
      priority: order.priority as 'routine' | 'urgent' | 'stat',
      userId: user.userId || order.providerId,
      portalType: 'PROVIDER',
    });

    return order;
  }

  async findPending() {
    return this.prisma.labOrder.findMany({
      where: {
        status: {
          in: [LabOrderStatus.NEW, LabOrderStatus.IN_PROGRESS],
        },
      },
      include: {
        tests: true,
      },
      orderBy: {
        orderedAt: 'asc',
      },
    });
  }

  async submitResult(
    orderId: string,
    dto: SubmitLabResultDto,
    user: RequestUserContext,
  ) {
    if (!user.userId) {
      throw new ForbiddenException('Missing user context');
    }

    const { updatedOrder, abnormalFlag, isCritical, testDetails } =
      await this.prisma.$transaction(async (tx) => {
        const order = await tx.labOrder.findUnique({
          where: { id: orderId },
          include: {
            tests: {
              include: { result: true },
            },
          },
        });

        if (!order) {
          throw new NotFoundException(`Lab order ${orderId} not found`);
        }

        const test = order.tests.find((t) => t.id === dto.testId);
        if (!test) {
          throw new NotFoundException(
            `Lab test ${dto.testId} not found for order ${orderId}`,
          );
        }

        const abnormalFlag = dto.abnormalFlag ?? AbnormalFlag.NORMAL;
        const isCritical = abnormalFlag === AbnormalFlag.CRITICAL;

        await tx.labResult.upsert({
          where: { labOrderTestId: dto.testId },
          create: {
            labOrderTestId: dto.testId,
            value: dto.value,
            unit: dto.unit,
            referenceRange: dto.referenceRange,
            abnormalFlag,
            comment: dto.comment,
            verifiedBy: user.userId,
            verifiedAt: new Date(),
          },
          update: {
            value: dto.value,
            unit: dto.unit,
            referenceRange: dto.referenceRange,
            abnormalFlag,
            comment: dto.comment,
            verifiedBy: user.userId,
            verifiedAt: new Date(),
          },
        });

        await tx.labOrderTest.update({
          where: { id: dto.testId },
          data: {
            status: isCritical
              ? LabTestStatus.CRITICAL
              : LabTestStatus.COMPLETED,
            performedAt: new Date(),
          },
        });

        const pendingTests = await tx.labOrderTest.count({
          where: {
            labOrderId: orderId,
            status: {
              in: [LabTestStatus.PENDING, LabTestStatus.IN_PROGRESS],
            },
          },
        });

        const criticalTests = await tx.labOrderTest.count({
          where: {
            labOrderId: orderId,
            status: LabTestStatus.CRITICAL,
          },
        });

        const orderUpdate: Prisma.LabOrderUpdateInput = {};
        if (pendingTests === 0) {
          orderUpdate.status =
            criticalTests > 0
              ? LabOrderStatus.RESULT_READY
              : LabOrderStatus.RESULT_READY;
          orderUpdate.resultedAt = new Date();
        } else {
          orderUpdate.status = LabOrderStatus.IN_PROGRESS;
        }

        const updatedOrder = await tx.labOrder.update({
          where: { id: orderId },
          data: orderUpdate,
          include: {
            tests: {
              include: { result: true },
            },
          },
        });

        return {
          updatedOrder,
          abnormalFlag,
          isCritical,
          testDetails: {
            testName: test.testName,
            loincCode: test.loincCode,
          },
        };
      });

    // Notify workflow service
    await this.workflowIntegration.notify({
      targetServiceOrderId: updatedOrder.id,
      status: 'COMPLETED',
      metadata: {
        labOrderStatus: updatedOrder.status,
        abnormalFlag: abnormalFlag,
      },
    });

    // MANDATORY: Publish lab result available event if all tests complete
    if (updatedOrder.status === LabOrderStatus.RESULT_READY) {
      const completedTests = updatedOrder.tests.filter(
        (t) =>
          t.status === LabTestStatus.COMPLETED ||
          t.status === LabTestStatus.CRITICAL,
      );
      const hasCritical = updatedOrder.tests.some(
        (t) => t.status === LabTestStatus.CRITICAL,
      );
      const hasAbnormal = updatedOrder.tests.some(
        (t) =>
          t.result?.abnormalFlag &&
          t.result.abnormalFlag !== AbnormalFlag.NORMAL,
      );

      await this.eventPublisher.publishLabResultAvailable({
        reportId: updatedOrder.id,
        orderId: updatedOrder.id,
        patientId: updatedOrder.patientId,
        providerId: updatedOrder.providerId,
        status: 'final',
        criticalValues: hasCritical,
        abnormalResults: hasAbnormal,
        resultCount: completedTests.length,
        userId: user.userId,
        portalType: 'LAB',
      });
    }

    // CRITICAL: Publish critical alert if this result is critical
    if (isCritical) {
      // Fetch patient name for critical alert
      const patient = await this.prisma.$queryRaw<any[]>`
        SELECT id, "firstName", "lastName"
        FROM "Patient"
        WHERE id = ${updatedOrder.patientId}
        LIMIT 1
      `;

      const patientName = patient[0]
        ? `${patient[0].firstName} ${patient[0].lastName}`
        : 'Unknown Patient';

      await this.eventPublisher.publishCriticalLabAlert({
        reportId: updatedOrder.id,
        patientId: updatedOrder.patientId,
        patientName,
        providerId: updatedOrder.providerId,
        testName: testDetails.testName,
        loincCode: testDetails.loincCode,
        value: dto.value,
        unit: dto.unit || '',
        referenceRange: dto.referenceRange || '',
        criticalReason: dto.comment || 'Critical value detected',
        userId: user.userId,
        portalType: 'LAB',
      });
    }

    return updatedOrder;
  }

  private mapTest(
    test: LabTestDto,
  ): Prisma.LabOrderTestCreateWithoutLabOrderInput {
    return {
      loincCode: test.loincCode,
      testName: test.testName,
      specimenType: test.specimenType,
      status: test.status ?? LabTestStatus.PENDING,
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `LAB-${timestamp}-${random}`;

    const existing = await this.prisma.labOrder.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (existing) {
      return this.generateOrderNumber();
    }

    return orderNumber;
  }
}
