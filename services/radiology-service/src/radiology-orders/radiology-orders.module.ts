import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { IntegrationModule } from '../integration/integration.module';
import { MinioService } from '../storage/minio.service';
import { RadiologyOrdersController } from './radiology-orders.controller';
import { RadiologyOrdersService } from './radiology-orders.service';

@Module({
  imports: [IntegrationModule],
  controllers: [RadiologyOrdersController],
  providers: [RadiologyOrdersService, RolesGuard, MinioService],
  exports: [RadiologyOrdersService],
})
export class RadiologyOrdersModule {}
