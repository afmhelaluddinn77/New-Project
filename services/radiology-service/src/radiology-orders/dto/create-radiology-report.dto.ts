import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRadiologyReportDto {
  @IsString()
  reportText!: string;

  @IsOptional()
  @IsString()
  impression?: string;

  @IsOptional()
  @IsBoolean()
  criticalFinding?: boolean;
}
