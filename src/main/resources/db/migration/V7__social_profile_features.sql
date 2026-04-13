ALTER TABLE users
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS user_follows (
    follower_id BIGINT NOT NULL,
    followed_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_id),
    CONSTRAINT fk_user_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_follows_followed FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_user_follows_not_self CHECK (follower_id <> followed_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_followed_created_at
    ON user_follows (followed_id, created_at DESC);

CREATE TABLE IF NOT EXISTS post_bookmarks (
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id),
    CONSTRAINT fk_post_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_bookmarks_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_bookmarks_post_created_at
    ON post_bookmarks (post_id, created_at DESC);
