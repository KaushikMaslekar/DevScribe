package com.devscribe.dto.user;

public record UserProfileResponse(
        Long id,
        String username,
        String displayName,
        String bio,
        String avatarUrl,
        long publishedPosts,
        long followers,
        long following,
        boolean followedByMe
        ) {

}
