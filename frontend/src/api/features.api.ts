import api from './client';
import { ActiveFeaturesMap, FeatureFlag } from '../types/features';

export const featuresApi = {
  getActive: (): Promise<ActiveFeaturesMap> =>
    api.get<ActiveFeaturesMap>('/features/active').then((res) => res.data),

  getAll: (): Promise<FeatureFlag[]> =>
    api.get<FeatureFlag[]>('/features').then((res) => res.data),

  update: (data: Partial<FeatureFlag> & { key: string; isEnabled: boolean }): Promise<FeatureFlag> =>
    api.post<FeatureFlag>('/features', data).then((res) => res.data),
};
