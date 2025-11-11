import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import {
  VerifyPrescriptionDto,
  VerificationActionType,
} from './dto/verify-prescription.dto';
import {
  UserContext,
  RequestUserContext,
} from '../common/decorators/user-context.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('prescriptions')
@UseGuards(RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles('PROVIDER', 'CLINICAL_WORKFLOW')  // Allow workflow service to create orders
  create(
    @Body() dto: CreatePrescriptionDto,
    @UserContext() user: RequestUserContext,
  ) {
    return this.prescriptionsService.create(dto, user);
  }

  @Get('pending')
  @Roles('PHARMACIST')
  findPending() {
    return this.prescriptionsService.findPending();
  }

  @Post(':id/verify')
  @Roles('PHARMACIST')
  verify(
    @Param('id') id: string,
    @Body() dto: VerifyPrescriptionDto,
    @UserContext() user: RequestUserContext,
  ) {
    return this.prescriptionsService.verify(id, dto, user);
  }

  // Convenience endpoint so providers can mark as dispensed when pharmacy portal integrates fully
  @Post(':id/dispense')
  @Roles('PHARMACIST')
  dispense(@Param('id') id: string, @UserContext() user: RequestUserContext) {
    const dto: VerifyPrescriptionDto = {
      action: VerificationActionType.DISPENSE,
    };
    return this.prescriptionsService.verify(id, dto, user);
  }
}
