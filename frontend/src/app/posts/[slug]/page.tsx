"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPostBySlug } from "@/lib/post-api";

export default function PostDetailPage() {
  const params = useParams<{ slug: string }>();

  const postQuery = useQuery({
    queryKey: ["post", params.slug],
    queryFn: () => getPostBySlug(params.slug),
    enabled: Boolean(params.slug),
  });

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

          <div className="mt-8 rounded-xl border bg-card p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-7">
              {postQuery.data.markdownContent}
            </pre>
          </div>
        </article>
      ) : null}
    </main>
  );
}
