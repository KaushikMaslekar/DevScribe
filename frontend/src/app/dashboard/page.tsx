"use client";

import { FormEvent, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { me } from "@/lib/auth-api";
import {
  addCollaborator,
  getCollaborationSession,
  listCollaborators,
  removeCollaborator,
} from "@/lib/collaboration-api";
import {
  clearDraftSnapshot,
  readDraftSnapshot,
  useAutosaveDraft,
} from "@/lib/autosave";
import { clearAccessToken } from "@/lib/auth-storage";
import {
  createPost,
  deletePost,
  listPosts,
  publishPost,
  updatePost,
} from "@/lib/post-api";
import type { PostStatus } from "@/types/post";

const RichMarkdownEditor = dynamic(
  () =>
    import("@/components/editor/rich-markdown-editor").then(
      (module) => module.RichMarkdownEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-96 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
        Loading editor...
      </div>
    ),
  },
);

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const initialSnapshot = useMemo(() => readDraftSnapshot(), []);
  const [statusFilter, setStatusFilter] = useState<PostStatus | "ALL">("ALL");
  const [title, setTitle] = useState(() => initialSnapshot?.title ?? "");
  const [excerpt, setExcerpt] = useState(() => initialSnapshot?.excerpt ?? "");
  const [markdownContent, setMarkdownContent] = useState(
    () => initialSnapshot?.markdownContent ?? "",
  );
  const [tagsInput, setTagsInput] = useState(
    () => initialSnapshot?.tagsInput ?? "",
  );
  const [draftPostId, setDraftPostId] = useState<number | null>(
    () => initialSnapshot?.postId ?? null,
  );
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [collaboratorIdentifier, setCollaboratorIdentifier] = useState("");

  const normalizedTags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput],
  );

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

  const collaborationSessionQuery = useQuery({
    queryKey: ["collaboration", "session", draftPostId],
    queryFn: () => getCollaborationSession(draftPostId as number),
    enabled: Boolean(draftPostId) && profileQuery.isSuccess,
    retry: false,
  });

  const collaboratorsQuery = useQuery({
    queryKey: ["collaboration", "collaborators", draftPostId],
    queryFn: () => listCollaborators(draftPostId as number),
    enabled: Boolean(draftPostId) && collaborationSessionQuery.isSuccess,
    retry: false,
  });

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      setDraftPostId(post.id);
      queryClient.invalidateQueries({ queryKey: ["posts", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "published"] });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof updatePost>[1];
    }) => updatePost(id, payload),
    onSuccess: () => {
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

  const addCollaboratorMutation = useMutation({
    mutationFn: (identifier: string) =>
      addCollaborator(draftPostId as number, { identifier }),
    onSuccess: () => {
      setCollaboratorIdentifier("");
      queryClient.invalidateQueries({
        queryKey: ["collaboration", "collaborators", draftPostId],
      });
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: (userId: number) =>
      removeCollaborator(draftPostId as number, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collaboration", "collaborators", draftPostId],
      });
    },
  });

  const autosave = useAutosaveDraft({
    enabled: profileQuery.isSuccess,
    postId: draftPostId,
    onPostIdChange: setDraftPostId,
    initialRevision: initialSnapshot?.revision ?? 0,
    title,
    excerpt,
    markdownContent,
    tagsInput,
  });

  function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      title,
      excerpt: excerpt || undefined,
      markdownContent,
      tags: normalizedTags,
    };

    if (draftPostId) {
      updatePostMutation.mutate({ id: draftPostId, payload });
      return;
    }

    createPostMutation.mutate(payload);
  }

  function handleStartNewDraft() {
    setDraftPostId(null);
    setTitle("");
    setExcerpt("");
    setMarkdownContent("");
    setTagsInput("");
    setCollaboratorIdentifier("");
    setEditorResetKey((value) => value + 1);
    clearDraftSnapshot();
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
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Autosave status: {autosave.saveState}
            {autosave.lastSavedAt
              ? ` · ${new Date(autosave.lastSavedAt).toLocaleTimeString()}`
              : ""}
          </span>
          <span>{draftPostId ? `Draft ID: ${draftPostId}` : "New draft"}</span>
        </div>
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
        <RichMarkdownEditor
          key={editorResetKey}
          initialMarkdown={markdownContent}
          onMarkdownChange={setMarkdownContent}
          collaborationSession={collaborationSessionQuery.data ?? null}
          collaboratorName={profileQuery.data?.username}
        />
        {draftPostId ? (
          <div className="mt-6 rounded-lg border bg-muted/20 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">Collaborative editing</p>
                <p className="text-xs text-muted-foreground">
                  {collaborationSessionQuery.isLoading
                    ? "Checking collaboration access..."
                    : collaborationSessionQuery.isError
                      ? "Collaboration is unavailable for this draft right now."
                      : collaborationSessionQuery.data
                        ? `${collaborationSessionQuery.data.role} access in room ${collaborationSessionQuery.data.room}`
                        : "Save the draft to open a collaboration room."}
                </p>
              </div>
              {collaborationSessionQuery.data?.degradedModeFallback ? (
                <span className="rounded-full border px-2 py-1 text-xs text-amber-700">
                  Fallback mode
                </span>
              ) : null}
            </div>

            {collaboratorsQuery.data ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Collaborators
                </p>
                {collaboratorsQuery.data.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No collaborators added yet.
                  </p>
                ) : (
                  collaboratorsQuery.data.map((collaborator) => (
                    <div
                      key={collaborator.userId}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{collaborator.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {collaborator.email}
                        </p>
                      </div>
                      {collaborationSessionQuery.data?.role === "OWNER" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            removeCollaboratorMutation.mutate(
                              collaborator.userId,
                            )
                          }
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {collaborationSessionQuery.data?.role === "OWNER" ? (
              <form
                className="mt-4 flex flex-wrap gap-2"
                onSubmit={(event) => {
                  event.preventDefault();

                  if (!collaboratorIdentifier.trim()) {
                    return;
                  }

                  addCollaboratorMutation.mutate(collaboratorIdentifier.trim());
                }}
              >
                <input
                  className="min-w-72 flex-1 rounded-md border bg-background px-3 py-2 outline-none ring-ring/40 focus:ring-2"
                  value={collaboratorIdentifier}
                  onChange={(event) =>
                    setCollaboratorIdentifier(event.target.value)
                  }
                  placeholder="Invite by username or email"
                />
                <Button
                  type="submit"
                  disabled={addCollaboratorMutation.isPending}
                >
                  Invite
                </Button>
              </form>
            ) : null}
          </div>
        ) : null}
        <label className="mt-4 mb-2 block text-sm">
          Tags (comma separated)
        </label>
        <input
          className="w-full rounded-md border bg-background px-3 py-2 outline-none ring-ring/40 focus:ring-2"
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          placeholder="spring-boot, java, backend"
        />
        <Button
          className="mt-4"
          type="submit"
          disabled={
            createPostMutation.isPending || updatePostMutation.isPending
          }
        >
          {createPostMutation.isPending || updatePostMutation.isPending
            ? "Saving..."
            : "Save Draft"}
        </Button>
        <Button
          className="mt-4 ml-3"
          type="button"
          variant="outline"
          onClick={handleStartNewDraft}
        >
          Start New Draft
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
                  {post.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={`${post.id}-${tag}`}
                          className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
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
