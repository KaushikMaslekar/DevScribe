export interface UserProfile {
  id: number;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  publishedPosts: number;
  followers: number;
  following: number;
  followedByMe: boolean;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}
