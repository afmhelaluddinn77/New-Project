import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum VerificationActionType {
  VERIFY = 'VERIFY',
  REJECT = 'REJECT',
  DISPENSE = 'DISPENSE',
}

export class VerifyPrescriptionDto {
  @IsEnum(VerificationActionType)
  action!: VerificationActionType;

  @IsOptional()
  @IsString()
  notes?: string;
}
