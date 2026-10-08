import { BaseEntity } from './common';

export interface FeatureFlag extends BaseEntity {
  key: string;
  isEnabled: boolean;
  description?: string;
  allowedRoles?: string[];
}

export type ActiveFeaturesMap = Record<string, boolean>;
