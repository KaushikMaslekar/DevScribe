package com.devscribe.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devscribe.entity.PostLike;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPost_Id(Long postId);

    boolean existsByPost_IdAndUser_Id(Long postId, Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from PostLike pl where pl.post.id = :postId and pl.user.id = :userId")
    int deleteByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);

    @Query("select pl.post.id as postId, count(pl.id) as likeCount from PostLike pl where pl.post.id in :postIds group by pl.post.id")
    List<PostLikeCountProjection> countLikesByPostIds(@Param("postIds") Collection<Long> postIds);

    @Query("select pl.post.id from PostLike pl where pl.user.id = :userId and pl.post.id in :postIds")
    List<Long> findLikedPostIdsByUserIdAndPostIds(@Param("userId") Long userId, @Param("postIds") Collection<Long> postIds);

    interface PostLikeCountProjection {

        Long getPostId();

        long getLikeCount();
    }
}
