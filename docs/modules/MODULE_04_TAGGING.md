# Module 04: Tagging and Taxonomy

## Goal

Add a robust tagging system so posts can be categorized, filtered, and discovered by topic.

## Status

Completed.

## Implementation Summary

- Tag entity and slug normalization are implemented with unique slug enforcement.
- Post-tag many-to-many mapping is active and duplicate assignment is naturally prevented by set semantics.
- API coverage is implemented:
  - GET /tags
  - PUT /posts/{id}/tags
  - GET /posts?tag=<tagSlug>
- Frontend coverage is implemented in dashboard, homepage tag chips, and post detail rendering.
- Tag upsert policy is implemented in service layer for missing tags.

## Core Scope

- Normalize `Tag` management with unique slugs.
- Attach multiple tags to a post using many-to-many relationship.
- Expose APIs to create/update post tags and filter posts by tag.
- Display tags in feed, detail page, and dashboard.

## Backend Design

### Data Model

- `Tag` (`id`, `name`, `slug`).
- `PostTag` join table (`post_id`, `tag_id`) with composite uniqueness.

### Endpoints (planned)

- `GET /tags`
- `POST /tags` (optional admin/author controlled)
- `PUT /posts/{id}/tags`
- `GET /posts?tag=<tagSlug>`

### Service Rules

- Tag names canonicalized (trim + case normalization strategy).
- Duplicate tags for same post prevented at service layer.
- Missing tags can be either auto-created or rejected based on policy.

## Frontend Design

- Tag input component in post editor/dashboard.
- Tag chips in post cards and details.
- Clickable tag filtering in homepage.
- Query cache invalidation for tag-dependent lists.

## Request Flow

1. Author submits selected tags with post update.
2. Backend validates tag list and upserts associations.
3. Feed query can filter by tag slug.
4. Frontend updates feed and active filters using React Query.

## Risks and Controls

- Risk: tag explosion with near-duplicates.
- Control: slug normalization and optional moderation policy.

## Validation Targets

- Tag add/remove from a post.
- Filtering by tag returns expected set.
- Duplicate assignment blocked.
