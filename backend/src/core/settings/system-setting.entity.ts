import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

export enum SettingValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

@Entity('system_settings')
export class SystemSetting extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @Column({
    type: 'enum',
    enum: SettingValueType,
    default: SettingValueType.STRING,
  })
  type!: SettingValueType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;
}
