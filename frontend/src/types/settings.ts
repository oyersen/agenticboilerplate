import { BaseEntity } from './common';

export type SettingValueType = 'string' | 'number' | 'boolean' | 'json';

export interface SystemSetting extends BaseEntity {
  key: string;
  value: string;
  type: SettingValueType;
  description?: string;
  isPublic: boolean;
}

export type PublicSettingsMap = Record<string, string>;
