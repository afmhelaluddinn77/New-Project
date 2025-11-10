import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InvestigationController } from './investigation.controller';
import { InvestigationService } from './investigation.service';

@Module({
  imports: [PrismaModule],
  controllers: [InvestigationController],
  providers: [InvestigationService],
  exports: [InvestigationService],
})
export class InvestigationModule {}
