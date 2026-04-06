"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { me } from "@/lib/auth-api";
import { clearAccessToken } from "@/lib/auth-storage";
import { createPost, deletePost, listPosts, publishPost } from "@/lib/post-api";
import type { PostStatus } from "@/types/post";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<PostStatus | "ALL">("ALL");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");

  const profileQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: me,
  });

  const postsQuery = useQuery({
    queryKey: ["posts", "mine", statusFilter],
    queryFn: () =>
      listPosts({
        mine: true,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page: 0,
        size: 20,
      }),
  });

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      setTitle("");
      setExcerpt("");
      setMarkdownContent("");
      queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "published"] });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: publishPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "published"] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "published"] });
    },
  });

  function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createPostMutation.mutate({
      title,
      excerpt: excerpt || undefined,
      markdownContent,
    });
  }

  function handleLogout() {
    clearAccessToken();
    router.replace("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-14 md:px-10">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to your writing control center.
      </p>

      <div className="mt-6 rounded-xl border bg-card p-6 text-card-foreground">
        {profileQuery.isLoading ? <p>Loading profile...</p> : null}
        {profileQuery.isError ? (
          <p className="text-red-500">Session expired. Please sign in again.</p>
        ) : null}
        {profileQuery.data ? (
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">User:</span>{" "}
              {profileQuery.data.username}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {profileQuery.data.email}
            </p>
            <p>
              <span className="font-medium">Role:</span>{" "}
              {profileQuery.data.role}
            </p>
          </div>
        ) : null}

        <Button variant="outline" className="mt-5" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <form
        onSubmit={handleCreatePost}
        className="mt-8 rounded-xl border bg-card p-6 text-card-foreground"
      >
        <h2 className="text-xl font-semibold">Create New Post</h2>
        <label className="mt-4 mb-2 block text-sm">Title</label>
        <input
          className="w-full rounded-md border bg-background px-3 py-2 outline-none ring-ring/40 focus:ring-2"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <label className="mt-4 mb-2 block text-sm">Excerpt</label>
        <input
          className="w-full rounded-md border bg-background px-3 py-2 outline-none ring-ring/40 focus:ring-2"
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
        />
        <label className="mt-4 mb-2 block text-sm">Markdown Content</label>
        <textarea
          className="min-h-48 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none ring-ring/40 focus:ring-2"
          value={markdownContent}
          onChange={(event) => setMarkdownContent(event.target.value)}
          required
        />
        <Button
          className="mt-4"
          type="submit"
          disabled={createPostMutation.isPending}
        >
          {createPostMutation.isPending ? "Creating..." : "Create Draft"}
        </Button>
      </form>

      <section className="mt-8 rounded-xl border bg-card p-6 text-card-foreground">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Your Posts</h2>
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as PostStatus | "ALL")
            }
          >
            <option value="ALL">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        {postsQuery.isLoading ? <p className="mt-4">Loading posts...</p> : null}
        {postsQuery.isError ? (
          <p className="mt-4 text-red-500">Unable to load your posts.</p>
        ) : null}
        {postsQuery.data ? (
          <div className="mt-4 space-y-3">
            {postsQuery.data.content.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No posts found for this filter.
              </p>
            ) : (
              postsQuery.data.content.map((post) => (
                <div key={post.id} className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">{post.status}</p>
                  <h3 className="mt-1 text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {post.excerpt ?? "No excerpt"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/posts/${post.slug}`)}
                    >
                      View
                    </Button>
                    {post.status === "DRAFT" ? (
                      <Button
                        size="sm"
                        onClick={() => publishPostMutation.mutate(post.id)}
                        disabled={publishPostMutation.isPending}
                      >
                        Publish
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePostMutation.mutate(post.id)}
                      disabled={deletePostMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
