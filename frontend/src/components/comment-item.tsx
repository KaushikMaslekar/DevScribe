"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteComment, flagComment } from "@/lib/comment-api";
import { CommentResponse } from "@/types/comment";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Flag, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentItemProps {
  comment: CommentResponse;
  postId: number;
  onReplyClick?: (commentId: number) => void;
  depth?: number;
}

export function CommentItem({
  comment,
  postId,
  onReplyClick,
  depth = 0,
}: CommentItemProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(postId, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["comment-count", postId] });
      setShowConfirmDelete(false);
    },
  });

  const flagMutation = useMutation({
    mutationFn: () => flagComment(postId, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  if (comment.status === "DELETED") {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground italic">
        This comment has been deleted.
      </div>
    );
  }

  const isSpamFlagged = comment.status === "FLAGGED";

  return (
    <div
      className={`flex gap-3 rounded-lg border bg-card/50 p-4 ${depth > 0 ? "ml-6" : ""}`}
    >
      {/* Avatar */}
      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
        {comment.author.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt={comment.author.displayName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          comment.author.displayName[0]?.toUpperCase() || "?"
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {comment.author.displayName}
          </span>
          <span>@{comment.author.username}</span>
          <span>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          {isSpamFlagged && (
            <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-yellow-700 dark:text-yellow-400">
              Flagged
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-foreground break-words">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="mt-3 flex flex-wrap gap-1">
          {onReplyClick && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onReplyClick(comment.id)}
            >
              <Reply className="mr-1 h-3 w-3" />
              Reply
            </Button>
          )}

          {!comment.isAuthor && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              disabled={flagMutation.isPending}
              onClick={() => flagMutation.mutate()}
            >
              <Flag className="mr-1 h-3 w-3" />
              {isSpamFlagged ? "Flagged" : "Flag"}
            </Button>
          )}

          {comment.isAuthor && (
            <>
              {showConfirmDelete ? (
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate()}
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={deleteMutation.isPending}
                    onClick={() => setShowConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setShowConfirmDelete(true)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

