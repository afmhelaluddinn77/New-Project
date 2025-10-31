import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrescriptionStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { MedicationItemDto } from './dto/medication-item.dto';
import {
  VerificationActionType,
  VerifyPrescriptionDto,
} from './dto/verify-prescription.dto';
import { RequestUserContext } from '../common/decorators/user-context.decorator';
import { WorkflowIntegrationService } from '../integration/workflow-integration.service';

type WorkflowItemStatus = 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
const WORKFLOW_ITEM_TYPE = 'PHARMACY' as const;

@Injectable()
export class PrescriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowIntegration: WorkflowIntegrationService,
  ) {}

  async create(dto: CreatePrescriptionDto, user: RequestUserContext) {
    if (user.userId && user.userId !== dto.providerId) {
      throw new ForbiddenException(
        'Provider mismatch between token and payload',
      );
    }

    const orderNumber = await this.generateOrderNumber();

    const created = await this.prisma.prescriptionOrder.create({
      data: {
        orderNumber,
        patientId: dto.patientId,
        providerId: dto.providerId,
        encounterId: dto.encounterId,
        orderType: dto.orderType,
        priority: dto.priority,
        notes: dto.notes,
        status: 'NEW',
        items: {
          create: dto.items.map((item) => this.mapMedicationItem(item)),
        },
      },
      include: {
        items: true,
      },
    });

    return created;
  }

  async findPending() {
    return this.prisma.prescriptionOrder.findMany({
      where: {
        status: {
          in: ['NEW', 'REVIEW_PENDING'],
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });
  }

  async verify(
    id: string,
    dto: VerifyPrescriptionDto,
    user: RequestUserContext,
  ) {
    if (!user.userId) {
      throw new ForbiddenException('Missing user context');
    }

    const order = await this.prisma.prescriptionOrder.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Prescription ${id} not found`);
    }

    const data: Prisma.PrescriptionOrderUpdateInput = {};

    switch (dto.action) {
      case VerificationActionType.VERIFY:
        data.status = PrescriptionStatus.VERIFIED;
        data.verifiedAt = new Date();
        data.notes = this.mergeNotes(
          order.notes,
          dto.notes,
          user.userId,
          'Verification',
        );
        break;
      case VerificationActionType.DISPENSE:
        if (order.status !== 'VERIFIED' && order.status !== 'DISPENSED') {
          throw new BadRequestException(
            'Prescription must be verified before dispensing',
          );
        }
        data.status = PrescriptionStatus.DISPENSED;
        data.dispensedAt = new Date();
        data.notes = this.mergeNotes(
          order.notes,
          dto.notes,
          user.userId,
          'Dispense',
        );
        break;
      case VerificationActionType.REJECT:
        data.status = PrescriptionStatus.CANCELLED;
        data.notes = this.mergeNotes(
          order.notes,
          dto.notes,
          user.userId,
          'Rejected',
        );
        break;
      default:
        throw new BadRequestException('Unsupported action');
    }

    const updated = await this.prisma.prescriptionOrder.update({
      where: { id },
      data,
      include: {
        items: true,
        interactionChecks: true,
      },
    });

    await this.workflowIntegration.notify({
      targetServiceOrderId: updated.id,
      itemType: WORKFLOW_ITEM_TYPE,
      status: this.mapActionToItemStatus(dto.action),
      metadata: {
        status: updated.status,
        verifiedAt: updated.verifiedAt,
        dispensedAt: updated.dispensedAt,
      },
    });

    return updated;
  }

  private async generateOrderNumber(): Promise<string> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `RX-${timestamp}-${random}`;

    const existing = await this.prisma.prescriptionOrder.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (existing) {
      return this.generateOrderNumber();
    }

    return orderNumber;
  }

  private mapMedicationItem(
    item: MedicationItemDto,
  ): Prisma.MedicationItemCreateWithoutPrescriptionOrderInput {
    return {
      rxNormId: item.rxNormId,
      drugName: item.drugName,
      dosage: item.dosage,
      route: item.route,
      frequency: item.frequency,
      duration: item.duration,
      quantity: item.quantity,
      instructions: item.instructions,
    };
  }

  private mergeNotes(
    existing: string | null | undefined,
    addition: string | undefined,
    userId: string,
    label: string,
  ) {
    if (!addition) {
      return existing ?? null;
    }

    const stamped = `[${label} by ${userId}] ${addition}`;
    return existing
      ? `${existing}
${stamped}`
      : stamped;
  }

  private mapActionToItemStatus(
    action: VerificationActionType,
  ): WorkflowItemStatus {
    switch (action) {
      case VerificationActionType.VERIFY:
        return 'IN_PROGRESS';
      case VerificationActionType.DISPENSE:
        return 'COMPLETED';
      case VerificationActionType.REJECT:
        return 'ERROR';
      default:
        return 'REQUESTED';
    }
  }
}
