"use client";

import Link from "next/link";
import { ArrowRight, PenSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { listPosts } from "@/lib/post-api";

export default function Home() {
  const publishedPostsQuery = useQuery({
    queryKey: ["posts", "published"],
    queryFn: () => listPosts({ page: 0, size: 6 }),
  });

  return (
    <main className="relative flex flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(29,78,216,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(251,146,60,0.2),transparent_35%)]" />
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-20 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-xs tracking-[0.2em] text-muted-foreground"
        >
          <PenSquare className="h-3.5 w-3.5" />
          DEVSCRIBE PLATFORM
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl"
        >
          Write, collaborate, and ship technical stories with confidence.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg"
        >
          DevScribe is a full-stack, production-ready blogging system with
          secure authentication, markdown-first writing, autosave reliability,
          and collaborative editing.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Button asChild size="lg">
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </motion.div>

        <div className="mt-14 w-full">
          <h2 className="text-xl font-semibold">Latest Published Posts</h2>
          {publishedPostsQuery.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Loading posts...
            </p>
          ) : null}
          {publishedPostsQuery.isError ? (
            <p className="mt-3 text-sm text-red-500">
              Unable to load posts right now.
            </p>
          ) : null}
          {publishedPostsQuery.data ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {publishedPostsQuery.data.content.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No published posts yet.
                </p>
              ) : (
                publishedPostsQuery.data.content.map((post) => (
                  <Link
                    href={`/posts/${post.slug}`}
                    key={post.id}
                    className="rounded-xl border bg-card p-5 transition hover:border-primary/50"
                  >
                    <p className="text-xs tracking-wide text-muted-foreground">
                      @{post.authorUsername}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt ?? "No excerpt available."}
                    </p>
                  </Link>
                ))
              )}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
