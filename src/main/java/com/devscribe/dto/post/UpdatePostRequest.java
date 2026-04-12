package com.devscribe.dto.post;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePostRequest(
        @NotBlank
        @Size(max = 255)
        String title,
        @Size(max = 1000)
        String excerpt,
        @NotBlank
        String markdownContent,
        List<@Size(min = 1, max = 80) String> tags
        ) {

}
