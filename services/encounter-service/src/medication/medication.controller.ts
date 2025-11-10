import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MedicationService } from './medication.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Medications')
@ApiBearerAuth()
@Controller('medications')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search medications by name or code' })
  @ApiResponse({ status: 200, description: 'List of matching medications' })
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 20,
  ) {
    return this.medicationService.search({ query, limit });
  }

  @Get('search/rxnorm/:rxnormCode')
  @ApiOperation({ summary: 'Search medication by RxNorm code' })
  @ApiResponse({ status: 200, description: 'Medication found' })
  async searchByRxNormCode(@Param('rxnormCode') rxnormCode: string) {
    return this.medicationService.findByRxNormCode(rxnormCode);
  }

  @Post('interactions/check')
  @ApiOperation({ summary: 'Check drug interactions between medications' })
  @ApiResponse({ status: 200, description: 'Interaction check results' })
  async checkInteractions(
    @Body() medications: Array<{ rxnormCode?: string; genericName: string }>,
  ) {
    return this.medicationService.checkInteractions(medications);
  }

  @Get('contraindications/:rxnormCode')
  @ApiOperation({ summary: 'Get contraindications for a medication' })
  @ApiResponse({ status: 200, description: 'Contraindications list' })
  async getContraindications(@Param('rxnormCode') rxnormCode: string) {
    return this.medicationService.getContraindications(rxnormCode);
  }

  @Get('side-effects/:rxnormCode')
  @ApiOperation({ summary: 'Get side effects for a medication' })
  @ApiResponse({ status: 200, description: 'Side effects list' })
  async getSideEffects(@Param('rxnormCode') rxnormCode: string) {
    return this.medicationService.getSideEffects(rxnormCode);
  }

  @Get('dosage-info/:rxnormCode')
  @ApiOperation({ summary: 'Get dosage information for a medication' })
  @ApiResponse({ status: 200, description: 'Dosage information' })
  async getDosageInfo(@Param('rxnormCode') rxnormCode: string) {
    return this.medicationService.getDosageInfo(rxnormCode);
  }

  @Post('allergy-check')
  @ApiOperation({ summary: 'Check medication against patient allergies' })
  @ApiResponse({ status: 200, description: 'Allergy check results' })
  async checkAllergies(
    @Body() data: { patientId: string; medications: string[] },
  ) {
    return this.medicationService.checkAllergies(data.patientId, data.medications);
  }

  @Get('alternatives/:rxnormCode')
  @ApiOperation({ summary: 'Get alternative medications' })
  @ApiResponse({ status: 200, description: 'List of alternative medications' })
  async getAlternatives(@Param('rxnormCode') rxnormCode: string) {
    return this.medicationService.getAlternatives(rxnormCode);
  }
}
