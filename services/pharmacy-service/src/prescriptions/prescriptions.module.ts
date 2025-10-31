import { Module } from '@nestjs/common';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { IntegrationModule } from '../integration/integration.module';

@Module({
  imports: [IntegrationModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, RolesGuard],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
