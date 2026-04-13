CREATE TABLE IF NOT EXISTS post_autosave_snapshots (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    revision BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    markdown_content TEXT NOT NULL DEFAULT '',
    tags_csv TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_post_autosave_snapshots_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT uq_post_autosave_snapshots_post_revision UNIQUE (post_id, revision)
);

CREATE INDEX IF NOT EXISTS idx_post_autosave_snapshots_post_created_at
    ON post_autosave_snapshots (post_id, created_at DESC);
