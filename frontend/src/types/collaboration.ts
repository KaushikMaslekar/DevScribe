export interface CollaborationSession {
  postId: number;
  room: string;
  role: "OWNER" | "COLLABORATOR";
  canEdit: boolean;
  degradedModeFallback: boolean;
}

export interface Collaborator {
  userId: number;
  username: string;
  email: string;
  addedAt: string;
}

export interface AddCollaboratorRequest {
  identifier: string;
}
