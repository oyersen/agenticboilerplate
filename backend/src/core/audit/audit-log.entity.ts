import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  username?: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string; // e.g. 'CREATE', 'UPDATE', 'DELETE', 'TOGGLE'

  @Index()
  @Column({ type: 'varchar', length: 100 })
  resource!: string; // e.g. 'SYSTEM_SETTING', 'FEATURE_FLAG', 'PRODUCT'

  @Column({ type: 'varchar', length: 100, nullable: true })
  resourceId?: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  newValues?: Record<string, unknown>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;
}
