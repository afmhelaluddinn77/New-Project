import { Injectable } from "@nestjs/common";
import {
  AppealStatus,
  Denial,
  DenialCategory,
  DenialResponsibility,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateDenialDto {
  claimId: string;
  denialDate: Date;
  denialCode: string;
  denialReason: string;
  category: DenialCategory;
  rootCause?: string;
  responsibility: DenialResponsibility;
  deniedAmount: number;
  isAppealable?: boolean;
  appealDeadline?: Date;
}

export interface UpdateDenialDto {
  category?: DenialCategory;
  rootCause?: string;
  responsibility?: DenialResponsibility;
  appealStatus?: AppealStatus;
  assignedTo?: string;
  priority?: string;
  resolutionNotes?: string;
}

export interface DenialFilters {
  category?: DenialCategory;
  responsibility?: DenialResponsibility;
  appealStatus?: AppealStatus;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isResolved?: boolean;
  claimStatus?: string;
}

@Injectable()
export class DenialService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new denial record
   */
  async createDenial(dto: CreateDenialDto, userId: string): Promise<Denial> {
    const denial = await this.prisma.denial.create({
      data: {
        ...dto,
        appealStatus: dto.isAppealable ? "NOT_APPEALED" : undefined,
      },
      include: {
        claim: true,
      },
    });

    // Update claim status
    await this.prisma.claim.update({
      where: { id: dto.claimId },
      data: {
        status: "DENIED",
        submissionStatus: "REJECTED",
      },
    });

    // Create status history
    await this.prisma.claimStatusHistory.create({
      data: {
        claimId: dto.claimId,
        fromStatus: "SUBMITTED",
        toStatus: "DENIED",
        changedBy: userId,
        reason: dto.denialReason,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "CREATE_DENIAL",
        resourceType: "Denial",
        resourceId: denial.id,
        metadata: { claimId: dto.claimId, reason: dto.denialReason },
        success: true,
      },
    });

    return denial;
  }

  /**
   * Get denials with filtering and categorization
   */
  async getDenials(filters: DenialFilters = {}): Promise<any[]> {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.responsibility) {
      where.responsibility = filters.responsibility;
    }

    if (filters.appealStatus) {
      where.appealStatus = filters.appealStatus;
    }

    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters.isResolved !== undefined) {
      where.resolvedAt = filters.isResolved ? { not: null } : null;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.denialDate = {};
      if (filters.dateFrom) {
        where.denialDate.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.denialDate.lte = filters.dateTo;
      }
    }

    return this.prisma.denial.findMany({
      where,
      include: {
        claim: {
          select: {
            claimNumber: true,
            patientName: true,
            totalCharges: true,
            payer: {
              select: {
                name: true,
              },
            },
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        actions: {
          orderBy: { actionDate: "desc" },
          take: 1,
        },
      },
      orderBy: [
        { priority: "desc" },
        { appealDeadline: "asc" },
        { denialDate: "desc" },
      ],
    });
  }

  /**
   * Categorize denial for analytics and root cause analysis
   */
  async categorizeDenial(
    denialId: string,
    category: DenialCategory,
    rootCause: string,
    userId: string
  ): Promise<Denial> {
    const denial = await this.prisma.denial.update({
      where: { id: denialId },
      data: {
        category,
        rootCause,
      },
    });

    // Add note about categorization
    await this.prisma.denialNote.create({
      data: {
        denialId,
        note: `Categorized as ${category} - Root cause: ${rootCause}`,
        createdBy: userId,
      },
    });

    return denial;
  }

  /**
   * Assign denial to staff member for resolution
   */
  async assignDenial(
    denialId: string,
    assignedTo: string,
    priority: string,
    userId: string
  ): Promise<Denial> {
    const denial = await this.prisma.denial.update({
      where: { id: denialId },
      data: {
        assignedTo,
        assignedAt: new Date(),
        priority,
      },
    });

    // Add action record
    await this.prisma.denialAction.create({
      data: {
        denialId,
        action: "assigned",
        actionDate: new Date(),
        actionBy: userId,
        notes: `Assigned to ${assignedTo} with ${priority} priority`,
      },
    });

    return denial;
  }

  /**
   * Initiate appeal process
   */
  async initiateAppeal(
    denialId: string,
    appealNotes: string,
    userId: string
  ): Promise<Denial> {
    const denial = await this.prisma.denial.update({
      where: { id: denialId },
      data: {
        appealStatus: "PREPARING",
        appealedAt: new Date(),
        appealedBy: userId,
      },
    });

    // Add appeal action
    await this.prisma.denialAction.create({
      data: {
        denialId,
        action: "appealed",
        actionDate: new Date(),
        actionBy: userId,
        notes: appealNotes,
      },
    });

    // Update claim status
    await this.prisma.claim.update({
      where: { id: denial.claimId },
      data: { status: "APPEALED" },
    });

    return denial;
  }

  /**
   * Submit appeal to payer
   */
  async submitAppeal(denialId: string, userId: string): Promise<Denial> {
    const denial = await this.prisma.denial.update({
      where: { id: denialId },
      data: {
        appealStatus: "SUBMITTED",
      },
    });

    await this.prisma.denialAction.create({
      data: {
        denialId,
        action: "appeal_submitted",
        actionDate: new Date(),
        actionBy: userId,
      },
    });

    return denial;
  }

  /**
   * Update appeal status
   */
  async updateAppealStatus(
    denialId: string,
    status: AppealStatus,
    notes: string,
    userId: string
  ): Promise<Denial> {
    const denial = await this.prisma.denial.update({
      where: { id: denialId },
      data: {
        appealStatus: status,
      },
    });

    if (status === "APPROVED") {
      // Update claim status
      await this.prisma.claim.update({
        where: { id: denial.claimId },
        data: { status: "APPROVED" },
      });

      // Update recovered amount
      await this.prisma.denial.update({
        where: { id: denialId },
        data: {
          recoveredAmount: denial.deniedAmount,
          resolvedAt: new Date(),
          resolvedBy: userId,
        },
      });
    }

    await this.prisma.denialNote.create({
      data: {
        denialId,
        note: `Appeal status updated to ${status}: ${notes}`,
        createdBy: userId,
      },
    });

    return denial;
  }

  /**
   * Resolve denial
   */
  async resolveDenial(
    denialId: string,
    resolutionNotes: string,
    recoveredAmount: number,
    userId: string
  ): Promise<Denial> {
    const denial = await this.prisma.denial.update({
      where: { id: denialId },
      data: {
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolutionNotes,
        recoveredAmount,
      },
    });

    await this.prisma.denialAction.create({
      data: {
        denialId,
        action: "resolved",
        actionDate: new Date(),
        actionBy: userId,
        notes: resolutionNotes,
      },
    });

    return denial;
  }

  /**
   * Get denial analytics by category
   */
  async getDenialAnalytics(dateFrom: Date, dateTo: Date) {
    const denials = await this.prisma.denial.groupBy({
      by: ["category", "responsibility"],
      where: {
        denialDate: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      _count: true,
      _sum: {
        deniedAmount: true,
        recoveredAmount: true,
      },
    });

    const topReasons = await this.prisma.denial.groupBy({
      by: ["denialReason"],
      where: {
        denialDate: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      _count: true,
      _sum: {
        deniedAmount: true,
      },
      orderBy: {
        _count: {
          denialReason: "desc",
        },
      },
      take: 10,
    });

    return {
      byCategory: denials,
      topReasons,
      totalDenials: denials.reduce((sum, d) => sum + d._count, 0),
      totalDeniedAmount: denials.reduce(
        (sum, d) => sum + (d._sum.deniedAmount || 0),
        0
      ),
      totalRecoveredAmount: denials.reduce(
        (sum, d) => sum + (d._sum.recoveredAmount || 0),
        0
      ),
    };
  }

  /**
   * Add note to denial
   */
  async addDenialNote(denialId: string, note: string, userId: string) {
    return this.prisma.denialNote.create({
      data: {
        denialId,
        note,
        createdBy: userId,
      },
    });
  }
}
