import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LabOrdersService } from './lab-orders.service';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { SubmitLabResultDto } from './dto/submit-lab-result.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  UserContext,
  RequestUserContext,
} from '../common/decorators/user-context.decorator';

@Controller('orders')
@UseGuards(RolesGuard)
export class LabOrdersController {
  constructor(private readonly labOrdersService: LabOrdersService) {}

  @Post()
  @Roles('CLINICAL_WORKFLOW', 'PROVIDER')
  create(
    @Body() dto: CreateLabOrderDto,
    @UserContext() user: RequestUserContext,
  ) {
    return this.labOrdersService.create(dto, user);
  }

  @Get('pending')
  @Roles('LAB_TECH')
  findPending() {
    return this.labOrdersService.findPending();
  }

  @Post(':id/results')
  @Roles('LAB_TECH')
  submitResult(
    @Param('id') id: string,
    @Body() dto: SubmitLabResultDto,
    @UserContext() user: RequestUserContext,
  ) {
    return this.labOrdersService.submitResult(id, dto, user);
  }
}
