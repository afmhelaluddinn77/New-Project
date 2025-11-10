import { IsString, IsOptional, IsEnum, IsUUID, IsDateString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EncounterType {
  OUTPATIENT = 'OUTPATIENT',
  INPATIENT = 'INPATIENT',
  EMERGENCY = 'EMERGENCY',
  TELEMEDICINE = 'TELEMEDICINE',
  HOME_VISIT = 'HOME_VISIT',
  FOLLOW_UP = 'FOLLOW_UP',
}

export enum EncounterClass {
  AMBULATORY = 'AMBULATORY',
  EMERGENCY = 'EMERGENCY',
  INPATIENT = 'INPATIENT',
  OBSERVATION = 'OBSERVATION',
  VIRTUAL = 'VIRTUAL',
}

export enum Priority {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  ASAP = 'ASAP',
  STAT = 'STAT',
}

export class CreateEncounterDto {
  @ApiProperty({ description: 'Patient ID (UUID)' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'Provider ID (UUID)' })
  @IsUUID()
  providerId: string;

  @ApiPropertyOptional({ description: 'Facility ID (UUID)' })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @ApiProperty({ enum: EncounterType, description: 'Type of encounter' })
  @IsEnum(EncounterType)
  encounterType: EncounterType;

  @ApiProperty({ enum: EncounterClass, description: 'Class of encounter' })
  @IsEnum(EncounterClass)
  encounterClass: EncounterClass;

  @ApiPropertyOptional({ enum: Priority, description: 'Priority level', default: Priority.ROUTINE })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: 'Chief complaint' })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({ description: 'History of present illness (JSONB)' })
  @IsOptional()
  @IsObject()
  historyOfPresentIllness?: any;

  @ApiPropertyOptional({ description: 'Past medical history (JSONB)' })
  @IsOptional()
  @IsObject()
  pastMedicalHistory?: any;

  @ApiPropertyOptional({ description: 'Medication history (JSONB)' })
  @IsOptional()
  @IsObject()
  medicationHistory?: any;

  @ApiPropertyOptional({ description: 'Family history (JSONB)' })
  @IsOptional()
  @IsObject()
  familyHistory?: any;

  @ApiPropertyOptional({ description: 'Social history (JSONB)' })
  @IsOptional()
  @IsObject()
  socialHistory?: any;

  @ApiPropertyOptional({ description: 'Review of systems (JSONB)' })
  @IsOptional()
  @IsObject()
  reviewOfSystems?: any;

  @ApiPropertyOptional({ description: 'Vital signs (JSONB)' })
  @IsOptional()
  @IsObject()
  vitalSigns?: any;

  @ApiPropertyOptional({ description: 'General examination (JSONB)' })
  @IsOptional()
  @IsObject()
  generalExamination?: any;

  @ApiPropertyOptional({ description: 'Systemic examination (JSONB)' })
  @IsOptional()
  @IsObject()
  systemicExamination?: any;

  @ApiPropertyOptional({ description: 'Clinical assessment' })
  @IsOptional()
  @IsString()
  assessment?: string;

  @ApiPropertyOptional({ description: 'Diagnosis codes (ICD-10, SNOMED CT)' })
  @IsOptional()
  @IsObject()
  diagnosisCodes?: any;

  @ApiPropertyOptional({ description: 'Treatment plan' })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiProperty({ description: 'User ID creating the encounter' })
  @IsString()
  createdBy: string;
}
