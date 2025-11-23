import { Module } from "@nestjs/common";
import { FhirResourceService } from "./fhir-resource.service";
import { FhirController } from "./fhir.controller";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [FhirController],
  providers: [FhirResourceService],
})
export class AppModule {}
