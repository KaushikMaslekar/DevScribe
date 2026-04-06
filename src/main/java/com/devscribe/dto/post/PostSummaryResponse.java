package com.devscribe.dto.post;

import java.time.OffsetDateTime;

import com.devscribe.entity.PostStatus;

public record PostSummaryResponse(
        Long id,
        String slug,
        String title,
        String excerpt,
        String authorUsername,
        PostStatus status,
        OffsetDateTime publishedAt,
        OffsetDateTime updatedAt
        ) {

}
