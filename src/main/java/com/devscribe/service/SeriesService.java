package com.devscribe.service;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.devscribe.dto.series.AttachSeriesPostRequest;
import com.devscribe.dto.series.CreateSeriesRequest;
import com.devscribe.dto.series.ReorderSeriesPostsRequest;
import com.devscribe.dto.series.SeriesPostItemResponse;
import com.devscribe.dto.series.SeriesPostsResponse;
import com.devscribe.dto.series.SeriesSummaryResponse;
import com.devscribe.entity.Post;
import com.devscribe.entity.Series;
import com.devscribe.entity.SeriesPost;
import com.devscribe.entity.User;
import com.devscribe.repository.PostRepository;
import com.devscribe.repository.SeriesPostRepository;
import com.devscribe.repository.SeriesRepository;
import com.devscribe.repository.UserRepository;
import com.devscribe.util.SlugUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SeriesService {

    private final SeriesRepository seriesRepository;
    private final SeriesPostRepository seriesPostRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public SeriesSummaryResponse create(CreateSeriesRequest request) {
        User currentUser = getCurrentUser();
        String normalizedTitle = request.title().trim();
        String slug = createUniqueSlug(normalizedTitle);

        Series series = Series.builder()
                .author(currentUser)
                .slug(slug)
                .title(normalizedTitle)
                .description(normalizeDescription(request.description()))
                .build();

        Series saved = seriesRepository.save(series);
        return toSummary(saved);
    }

    @Transactional(readOnly = true)
    public List<SeriesSummaryResponse> listMine() {
        User currentUser = getCurrentUser();
        return seriesRepository.findByAuthor_IdOrderByUpdatedAtDesc(currentUser.getId()).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public SeriesPostsResponse listPosts(@NonNull Long seriesId) {
        Series series = getOwnedSeries(seriesId);
        return toSeriesPostsResponse(series.getId());
    }

    @Transactional
    public SeriesPostsResponse attachPost(@NonNull Long seriesId, AttachSeriesPostRequest request) {
        Series series = getOwnedSeries(seriesId);
        Post post = getOwnedPost(request.postId());

        if (seriesPostRepository.findBySeries_IdAndPost_Id(seriesId, post.getId()).isPresent()) {
            throw new ResponseStatusException(BAD_REQUEST, "Post is already attached to this series");
        }

        SeriesPost existingSeriesPost = seriesPostRepository.findByPost_Id(post.getId()).orElse(null);
        if (existingSeriesPost != null && !existingSeriesPost.getSeries().getId().equals(seriesId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Post is already attached to another series");
        }

        List<SeriesPost> currentSeriesPosts = seriesPostRepository.findBySeries_IdOrderBySortOrderAsc(seriesId);
        int targetSortOrder = resolveTargetSortOrder(request.sortOrder(), currentSeriesPosts.size());

        for (SeriesPost seriesPost : currentSeriesPosts) {
            if (seriesPost.getSortOrder() >= targetSortOrder) {
                seriesPost.setSortOrder(seriesPost.getSortOrder() + 1);
            }
        }
        if (!currentSeriesPosts.isEmpty()) {
            seriesPostRepository.saveAll(currentSeriesPosts);
        }

        seriesPostRepository.save(SeriesPost.builder()
                .series(series)
                .post(post)
                .sortOrder(targetSortOrder)
                .build());

        return toSeriesPostsResponse(seriesId);
    }

    @Transactional
    public SeriesPostsResponse reorderPosts(@NonNull Long seriesId, ReorderSeriesPostsRequest request) {
        getOwnedSeries(seriesId);
        List<SeriesPost> currentSeriesPosts = seriesPostRepository.findBySeries_IdOrderBySortOrderAsc(seriesId);

        if (currentSeriesPosts.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Series has no posts to reorder");
        }

        List<Long> requestedOrder = request.postIds();
        if (requestedOrder.size() != currentSeriesPosts.size()) {
            throw new ResponseStatusException(BAD_REQUEST, "Reorder payload must include all series posts exactly once");
        }

        Set<Long> uniqueRequestedPostIds = new HashSet<>(requestedOrder);
        if (uniqueRequestedPostIds.size() != requestedOrder.size()) {
            throw new ResponseStatusException(BAD_REQUEST, "Reorder payload contains duplicate post ids");
        }

        Set<Long> currentPostIds = currentSeriesPosts.stream()
                .map(seriesPost -> seriesPost.getPost().getId())
                .collect(Collectors.toSet());
        if (!currentPostIds.equals(uniqueRequestedPostIds)) {
            throw new ResponseStatusException(BAD_REQUEST, "Reorder payload must match current series posts");
        }

        Map<Long, SeriesPost> byPostId = currentSeriesPosts.stream()
                .collect(Collectors.toMap(seriesPost -> seriesPost.getPost().getId(), Function.identity()));

        for (int i = 0; i < requestedOrder.size(); i += 1) {
            Long postId = requestedOrder.get(i);
            SeriesPost seriesPost = byPostId.get(postId);
            seriesPost.setSortOrder(i + 1);
        }
        seriesPostRepository.saveAll(currentSeriesPosts);

        return toSeriesPostsResponse(seriesId);
    }

    private int resolveTargetSortOrder(Integer requestedSortOrder, int currentSize) {
        if (requestedSortOrder == null) {
            return currentSize + 1;
        }

        if (requestedSortOrder < 1 || requestedSortOrder > currentSize + 1) {
            throw new ResponseStatusException(BAD_REQUEST, "sortOrder must be between 1 and current series size + 1");
        }

        return requestedSortOrder;
    }

    private Series getOwnedSeries(Long seriesId) {
        Series series = seriesRepository.findById(seriesId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Series not found"));

        User currentUser = getCurrentUser();
        if (!series.getAuthor().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You do not have access to this series");
        }

        return series;
    }

    private Post getOwnedPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Post not found"));

        User currentUser = getCurrentUser();
        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You do not have access to this post");
        }

        return post;
    }

    private SeriesPostsResponse toSeriesPostsResponse(Long seriesId) {
        List<SeriesPostItemResponse> items = seriesPostRepository.findBySeries_IdOrderBySortOrderAsc(seriesId).stream()
                .map(seriesPost -> new SeriesPostItemResponse(
                        seriesPost.getPost().getId(),
                        seriesPost.getPost().getSlug(),
                        seriesPost.getPost().getTitle(),
                        seriesPost.getPost().getStatus(),
                        seriesPost.getSortOrder()
                ))
                .toList();

        return new SeriesPostsResponse(seriesId, items);
    }

    private SeriesSummaryResponse toSummary(Series series) {
        return new SeriesSummaryResponse(
                series.getId(),
                series.getSlug(),
                series.getTitle(),
                series.getDescription(),
                series.getAuthor().getUsername(),
                0,
                series.getCreatedAt(),
                series.getUpdatedAt()
        );
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(FORBIDDEN, "Authentication required");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    private String createUniqueSlug(String title) {
        String baseSlug = SlugUtil.toSlug(title);
        if (baseSlug.isBlank()) {
            baseSlug = "series";
        }

        String slug = baseSlug;
        int suffix = 1;
        while (seriesRepository.existsBySlug(slug)) {
            suffix += 1;
            slug = baseSlug + "-" + suffix;
        }

        return slug;
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }

        String trimmed = description.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        return trimmed;
    }
}
