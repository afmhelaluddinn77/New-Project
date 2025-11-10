import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Prisma, PrescriptionStatus } from '@prisma/client';

@Injectable()
export class PrescriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePrescriptionDto, userId: string) {
    const prescription = await this.prisma.prescription.create({
      data: {
        ...data,
        status: PrescriptionStatus.ACTIVE,
        prescribedDate: new Date(),
        prescribedBy: userId,
      },
      include: this.baseInclude,
    });

    await this.createAuditLog('CREATE', prescription.id, userId, null, prescription);
    return prescription;
  }

  async findAll(skip = 0, take = 20) {
    return this.prisma.prescription.findMany({
      skip,
      take,
      orderBy: { prescribedDate: 'desc' },
      include: this.baseInclude,
    });
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: this.baseInclude,
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return prescription;
  }

  async findByEncounter(encounterId: string) {
    return this.prisma.prescription.findMany({
      where: { encounterId },
      orderBy: { prescribedDate: 'desc' },
      include: this.baseInclude,
    });
  }

  async update(id: string, data: UpdatePrescriptionDto, userId: string) {
    const existing = await this.findOne(id);

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: {
        ...data,
        dispensedDate: data.dispensedDate ?? existing.dispensedDate,
        dispensedBy: data.dispensedBy ?? existing.dispensedBy,
        pharmacyId: data.pharmacyId ?? existing.pharmacyId,
      },
      include: this.baseInclude,
    });

    await this.createAuditLog('UPDATE', id, userId, existing, updated);
    return updated;
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOne(id);

    const cancelled = await this.prisma.prescription.update({
      where: { id },
      data: {
        status: PrescriptionStatus.CANCELLED,
      },
      include: this.baseInclude,
    });

    await this.createAuditLog('DELETE', id, userId, existing, cancelled);
    return cancelled;
  }

  async dispense(id: string, dispenseData: any, userId: string) {
    const existing = await this.findOne(id);

    const dispensed = await this.prisma.prescription.update({
      where: { id },
      data: {
        status: PrescriptionStatus.COMPLETED,
        dispensedDate: dispenseData?.dispensedDate ? new Date(dispenseData.dispensedDate) : new Date(),
        dispensedBy: userId,
        pharmacyId: dispenseData?.pharmacyId ?? existing.pharmacyId,
      },
      include: this.baseInclude,
    });

    await this.createAuditLog('UPDATE', id, userId, existing, dispensed);
    return dispensed;
  }

  async checkInteractions(id: string, medications: Array<{ genericName?: string; rxNormCode?: string }>) {
    // TODO: integrate with external drug interaction service (e.g., RxNav)
    const prescription = await this.findOne(id);
    const interactions = medications.map((item) => ({
      with: item.genericName ?? item.rxNormCode ?? 'Unknown medication',
      severity: 'low',
      recommendation: 'Monitor patient for adverse effects.',
    }));

    return {
      prescriptionId: prescription.id,
      checkedAt: new Date().toISOString(),
      interactions,
    };
  }

  private async createAuditLog(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    resourceId: string,
    userId: string,
    oldValue: any,
    newValue: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        resourceType: 'Prescription',
        resourceId,
        userId,
        userRole: 'PROVIDER', // TODO: extract from JWT once available
        oldValue,
        newValue,
      },
    });
  }

  private get baseInclude(): Prisma.PrescriptionInclude {
    return {
      encounter: {
        select: {
          id: true,
          patientId: true,
          providerId: true,
          encounterNumber: true,
        },
      },
    };
  }
}
