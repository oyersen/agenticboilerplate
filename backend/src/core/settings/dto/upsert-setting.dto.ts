import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SettingValueType } from '../system-setting.entity';

export class UpsertSettingDto {
  @ApiProperty({ example: 'MAX_UPLOAD_SIZE_MB' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: '50' })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiPropertyOptional({ enum: SettingValueType, default: SettingValueType.STRING })
  @IsEnum(SettingValueType)
  @IsOptional()
  type?: SettingValueType = SettingValueType.STRING;

  @ApiPropertyOptional({ example: 'Maksimum dosya yükleme boyutu (MB)' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;
}
