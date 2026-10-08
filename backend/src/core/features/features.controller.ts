import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FeaturesService } from './features.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
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
  constructor(private readonly featuresService: FeaturesService) {}

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
  updateFlag(@Body() dto: UpdateFeatureFlagDto) {
    return this.featuresService.setFlag(
      dto.key,
      dto.isEnabled,
      dto.description,
      dto.allowedRoles,
    );
  }
}
