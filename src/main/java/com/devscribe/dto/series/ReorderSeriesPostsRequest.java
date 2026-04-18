package com.devscribe.dto.series;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReorderSeriesPostsRequest(
        @NotNull
        @Size(min = 1)
        List<@NotNull Long> postIds
) {

}

