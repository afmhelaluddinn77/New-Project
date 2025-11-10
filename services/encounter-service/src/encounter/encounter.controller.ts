import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EncounterService } from './encounter.service';
import { CreateEncounterDto } from './dto/create-encounter.dto';

@ApiTags('encounters')
@Controller('encounters')
export class EncounterController {
  constructor(private readonly encounterService: EncounterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new encounter' })
  @ApiResponse({ status: 201, description: 'Encounter created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createEncounterDto: CreateEncounterDto) {
    return this.encounterService.create(createEncounterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all encounters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Encounters retrieved successfully' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.encounterService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      orderBy: { encounterDate: 'desc' },
    });
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all encounters for a patient' })
  @ApiResponse({ status: 200, description: 'Patient encounters retrieved successfully' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.encounterService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get encounter by ID' })
  @ApiResponse({ status: 200, description: 'Encounter retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Encounter not found' })
  findOne(@Param('id') id: string) {
    return this.encounterService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an encounter' })
  @ApiResponse({ status: 200, description: 'Encounter updated successfully' })
  @ApiResponse({ status: 404, description: 'Encounter not found' })
  update(
    @Param('id') id: string,
    @Body() updateEncounterDto: Partial<CreateEncounterDto>,
    @Query('userId') userId: string,
  ) {
    return this.encounterService.update(id, updateEncounterDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an encounter' })
  @ApiResponse({ status: 204, description: 'Encounter deleted successfully' })
  @ApiResponse({ status: 404, description: 'Encounter not found' })
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.encounterService.remove(id, userId);
  }

  @Post(':id/finalize')
  @ApiOperation({ summary: 'Finalize an encounter' })
  @ApiResponse({ status: 200, description: 'Encounter finalized successfully' })
  @ApiResponse({ status: 404, description: 'Encounter not found' })
  finalize(@Param('id') id: string, @Query('userId') userId: string) {
    return this.encounterService.finalize(id, userId);
  }
}
