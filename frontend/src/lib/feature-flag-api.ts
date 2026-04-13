import { apiClient } from "@/lib/api-client";
import type { FeatureFlag, UpdateFeatureFlagRequest } from "@/types/feature";

export async function listFeatureFlags(): Promise<FeatureFlag[]> {
  const { data } = await apiClient.get<FeatureFlag[]>("/features");
  return data;
}

export async function updateFeatureFlag(
  payload: UpdateFeatureFlagRequest,
): Promise<FeatureFlag> {
  const { data } = await apiClient.put<FeatureFlag>("/admin/features", payload);
  return data;
}
