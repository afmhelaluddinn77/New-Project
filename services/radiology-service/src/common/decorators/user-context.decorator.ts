import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestUserContext {
  userId: string | null;
  role: string | null;
  portal: string | null;
}

export const UserContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUserContext => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const headers = request.headers ?? {};

    const normalize = (value: string | string[] | undefined): string | null => {
      if (Array.isArray(value)) {
        return value[0] ?? null;
      }
      return value ?? null;
    };

    return {
      userId: normalize(headers['x-user-id']),
      role: normalize(headers['x-user-role']),
      portal: normalize(headers['x-portal']),
    };
  },
);
