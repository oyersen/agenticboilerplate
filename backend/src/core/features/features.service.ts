import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from './feature-flag.entity';

@Injectable()
export class FeaturesService implements OnModuleInit {
  private readonly logger = new Logger(FeaturesService.name);
  private readonly flagsCache = new Map<string, FeatureFlag>();

  constructor(
    @InjectRepository(FeatureFlag)
    private readonly flagRepository: Repository<FeatureFlag>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refreshCache();
  }

  async refreshCache(): Promise<void> {
    const flags = await this.flagRepository.find();
    this.flagsCache.clear();
    for (const flag of flags) {
      this.flagsCache.set(flag.key, flag);
    }
    this.logger.log(`Features cache loaded with ${flags.length} flags.`);
  }

  isEnabled(key: string, userRoles?: string[]): boolean {
    const flag = this.flagsCache.get(key);
    // If not registered in database, allow by default or keep default open
    if (!flag) return true;
    if (!flag.isEnabled) return false;

    // If allowedRoles is specified, check user's roles
    if (flag.allowedRoles && flag.allowedRoles.length > 0) {
      if (!userRoles || userRoles.length === 0) return false;
      return flag.allowedRoles.some((role) => userRoles.includes(role));
    }

    return true;
  }

  async getAll(): Promise<FeatureFlag[]> {
    return this.flagRepository.find();
  }

  async getActiveMap(): Promise<Record<string, boolean>> {
    const flags = await this.flagRepository.find();
    const map: Record<string, boolean> = {};
    for (const f of flags) {
      map[f.key] = f.isEnabled;
    }
    return map;
  }

  async setFlag(
    key: string,
    isEnabled: boolean,
    description?: string,
    allowedRoles?: string[],
  ): Promise<FeatureFlag> {
    let flag = await this.flagRepository.findOne({ where: { key } });
    if (!flag) {
      flag = this.flagRepository.create({
        key,
        isEnabled,
        description,
        allowedRoles,
      });
    } else {
      flag.isEnabled = isEnabled;
      if (description !== undefined) flag.description = description;
      if (allowedRoles !== undefined) flag.allowedRoles = allowedRoles;
    }

    const saved = await this.flagRepository.save(flag);
    this.flagsCache.set(saved.key, saved);
    return saved;
  }
}
