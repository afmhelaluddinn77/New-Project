import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [HttpModule],
  controllers: [InteractionsController],
  providers: [InteractionsService, RolesGuard],
})
export class InteractionsModule {}
