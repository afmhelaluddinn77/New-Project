import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MedicationController } from './medication.controller';
import { MedicationService } from './medication.service';

@Module({
  imports: [PrismaModule],
  controllers: [MedicationController],
  providers: [MedicationService],
  exports: [MedicationService],
})
export class MedicationModule {}
