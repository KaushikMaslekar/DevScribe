package com.devscribe.dto.post;

public record CollaborationSessionResponse(
        Long postId,
        String room,
        String role,
        boolean canEdit,
        boolean degradedModeFallback
        ) {

}
