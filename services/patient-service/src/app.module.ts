import { Module } from '@nestjs/common'
import { PatientController } from './patient/patient.controller'
import { PatientService } from './patient/patient.service'

@Module({
  imports: [],
  controllers: [PatientController],
  providers: [PatientService],
})
export class AppModule {}

