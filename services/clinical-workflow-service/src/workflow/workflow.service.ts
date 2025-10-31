import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  Prisma,
  OrderItemStatus,
  OrderItemType,
  OrderPriority,
  UnifiedOrderStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnifiedOrderDto } from './dto/create-unified-order.dto';
import {
  UnifiedOrderItemDto,
  UnifiedOrderItemTypeDto,
} from './dto/unified-order-item.dto';
import { RequestUserContext } from '../common/decorators/user-context.decorator';
import { WorkflowGateway } from './workflow.gateway';
import { UpdateItemStatusDto } from './dto/update-item-status.dto';

interface DispatchResult {
  targetOrderId: string;
  payloadSnapshot: Record<string, unknown>;
}

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly gateway: WorkflowGateway,
  ) {}

  async createUnifiedOrder(
    dto: CreateUnifiedOrderDto,
    user: RequestUserContext,
  ) {
    if (user.userId && user.userId !== dto.providerId) {
      throw new ForbiddenException(
        'Provider mismatch between token and payload',
      );
    }

    const orderNumber = await this.generateOrderNumber();

    const unifiedOrder = await this.prisma.unifiedOrder.create({
      data: {
        orderNumber,
        patientId: dto.patientId,
        providerId: dto.providerId,
        encounterId: dto.encounterId,
        priority: dto.priority as OrderPriority,
        status: UnifiedOrderStatus.NEW,
      },
    });

    for (const item of dto.items) {
      await this.processItem(unifiedOrder.id, item, dto, user);
    }

    const updatedStatus =
      dto.items.length > 0
        ? UnifiedOrderStatus.PARTIALLY_FULFILLED
        : UnifiedOrderStatus.NEW;
    await this.prisma.unifiedOrder.update({
      where: { id: unifiedOrder.id },
      data: { status: updatedStatus },
    });

    await this.recordEvent(unifiedOrder.id, 'UNIFIED_ORDER_CREATED', {
      providerId: dto.providerId,
      patientId: dto.patientId,
      priority: dto.priority,
    });

    this.gateway.emitOrderUpdate(unifiedOrder.id);

    return this.getUnifiedOrder(unifiedOrder.id, user);
  }

  async getUnifiedOrder(orderId: string, user: RequestUserContext) {
    const order = await this.prisma.unifiedOrder.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Unified order ${orderId} not found`);
    }

    if (!this.canAccessOrder(order.providerId, user)) {
      throw new ForbiddenException('Not authorized to access this order');
    }

    return order;
  }

  async listUnifiedOrders(user: RequestUserContext) {
    if (!user.userId) {
      throw new ForbiddenException('Missing user identity for listing orders');
    }

    const orders = await this.prisma.unifiedOrder.findMany({
      where: {
        providerId: user.userId,
      },
      include: {
        items: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  async updateItemStatus(update: UpdateItemStatusDto) {
    const { targetServiceOrderId, itemType, status, metadata } = update;

    const item = await this.prisma.unifiedOrderItem.findFirst({
      where: {
        targetServiceOrderId,
        itemType,
      },
    });

    if (!item) {
      throw new NotFoundException(
        `Unified order item not found for ${targetServiceOrderId}`,
      );
    }

    await this.prisma.unifiedOrderItem.update({
      where: { id: item.id },
      data: {
        status,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      },
    });

    await this.recordEvent(item.unifiedOrderId, `${itemType}_ORDER_STATUS`, {
      targetServiceOrderId,
      status,
    });

    await this.recomputeUnifiedOrderStatus(item.unifiedOrderId);
    this.gateway.emitOrderUpdate(item.unifiedOrderId);

    return this.getUnifiedOrder(item.unifiedOrderId, {
      userId: null,
      portal: null,
      role: 'SYSTEM',
    });
  }

  private async processItem(
    unifiedOrderId: string,
    item: UnifiedOrderItemDto,
    dto: CreateUnifiedOrderDto,
    user: RequestUserContext,
  ): Promise<void> {
    const orderItem = await this.prisma.unifiedOrderItem.create({
      data: {
        unifiedOrderId,
        itemType: item.type as unknown as OrderItemType,
        status: OrderItemStatus.REQUESTED,
        targetServiceOrderId: 'PENDING',
      },
    });

    try {
      this.ensurePayloadShape(item);
      const result = await this.dispatchToService(item, dto, user);

      await this.prisma.unifiedOrderItem.update({
        where: { id: orderItem.id },
        data: {
          status: OrderItemStatus.IN_PROGRESS,
          targetServiceOrderId: result.targetOrderId,
          metadata: result.payloadSnapshot as Prisma.InputJsonValue,
        },
      });

      await this.recordEvent(unifiedOrderId, `${item.type}_ORDER_SUBMITTED`, {
        targetServiceOrderId: result.targetOrderId,
      });

      this.gateway.emitOrderUpdate(unifiedOrderId);
    } catch (error) {
      await this.prisma.unifiedOrderItem.update({
        where: { id: orderItem.id },
        data: {
          status: OrderItemStatus.ERROR,
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
          } as Prisma.InputJsonValue,
        },
      });

      await this.recordEvent(unifiedOrderId, `${item.type}_ORDER_FAILED`, {
        reason: error instanceof Error ? error.message : 'Unknown error',
      });

      this.logger.error(
        `Failed to dispatch ${item.type} order`,
        error as Error,
      );
      this.gateway.emitOrderUpdate(unifiedOrderId);
    }
  }

  private async dispatchToService(
    item: UnifiedOrderItemDto,
    dto: CreateUnifiedOrderDto,
    user: RequestUserContext,
  ): Promise<DispatchResult> {
    const headers = {
      'x-user-id': user.userId ?? dto.providerId,
      'x-user-role': this.resolveServiceRole(item.type),
      'x-portal': user.portal ?? 'PROVIDER',
    };

    switch (item.type) {
      case UnifiedOrderItemTypeDto.PHARMACY: {
        const url = this.config.get<string>('PHARMACY_SERVICE_URL');
        const response = await firstValueFrom(
          this.http.post(`${url}/prescriptions`, item.payload, { headers }),
        );
        return {
          targetOrderId:
            response.data?.id ?? response.data?.orderNumber ?? 'unknown',
          payloadSnapshot: response.data,
        };
      }
      case UnifiedOrderItemTypeDto.LAB: {
        const url = this.config.get<string>('LAB_SERVICE_URL');
        const response = await firstValueFrom(
          this.http.post(`${url}/orders`, item.payload, { headers }),
        );
        return {
          targetOrderId:
            response.data?.id ?? response.data?.orderNumber ?? 'unknown',
          payloadSnapshot: response.data,
        };
      }
      case UnifiedOrderItemTypeDto.RADIOLOGY: {
        const url = this.config.get<string>('RADIOLOGY_SERVICE_URL');
        const response = await firstValueFrom(
          this.http.post(`${url}/orders`, item.payload, { headers }),
        );
        return {
          targetOrderId:
            response.data?.id ?? response.data?.orderNumber ?? 'unknown',
          payloadSnapshot: response.data,
        };
      }
      default:
        throw new BadRequestException(`Unsupported order type: ${item.type}`);
    }
  }

  private resolveServiceRole(type: UnifiedOrderItemTypeDto): string {
    switch (type) {
      case UnifiedOrderItemTypeDto.PHARMACY:
        return 'PHARMACIST';
      case UnifiedOrderItemTypeDto.LAB:
        return 'LAB_TECH';
      case UnifiedOrderItemTypeDto.RADIOLOGY:
        return 'RADIOLOGIST';
      default:
        return 'SYSTEM';
    }
  }

  private ensurePayloadShape(item: UnifiedOrderItemDto): void {
    const payload = item.payload as Record<string, unknown>;

    const requiredFieldsByType: Record<UnifiedOrderItemTypeDto, string[]> = {
      [UnifiedOrderItemTypeDto.PHARMACY]: [
        'patientId',
        'providerId',
        'encounterId',
        'items',
      ],
      [UnifiedOrderItemTypeDto.LAB]: [
        'patientId',
        'providerId',
        'encounterId',
        'tests',
      ],
      [UnifiedOrderItemTypeDto.RADIOLOGY]: [
        'patientId',
        'providerId',
        'encounterId',
        'studyType',
        'bodyPart',
      ],
      [UnifiedOrderItemTypeDto.PROCEDURE]: [],
    };

    for (const field of requiredFieldsByType[item.type] ?? []) {
      if (!(field in payload)) {
        throw new BadRequestException(
          `Payload for ${item.type} order missing required field '${field}'`,
        );
      }
    }
  }

  private async recordEvent(
    unifiedOrderId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ) {
    await this.prisma.workflowEvent.create({
      data: {
        unifiedOrderId,
        eventType,
        payload: payload as Prisma.InputJsonValue,
      },
    });
  }

  private async recomputeUnifiedOrderStatus(
    unifiedOrderId: string,
  ): Promise<void> {
    const order = await this.prisma.unifiedOrder.findUnique({
      where: { id: unifiedOrderId },
      include: { items: true },
    });

    if (!order) {
      return;
    }

    let nextStatus: UnifiedOrderStatus = UnifiedOrderStatus.NEW;

    const hasError = order.items.some(
      (item) => item.status === OrderItemStatus.ERROR,
    );
    const allCompleted =
      order.items.length > 0 &&
      order.items.every((item) => item.status === OrderItemStatus.COMPLETED);
    const anyInProgress = order.items.some(
      (item) => item.status === OrderItemStatus.IN_PROGRESS,
    );
    const anyRequested = order.items.some(
      (item) => item.status === OrderItemStatus.REQUESTED,
    );

    if (hasError) {
      nextStatus = UnifiedOrderStatus.PARTIALLY_FULFILLED;
    } else if (allCompleted) {
      nextStatus = UnifiedOrderStatus.COMPLETED;
    } else if (anyInProgress || anyRequested) {
      nextStatus = UnifiedOrderStatus.PARTIALLY_FULFILLED;
    }

    if (nextStatus !== order.status) {
      await this.prisma.unifiedOrder.update({
        where: { id: unifiedOrderId },
        data: { status: nextStatus },
      });

      await this.recordEvent(unifiedOrderId, 'UNIFIED_ORDER_STATUS', {
        status: nextStatus,
      });
    }
  }

  private canAccessOrder(
    providerId: string,
    user: RequestUserContext,
  ): boolean {
    const role = user.role?.toUpperCase();
    if (role === 'CLINICAL_WORKFLOW' || role === 'SYSTEM') {
      return true;
    }
    if (!user.userId) {
      return false;
    }
    return providerId === user.userId;
  }

  private async generateOrderNumber(): Promise<string> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `WF-${timestamp}-${random}`;

    const existing = await this.prisma.unifiedOrder.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (existing) {
      return this.generateOrderNumber();
    }

    return orderNumber;
  }
}
