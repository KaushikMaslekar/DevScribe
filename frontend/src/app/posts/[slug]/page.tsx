"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { getPostBySlug, likePost, unlikePost } from "@/lib/post-api";
import { markdownToHtml } from "@/lib/markdown";
import { getAccessToken } from "@/lib/auth-storage";
import { Button } from "@/components/ui/button";

export default function PostDetailPage() {
  const params = useParams<{ slug: string }>();
  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: ["post", params.slug],
    queryFn: () => getPostBySlug(params.slug),
    enabled: Boolean(params.slug),
  });

  const likeMutation = useMutation({
    mutationFn: (id: number) => likePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", params.slug] });
      queryClient.invalidateQueries({ queryKey: ["posts", "published"] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (id: number) => unlikePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", params.slug] });
      queryClient.invalidateQueries({ queryKey: ["posts", "published"] });
    },
  });

  const canLike = Boolean(getAccessToken());

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-14 md:px-10">
      {postQuery.isLoading ? <p>Loading post...</p> : null}
      {postQuery.isError ? (
        <p className="text-red-500">Unable to load this post.</p>
      ) : null}

      {postQuery.data ? (
        <article>
          <p className="text-sm text-muted-foreground">
            @{postQuery.data.authorUsername}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {postQuery.data.title}
          </h1>
          {postQuery.data.excerpt ? (
            <p className="mt-4 text-lg text-muted-foreground">
              {postQuery.data.excerpt}
            </p>
          ) : null}

          <div className="mt-4 flex items-center gap-3">
            <Button
              type="button"
              variant={postQuery.data.likedByMe ? "default" : "outline"}
              size="sm"
              disabled={
                !canLike || likeMutation.isPending || unlikeMutation.isPending
              }
              onClick={() => {
                if (!canLike) {
                  return;
                }

                if (postQuery.data.likedByMe) {
                  unlikeMutation.mutate(postQuery.data.id);
                } else {
                  likeMutation.mutate(postQuery.data.id);
                }
              }}
            >
              <Heart className="mr-2 h-4 w-4" />
              {postQuery.data.likedByMe ? "Unlike" : "Like"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {postQuery.data.likesCount}{" "}
              {postQuery.data.likesCount === 1 ? "like" : "likes"}
            </span>
            {!canLike ? (
              <span className="text-xs text-muted-foreground">
                Sign in to react
              </span>
            ) : null}
          </div>

          {postQuery.data.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {postQuery.data.tags.map((tag) => (
                <span
                  key={`${postQuery.data.id}-${tag}`}
                  className="rounded-full border px-2 py-1 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 rounded-xl border bg-card p-6">
            <div
              className="prose prose-slate max-w-none prose-pre:rounded-lg prose-pre:bg-slate-950 prose-pre:text-slate-100"
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(postQuery.data.markdownContent),
              }}
            />
          </div>
        </article>
      ) : null}
    </main>
  );
}
