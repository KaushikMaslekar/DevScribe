package com.devscribe.dto.series;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AttachSeriesPostRequest(
        @NotNull
        Long postId,
        @Min(1)
        Integer sortOrder
) {

}

