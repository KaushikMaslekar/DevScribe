"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getComments, getCommentCount } from "@/lib/comment-api";
import { CommentItem } from "./comment-item";
import { CommentComposer } from "./comment-composer";
import { CommentThreadResponse } from "@/types/comment";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader } from "lucide-react";
import { getAccessToken } from "@/lib/auth-storage";

interface CommentSectionProps {
  postId: number;
}

function CommentThread({
  thread,
  postId,
  replyingTo,
  onReplyClick,
  onReplySuccess,
}: {
  thread: CommentThreadResponse;
  postId: number;
  replyingTo: number | null;
  onReplyClick: (commentId: number) => void;
  onReplySuccess: () => void;
}) {
  return (
    <div className="space-y-3">
      <CommentItem
        comment={thread.comment}
        postId={postId}
        onReplyClick={onReplyClick}
      />

      {replyingTo === thread.comment.id && (
        <CommentComposer
          postId={postId}
          parentCommentId={thread.comment.id}
          isReply
          onSuccess={onReplySuccess}
          onCancel={() => onReplyClick(-1)}
        />
      )}

      {thread.replies.length > 0 && (
        <div className="space-y-3">
          {thread.replies.map((reply) => (
            <CommentThread
              key={reply.comment.id}
              thread={reply}
              postId={postId}
              replyingTo={replyingTo}
              onReplyClick={onReplyClick}
              onReplySuccess={onReplySuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const canInteract = Boolean(getAccessToken());

  const commentCountQuery = useQuery({
    queryKey: ["comment-count", postId],
    queryFn: () => getCommentCount(postId),
    enabled: Boolean(postId),
  });

  const commentsQuery = useQuery({
    queryKey: ["comments", postId, page],
    queryFn: () => getComments(postId, page, 20),
    enabled: Boolean(postId),
  });

  const queryClient = useQueryClient();

  const handleReplySuccess = () => {
    setReplyingTo(null);
    // Refresh comments
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    queryClient.invalidateQueries({ queryKey: ["comment-count", postId] });
  };

  return (
    <section className="mt-12 rounded-3xl border bg-card/85 p-6 shadow-sm md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          Comments
          {commentCountQuery.data !== undefined && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({commentCountQuery.data})
            </span>
          )}
        </h2>
      </div>

      {/* Comment Composer */}
      {canInteract ? (
        <div className="mb-6">
          <CommentComposer
            postId={postId}
            onSuccess={handleReplySuccess}
          />
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          <a href="/login" className="font-semibold underline">
            Sign in
          </a>{" "}
          to leave a comment.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {commentsQuery.isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {commentsQuery.isError && (
          <div className="rounded-lg border border-dashed bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load comments. Please try again.
          </div>
        )}

        {commentsQuery.data?.content && commentsQuery.data.content.length > 0 ? (
          <>
            {commentsQuery.data.content.map((thread) => (
              <CommentThread
                key={thread.comment.id}
                thread={thread}
                postId={postId}
                replyingTo={replyingTo}
                onReplyClick={setReplyingTo}
                onReplySuccess={handleReplySuccess}
              />
            ))}

            {/* Pagination */}
            {commentsQuery.data.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0 || commentsQuery.isLoading}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-muted-foreground">
                  Page {page + 1} of {commentsQuery.data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    page >= commentsQuery.data.totalPages - 1 ||
                    commentsQuery.isLoading
                  }
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : !commentsQuery.isLoading && !commentsQuery.isError ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : null}
      </div>
    </section>
  );
}

