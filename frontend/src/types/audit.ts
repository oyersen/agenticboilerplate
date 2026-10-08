import { BaseEntity } from './common';

export interface AuditLog extends BaseEntity {
  userId?: string;
  username?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}
