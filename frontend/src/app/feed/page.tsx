"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { listFollowingFeed } from "@/lib/post-api";

export default function FollowingFeedPage() {
  const feedQuery = useQuery({
    queryKey: ["posts", "feed"],
    queryFn: () => listFollowingFeed({ page: 0, size: 12 }),
  });

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12 md:px-10 page-surface">
      <div className="mb-8 rounded-3xl border bg-card/80 p-6 shadow-sm backdrop-blur">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Personalized reading
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Following Feed
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Latest published posts from authors you follow.
        </p>
      </div>

      {feedQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading feed...</p>
      ) : null}

      {feedQuery.isError ? (
        <div className="rounded-3xl border border-white/20 bg-black p-4 text-sm text-white">
          Unable to load following feed.
        </div>
      ) : null}

      {feedQuery.data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {feedQuery.data.content.length === 0 ? (
            <div className="rounded-3xl border bg-card/80 p-6 text-sm text-muted-foreground">
              No feed items yet. Follow authors to personalize this page.
            </div>
          ) : (
            feedQuery.data.content.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group rounded-3xl border bg-card/85 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-foreground hover:shadow-lg"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  @{post.authorUsername}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight transition group-hover:text-foreground">
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
                  {post.excerpt ?? "No excerpt available."}
                </p>
                <div className="mt-5 inline-flex items-center gap-1 rounded-full border bg-background/80 px-2 py-1 text-xs text-muted-foreground">
                  <Heart className="h-3 w-3" />
                  {post.likesCount}
                </div>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </main>
  );
}
