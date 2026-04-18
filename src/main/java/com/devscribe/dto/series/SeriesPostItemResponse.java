package com.devscribe.dto.series;

import com.devscribe.entity.PostStatus;

public record SeriesPostItemResponse(
        Long postId,
        String postSlug,
        String postTitle,
        PostStatus postStatus,
        int sortOrder
) {

}

