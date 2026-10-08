import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_FEATURE_KEY } from '../decorators/require-feature.decorator';
import { FeaturesService } from '../features.service';
import { KeycloakUser } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featuresService: FeaturesService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<string | undefined>(
      REQUIRE_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: KeycloakUser }>();
    const userRoles = request.user?.realm_access?.roles ?? [];

    const isAllowed = this.featuresService.isEnabled(requiredFeature, userRoles);

    if (!isAllowed) {
      throw new ForbiddenException(
        `Feature '${requiredFeature}' is currently disabled or restricted by system administrator.`,
      );
    }

    return true;
  }
}
