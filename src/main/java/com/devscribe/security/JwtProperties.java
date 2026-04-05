package com.devscribe.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "devscribe.security.jwt")
public record JwtProperties(
        String secret,
        long expirationMs
        ) {

}
