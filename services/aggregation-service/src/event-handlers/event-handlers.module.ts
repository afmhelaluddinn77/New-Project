import { Module } from "@nestjs/common";
import { EncounterEventHandler } from "./encounter-event.handler";
import { LabEventHandler } from "./lab-event.handler";
import { PatientEventHandler } from "./patient-event.handler";
import { PharmacyEventHandler } from "./pharmacy-event.handler";
import { RadiologyEventHandler } from "./radiology-event.handler";

@Module({
  providers: [
    PatientEventHandler,
    LabEventHandler,
    RadiologyEventHandler,
    PharmacyEventHandler,
    EncounterEventHandler,
  ],
})
export class EventHandlersModule {}
