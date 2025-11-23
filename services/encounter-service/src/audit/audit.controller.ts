import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuditService } from "./audit.service";

@Controller("encounters/audit")
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getLogs(
    @Query("user") user?: string,
    @Query("action") action?: string,
    @Query("date") date?: string
  ) {
    return this.auditService.findAll({ userId: user, action, date });
  }
}
