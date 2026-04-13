package com.devscribe.dto.post;

import java.time.OffsetDateTime;
import java.util.List;

import com.devscribe.entity.PostStatus;

public record PostDetailResponse(
        Long id,
        String slug,
        String title,
        String excerpt,
        String markdownContent,
        String authorUsername,
        String seriesSlug,
        String seriesTitle,
        Integer seriesOrder,
        PostStatus status,
        OffsetDateTime publishedAt,
        OffsetDateTime scheduledPublishAt,
        OffsetDateTime updatedAt,
        List<String> tags,
        int readingTimeMinutes,
        List<PostTocItemResponse> tableOfContents,
        long views,
        long likesCount,
        boolean likedByMe,
        boolean bookmarkedByMe,
        boolean authorFollowedByMe
        ) {

}
