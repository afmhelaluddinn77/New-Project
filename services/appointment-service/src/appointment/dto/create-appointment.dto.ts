import { AppointmentType } from "@prisma/client";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateAppointmentDto {
  @IsString()
  patientId: string;

  @IsString()
  @IsOptional()
  providerId?: string;

  @IsEnum(AppointmentType)
  appointmentType: AppointmentType;

  @IsDateString()
  @IsOptional()
  requestedDate?: string;

  @IsString()
  @IsOptional()
  requestedTime?: string;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @IsInt()
  @Min(15)
  @Max(240)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isTelemedicine?: boolean;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  instructions?: string;
}
