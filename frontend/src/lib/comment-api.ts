import { apiClient } from "@/lib/api-client";
import type {
  CommentResponse,
  CommentThreadResponse,
  CreateCommentRequest,
  CommentCountResponse,
} from "@/types/comment";
import { PageResponse } from "@/types/post";

export async function getComments(
  postId: number,
  page: number = 0,
  size: number = 20,
): Promise<PageResponse<CommentThreadResponse>> {
  const { data } = await apiClient.get<PageResponse<CommentThreadResponse>>(
    `/posts/${postId}/comments`,
    {
      params: { page, size },
    },
  );
  return data;
}

export async function getCommentCount(postId: number): Promise<number> {
  const { data } = await apiClient.get<CommentCountResponse>(
    `/posts/${postId}/comments/count`,
  );
  return data.count;
}

export async function createComment(
  postId: number,
  request: CreateCommentRequest,
): Promise<CommentResponse> {
  const { data } = await apiClient.post<CommentResponse>(
    `/posts/${postId}/comments`,
    request,
  );
  return data;
}

export async function deleteComment(
  postId: number,
  commentId: number,
): Promise<void> {
  await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
}

export async function flagComment(
  postId: number,
  commentId: number,
): Promise<void> {
  await apiClient.post(`/posts/${postId}/comments/${commentId}/flag`);
}

