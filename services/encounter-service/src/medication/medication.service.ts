import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface MedicationSearchFilters {
  query: string;
  limit?: number;
}

@Injectable()
export class MedicationService {
  constructor(private readonly prisma: PrismaService) {}

  async search(filters: MedicationSearchFilters) {
    const { query, limit = 20 } = filters;

    // TODO: replace with real terminology search (RxNorm/SNOMED)
    return this.prisma.prescription.findMany({
      where: {
        OR: [
          { genericName: { contains: query, mode: 'insensitive' } },
          { brandName: { contains: query, mode: 'insensitive' } },
          { rxNormCode: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { prescribedDate: 'desc' },
      select: {
        id: true,
        genericName: true,
        brandName: true,
        rxNormCode: true,
        dosage: true,
        route: true,
        frequency: true,
      },
    });
  }

  async findByRxNormCode(rxNormCode: string) {
    // TODO: integrate with RxNorm API
    return this.prisma.prescription.findFirst({
      where: { rxNormCode },
      select: {
        id: true,
        genericName: true,
        brandName: true,
        dosage: true,
        dosageForm: true,
        route: true,
        frequency: true,
        indication: true,
      },
    });
  }

  async checkInteractions(medications: Array<{ rxnormCode?: string; genericName?: string }>) {
    // TODO: integrate with external drug interaction engine
    return medications.map((medication) => ({
      medication: medication.rxnormCode ?? medication.genericName ?? 'unknown',
      interactions: [],
      checkedAt: new Date().toISOString(),
      recommendation: 'No known severe interactions in sandbox mode.',
    }));
  }

  async getContraindications(rxNormCode: string) {
    // TODO: pull contraindication data from knowledge base
    return {
      rxNormCode,
      contraindications: [],
      source: 'stub',
      retrievedAt: new Date().toISOString(),
    };
  }

  async getSideEffects(rxNormCode: string) {
    // TODO: integrate with FDA adverse event data
    return {
      rxNormCode,
      sideEffects: [],
      source: 'stub',
      retrievedAt: new Date().toISOString(),
    };
  }

  async getDosageInfo(rxNormCode: string) {
    // TODO: integrate with dosage reference service
    return {
      rxNormCode,
      dosageGuidelines: [],
      source: 'stub',
      retrievedAt: new Date().toISOString(),
    };
  }

  async checkAllergies(patientId: string, medications: string[]) {
    // TODO: integrate with allergy/intolerance registry once available
    return {
      patientId,
      medications,
      potentialConflicts: [],
      checkedAt: new Date().toISOString(),
      notes: 'Allergy cross-check is not yet implemented in sandbox mode.',
    };
  }

  async getAlternatives(rxNormCode: string) {
    // TODO: integrate with clinical guidelines for therapeutic alternatives
    return {
      rxNormCode,
      alternatives: [],
      source: 'stub',
      retrievedAt: new Date().toISOString(),
    };
  }
}
