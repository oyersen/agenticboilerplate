import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting, SettingValueType } from './system-setting.entity';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@Injectable()
export class SystemSettingsService implements OnModuleInit {
  private readonly logger = new Logger(SystemSettingsService.name);
  private readonly cache = new Map<string, string>();

  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingRepository: Repository<SystemSetting>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refreshCache();
  }

  async refreshCache(): Promise<void> {
    const all = await this.settingRepository.find();
    this.cache.clear();
    for (const setting of all) {
      this.cache.set(setting.key, setting.value);
    }
    this.logger.log(`SystemSettings cache loaded with ${all.length} entries.`);
  }

  get<T = string>(key: string, defaultValue?: T): T {
    const val = this.cache.get(key);
    if (val === undefined) {
      if (defaultValue !== undefined) return defaultValue;
      throw new NotFoundException(`System setting '${key}' not found.`);
    }
    return val as unknown as T;
  }

  getNumber(key: string, defaultValue?: number): number {
    const val = this.cache.get(key);
    if (val === undefined) {
      if (defaultValue !== undefined) return defaultValue;
      throw new NotFoundException(`System setting '${key}' not found.`);
    }
    return Number(val);
  }

  getBoolean(key: string, defaultValue?: boolean): boolean {
    const val = this.cache.get(key);
    if (val === undefined) {
      if (defaultValue !== undefined) return defaultValue;
      throw new NotFoundException(`System setting '${key}' not found.`);
    }
    return val === 'true' || val === '1';
  }

  async getAll(): Promise<SystemSetting[]> {
    return this.settingRepository.find();
  }

  async getPublicSettings(): Promise<Record<string, string>> {
    const publicSettings = await this.settingRepository.find({
      where: { isPublic: true },
    });
    const result: Record<string, string> = {};
    for (const s of publicSettings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async upsert(dto: UpsertSettingDto): Promise<SystemSetting> {
    let setting = await this.settingRepository.findOne({
      where: { key: dto.key },
    });

    if (!setting) {
      setting = this.settingRepository.create(dto);
    } else {
      setting.value = dto.value;
      if (dto.type) setting.type = dto.type;
      if (dto.description !== undefined) setting.description = dto.description;
      if (dto.isPublic !== undefined) setting.isPublic = dto.isPublic;
    }

    const saved = await this.settingRepository.save(setting);
    this.cache.set(saved.key, saved.value);
    return saved;
  }
}
