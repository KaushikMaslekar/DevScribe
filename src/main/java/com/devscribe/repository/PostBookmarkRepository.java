package com.devscribe.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devscribe.entity.PostBookmark;
import com.devscribe.entity.PostBookmarkId;

public interface PostBookmarkRepository extends JpaRepository<PostBookmark, PostBookmarkId> {

    boolean existsByUser_IdAndPost_Id(Long userId, Long postId);

    void deleteByUser_IdAndPost_Id(Long userId, Long postId);

    Page<PostBookmark> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("""
            select pb.post.id
            from PostBookmark pb
            where pb.user.id = :userId and pb.post.id in :postIds
            """)
    List<Long> findBookmarkedPostIdsByUserIdAndPostIds(@Param("userId") Long userId, @Param("postIds") List<Long> postIds);
}
