package com.devscribe.dto.series;

public record SeriesPublicPostItemResponse(
        Long postId,
        String postSlug,
        String postTitle,
        int sortOrder
) {

}

