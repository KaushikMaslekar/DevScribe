# Module 09: Search and Discovery

## Goal

Provide fast, relevant post discovery with progressive enhancement from SQL search to advanced full-text search.

## Status

Planned.

## Core Scope

- Basic SQL search by title/excerpt/content.
- Debounced frontend search input with dynamic result rendering.
- Optional Elasticsearch integration for advanced relevance.

## Backend Search Layers

### Layer 1: SQL Search

- Query approach: case-insensitive `LIKE`/`ILIKE` for published posts.
- Supports pagination and optional tag/status filters.

### Layer 2: Elasticsearch (optional)

- Index published content with incremental updates.
- Use analyzers for better ranking and language-aware tokenization.
- Fallback to SQL when ES unavailable.

## Frontend Flow

1. User types in search input.
2. Debounce window reduces API chatter.
3. Query sent with text and paging params.
4. Results rendered with loading and empty states.

## Performance Considerations

- Query response should stay predictable under load.
- Avoid full table scans through proper indexing and constraints.
- Cache frequent search patterns where beneficial.

## Validation Targets

- Search returns relevant published posts.
- Debounce behavior prevents over-fetching.
- Optional ES integration improves ranking quality.
