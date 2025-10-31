import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  UnifiedOrderItemDto,
  UnifiedOrderItemTypeDto,
} from './unified-order-item.dto';

export enum UnifiedOrderPriorityDto {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  STAT = 'STAT',
}

export class CreateUnifiedOrderDto {
  @IsString()
  patientId!: string;

  @IsString()
  providerId!: string;

  @IsString()
  encounterId!: string;

  @IsEnum(UnifiedOrderPriorityDto)
  priority!: UnifiedOrderPriorityDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => UnifiedOrderItemDto)
  items!: Array<UnifiedOrderItemDto & { type: UnifiedOrderItemTypeDto }>;
}
