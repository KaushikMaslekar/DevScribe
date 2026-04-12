import { apiClient } from "@/lib/api-client";

export async function listTags(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>("/tags");
  return data;
}
