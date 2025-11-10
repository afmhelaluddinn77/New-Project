import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    const action = this.getActionFromMethod(method);
    const resourceType = this.getResourceTypeFromUrl(url);

    return next.handle().pipe(
      tap(async (data) => {
        // Only log if we have a user (authenticated request)
        if (user && resourceType) {
          try {
            await this.prisma.auditLog.create({
              data: {
                action: action as any,
                resourceType,
                resourceId: data?.id || 'N/A',
                userId: user.id || user.sub,
                userRole: user.role || 'UNKNOWN',
                userIp: ip || request.connection.remoteAddress,
                userAgent: headers['user-agent'],
                newValue: data,
              },
            });
          } catch (error) {
            // Log error but don't fail the request
            console.error('Audit log error:', error);
          }
        }
      }),
    );
  }

  private getActionFromMethod(method: string): string {
    const actionMap: Record<string, string> = {
      GET: 'READ',
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return actionMap[method] || 'UNKNOWN';
  }

  private getResourceTypeFromUrl(url: string): string | null {
    if (url.includes('/encounters')) return 'Encounter';
    if (url.includes('/investigations')) return 'Investigation';
    if (url.includes('/prescriptions')) return 'Prescription';
    return null;
  }
}
