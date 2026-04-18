package com.devscribe.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devscribe.entity.Series;

public interface SeriesRepository extends JpaRepository<Series, Long> {

    List<Series> findByAuthor_IdOrderByUpdatedAtDesc(Long authorId);

    Optional<Series> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
