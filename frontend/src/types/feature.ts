export interface FeatureFlag {
  key: string;
  description: string | null;
  enabled: boolean;
  rolloutPercentage: number;
  enabledForMe: boolean;
}

export interface UpdateFeatureFlagRequest {
  key: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
}
