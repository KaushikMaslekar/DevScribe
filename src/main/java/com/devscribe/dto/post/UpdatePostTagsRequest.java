package com.devscribe.dto.post;

import java.util.List;

import jakarta.validation.constraints.Size;

public record UpdatePostTagsRequest(
        List<@Size(min = 1, max = 80) String> tags
        ) {

}
