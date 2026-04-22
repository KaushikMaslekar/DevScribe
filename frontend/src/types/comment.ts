export interface AuthorInfo {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface CommentResponse {
  id: number;
  postId: number;
  parentCommentId: number | null;
  author: AuthorInfo;
  content: string;
  status: "ACTIVE" | "FLAGGED" | "DELETED";
  createdAt: string;
  updatedAt: string;
  isAuthor: boolean;
}

export interface CommentThreadResponse {
  comment: CommentResponse;
  replies: CommentThreadResponse[];
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: number | null;
}

export interface CommentCountResponse {
  postId: number;
  count: number;
}

