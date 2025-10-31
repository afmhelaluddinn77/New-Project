import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator'

export enum PortalType {
  PATIENT = 'PATIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  LAB = 'LAB',
  PHARMACY = 'PHARMACY',
  BILLING = 'BILLING',
  RADIOLOGY = 'RADIOLOGY',
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsEnum(PortalType)
  @IsNotEmpty()
  portalType: PortalType
}

