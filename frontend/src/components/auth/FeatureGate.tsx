import React from 'react';
import { useFeaturesStore } from '../../store/featuresStore';

export interface FeatureGateProps {
  flag: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  flag,
  fallback = null,
  children,
}) => {
  const isEnabled = useFeaturesStore((state) => state.isEnabled(flag));

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
