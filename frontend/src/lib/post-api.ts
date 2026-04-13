import { apiClient } from "@/lib/api-client";
import type {
  AutosaveSnapshot,
  AutosavePostRequest,
  AutosavePostResponse,
  CreatePostRequest,
  PageResponse,
  PostBookmarkResponse,
  PostDetail,
  PostLikeResponse,
  PostStatus,
  PostSummary,
  RestoreAutosaveResponse,
  UpdatePostRequest,
} from "@/types/post";

export async function listPosts(params?: {
  page?: number;
  size?: number;
  mine?: boolean;
  status?: PostStatus;
  tag?: string;
  query?: string;
}): Promise<PageResponse<PostSummary>> {
  const { data } = await apiClient.get<PageResponse<PostSummary>>("/posts", {
    params,
  });
  return data;
}

export async function getPostBySlug(slug: string): Promise<PostDetail> {
  const { data } = await apiClient.get<PostDetail>(`/posts/${slug}`);
  return data;
}

export async function createPost(
  payload: CreatePostRequest,
): Promise<PostDetail> {
  const { data } = await apiClient.post<PostDetail>("/posts", payload);
  return data;
}

export async function updatePost(
  id: number,
  payload: UpdatePostRequest,
): Promise<PostDetail> {
  const { data } = await apiClient.put<PostDetail>(`/posts/${id}`, payload);
  return data;
}

export async function deletePost(id: number): Promise<void> {
  await apiClient.delete(`/posts/${id}`);
}

export async function publishPost(id: number): Promise<PostDetail> {
  const { data } = await apiClient.post<PostDetail>(`/posts/${id}/publish`);
  return data;
}

export async function autosavePost(
  payload: AutosavePostRequest,
): Promise<AutosavePostResponse> {
  const { data } = await apiClient.post<AutosavePostResponse>(
    "/posts/autosave",
    payload,
  );
  return data;
}

export async function listAutosaveSnapshots(
  postId: number,
): Promise<AutosaveSnapshot[]> {
  const { data } = await apiClient.get<AutosaveSnapshot[]>(
    `/posts/${postId}/autosave-snapshots`,
  );
  return data;
}

export async function restoreAutosaveSnapshot(
  postId: number,
  snapshotId: number,
): Promise<RestoreAutosaveResponse> {
  const { data } = await apiClient.post<RestoreAutosaveResponse>(
    `/posts/${postId}/autosave-snapshots/${snapshotId}/restore`,
  );
  return data;
}

export async function likePost(id: number): Promise<PostLikeResponse> {
  const { data } = await apiClient.post<PostLikeResponse>(`/posts/${id}/like`);
  return data;
}

export async function unlikePost(id: number): Promise<PostLikeResponse> {
  const { data } = await apiClient.delete<PostLikeResponse>(
    `/posts/${id}/like`,
  );
  return data;
}

export async function bookmarkPost(id: number): Promise<PostBookmarkResponse> {
  const { data } = await apiClient.post<PostBookmarkResponse>(
    `/posts/${id}/bookmark`,
  );
  return data;
}

export async function unbookmarkPost(
  id: number,
): Promise<PostBookmarkResponse> {
  const { data } = await apiClient.delete<PostBookmarkResponse>(
    `/posts/${id}/bookmark`,
  );
  return data;
}

export async function listBookmarkedPosts(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<PostSummary>> {
  const { data } = await apiClient.get<PageResponse<PostSummary>>(
    "/posts/bookmarks",
    {
      params,
    },
  );
  return data;
}

export async function listFollowingFeed(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<PostSummary>> {
  const { data } = await apiClient.get<PageResponse<PostSummary>>(
    "/posts/feed",
    {
      params,
    },
  );
  return data;
}
