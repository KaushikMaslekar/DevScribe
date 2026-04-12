create table if not exists post_likes (
    id bigserial primary key,
    post_id bigint not null references posts(id) on delete cascade,
    user_id bigint not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    constraint uq_post_likes_post_user unique (post_id, user_id)
);

create index if not exists idx_post_likes_post_id on post_likes(post_id);
create index if not exists idx_post_likes_user_id on post_likes(user_id);
