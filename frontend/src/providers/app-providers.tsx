"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { PostRealtimeListener } from "@/providers/post-realtime-listener";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <PostRealtimeListener />
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
