package com.devscribe.dto.series;

import java.util.List;

public record SeriesDetailResponse(
        Long id,
        String slug,
        String title,
        String description,
        String authorUsername,
        long postsCount,
        List<SeriesPublicPostItemResponse> posts,
        String currentPostSlug,
        String previousPostSlug,
        String nextPostSlug
) {

}

