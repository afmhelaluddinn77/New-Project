import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Payer, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface CreatePayerDto {
  name: string;
  payerId: string;
  taxId?: string;
  npi?: string;
  contactPerson?: string;
  contactTitle?: string;
  phone: string;
  fax?: string;
  email?: string;
  website?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  claimSubmissionMethod: string;
  clearinghouseId?: string;
  ediReceiverId?: string;
  submissionUrl?: string;
  remittanceMethod: string;
  remittanceEmail?: string;
  eftEnrolled?: boolean;
  timeLimitDays?: number;
  requiresAuth?: boolean;
  requiresReferral?: boolean;
  acceptsSecondary?: boolean;
}

export interface UpdatePayerDto extends Partial<CreatePayerDto> {}

@Injectable()
export class PayerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new payer with complete information
   */
  async createPayer(dto: CreatePayerDto, userId: string): Promise<Payer> {
    // Check if payer ID already exists
    const existing = await this.prisma.payer.findUnique({
      where: { payerId: dto.payerId },
    });

    if (existing) {
      throw new BadRequestException(
        `Payer with ID ${dto.payerId} already exists`
      );
    }

    const payer = await this.prisma.payer.create({
      data: {
        ...dto,
        createdBy: userId,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "CREATE_PAYER",
        resourceType: "Payer",
        resourceId: payer.id,
        success: true,
      },
    });

    return payer;
  }

  /**
   * Get all payers with optional filtering
   */
  async getPayers(filters?: {
    isActive?: boolean;
    claimSubmissionMethod?: string;
    searchTerm?: string;
  }): Promise<Payer[]> {
    const where: Prisma.PayerWhereInput = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.claimSubmissionMethod) {
      where.claimSubmissionMethod = filters.claimSubmissionMethod;
    }

    if (filters?.searchTerm) {
      where.OR = [
        { name: { contains: filters.searchTerm, mode: "insensitive" } },
        { payerId: { contains: filters.searchTerm, mode: "insensitive" } },
        {
          contactPerson: { contains: filters.searchTerm, mode: "insensitive" },
        },
      ];
    }

    return this.prisma.payer.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            claims: true,
            payments: true,
          },
        },
      },
    });
  }

  /**
   * Get a single payer by ID
   */
  async getPayerById(id: string): Promise<Payer> {
    const payer = await this.prisma.payer.findUnique({
      where: { id },
      include: {
        contracts: true,
        feeSchedules: {
          where: { isActive: true },
        },
        denialReasons: {
          where: { isActive: true },
        },
      },
    });

    if (!payer) {
      throw new NotFoundException(`Payer with ID ${id} not found`);
    }

    return payer;
  }

  /**
   * Update payer information
   */
  async updatePayer(
    id: string,
    dto: UpdatePayerDto,
    userId: string
  ): Promise<Payer> {
    const existing = await this.getPayerById(id);

    const updated = await this.prisma.payer.update({
      where: { id },
      data: dto,
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "UPDATE_PAYER",
        resourceType: "Payer",
        resourceId: id,
        metadata: { changes: dto },
        success: true,
      },
    });

    return updated;
  }

  /**
   * Manage payer contracts
   */
  async addPayerContract(
    payerId: string,
    contract: {
      contractNumber: string;
      startDate: Date;
      endDate?: Date;
      terms?: string;
    }
  ) {
    return this.prisma.payerContract.create({
      data: {
        payerId,
        ...contract,
      },
    });
  }

  /**
   * Manage fee schedules
   */
  async createFeeSchedule(
    payerId: string,
    schedule: {
      name: string;
      effectiveDate: Date;
      expirationDate?: Date;
      fees: Array<{
        procedureCode: string;
        modifier?: string;
        allowedAmount: number;
      }>;
    }
  ) {
    const { fees, ...scheduleData } = schedule;

    return this.prisma.feeSchedule.create({
      data: {
        payerId,
        ...scheduleData,
        fees: {
          create: fees,
        },
      },
      include: {
        fees: true,
      },
    });
  }

  /**
   * Get payer statistics
   */
  async getPayerStatistics(payerId: string) {
    const [claims, payments, denials] = await Promise.all([
      this.prisma.claim.aggregate({
        where: { payerId },
        _sum: {
          totalCharges: true,
          paidAmount: true,
        },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { payerId },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      }),
      this.prisma.denial.count({
        where: {
          claim: { payerId },
        },
      }),
    ]);

    return {
      totalClaims: claims._count,
      totalCharges: claims._sum.totalCharges || 0,
      totalPaid: claims._sum.paidAmount || 0,
      totalPayments: payments._count,
      totalPaymentAmount: payments._sum.totalAmount || 0,
      totalDenials: denials,
      denialRate: claims._count > 0 ? (denials / claims._count) * 100 : 0,
    };
  }

  /**
   * Manage denial reasons for a payer
   */
  async addDenialReason(
    payerId: string,
    reason: {
      code: string;
      description: string;
      category: string;
    }
  ) {
    return this.prisma.denialReason.create({
      data: {
        payerId,
        ...reason,
      },
    });
  }
}
