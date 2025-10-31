import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { InteractionCheckDto } from './dto/interaction-check.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('interactions')
@UseGuards(RolesGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post('check')
  @Roles('PROVIDER', 'PHARMACIST')
  checkInteractions(@Body() dto: InteractionCheckDto) {
    return this.interactionsService.check(dto);
  }
}
