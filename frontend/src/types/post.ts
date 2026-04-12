export type PostStatus = "DRAFT" | "PUBLISHED";

export interface PostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  authorUsername: string;
  tags: string[];
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
}

export interface PostDetail {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  markdownContent: string;
  authorUsername: string;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  tags: string[];
  views: number;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreatePostRequest {
  title: string;
  excerpt?: string;
  markdownContent: string;
  tags?: string[];
}

export interface UpdatePostRequest {
  title: string;
  excerpt?: string;
  markdownContent: string;
  tags?: string[];
}

export interface AutosavePostRequest {
  postId?: number;
  clientRevision: number;
  title?: string;
  excerpt?: string;
  markdownContent?: string;
  tags?: string[];
}

export interface AutosavePostResponse {
  postId: number;
  slug: string;
  autosaveRevision: number;
  accepted: boolean;
  savedAt: string;
}

export type AutosaveState =
  | "idle"
  | "saving"
  | "saved"
  | "retrying"
  | "offline"
  | "error";
