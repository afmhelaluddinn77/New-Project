import { PartialType } from '@nestjs/swagger';
import { CreateInvestigationDto } from './create-investigation.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InvestigationStatus, ResultInterpretation } from '@prisma/client';

export class UpdateInvestigationDto extends PartialType(CreateInvestigationDto) {
  @ApiProperty({ description: 'Investigation status', enum: InvestigationStatus })
  @IsOptional()
  @IsEnum(InvestigationStatus)
  status?: InvestigationStatus;

  @ApiProperty({ description: 'Result value', example: '12.4' })
  @IsOptional()
  @IsString()
  resultValue?: string;

  @ApiProperty({ description: 'Result unit', example: 'mg/dL' })
  @IsOptional()
  @IsString()
  resultUnit?: string;

  @ApiProperty({ description: 'Reference range', example: '10-20 mg/dL' })
  @IsOptional()
  @IsString()
  referenceRange?: string;

  @ApiProperty({ description: 'Result interpretation', enum: ResultInterpretation })
  @IsOptional()
  @IsEnum(ResultInterpretation)
  interpretation?: ResultInterpretation;

  @ApiProperty({ description: 'Result notes' })
  @IsOptional()
  @IsString()
  resultNotes?: string;
}
