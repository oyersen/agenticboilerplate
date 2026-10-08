import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

@Entity('feature_flags')
export class FeatureFlag extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  key!: string;

  @Column({ type: 'boolean', default: true })
  isEnabled!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'simple-array', nullable: true })
  allowedRoles?: string[];
}
