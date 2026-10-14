import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FeaturesService } from './features.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, KeycloakUser } from '../auth/decorators/current-user.decorator';
import { AuditLogService } from '../audit/audit-log.service';
import { EventsGateway } from '../events/events.gateway';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateFeatureFlagDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsBoolean()
  isEnabled!: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  allowedRoles?: string[];
}

@ApiTags('Features')
@Controller('features')
export class FeaturesController {
  constructor(
    private readonly featuresService: FeaturesService,
    private readonly auditLogService: AuditLogService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get active features map for frontend gates' })
  getActiveMap() {
    return this.featuresService.getActiveMap();
  }

  @Get()
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get all feature flags (Admin only)' })
  getAllFlags() {
    return this.featuresService.getAll();
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update or create feature flag (Admin only)' })
  async updateFlag(
    @Body() dto: UpdateFeatureFlagDto,
    @CurrentUser() user?: KeycloakUser,
  ) {
    const saved = await this.featuresService.setFlag(
      dto.key,
      dto.isEnabled,
      dto.description,
      dto.allowedRoles,
    );

    // 1. Audit trail
    await this.auditLogService.log({
      userId: user?.sub,
      username: user?.preferred_username || user?.email,
      action: 'UPDATE_FEATURE_FLAG',
      resource: 'FEATURE_FLAG',
      resourceId: dto.key,
      newValues: {
        isEnabled: dto.isEnabled,
        description: dto.description,
        allowedRoles: dto.allowedRoles,
      },
    });

    // 2. Real-time broadcast
    this.eventsGateway.broadcastEvent('ENTITY_UPDATED', saved, 'features');

    return saved;
  }
}
