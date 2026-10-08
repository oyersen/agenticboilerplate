import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('System Settings')
@Controller('settings')
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

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
  upsertSetting(@Body() dto: UpsertSettingDto) {
    return this.settingsService.upsert(dto);
  }
}
