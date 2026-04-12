import { apiClient } from "@/lib/api-client";
import type {
  AddCollaboratorRequest,
  CollaborationSession,
  Collaborator,
} from "@/types/collaboration";

export async function getCollaborationSession(
  postId: number,
): Promise<CollaborationSession> {
  const { data } = await apiClient.get<CollaborationSession>(
    `/posts/${postId}/collaboration/session`,
  );
  return data;
}

export async function listCollaborators(
  postId: number,
): Promise<Collaborator[]> {
  const { data } = await apiClient.get<Collaborator[]>(
    `/posts/${postId}/collaboration/collaborators`,
  );
  return data;
}

export async function addCollaborator(
  postId: number,
  payload: AddCollaboratorRequest,
): Promise<Collaborator> {
  const { data } = await apiClient.post<Collaborator>(
    `/posts/${postId}/collaboration/collaborators`,
    payload,
  );
  return data;
}

export async function removeCollaborator(
  postId: number,
  userId: number,
): Promise<void> {
  await apiClient.delete(
    `/posts/${postId}/collaboration/collaborators/${userId}`,
  );
}
