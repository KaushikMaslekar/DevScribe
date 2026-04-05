package com.devscribe.dto.auth;

public record AuthTokenPayload(
        String token,
        long expiresInMs,
        UserMeResponse user
        ) {

}
