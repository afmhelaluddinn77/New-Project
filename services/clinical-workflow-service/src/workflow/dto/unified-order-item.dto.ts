import { IsEnum, IsNotEmptyObject, IsObject } from 'class-validator';

export enum UnifiedOrderItemTypeDto {
  PHARMACY = 'PHARMACY',
  LAB = 'LAB',
  RADIOLOGY = 'RADIOLOGY',
  PROCEDURE = 'PROCEDURE',
}

export class UnifiedOrderItemDto {
  @IsEnum(UnifiedOrderItemTypeDto)
  type!: UnifiedOrderItemTypeDto;

  @IsObject()
  @IsNotEmptyObject()
  payload!: Record<string, unknown>;
}
