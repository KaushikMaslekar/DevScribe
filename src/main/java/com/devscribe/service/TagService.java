package com.devscribe.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devscribe.entity.Tag;
import com.devscribe.repository.TagRepository;
import com.devscribe.util.SlugUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TagService {

    private static final int MAX_TAGS_PER_POST = 10;

    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public List<Tag> listAll() {
        return tagRepository.findAllByOrderByNameAsc();
    }

    @Transactional
    public Set<Tag> resolveAndUpsert(List<String> rawTags) {
        if (rawTags == null || rawTags.isEmpty()) {
            return new LinkedHashSet<>();
        }

        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String value : rawTags) {
            if (value == null) {
                continue;
            }

            String trimmed = value.trim();
            if (trimmed.isEmpty()) {
                continue;
            }

            String slug = SlugUtil.toSlug(trimmed);
            if (slug.isEmpty()) {
                continue;
            }
            normalized.add(slug);
        }

        if (normalized.size() > MAX_TAGS_PER_POST) {
            throw new IllegalArgumentException("A post can have at most 10 tags");
        }

        List<Tag> result = new ArrayList<>();
        for (String slug : normalized) {
            Tag existing = tagRepository.findBySlug(slug).orElse(null);
            Tag tag;
            if (existing != null) {
                tag = existing;
            } else {
                Tag newTag = Objects.requireNonNull(
                        Tag.builder()
                                .name(slug.replace('-', ' '))
                                .slug(slug)
                                .build()
                );
                Tag created = tagRepository.save(
                        newTag
                );
                tag = created;
            }
            result.add(tag);
        }

        return new LinkedHashSet<>(result);
    }
}
