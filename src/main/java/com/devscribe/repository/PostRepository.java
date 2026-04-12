package com.devscribe.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devscribe.entity.Post;
import com.devscribe.entity.PostStatus;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlugAndStatus(String slug, PostStatus status);

    Optional<Post> findBySlug(String slug);

    Page<Post> findByStatusOrderByPublishedAtDesc(PostStatus status, Pageable pageable);

    Page<Post> findDistinctByStatusAndTags_SlugOrderByPublishedAtDesc(PostStatus status, String tagSlug, Pageable pageable);

    Page<Post> findByAuthor_IdOrderByUpdatedAtDesc(Long authorId, Pageable pageable);

    Page<Post> findByAuthor_IdAndStatusOrderByUpdatedAtDesc(Long authorId, PostStatus status, Pageable pageable);

    Page<Post> findDistinctByAuthor_IdAndTags_SlugOrderByUpdatedAtDesc(Long authorId, String tagSlug, Pageable pageable);

    Page<Post> findDistinctByAuthor_IdAndStatusAndTags_SlugOrderByUpdatedAtDesc(
            Long authorId,
            PostStatus status,
            String tagSlug,
            Pageable pageable
    );

    boolean existsBySlug(String slug);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "delete from posts where author_id = :authorId", nativeQuery = true)
    int deleteAllByAuthorIdNative(@Param("authorId") Long authorId);
}
