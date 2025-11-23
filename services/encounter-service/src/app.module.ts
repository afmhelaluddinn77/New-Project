import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuditModule } from "./audit/audit.module";
import { EncounterModule } from "./encounter/encounter.module";
import { InvestigationModule } from "./investigation/investigation.module";
import { MedicationModule } from "./medication/medication.module";
import { PrescriptionModule } from "./prescription/prescription.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    EncounterModule,
    PrescriptionModule,
    InvestigationModule,
    MedicationModule,
    AuditModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
