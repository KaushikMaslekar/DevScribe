package com.devscribe.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @NotBlank
        @Size(max = 255)
        String title,
        @Size(max = 1000)
        String excerpt,
        @NotBlank
        String markdownContent
        ) {

}
