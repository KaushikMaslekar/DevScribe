package com.devscribe.dto.post;

import java.time.OffsetDateTime;

public record AutosavePostResponse(
        Long postId,
        String slug,
        long autosaveRevision,
        boolean accepted,
        OffsetDateTime savedAt
        ) {

}
