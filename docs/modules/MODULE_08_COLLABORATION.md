# Module 08: Collaborative Editing

## Goal

Enable conflict-free multi-user editing with presence and cursor awareness.

## Status

Planned.

## Core Stack

- TipTap collaboration extension
- Y.js CRDT document model
- Hocuspocus server for collaboration transport

## Core Scope

- Multiple authors editing same draft concurrently.
- Real-time cursor and presence information.
- Automatic merge without destructive conflicts.
- Graceful fallback to single-user mode on collaboration failure.

## Collaboration Flow

1. User opens collaborative draft.
2. Editor attaches to Y.js document.
3. Hocuspocus syncs operations among clients.
4. Awareness layer broadcasts cursor/presence metadata.
5. Periodic snapshots persist state to backend for durability.

## Persistence Strategy

- CRDT updates are durable in session memory.
- Periodic checkpoint persisted to backend draft storage.
- Reconnect restores from latest checkpoint + resumed sync.

## Failure Handling

- If collaboration channel fails:
  - continue local editing,
  - keep autosave active,
  - show degraded mode indicator,
  - resume collaborative mode after reconnect.

## Security and Ownership

- Session access validated by backend authorization.
- Only permitted users can join a document room.

## Validation Targets

- Concurrent edit convergence across users.
- Presence updates stable under network jitter.
- Fallback mode still preserves content via autosave.
