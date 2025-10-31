import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WorkflowIntegrationService } from './workflow-integration.service';

@Module({
  imports: [HttpModule],
  providers: [WorkflowIntegrationService],
  exports: [WorkflowIntegrationService],
})
export class IntegrationModule {}
