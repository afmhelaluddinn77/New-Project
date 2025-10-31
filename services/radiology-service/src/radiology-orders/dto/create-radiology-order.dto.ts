import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum RadiologyStudyTypeDto {
  XRAY = 'XRAY',
  CT = 'CT',
  MRI = 'MRI',
  ULTRASOUND = 'ULTRASOUND',
  OTHER = 'OTHER',
}

export enum RadiologyOrderPriorityDto {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  STAT = 'STAT',
}

export class CreateRadiologyOrderDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsString()
  @IsNotEmpty()
  providerId!: string;

  @IsString()
  @IsNotEmpty()
  encounterId!: string;

  @IsEnum(RadiologyStudyTypeDto)
  studyType!: RadiologyStudyTypeDto;

  @IsString()
  @IsNotEmpty()
  bodyPart!: string;

  @Type(() => Boolean)
  @IsBoolean()
  contrast!: boolean;

  @IsEnum(RadiologyOrderPriorityDto)
  priority!: RadiologyOrderPriorityDto;

  @IsOptional()
  @IsString()
  clinicalIndication?: string;
}
