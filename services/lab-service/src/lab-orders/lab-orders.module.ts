import { Module } from '@nestjs/common';
import { LabOrdersController } from './lab-orders.controller';
import { LabOrdersService } from './lab-orders.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { IntegrationModule } from '../integration/integration.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [IntegrationModule, EventsModule],
  controllers: [LabOrdersController],
  providers: [LabOrdersService, RolesGuard],
  exports: [LabOrdersService],
})
export class LabOrdersModule {}
