import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { Encounter, Prisma } from '@prisma/client';

@Injectable()
export class EncounterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEncounterDto: CreateEncounterDto): Promise<Encounter> {
    // Generate encounter number
    const encounterNumber = await this.generateEncounterNumber();

    const encounter = await this.prisma.encounter.create({
      data: {
        ...createEncounterDto,
        encounterNumber,
        updatedBy: createEncounterDto.createdBy,
      },
      include: {
        investigations: true,
        prescriptions: true,
        encounterNotes: true,
      },
    });

    // Create audit log
    await this.createAuditLog({
      action: 'CREATE',
      resourceType: 'Encounter',
      resourceId: encounter.id,
      userId: createEncounterDto.createdBy,
      newValue: encounter,
    });

    return encounter;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EncounterWhereInput;
    orderBy?: Prisma.EncounterOrderByWithRelationInput;
  }): Promise<Encounter[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.encounter.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        investigations: true,
        prescriptions: true,
        encounterNotes: true,
      },
    });
  }

  async findOne(id: string): Promise<Encounter> {
    const encounter = await this.prisma.encounter.findUnique({
      where: { id },
      include: {
        investigations: true,
        prescriptions: true,
        encounterNotes: true,
        auditLogs: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    if (!encounter) {
      throw new NotFoundException(`Encounter with ID ${id} not found`);
    }

    return encounter;
  }

  async findByPatient(patientId: string): Promise<Encounter[]> {
    return this.prisma.encounter.findMany({
      where: { patientId },
      orderBy: { encounterDate: 'desc' },
      include: {
        investigations: true,
        prescriptions: true,
        encounterNotes: true,
      },
    });
  }

  async update(id: string, updateData: Partial<CreateEncounterDto>, userId: string): Promise<Encounter> {
    const existingEncounter = await this.findOne(id);

    const updated = await this.prisma.encounter.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: userId,
      },
      include: {
        investigations: true,
        prescriptions: true,
        encounterNotes: true,
      },
    });

    // Create audit log
    await this.createAuditLog({
      action: 'UPDATE',
      resourceType: 'Encounter',
      resourceId: id,
      userId,
      oldValue: existingEncounter,
      newValue: updated,
    });

    return updated;
  }

  async remove(id: string, userId: string): Promise<Encounter> {
    const encounter = await this.findOne(id);

    const deleted = await this.prisma.encounter.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    // Create audit log
    await this.createAuditLog({
      action: 'DELETE',
      resourceType: 'Encounter',
      resourceId: id,
      userId,
      oldValue: encounter,
    });

    return deleted;
  }

  async finalize(id: string, userId: string): Promise<Encounter> {
    return this.prisma.encounter.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        updatedBy: userId,
      },
    });
  }

  private async generateEncounterNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Count encounters for this month
    const count = await this.prisma.encounter.count({
      where: {
        encounterDate: {
          gte: new Date(year, date.getMonth(), 1),
          lt: new Date(year, date.getMonth() + 1, 1),
        },
      },
    });

    const sequence = String(count + 1).padStart(5, '0');
    return `ENC-${year}${month}-${sequence}`;
  }

  private async createAuditLog(data: {
    action: string;
    resourceType: string;
    resourceId: string;
    userId: string;
    oldValue?: any;
    newValue?: any;
  }) {
    await this.prisma.auditLog.create({
      data: {
        action: data.action as any,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        userId: data.userId,
        userRole: 'PROVIDER', // TODO: Get from JWT token
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
      },
    });
  }
}
