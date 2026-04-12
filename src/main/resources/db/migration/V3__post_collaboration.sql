CREATE TABLE IF NOT EXISTS post_collaborators (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_post_collaborators_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_collaborators_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_post_collaborators_post_user UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_collaborators_post_id ON post_collaborators(post_id);
CREATE INDEX IF NOT EXISTS idx_post_collaborators_user_id ON post_collaborators(user_id);
