import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { OrderItemStatus, OrderItemType } from '../../generated/prisma/client';

export class UpdateItemStatusDto {
  @IsString()
  targetServiceOrderId!: string;

  @IsEnum(OrderItemType)
  itemType!: OrderItemType;

  @IsEnum(OrderItemStatus)
  status!: OrderItemStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
