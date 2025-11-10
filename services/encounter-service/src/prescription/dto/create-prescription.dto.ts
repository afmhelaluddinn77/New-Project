import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PrescriptionStatus } from '@prisma/client';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Encounter ID' })
  @IsString()
  encounterId: string;

  @ApiProperty({ description: 'Medication ID (optional reference)' })
  @IsOptional()
  @IsString()
  medicationId?: string;

  @ApiProperty({ description: 'RxNorm code (optional)' })
  @IsOptional()
  @IsString()
  rxNormCode?: string;

  @ApiProperty({ description: 'Generic medication name' })
  @IsString()
  genericName: string;

  @ApiProperty({ description: 'Brand name (optional)' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiProperty({ description: 'Dosage (e.g., 500mg)' })
  @IsString()
  dosage: string;

  @ApiProperty({ description: 'Dosage form (tablet, capsule, syrup, injection, etc.)' })
  @IsString()
  dosageForm: string;

  @ApiProperty({ description: 'Route of administration (oral, IV, IM, topical, etc.)' })
  @IsString()
  route: string;

  @ApiProperty({ description: 'Frequency (BID, TID, QID, etc.)' })
  @IsString()
  frequency: string;

  @ApiProperty({ description: 'Duration (e.g., 7 days, 2 weeks)' })
  @IsString()
  duration: string;

  @ApiProperty({ description: 'Quantity to dispense' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Number of refills allowed', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refills?: number;

  @ApiProperty({ description: 'Special instructions for patient' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ description: 'Clinical indication for prescription' })
  @IsOptional()
  @IsString()
  indication?: string;

  @ApiProperty({ description: 'Whether allergy has been checked', default: false })
  @IsOptional()
  @IsBoolean()
  allergyChecked?: boolean;

  @ApiProperty({ description: 'Whether drug interactions have been checked', default: false })
  @IsOptional()
  @IsBoolean()
  interactionChecked?: boolean;

  @ApiProperty({ description: 'Pharmacy ID (optional)' })
  @IsOptional()
  @IsString()
  pharmacyId?: string;
}
