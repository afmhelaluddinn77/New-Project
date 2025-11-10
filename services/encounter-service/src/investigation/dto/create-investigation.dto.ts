import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvestigationType, Priority, InvestigationStatus } from '@prisma/client';

export class CreateInvestigationDto {
  @ApiProperty({ description: 'Encounter ID' })
  @IsString()
  encounterId: string;

  @ApiProperty({ description: 'Investigation type', enum: InvestigationType })
  @IsEnum(InvestigationType)
  investigationType: InvestigationType;

  @ApiProperty({ description: 'LOINC code for lab tests' })
  @IsOptional()
  @IsString()
  loincCode?: string;

  @ApiProperty({ description: 'SNOMED CT code' })
  @IsOptional()
  @IsString()
  snomedCode?: string;

  @ApiProperty({ description: 'Investigation name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Investigation description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Priority level', enum: Priority, default: 'ROUTINE' })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ description: 'Imaging modality (for imaging investigations)' })
  @IsOptional()
  @IsString()
  imagingModality?: string;

  @ApiProperty({ description: 'Imaging body site' })
  @IsOptional()
  @IsString()
  imagingBodySite?: string;
}
