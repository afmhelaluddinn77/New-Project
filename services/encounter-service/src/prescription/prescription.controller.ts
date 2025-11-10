import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() createPrescriptionDto: CreatePrescriptionDto,
    @CurrentUser() user: any,
  ) {
    return this.prescriptionService.create(createPrescriptionDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prescriptions with pagination' })
  @ApiResponse({ status: 200, description: 'List of prescriptions' })
  async findAll(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ) {
    return this.prescriptionService.findAll(skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  @ApiResponse({ status: 200, description: 'Prescription found' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async findOne(@Param('id') id: string) {
    return this.prescriptionService.findOne(id);
  }

  @Get('encounter/:encounterId')
  @ApiOperation({ summary: 'Get prescriptions for an encounter' })
  @ApiResponse({ status: 200, description: 'List of prescriptions for encounter' })
  async findByEncounter(@Param('encounterId') encounterId: string) {
    return this.prescriptionService.findByEncounter(encounterId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a prescription' })
  @ApiResponse({ status: 200, description: 'Prescription updated successfully' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
    @CurrentUser() user: any,
  ) {
    return this.prescriptionService.update(id, updatePrescriptionDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a prescription' })
  @ApiResponse({ status: 204, description: 'Prescription deleted successfully' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.prescriptionService.remove(id, user.sub);
  }

  @Post(':id/dispense')
  @ApiOperation({ summary: 'Mark prescription as dispensed' })
  @ApiResponse({ status: 200, description: 'Prescription marked as dispensed' })
  async dispense(
    @Param('id') id: string,
    @Body() dispenseData: any,
    @CurrentUser() user: any,
  ) {
    return this.prescriptionService.dispense(id, dispenseData, user.sub);
  }

  @Post(':id/check-interactions')
  @ApiOperation({ summary: 'Check drug interactions for prescription' })
  @ApiResponse({ status: 200, description: 'Interaction check results' })
  async checkInteractions(
    @Param('id') id: string,
    @Body() otherMedications: any,
  ) {
    return this.prescriptionService.checkInteractions(id, otherMedications);
  }
}
