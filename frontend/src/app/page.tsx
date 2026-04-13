"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Heart,
  PenSquare,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { listPosts } from "@/lib/post-api";
import { listTags } from "@/lib/tag-api";

const SEARCH_DEBOUNCE_MS = 350;

export default function Home() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: listTags,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const publishedPostsQuery = useQuery({
    queryKey: ["posts", "published", activeTag, debouncedSearch],
    queryFn: () =>
      listPosts({
        page: 0,
        size: 6,
        tag: activeTag ?? undefined,
        query: debouncedSearch || undefined,
      }),
  });

  const featuredStats = [
    {
      label: "Published posts",
      value: publishedPostsQuery.data?.totalElements ?? "—",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Available tags",
      value: tagsQuery.data?.length ?? "—",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      label: "Collaboration-ready",
      value: "Live",
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <main className="relative flex flex-1 overflow-hidden page-surface">
      <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-6 py-16 md:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr] lg:items-start">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur"
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
              DevScribe is a production-ready blogging workspace with
              markdown-first writing, autosave recovery, live collaboration, and
              a polished reader experience.
            </motion.p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {featuredStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2"
                >
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/feed">Following Feed</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/bookmarks">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Bookmarks
                </Link>
              </Button>
            </div>

            <div className="mt-8 rounded-3xl border bg-card/70 p-5 shadow-sm backdrop-blur">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Search className="h-4 w-4 text-muted-foreground" />
                Search published posts
              </label>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search title, excerpt, or content..."
                className="w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none ring-ring/40 focus:ring-2"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  {debouncedSearch
                    ? `Searching for \"${debouncedSearch}\"`
                    : "Showing the latest published posts"}
                </span>
                {debouncedSearch ? (
                  <button
                    type="button"
                    className="underline-offset-4 hover:underline"
                    onClick={() => setSearchInput("")}
                  >
                    Clear search
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/85 p-5 shadow-lg backdrop-blur">
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                What you can do
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  "Publish fast with autosave and recovery snapshots.",
                  "Work together live with collaborative editing.",
                  "Build a personalized feed by following authors.",
                  "Save bookmarks and revisit your best reads later.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border bg-background/80 px-4 py-3 text-sm text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Explore content
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Latest Published Posts
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  activeTag === null
                    ? "border-foreground bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {tagsQuery.data?.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    activeTag === tag
                      ? "border-foreground bg-foreground text-background"
                      : "bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {publishedPostsQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 animate-pulse rounded-3xl border bg-card/80 p-5"
                />
              ))}
            </div>
          ) : null}
          {publishedPostsQuery.isError ? (
            <div className="rounded-3xl border border-white/20 bg-black p-4 text-sm text-white">
              Unable to load posts right now.
            </div>
          ) : null}
          {publishedPostsQuery.data ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {publishedPostsQuery.data.content.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch || activeTag
                    ? "No posts matched your search."
                    : "No published posts yet."}
                </p>
              ) : (
                publishedPostsQuery.data.content.map((post) => (
                  <Link
                    href={`/posts/${post.slug}`}
                    key={post.id}
                    className="group rounded-3xl border bg-card/85 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-foreground hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                        @{post.authorUsername}
                      </p>
                      <span className="rounded-full border px-2 py-1 text-[11px] text-muted-foreground">
                        {post.tags.length > 0 ? `#${post.tags[0]}` : "article"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight transition group-hover:text-foreground">
                      {post.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
                      {post.excerpt ?? "No excerpt available."}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
                        <Heart className="h-3 w-3" />
                        {post.likesCount}
                      </span>
                      <span>Read story →</span>
                    </div>
                    {post.tags.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={`${post.id}-${tag}`}
                            className="rounded-full border bg-background/80 px-2.5 py-1 text-xs text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </Link>
                ))
              )}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
