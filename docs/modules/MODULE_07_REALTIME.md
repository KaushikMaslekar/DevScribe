# Module 07: Realtime Synchronization

## Goal

Broadcast post-level updates across active sessions with low latency.

## Status

Planned.

## Core Scope

- Use Supabase Realtime channels for event distribution.
- Reflect publish/update/delete events in feed and dashboard without hard refresh.
- Keep React Query cache synchronized using targeted invalidation or patch updates.

## Event Model

- Event source: backend domain actions (publish/update/delete).
- Event payload: minimal identifiers + change metadata.
- Consumers: homepage feed, dashboard lists, detail route.

## Frontend Flow

1. Client subscribes to relevant realtime channels.
2. Event received with post id/slug/status.
3. Query cache is patched or invalidated by key.
4. UI updates naturally through React Query reactivity.

## Backend Integration Strategy

- On successful post mutation, emit event to Supabase channel.
- Keep event publication non-blocking to avoid API latency impact.

## Reliability Considerations

- Subscription reconnect strategy.
- Idempotent client-side event handling.
- Fallback to periodic refetch when channel unavailable.

## Validation Targets

- Two browser sessions see synchronized updates.
- Published post appears in public feed in near real time.
- Disconnect/reconnect restores expected state.
