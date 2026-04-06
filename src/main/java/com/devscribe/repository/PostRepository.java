package com.devscribe.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.devscribe.entity.Post;
import com.devscribe.entity.PostStatus;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlugAndStatus(String slug, PostStatus status);

    Optional<Post> findBySlug(String slug);

    Page<Post> findByStatusOrderByPublishedAtDesc(PostStatus status, Pageable pageable);

    Page<Post> findByAuthor_IdOrderByUpdatedAtDesc(Long authorId, Pageable pageable);

    Page<Post> findByAuthor_IdAndStatusOrderByUpdatedAtDesc(Long authorId, PostStatus status, Pageable pageable);

    boolean existsBySlug(String slug);
}
