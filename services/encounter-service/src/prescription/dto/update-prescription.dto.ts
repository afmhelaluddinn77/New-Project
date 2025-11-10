import { PartialType } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PrescriptionStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @ApiProperty({ description: 'Prescription status', enum: PrescriptionStatus })
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @ApiProperty({ description: 'Date when prescription was dispensed' })
  @IsOptional()
  dispensedDate?: Date;

  @ApiProperty({ description: 'ID of user who dispensed the prescription' })
  @IsOptional()
  dispensedBy?: string;

  @ApiProperty({ description: 'Pharmacy ID where prescription was dispensed' })
  @IsOptional()
  pharmacyId?: string;
}
