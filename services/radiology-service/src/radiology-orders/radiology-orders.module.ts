import { Module } from '@nestjs/common';
import { RadiologyOrdersController } from './radiology-orders.controller';
import { RadiologyOrdersService } from './radiology-orders.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { IntegrationModule } from '../integration/integration.module';

@Module({
  imports: [IntegrationModule],
  controllers: [RadiologyOrdersController],
  providers: [RadiologyOrdersService, RolesGuard],
  exports: [RadiologyOrdersService],
})
export class RadiologyOrdersModule {}
