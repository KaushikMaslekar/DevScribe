-- V5__performance_indexes.sql
-- Add indexes to optimize frequently used queries in getPosts() and search paths

-- Index for findByStatusOrderByPublishedAtDesc (homepage, published posts list)
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at_desc
  ON posts(status, published_at DESC NULLS LAST)
  WHERE status = 'PUBLISHED';

-- Index for findByAuthor_IdOrderByUpdatedAtDesc (user dashboard)
CREATE INDEX IF NOT EXISTS idx_posts_author_id_updated_at_desc
  ON posts(author_id, updated_at DESC);

-- Index for findByAuthor_IdAndStatusOrderByUpdatedAtDesc (user dashboard with status filter)
CREATE INDEX IF NOT EXISTS idx_posts_author_id_status_updated_at_desc
  ON posts(author_id, status, updated_at DESC);

-- Composite index for tag + status filtering (hot path - homepage with tag)
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id
  ON post_tags(tag_id);

-- Index on post slug for slug-based lookups (findBySlug, findBySlugAndStatus)
CREATE INDEX IF NOT EXISTS idx_posts_slug_unique
  ON posts(slug)
  WHERE status = 'PUBLISHED';

-- Cover index for post summaries (includes frequently selected columns)
-- Helps avoid additional table look-ups
CREATE INDEX IF NOT EXISTS idx_posts_cover_summary
  ON posts(status, published_at DESC, author_id)
  INCLUDE (id, title, excerpt, updated_at)
  WHERE status = 'PUBLISHED';
