import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestigationDto } from './dto/create-investigation.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { InvestigationStatus, Priority } from '@prisma/client';

@Injectable()
export class InvestigationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInvestigationDto, userId: string) {
    const investigation = await this.prisma.investigation.create({
      data: {
        ...data,
        orderedBy: userId,
        status: InvestigationStatus.ORDERED,
        orderedDate: new Date(),
        priority: data.priority ?? Priority.ROUTINE,
      },
    });

    await this.createAuditLog('CREATE', investigation.id, userId, null, investigation);
    return investigation;
  }

  async findAll(skip = 0, take = 20) {
    return this.prisma.investigation.findMany({
      skip,
      take,
      orderBy: { orderedDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const investigation = await this.prisma.investigation.findUnique({
      where: { id },
    });

    if (!investigation) {
      throw new NotFoundException(`Investigation with ID ${id} not found`);
    }

    return investigation;
  }

  async findByEncounter(encounterId: string) {
    return this.prisma.investigation.findMany({
      where: { encounterId },
      orderBy: { orderedDate: 'desc' },
    });
  }

  async update(id: string, data: UpdateInvestigationDto, userId: string) {
    const existing = await this.findOne(id);

    const updated = await this.prisma.investigation.update({
      where: { id },
      data: {
        ...data,
        resultDate: data.resultValue ? new Date() : existing.resultDate,
      },
    });

    await this.createAuditLog('UPDATE', id, userId, existing, updated);
    return updated;
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOne(id);

    const cancelled = await this.prisma.investigation.update({
      where: { id },
      data: {
        status: InvestigationStatus.CANCELLED,
      },
    });

    await this.createAuditLog('DELETE', id, userId, existing, cancelled);
    return cancelled;
  }

  async addResults(id: string, resultData: any, userId: string) {
    const existing = await this.findOne(id);

    const completed = await this.prisma.investigation.update({
      where: { id },
      data: {
        status: InvestigationStatus.COMPLETED,
        resultDate: resultData?.resultDate ? new Date(resultData.resultDate) : new Date(),
        resultValue: resultData?.resultValue ?? existing.resultValue,
        resultUnit: resultData?.resultUnit ?? existing.resultUnit,
        referenceRange: resultData?.referenceRange ?? existing.referenceRange,
        interpretation: resultData?.interpretation ?? existing.interpretation,
        resultNotes: resultData?.resultNotes ?? existing.resultNotes,
      },
    });

    await this.createAuditLog('UPDATE', id, userId, existing, completed);
    return completed;
  }

  async findByLoincCode(loincCode: string) {
    return this.prisma.investigation.findMany({
      where: { loincCode },
    });
  }

  async findBySnomedCode(snomedCode: string) {
    return this.prisma.investigation.findMany({
      where: { snomedCode },
    });
  }

  private async createAuditLog(
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    resourceId: string,
    userId: string,
    oldValue: any,
    newValue: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        resourceType: 'Investigation',
        resourceId,
        userId,
        userRole: 'PROVIDER',
        oldValue,
        newValue,
      },
    });
  }
}
