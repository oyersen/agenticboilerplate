import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, KeycloakUser } from '../auth/decorators/current-user.decorator';
import { AuditLogService } from '../audit/audit-log.service';
import { EventsGateway } from '../events/events.gateway';

@ApiTags('System Settings')
@Controller('settings')
export class SystemSettingsController {
  constructor(
    private readonly settingsService: SystemSettingsService,
    private readonly auditLogService: AuditLogService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get all public system settings' })
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get()
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get all system settings (Admin only)' })
  getAllSettings() {
    return this.settingsService.getAll();
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create or update system setting (Admin only)' })
  async upsertSetting(
    @Body() dto: UpsertSettingDto,
    @CurrentUser() user?: KeycloakUser,
  ) {
    const saved = await this.settingsService.upsert(dto);

    // 1. Audit trail
    await this.auditLogService.log({
      userId: user?.sub,
      username: user?.preferred_username || user?.email,
      action: 'UPSERT_SETTING',
      resource: 'SYSTEM_SETTING',
      resourceId: dto.key,
      newValues: { value: dto.value, type: dto.type, isPublic: dto.isPublic },
    });

    // 2. Real-time broadcast
    this.eventsGateway.broadcastEvent('ENTITY_UPDATED', saved, 'settings');

    return saved;
  }
}
