import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RadiologyOrdersService } from './radiology-orders.service';
import { CreateRadiologyOrderDto } from './dto/create-radiology-order.dto';
import { CreateRadiologyReportDto } from './dto/create-radiology-report.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  UserContext,
  RequestUserContext,
} from '../common/decorators/user-context.decorator';

@Controller('orders')
@UseGuards(RolesGuard)
export class RadiologyOrdersController {
  constructor(
    private readonly radiologyOrdersService: RadiologyOrdersService,
  ) {}

  @Post()
  @Roles('CLINICAL_WORKFLOW', 'PROVIDER')
  create(
    @Body() dto: CreateRadiologyOrderDto,
    @UserContext() user: RequestUserContext,
  ) {
    return this.radiologyOrdersService.create(dto, user);
  }

  @Get('pending')
  @Roles('RADIOLOGIST')
  findPending() {
    return this.radiologyOrdersService.findPending();
  }

  @Post(':id/report')
  @Roles('RADIOLOGIST')
  submitReport(
    @Param('id') id: string,
    @Body() dto: CreateRadiologyReportDto,
    @UserContext() user: RequestUserContext,
  ) {
    return this.radiologyOrdersService.submitReport(id, dto, user);
  }
}
