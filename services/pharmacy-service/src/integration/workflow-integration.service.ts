import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
type WorkflowItemStatus = 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
type WorkflowItemType = 'PHARMACY';

interface WorkflowItemStatusUpdate {
  targetServiceOrderId: string;
  itemType: WorkflowItemType;
  status: WorkflowItemStatus;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class WorkflowIntegrationService {
  private readonly logger = new Logger(WorkflowIntegrationService.name);
  private readonly workflowApiUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.workflowApiUrl = this.config.get<string>(
      'WORKFLOW_API_URL',
      'http://localhost:3004/api/workflow',
    );
  }

  async notify(update: WorkflowItemStatusUpdate): Promise<void> {
    if (!this.workflowApiUrl) {
      this.logger.warn(
        'WORKFLOW_API_URL is not configured; skipping workflow notification',
      );
      return;
    }

    const payload = {
      targetServiceOrderId: update.targetServiceOrderId,
      itemType: update.itemType,
      status: update.status,
      metadata: update.metadata,
    };

    try {
      await firstValueFrom(
        this.http.post(
          `${this.workflowApiUrl}/orders/integration/item-status`,
          payload,
          {
            headers: {
              'x-user-role': 'PHARMACY_SERVICE',
            },
          },
        ),
      );
    } catch (error) {
      this.logger.error(
        'Failed to notify workflow service of pharmacy order update',
        error as Error,
      );
    }
  }
}
