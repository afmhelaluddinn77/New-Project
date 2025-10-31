import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { LabTestDto } from './lab-test.dto';

export enum LabOrderPriorityDto {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  STAT = 'STAT',
}

export class CreateLabOrderDto {
  @IsString()
  patientId!: string;

  @IsString()
  providerId!: string;

  @IsString()
  encounterId!: string;

  @IsEnum(LabOrderPriorityDto)
  priority!: LabOrderPriorityDto;

  @IsOptional()
  @IsString()
  clinicalNotes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => LabTestDto)
  tests!: LabTestDto[];
}
