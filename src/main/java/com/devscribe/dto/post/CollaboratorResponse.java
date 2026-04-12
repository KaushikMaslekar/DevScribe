package com.devscribe.dto.post;

import java.time.OffsetDateTime;

public record CollaboratorResponse(
        Long userId,
        String username,
        String email,
        OffsetDateTime addedAt
        ) {

}

        
