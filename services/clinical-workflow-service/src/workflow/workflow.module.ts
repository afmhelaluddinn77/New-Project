import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { WorkflowGateway } from './workflow.gateway';

@Module({
  imports: [HttpModule.register({ timeout: 5000 })],
  controllers: [WorkflowController],
  providers: [WorkflowService, RolesGuard, WorkflowGateway],
})
export class WorkflowModule {}
