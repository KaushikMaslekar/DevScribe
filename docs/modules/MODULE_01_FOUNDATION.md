# Module 01: Foundation and Monorepo Setup

## Goal

Establish a stable technical baseline so every next feature module can be implemented without reworking platform fundamentals.

## Status

Implemented and pushed.

## What This Module Contains

- Spring Boot backend baseline with clean package structure.
- PostgreSQL connection setup and Flyway migration integration.
- Initial schema migration (`users`, `posts`, `tags`, `post_tags`, `view_tracking`).
- Frontend scaffold with Next.js App Router and TypeScript strict mode.
- Core frontend libraries added (Tailwind, TanStack Query, Axios, Framer Motion, TipTap dependencies).
- Shared auth-aware Axios client with global 401 handling.
- Next.js middleware baseline for protected routes.

## Architecture Decisions

### Backend

- Framework: Spring Boot 3.x.
- Persistence: JPA + Hibernate with PostgreSQL as source of truth.
- Migrations: Flyway from day one to guarantee reproducible schema state.
- Configuration via environment variables for runtime portability.

### Frontend

- App Router to support server-first architecture and route-level composition.
- React Query as the canonical server-state cache.
- Axios as API client with interceptors for token handling and centralized errors.

## How It Works

1. App starts and backend applies Flyway migrations.
2. Frontend boots with global providers (QueryClient + app wrappers).
3. Axios instance reads auth token and injects `Authorization` header when available.
4. Middleware blocks protected route access if auth cookie is absent.

## Data and Environment Contracts

- DB URL and credentials are injected using environment variables.
- JWT settings are configured as app properties (used in Module 02).
- Frontend reads `NEXT_PUBLIC_API_URL` with fallback to local API URL.

## Why This Module Matters

Without this module, every future feature would risk drift in:

- schema state,
- auth integration approach,
- frontend data-fetching style,
- deployment readiness.

This module enforces consistency for all later modules.

## Validation Scope

- Backend compiles successfully.
- Frontend production build passes.
- Local infra startup (`docker compose`) available for PostgreSQL and Redis.
