import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Transaction wrapper for complex operations
  async executeTransaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return this.$transaction(fn);
  }
}
