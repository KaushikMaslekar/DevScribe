package com.devscribe.dto.post;

public record PostLikeResponse(
        Long postId,
        long likesCount,
        boolean likedByMe
        ) {

}
