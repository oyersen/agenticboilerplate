import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { PaginationQueryDto } from '../dto/pagination.dto';
import { PaginatedResult } from '../types/common.types';

export interface CreateAuditLogParams {
  userId?: string;
  username?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(params: CreateAuditLogParams): Promise<AuditLog> {
    try {
      const entry = this.auditRepository.create(params);
      const saved = await this.auditRepository.save(entry);
      return saved;
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${(err as Error).message}`, (err as Error).stack);
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<AuditLog>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.auditRepository.findAndCount({
      order: { createdAt: query.order ?? 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
