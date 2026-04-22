"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "@/lib/comment-api";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface CommentComposerProps {
  postId: number;
  parentCommentId?: number | null;
  isReply?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentComposer({
  postId,
  parentCommentId,
  isReply = false,
  onSuccess,
  onCancel,
}: CommentComposerProps) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      createComment(postId, {
        content,
        parentCommentId,
      }),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["comment-count", postId] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-3 rounded-2xl border bg-card/50 p-4 ${isReply ? "ml-6 border-dashed" : ""}`}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isReply ? "Reply to this comment..." : "Share your thoughts..."}
        className="min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-foreground focus:outline-none"
        disabled={createMutation.isPending}
      />

      <div className="flex justify-end gap-2">
        {isReply && onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || createMutation.isPending}
        >
          {createMutation.isPending && (
            <Loader className="mr-2 h-3 w-3 animate-spin" />
          )}
          {isReply ? "Reply" : "Comment"}
        </Button>
      </div>

      {createMutation.isError && (
        <p className="text-xs text-destructive">
          Failed to post comment. Please try again.
        </p>
      )}
    </form>
  );
}

