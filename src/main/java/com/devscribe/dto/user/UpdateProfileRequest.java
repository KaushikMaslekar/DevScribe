package com.devscribe.dto.user;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 120, message = "displayName must be at most 120 characters")
        String displayName,
        @Size(max = 1000, message = "bio must be at most 1000 characters")
        String bio,
        @Size(max = 512, message = "avatarUrl must be at most 512 characters")
        String avatarUrl
        ) {

}
