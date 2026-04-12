"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  subscribeToPostRealtime,
  type PostRealtimeEvent,
} from "@/lib/post-realtime";
import type { PageResponse, PostDetail, PostSummary } from "@/types/post";

const REALTIME_REFRESH_DEBOUNCE_MS = 400;

export function PostRealtimeListener() {
  const queryClient = useQueryClient();
  const pendingSlugsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const pendingSlugs = pendingSlugsRef.current;

    const applyOptimisticPatch = (event: PostRealtimeEvent) => {
      queryClient.setQueriesData<PageResponse<PostSummary>>(
        { queryKey: ["posts"] },
        (current) => {
          if (!current) {
            return current;
          }

          if (event.eventType === "DELETED") {
            const nextContent = current.content.filter(
              (post) => post.id !== event.postId,
            );

            if (nextContent.length === current.content.length) {
              return current;
            }

            return {
              ...current,
              content: nextContent,
              totalElements: Math.max(0, current.totalElements - 1),
            };
          }

          let changed = false;
          const nextContent = current.content.map((post) => {
            if (post.id !== event.postId) {
              return post;
            }

            changed = true;

            return {
              ...post,
              slug: event.slug,
              status: event.status,
              updatedAt: event.occurredAt,
              publishedAt:
                event.eventType === "PUBLISHED"
                  ? event.occurredAt
                  : post.publishedAt,
            };
          });

          if (!changed) {
            return current;
          }

          return {
            ...current,
            content: nextContent,
          };
        },
      );

      if (event.eventType === "DELETED") {
        queryClient.removeQueries({ queryKey: ["post", event.slug] });
        return;
      }

      queryClient.setQueriesData<PostDetail>({ queryKey: ["post"] }, (post) => {
        if (!post) {
          return post;
        }

        if (post.id !== event.postId && post.slug !== event.slug) {
          return post;
        }

        return {
          ...post,
          slug: event.slug,
          status: event.status,
          updatedAt: event.occurredAt,
          publishedAt:
            event.eventType === "PUBLISHED"
              ? event.occurredAt
              : post.publishedAt,
        };
      });
    };

    const flushInvalidations = () => {
      timerRef.current = null;

      queryClient.invalidateQueries({ queryKey: ["posts"] });

      pendingSlugs.forEach((slug) => {
        queryClient.invalidateQueries({ queryKey: ["post", slug] });
      });

      pendingSlugs.clear();
    };

    const scheduleInvalidation = (event: PostRealtimeEvent) => {
      applyOptimisticPatch(event);

      if (event.slug) {
        pendingSlugs.add(event.slug);
      }

      if (timerRef.current) {
        return;
      }

      timerRef.current = setTimeout(
        flushInvalidations,
        REALTIME_REFRESH_DEBOUNCE_MS,
      );
    };

    const unsubscribe = subscribeToPostRealtime(scheduleInvalidation);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      pendingSlugs.clear();
      unsubscribe?.();
    };
  }, [queryClient]);

  return null;
}
