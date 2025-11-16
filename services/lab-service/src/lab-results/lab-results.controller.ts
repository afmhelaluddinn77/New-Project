import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UserContext } from '../common/decorators/user-context.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { LabResultsService } from './lab-results.service';

/**
 * Lab Results Controller
 *
 * Provides comprehensive API endpoints for lab results management
 * Following PROJECT LAW: Always provide detailed, user-friendly responses
 */

@Controller('results')
@UseGuards(RolesGuard)
export class LabResultsController {
  constructor(private readonly labResultsService: LabResultsService) {}

  /**
   * Get detailed lab result by order ID
   * Used by Provider Portal to display comprehensive results
   */
  @Get(':orderId')
  @Roles('PROVIDER', 'LAB_TECH', 'CLINICAL_WORKFLOW')
  async getLabResult(
    @Param('orderId') orderId: string,
    @UserContext() user: RequestUserContext,
  ) {
    try {
      const result = await this.labResultsService.getDetailedResult(orderId);

      return {
        success: true,
        data: result,
        message: 'Lab result retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESULT_NOT_FOUND',
          message: 'Lab result not found or not accessible',
          suggestions: [
            'Verify the order ID is correct',
            'Check if results are finalized',
            'Ensure you have permission to view this result',
          ],
        },
      };
    }
  }

  /**
   * Get patient lab history for trend analysis
   */
  @Get('patient/:patientId/history')
  @Roles('PROVIDER', 'LAB_TECH')
  async getPatientLabHistory(
    @Param('patientId') patientId: string,
    @Query('testCode') testCode?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @UserContext() user?: RequestUserContext,
  ) {
    try {
      const history = await this.labResultsService.getPatientHistory(
        patientId,
        {
          testCode,
          limit: limit ? parseInt(limit) : 10,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        },
      );

      return {
        success: true,
        data: history,
        message: 'Patient lab history retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HISTORY_FETCH_FAILED',
          message: 'Failed to retrieve patient lab history',
          suggestions: [
            'Verify patient ID is correct',
            'Check date range parameters',
            'Ensure patient has lab results',
          ],
        },
      };
    }
  }

  /**
   * Get lab test templates for standardized result entry
   */
  @Get('templates/:testCode')
  @Roles('LAB_TECH', 'PROVIDER')
  async getTestTemplate(
    @Param('testCode') testCode: string,
    @UserContext() user: RequestUserContext,
  ) {
    try {
      const template = await this.labResultsService.getTestTemplate(testCode);

      return {
        success: true,
        data: template,
        message: 'Test template retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Test template not found',
          suggestions: [
            'Verify the test code is correct',
            'Check if template is active',
            'Contact lab administrator',
          ],
        },
      };
    }
  }

  /**
   * Create detailed lab result with components
   */
  @Post(':orderId/detailed')
  @Roles('LAB_TECH', 'CLINICAL_WORKFLOW')
  async createDetailedResult(
    @Param('orderId') orderId: string,
    @Body() resultData: CreateDetailedResultDto,
    @UserContext() user: RequestUserContext,
  ) {
    try {
      const result = await this.labResultsService.createDetailedResult(
        orderId,
        resultData,
        user.userId,
      );

      return {
        success: true,
        data: result,
        message: 'Detailed lab result created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESULT_CREATION_FAILED',
          message: 'Failed to create lab result',
          suggestions: [
            'Verify all required components are provided',
            'Check reference ranges are valid',
            'Ensure order exists and is in correct status',
          ],
        },
      };
    }
  }

  /**
   * Export lab results in various formats
   */
  @Post('export')
  @Roles('PROVIDER', 'LAB_TECH')
  async exportResults(
    @Body() exportRequest: ExportResultsDto,
    @UserContext() user: RequestUserContext,
  ) {
    try {
      const exportJob = await this.labResultsService.createExport(
        exportRequest,
        user.userId,
      );

      return {
        success: true,
        data: {
          exportId: exportJob.id,
          status: exportJob.status,
          estimatedCompletion: new Date(Date.now() + 30000), // 30 seconds estimate
        },
        message: 'Export job created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXPORT_FAILED',
          message: 'Failed to create export job',
          suggestions: [
            'Verify export parameters',
            'Check if results exist',
            'Try a smaller date range',
          ],
        },
      };
    }
  }

  /**
   * Get export status and download link
   */
  @Get('export/:exportId/status')
  @Roles('PROVIDER', 'LAB_TECH')
  async getExportStatus(
    @Param('exportId') exportId: string,
    @UserContext() user: RequestUserContext,
  ) {
    try {
      const exportStatus =
        await this.labResultsService.getExportStatus(exportId);

      return {
        success: true,
        data: exportStatus,
        message: 'Export status retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXPORT_NOT_FOUND',
          message: 'Export job not found',
          suggestions: [
            'Verify export ID is correct',
            'Check if export has expired',
          ],
        },
      };
    }
  }

  /**
   * Get critical results that require immediate attention
   */
  @Get('critical/pending')
  @Roles('PROVIDER', 'LAB_TECH')
  async getCriticalResults(
    @Query('limit') limit?: string,
    @UserContext() user?: RequestUserContext,
  ) {
    try {
      const criticalResults = await this.labResultsService.getCriticalResults(
        limit ? parseInt(limit) : 20,
      );

      return {
        success: true,
        data: criticalResults,
        message: 'Critical results retrieved successfully',
        meta: {
          count: criticalResults.length,
          requiresAction: criticalResults.filter((r) => r.actionRequired)
            .length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CRITICAL_RESULTS_FETCH_FAILED',
          message: 'Failed to retrieve critical results',
          suggestions: ['Check system connectivity', 'Verify user permissions'],
        },
      };
    }
  }

  /**
   * Get lab result statistics for dashboard
   */
  @Get('stats/dashboard')
  @Roles('PROVIDER', 'LAB_TECH', 'LAB_SUPERVISOR')
  async getDashboardStats(
    @Query('period') period?: string, // 'today', 'week', 'month'
    @UserContext() user?: RequestUserContext,
  ) {
    try {
      const stats = await this.labResultsService.getDashboardStats(
        period || 'today',
      );

      return {
        success: true,
        data: stats,
        message: 'Dashboard statistics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATS_FETCH_FAILED',
          message: 'Failed to retrieve dashboard statistics',
          suggestions: [
            'Try refreshing the page',
            'Check if lab service is running',
          ],
        },
      };
    }
  }
}

// DTOs for type safety and validation

export interface CreateDetailedResultDto {
  testCode: string;
  testName: string;
  status: 'FINAL' | 'PRELIMINARY' | 'CORRECTED';
  performedAt: string;
  verifiedBy?: string;
  interpretation?: string;
  components: ComponentResultDto[];
}

export interface ComponentResultDto {
  code: string;
  name: string;
  displayName: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRangeLow?: number;
  referenceRangeHigh?: number;
  referenceRangeText?: string;
  interpretation: 'N' | 'L' | 'H' | 'LL' | 'HH' | 'A';
  criticalValue?: boolean;
  comment?: string;
}

export interface ExportResultsDto {
  format: 'PDF' | 'HL7' | 'JSON' | 'CSV';
  patientId?: string;
  orderIds?: string[];
  startDate?: string;
  endDate?: string;
  testCodes?: string[];
  includeHistory?: boolean;
}

export interface LabResultHistoryQuery {
  testCode?: string;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface RequestUserContext {
  userId: string;
  roles?: string[];
}
