import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MedicationItemDto } from './medication-item.dto';

export enum OrderType {
  OPD = 'OPD',
  IPD = 'IPD',
}

export enum OrderPriority {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  STAT = 'STAT',
}

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  providerId!: string;

  @IsString()
  @IsNotEmpty()
  encounterId!: string;

  @IsEnum(OrderType)
  orderType!: OrderType;

  @IsEnum(OrderPriority)
  priority!: OrderPriority;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => MedicationItemDto)
  items!: MedicationItemDto[];
}
