import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface KeycloakUser {
  sub: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): KeycloakUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: KeycloakUser }>();
    return request.user;
  },
);
