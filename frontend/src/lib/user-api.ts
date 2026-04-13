import { apiClient } from "@/lib/api-client";
import type { UpdateProfileRequest, UserProfile } from "@/types/user";

export async function getUserProfile(username: string): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>(`/users/${username}`);
  return data;
}

export async function followUser(username: string): Promise<UserProfile> {
  const { data } = await apiClient.post<UserProfile>(
    `/users/${username}/follow`,
  );
  return data;
}

export async function unfollowUser(username: string): Promise<UserProfile> {
  const { data } = await apiClient.delete<UserProfile>(
    `/users/${username}/follow`,
  );
  return data;
}

export async function updateMyProfile(
  payload: UpdateProfileRequest,
): Promise<UserProfile> {
  const { data } = await apiClient.put<UserProfile>(
    "/users/me/profile",
    payload,
  );
  return data;
}
