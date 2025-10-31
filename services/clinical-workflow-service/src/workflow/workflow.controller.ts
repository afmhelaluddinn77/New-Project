import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateUnifiedOrderDto } from './dto/create-unified-order.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  RequestUserContext,
  UserContext,
} from '../common/decorators/user-context.decorator';
import { UpdateItemStatusDto } from './dto/update-item-status.dto';

@Controller('orders')
@UseGuards(RolesGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  @Roles('PROVIDER', 'CLINICAL_WORKFLOW')
  listUnifiedOrders(@UserContext() user: RequestUserContext) {
    return this.workflowService.listUnifiedOrders(user);
  }

  @Post('unified')
  @Roles('PROVIDER')
  createUnifiedOrder(
    @Body() dto: CreateUnifiedOrderDto,
    @UserContext() user: RequestUserContext,
  ) {
    return this.workflowService.createUnifiedOrder(dto, user);
  }

  @Get(':orderId')
  @Roles('PROVIDER', 'CLINICAL_WORKFLOW')
  getUnifiedOrder(
    @Param('orderId') orderId: string,
    @UserContext() user: RequestUserContext,
  ) {
    return this.workflowService.getUnifiedOrder(orderId, user);
  }

  @Post('integration/item-status')
  @Roles('LAB_SERVICE', 'PHARMACY_SERVICE', 'RADIOLOGY_SERVICE', 'SYSTEM')
  updateItemStatus(@Body() dto: UpdateItemStatusDto) {
    return this.workflowService.updateItemStatus(dto);
  }
}
