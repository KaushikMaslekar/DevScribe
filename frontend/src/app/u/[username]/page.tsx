"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { followUser, getUserProfile, unfollowUser } from "@/lib/user-api";
import { getAccessToken } from "@/lib/auth-storage";

export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["user", "profile", params.username],
    queryFn: () => getUserProfile(params.username),
    enabled: Boolean(params.username),
  });

  const followMutation = useMutation({
    mutationFn: (username: string) => followUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", "profile", params.username],
      });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (username: string) => unfollowUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", "profile", params.username],
      });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
  });

  const canFollow = Boolean(getAccessToken());

  return (
    <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12 md:px-10 page-surface">
      {profileQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      ) : null}

      {profileQuery.isError ? (
        <div className="rounded-3xl border border-white/20 bg-black p-4 text-sm text-white">
          Unable to load user profile.
        </div>
      ) : null}

      {profileQuery.data ? (
        <section className="rounded-3xl border bg-card/85 p-6 shadow-sm backdrop-blur md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                @{profileQuery.data.username}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                {profileQuery.data.displayName ?? profileQuery.data.username}
              </h1>
            </div>

            <div className="rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
              Profile page
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            {profileQuery.data.bio ?? "No bio added yet."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Published
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {profileQuery.data.publishedPosts}
              </p>
            </div>
            <div className="rounded-2xl border bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Followers
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {profileQuery.data.followers}
              </p>
            </div>
            <div className="rounded-2xl border bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Following
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {profileQuery.data.following}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant={profileQuery.data.followedByMe ? "default" : "outline"}
              size="sm"
              disabled={
                !canFollow ||
                followMutation.isPending ||
                unfollowMutation.isPending
              }
              onClick={() => {
                if (!canFollow) {
                  return;
                }

                if (profileQuery.data.followedByMe) {
                  unfollowMutation.mutate(profileQuery.data.username);
                } else {
                  followMutation.mutate(profileQuery.data.username);
                }
              }}
            >
              {profileQuery.data.followedByMe ? (
                <UserRoundCheck className="mr-2 h-4 w-4" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {profileQuery.data.followedByMe ? "Following" : "Follow"}
            </Button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
