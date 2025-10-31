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

@Injectable()
export class LabOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowIntegration: WorkflowIntegrationService,
  ) {}

  async create(dto: CreateLabOrderDto, user: RequestUserContext) {
    if (user.userId && user.userId !== dto.providerId) {
      throw new ForbiddenException(
        'Provider mismatch between token and payload',
      );
    }

    const orderNumber = await this.generateOrderNumber();

    return this.prisma.labOrder.create({
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

    const { updatedOrder, abnormalFlag } = await this.prisma.$transaction(
      async (tx) => {
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
            status:
              abnormalFlag === AbnormalFlag.CRITICAL
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

        return { updatedOrder, abnormalFlag };
      },
    );

    await this.workflowIntegration.notify({
      targetServiceOrderId: updatedOrder.id,
      status: 'COMPLETED',
      metadata: {
        labOrderStatus: updatedOrder.status,
        abnormalFlag: abnormalFlag,
      },
    });

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
