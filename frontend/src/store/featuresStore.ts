import { create } from 'zustand';
import { ActiveFeaturesMap } from '../types/features';
import { featuresApi } from '../api/features.api';

interface FeaturesState {
  flags: ActiveFeaturesMap;
  isLoading: boolean;
  fetchFeatures: () => Promise<void>;
  isEnabled: (key: string) => boolean;
}

export const useFeaturesStore = create<FeaturesState>((set, get) => ({
  flags: {},
  isLoading: false,
  fetchFeatures: async () => {
    set({ isLoading: true });
    try {
      const flags = await featuresApi.getActive();
      set({ flags, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  isEnabled: (key: string) => {
    const { flags } = get();
    // Default open if flag is not defined, otherwise respects boolean
    return flags[key] !== undefined ? flags[key] : true;
  },
}));
