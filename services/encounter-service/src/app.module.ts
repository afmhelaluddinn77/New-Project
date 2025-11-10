import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { EncounterModule } from './encounter/encounter.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { InvestigationModule } from './investigation/investigation.module';
import { MedicationModule } from './medication/medication.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    EncounterModule,
    PrescriptionModule,
    InvestigationModule,
    MedicationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
