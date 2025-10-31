import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';

export class InteractionCheckDto {
  @IsString()
  patientId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  newMedications!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentMedications?: string[];
}

export interface InteractionSummary {
  hasInteractions: boolean;
  interactions: Array<{
    drugs: string[];
    severity: string;
    description: string;
    recommendation?: string;
  }>;
  hasAllergies: boolean;
  allergies: string[];
}
