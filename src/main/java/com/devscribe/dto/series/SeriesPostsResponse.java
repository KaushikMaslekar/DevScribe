package com.devscribe.dto.series;

import java.util.List;

public record SeriesPostsResponse(
        Long seriesId,
        List<SeriesPostItemResponse> posts
) {

}

