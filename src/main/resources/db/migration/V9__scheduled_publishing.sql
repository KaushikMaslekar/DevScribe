ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;

ALTER TABLE post_autosave_snapshots
    ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_posts_scheduled_publish_at
    ON posts (status, scheduled_publish_at);