package com.devscribe.dto.post;

import java.time.OffsetDateTime;
import java.util.List;

public record AutosaveSnapshotResponse(
        Long id,
        Long revision,
        String title,
        String excerpt,
        String markdownContent,
        List<String> tags,
        OffsetDateTime savedAt
        ) {

}
