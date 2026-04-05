package com.devscribe.dto.auth;

import com.devscribe.entity.UserRole;

public record UserMeResponse(
        Long id,
        String email,
        String username,
        UserRole role
        ) {

}
