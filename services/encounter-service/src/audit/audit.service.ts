import { Injectable } from "@nestjs/common";
import { AuditAction, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { userId?: string; action?: string; date?: string }) {
    const { userId, action, date } = params;
    const where: Prisma.AuditLogWhereInput = {};

    if (userId) {
      where.userId = { contains: userId, mode: "insensitive" };
    }

    if (action && action !== "ALL") {
      where.action = action as AuditAction;
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.timestamp = {
        gte: start,
        lte: end,
      };
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: 50,
    });
  }
}
