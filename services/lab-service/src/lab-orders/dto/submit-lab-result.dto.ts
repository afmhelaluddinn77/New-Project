import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum AbnormalFlagDto {
  NORMAL = 'NORMAL',
  LOW = 'LOW',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class SubmitLabResultDto {
  @IsString()
  @IsNotEmpty()
  testId!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsOptional()
  @IsString()
  referenceRange?: string;

  @IsOptional()
  @IsEnum(AbnormalFlagDto)
  abnormalFlag?: AbnormalFlagDto;

  @IsOptional()
  @IsString()
  comment?: string;
}
