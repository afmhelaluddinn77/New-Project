import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RadiologyOrderStatus, StudyType } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRadiologyOrderDto } from './dto/create-radiology-order.dto';
import { CreateRadiologyReportDto } from './dto/create-radiology-report.dto';
import { RequestUserContext } from '../common/decorators/user-context.decorator';
import { WorkflowIntegrationService } from '../integration/workflow-integration.service';

@Injectable()
export class RadiologyOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowIntegration: WorkflowIntegrationService,
  ) {}

  async create(dto: CreateRadiologyOrderDto, user: RequestUserContext) {
    if (user.userId && user.userId !== dto.providerId) {
      throw new ForbiddenException(
        'Provider mismatch between token and payload',
      );
    }

    const orderNumber = await this.generateOrderNumber();

    return this.prisma.radiologyOrder.create({
      data: {
        orderNumber,
        patientId: dto.patientId,
        providerId: dto.providerId,
        encounterId: dto.encounterId,
        studyType: dto.studyType as StudyType,
        bodyPart: dto.bodyPart,
        contrast: dto.contrast,
        priority: dto.priority,
        clinicalIndication: dto.clinicalIndication,
        status: RadiologyOrderStatus.NEW,
      },
    });
  }

  async findPending() {
    return this.prisma.radiologyOrder.findMany({
      where: {
        status: {
          in: [
            RadiologyOrderStatus.NEW,
            RadiologyOrderStatus.SCHEDULED,
            RadiologyOrderStatus.IN_PROGRESS,
          ],
        },
      },
      orderBy: {
        orderedAt: 'asc',
      },
    });
  }

  async submitReport(
    orderId: string,
    dto: CreateRadiologyReportDto,
    user: RequestUserContext,
  ) {
    if (!user.userId) {
      throw new ForbiddenException('Missing user context');
    }

    const order = await this.prisma.radiologyOrder.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Radiology order ${orderId} not found`);
    }

    const report = await this.prisma.radiologyReport.upsert({
      where: { radiologyOrderId: orderId },
      create: {
        radiologyOrderId: orderId,
        reportText: dto.reportText,
        impression: dto.impression,
        criticalFinding: dto.criticalFinding ?? false,
        reportingRadiologistId: user.userId,
        reportStatus: dto.criticalFinding ? 'FINAL' : 'FINAL',
      },
      update: {
        reportText: dto.reportText,
        impression: dto.impression,
        criticalFinding: dto.criticalFinding ?? false,
        reportingRadiologistId: user.userId,
        reportStatus: dto.criticalFinding ? 'FINAL' : 'FINAL',
        updatedAt: new Date(),
      },
    });

    const updatedOrder = await this.prisma.radiologyOrder.update({
      where: { id: orderId },
      data: {
        status: RadiologyOrderStatus.REPORTED,
        reportedAt: new Date(),
      },
      include: {
        report: true,
        imagingAssets: true,
      },
    });

    await this.workflowIntegration.notify({
      targetServiceOrderId: updatedOrder.id,
      status: 'COMPLETED',
      metadata: {
        radiologyOrderStatus: updatedOrder.status,
        criticalFinding: report.criticalFinding,
      },
    });

    return { order: updatedOrder, report };
  }

  private async generateOrderNumber(): Promise<string> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `RAD-${timestamp}-${random}`;

    const existing = await this.prisma.radiologyOrder.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (existing) {
      return this.generateOrderNumber();
    }

    return orderNumber;
  }
}
