# Module 03: Posts CRUD and Publish Workflow

## Goal

Enable core blogging lifecycle with draft creation, updates, publishing, and public discovery.

## Status

Implemented and pushed.

## API Endpoints

- `GET /posts` (public published list, or own posts when `mine=true`)
- `GET /posts/{slug}` (public published detail)
- `POST /posts` (authenticated create draft)
- `PUT /posts/{id}` (authenticated owner update)
- `DELETE /posts/{id}` (authenticated owner delete)
- `POST /posts/{id}/publish` (authenticated owner publish)

## Backend Components

- `Post` entity with status, slug, version, timestamps.
- `PostStatus` enum (`DRAFT`, `PUBLISHED`).
- Post DTOs for create/update/detail/summary.
- `PostRepository` queries for public and owner scopes.
- `PostService` for ownership checks, slug generation, and lifecycle transitions.
- `SlugUtil` for deterministic URL-safe slugs.
- `PostController` exposing REST endpoints.

## Frontend Components

- `post-api` with typed request/response contracts.
- Home page fetches published posts for public feed.
- Dashboard supports:
  - create draft,
  - filter own posts by status,
  - publish draft,
  - delete post,
  - navigate to detail page.
- Post detail route `/posts/[slug]` loads and renders content.

## How the Draft to Publish Flow Works

1. Authenticated user creates post -> status is `DRAFT`.
2. User can update title/content/excerpt while in draft.
3. On publish call:
   - ownership is verified,
   - status switches to `PUBLISHED`,
   - `publishedAt` timestamp is set.
4. Published posts become visible in public list/detail endpoints.

## Authorization Rules

- Public users can only read published content.
- Authenticated users can manage only their own posts.
- Cross-user mutations are blocked with forbidden response.

## Consistency Notes

- Slug uniqueness is enforced with suffix strategy (`title`, `title-2`, ...).
- JPA `@Version` is enabled for optimistic lock readiness.
- Query layer separates public and owner views.

## Validation Scope

- Backend compiles and endpoints respond with expected status codes.
- Frontend build passes with dashboard/home/detail flows wired.
- End-to-end test path: register -> login -> create -> publish -> view public feed.
