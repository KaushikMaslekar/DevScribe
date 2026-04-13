package com.devscribe.dto.post;

public record PostBookmarkResponse(
        Long postId,
        boolean bookmarkedByMe
        ) {

}
