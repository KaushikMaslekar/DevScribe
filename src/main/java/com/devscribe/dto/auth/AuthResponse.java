package com.devscribe.dto.auth;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInMs,
        UserMeResponse user
        ) {

}
