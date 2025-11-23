import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Payment, PaymentMethod, PostingStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface CreatePaymentDto {
  payerId?: string;
  patientId?: string;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  totalAmount: number;
  batchNumber?: string;
}

export interface PaymentAllocationDto {
  claimId: string;
  allocatedAmount: number;
  notes?: string;
}

export interface PaymentFilters {
  paymentMethod?: PaymentMethod;
  postingStatus?: PostingStatus;
  dateFrom?: Date;
  dateTo?: Date;
  payerId?: string;
  searchTerm?: string;
}

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new payment entry
   */
  async createPayment(dto: CreatePaymentDto, userId: string): Promise<Payment> {
    // Generate unique payment number
    const count = await this.prisma.payment.count();
    const paymentNumber = `PMT-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

    const payment = await this.prisma.payment.create({
      data: {
        ...dto,
        paymentNumber,
        postedBy: userId,
        unappliedAmount: dto.totalAmount,
        postingStatus: "PENDING",
      },
    });

    // If from payer, try AI matching
    if (dto.payerId) {
      await this.performAiMatching(payment.id);
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "CREATE_PAYMENT",
        resourceType: "Payment",
        resourceId: payment.id,
        metadata: { amount: dto.totalAmount, method: dto.paymentMethod },
        success: true,
      },
    });

    return payment;
  }

  /**
   * AI-powered payment matching
   */
  async performAiMatching(paymentId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { payer: true },
    });

    if (!payment || !payment.payerId) return;

    // Find potential matching claims
    const potentialClaims = await this.prisma.claim.findMany({
      where: {
        payerId: payment.payerId,
        status: {
          in: ["SUBMITTED", "ACCEPTED", "IN_REVIEW", "APPROVED"],
        },
        totalCharges: {
          gte: payment.totalAmount * 0.9, // Within 10% of payment amount
          lte: payment.totalAmount * 1.1,
        },
      },
      orderBy: [{ serviceDate: "desc" }, { submittedAt: "desc" }],
      take: 10,
    });

    if (potentialClaims.length > 0) {
      // Calculate match scores
      const matches = potentialClaims
        .map((claim) => {
          let score = 0;

          // Exact amount match
          if (Math.abs(claim.totalCharges - payment.totalAmount) < 0.01) {
            score += 0.5;
          }
          // Close amount match
          else if (
            Math.abs(claim.totalCharges - payment.totalAmount) /
              payment.totalAmount <
            0.05
          ) {
            score += 0.3;
          }

          // Reference number match (if available)
          if (
            payment.referenceNumber &&
            claim.claimNumber.includes(payment.referenceNumber)
          ) {
            score += 0.3;
          }

          // Recent submission
          if (claim.submittedAt) {
            const daysSinceSubmission = Math.floor(
              (new Date().getTime() - claim.submittedAt.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (daysSinceSubmission < 30) {
              score += 0.2;
            }
          }

          return {
            claimId: claim.id,
            claimNumber: claim.claimNumber,
            score,
          };
        })
        .sort((a, b) => b.score - a.score);

      // Update payment with AI matching results
      if (matches.length > 0 && matches[0].score > 0.5) {
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: {
            aiMatchScore: matches[0].score,
            aiMatchedClaims: matches.slice(0, 3).map((m) => m.claimId),
            aiMatchedAt: new Date(),
          },
        });
      }
    }
  }

  /**
   * Post payment to claims
   */
  async postPayment(
    paymentId: string,
    allocations: PaymentAllocationDto[],
    userId: string
  ): Promise<Payment> {
    // Validate payment exists
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    // Validate total allocation doesn't exceed payment amount
    const totalAllocation = allocations.reduce(
      (sum, a) => sum + a.allocatedAmount,
      0
    );
    if (totalAllocation > payment.totalAmount) {
      throw new BadRequestException("Total allocation exceeds payment amount");
    }

    // Create allocations
    for (const allocation of allocations) {
      await this.prisma.paymentAllocation.create({
        data: {
          paymentId,
          claimId: allocation.claimId,
          allocatedAmount: allocation.allocatedAmount,
          allocatedBy: userId,
          notes: allocation.notes,
        },
      });

      // Update claim paid amount
      const claim = await this.prisma.claim.findUnique({
        where: { id: allocation.claimId },
      });

      if (claim) {
        const newPaidAmount =
          (claim.paidAmount || 0) + allocation.allocatedAmount;
        const newStatus =
          newPaidAmount >= claim.totalCharges ? "PAID" : "PARTIALLY_APPROVED";

        await this.prisma.claim.update({
          where: { id: allocation.claimId },
          data: {
            paidAmount: newPaidAmount,
            status: newStatus,
            lastActionDate: new Date(),
            lastActionBy: userId,
          },
        });
      }
    }

    // Update payment status
    const newAppliedAmount = (payment.appliedAmount || 0) + totalAllocation;
    const newUnappliedAmount = payment.totalAmount - newAppliedAmount;
    const newStatus = newUnappliedAmount === 0 ? "POSTED" : "PARTIALLY_POSTED";

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        appliedAmount: newAppliedAmount,
        unappliedAmount: newUnappliedAmount,
        postingStatus: newStatus,
      },
      include: {
        allocations: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "POST_PAYMENT",
        resourceType: "Payment",
        resourceId: paymentId,
        metadata: { allocations, totalAllocated: totalAllocation },
        success: true,
      },
    });

    return updatedPayment;
  }

  /**
   * Get payments with filtering
   */
  async getPayments(filters: PaymentFilters = {}): Promise<Payment[]> {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.postingStatus) {
      where.postingStatus = filters.postingStatus;
    }

    if (filters.payerId) {
      where.payerId = filters.payerId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.paymentDate = {};
      if (filters.dateFrom) {
        where.paymentDate.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.paymentDate.lte = filters.dateTo;
      }
    }

    if (filters.searchTerm) {
      where.OR = [
        {
          paymentNumber: { contains: filters.searchTerm, mode: "insensitive" },
        },
        {
          referenceNumber: {
            contains: filters.searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        payer: {
          select: {
            name: true,
          },
        },
        allocations: {
          include: {
            claim: {
              select: {
                claimNumber: true,
                patientName: true,
              },
            },
          },
        },
      },
      orderBy: [{ postingStatus: "asc" }, { paymentDate: "desc" }],
    });
  }

  /**
   * Get payment details with AI suggestions
   */
  async getPaymentWithSuggestions(paymentId: string): Promise<any> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        payer: true,
        allocations: true,
      },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    // If AI matching was performed, get the suggested claims
    let suggestedClaims = [];
    if (payment.aiMatchedClaims && payment.aiMatchedClaims.length > 0) {
      suggestedClaims = await this.prisma.claim.findMany({
        where: {
          id: { in: payment.aiMatchedClaims },
        },
        select: {
          id: true,
          claimNumber: true,
          patientName: true,
          totalCharges: true,
          paidAmount: true,
          status: true,
        },
      });
    }

    return {
      ...payment,
      suggestedClaims,
    };
  }

  /**
   * Reverse payment posting
   */
  async reversePayment(
    paymentId: string,
    reason: string,
    userId: string
  ): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { allocations: true },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    // Reverse all allocations
    for (const allocation of payment.allocations) {
      // Update claim
      const claim = await this.prisma.claim.findUnique({
        where: { id: allocation.claimId },
      });

      if (claim) {
        await this.prisma.claim.update({
          where: { id: allocation.claimId },
          data: {
            paidAmount: (claim.paidAmount || 0) - allocation.allocatedAmount,
            status: "SUBMITTED",
          },
        });
      }

      // Delete allocation
      await this.prisma.paymentAllocation.delete({
        where: { id: allocation.id },
      });
    }

    // Update payment status
    const reversedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        postingStatus: "REVERSED",
        appliedAmount: 0,
        unappliedAmount: payment.totalAmount,
      },
    });

    // Add adjustment record
    await this.prisma.paymentAdjustment.create({
      data: {
        paymentId,
        adjustmentCode: "REVERSAL",
        adjustmentReason: reason,
        adjustmentAmount: payment.appliedAmount || 0,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "REVERSE_PAYMENT",
        resourceType: "Payment",
        resourceId: paymentId,
        metadata: { reason },
        success: true,
      },
    });

    return reversedPayment;
  }

  /**
   * Get unposted payments summary
   */
  async getUnpostedPaymentsSummary() {
    const unposted = await this.prisma.payment.aggregate({
      where: {
        postingStatus: { in: ["PENDING", "PARTIALLY_POSTED"] },
      },
      _sum: {
        unappliedAmount: true,
      },
      _count: true,
    });

    const byMethod = await this.prisma.payment.groupBy({
      by: ["paymentMethod"],
      where: {
        postingStatus: { in: ["PENDING", "PARTIALLY_POSTED"] },
      },
      _sum: {
        unappliedAmount: true,
      },
      _count: true,
    });

    return {
      totalUnposted: unposted._count,
      totalUnappliedAmount: unposted._sum.unappliedAmount || 0,
      byPaymentMethod: byMethod,
    };
  }
}
