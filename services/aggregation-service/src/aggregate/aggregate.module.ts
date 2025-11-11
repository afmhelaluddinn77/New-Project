import { Module } from "@nestjs/common";
import { PatientAggregateController } from "./patient-aggregate.controller";

@Module({
  controllers: [PatientAggregateController],
})
export class AggregateModule {}
