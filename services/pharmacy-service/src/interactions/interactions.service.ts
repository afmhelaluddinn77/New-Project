import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  InteractionCheckDto,
  InteractionSummary,
} from './dto/interaction-check.dto';

interface RxNormInteractionResponse {
  fullInteractionTypeGroup?: Array<{
    sourceName: string;
    fullInteractionType: Array<{
      interactionPair: Array<{
        description: string;
        interactionConcept: Array<{
          sourceConceptItem: {
            name: string;
          };
          minConceptItem: {
            rxcui: string;
            name: string;
          };
        }>;
        severity: string;
      }>;
    }>;
  }>;
}

@Injectable()
export class InteractionsService {
  private readonly logger = new Logger(InteractionsService.name);

  constructor(private readonly http: HttpService) {}

  async check(dto: InteractionCheckDto): Promise<InteractionSummary> {
    const combined = [
      ...dto.newMedications,
      ...(dto.currentMedications ?? []),
    ].filter(Boolean);
    const unique = Array.from(new Set(combined));

    if (unique.length < 2) {
      return {
        hasInteractions: false,
        interactions: [],
        hasAllergies: false,
        allergies: [],
      };
    }

    try {
      const url = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${unique.join('+')}`;
      const response = await firstValueFrom(
        this.http.get<RxNormInteractionResponse>(url),
      );
      const interactions = this.transformResponse(response.data);

      return {
        hasInteractions: interactions.length > 0,
        interactions,
        hasAllergies: false,
        allergies: [],
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch interactions from RxNorm',
        error as Error,
      );
      return {
        hasInteractions: false,
        interactions: [],
        hasAllergies: false,
        allergies: [],
      };
    }
  }

  private transformResponse(
    data: RxNormInteractionResponse,
  ): InteractionSummary['interactions'] {
    if (!data.fullInteractionTypeGroup) {
      return [];
    }

    const results: InteractionSummary['interactions'] = [];

    for (const group of data.fullInteractionTypeGroup) {
      for (const interactionType of group.fullInteractionType ?? []) {
        for (const pair of interactionType.interactionPair ?? []) {
          const drugs =
            pair.interactionConcept?.map(
              (concept) => concept.minConceptItem.name,
            ) ?? [];
          results.push({
            drugs,
            severity: pair.severity?.toUpperCase() ?? 'UNKNOWN',
            description: pair.description ?? 'Interaction detected',
            recommendation:
              pair.severity?.toUpperCase() === 'CONTRAINDICATED'
                ? 'Avoid combination; consider alternative therapy.'
                : undefined,
          });
        }
      }
    }

    return results;
  }
}
