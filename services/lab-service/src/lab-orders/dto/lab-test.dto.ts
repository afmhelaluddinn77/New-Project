import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum LabTestStatusDto {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CRITICAL = 'CRITICAL',
}

export class LabTestDto {
  @IsString()
  loincCode!: string;

  @IsString()
  testName!: string;

  @IsOptional()
  @IsString()
  specimenType?: string;

  @IsOptional()
  @IsEnum(LabTestStatusDto)
  status?: LabTestStatusDto;
}
