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
import { InvestigationService } from './investigation.service';
import { CreateInvestigationDto } from './dto/create-investigation.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Investigations')
@ApiBearerAuth()
@Controller('investigations')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
export class InvestigationController {
  constructor(private readonly investigationService: InvestigationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new investigation order' })
  @ApiResponse({ status: 201, description: 'Investigation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() createInvestigationDto: CreateInvestigationDto,
    @CurrentUser() user: any,
  ) {
    return this.investigationService.create(createInvestigationDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all investigations with pagination' })
  @ApiResponse({ status: 200, description: 'List of investigations' })
  async findAll(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ) {
    return this.investigationService.findAll(skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get investigation by ID' })
  @ApiResponse({ status: 200, description: 'Investigation found' })
  @ApiResponse({ status: 404, description: 'Investigation not found' })
  async findOne(@Param('id') id: string) {
    return this.investigationService.findOne(id);
  }

  @Get('encounter/:encounterId')
  @ApiOperation({ summary: 'Get investigations for an encounter' })
  @ApiResponse({ status: 200, description: 'List of investigations for encounter' })
  async findByEncounter(@Param('encounterId') encounterId: string) {
    return this.investigationService.findByEncounter(encounterId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an investigation' })
  @ApiResponse({ status: 200, description: 'Investigation updated successfully' })
  @ApiResponse({ status: 404, description: 'Investigation not found' })
  async update(
    @Param('id') id: string,
    @Body() updateInvestigationDto: UpdateInvestigationDto,
    @CurrentUser() user: any,
  ) {
    return this.investigationService.update(id, updateInvestigationDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an investigation' })
  @ApiResponse({ status: 204, description: 'Investigation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Investigation not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.investigationService.remove(id, user.sub);
  }

  @Post(':id/results')
  @ApiOperation({ summary: 'Add results to investigation' })
  @ApiResponse({ status: 200, description: 'Results added successfully' })
  async addResults(
    @Param('id') id: string,
    @Body() resultData: any,
    @CurrentUser() user: any,
  ) {
    return this.investigationService.addResults(id, resultData, user.sub);
  }

  @Get('search/loinc/:loincCode')
  @ApiOperation({ summary: 'Search investigation by LOINC code' })
  @ApiResponse({ status: 200, description: 'Investigation found' })
  async searchByLoincCode(@Param('loincCode') loincCode: string) {
    return this.investigationService.findByLoincCode(loincCode);
  }

  @Get('search/snomed/:snomedCode')
  @ApiOperation({ summary: 'Search investigation by SNOMED code' })
  @ApiResponse({ status: 200, description: 'Investigation found' })
  async searchBySnomedCode(@Param('snomedCode') snomedCode: string) {
    return this.investigationService.findBySnomedCode(snomedCode);
  }
}
