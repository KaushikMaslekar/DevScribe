package com.devscribe.dto.post;

import jakarta.validation.constraints.NotBlank;

public record AddCollaboratorRequest(
        @NotBlank(message = "identifier is required")
        String identifier
        ) {

}
