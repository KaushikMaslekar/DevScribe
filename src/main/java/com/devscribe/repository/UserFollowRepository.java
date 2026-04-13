package com.devscribe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devscribe.entity.UserFollow;
import com.devscribe.entity.UserFollowId;

public interface UserFollowRepository extends JpaRepository<UserFollow, UserFollowId> {

    boolean existsByFollower_IdAndFollowed_Id(Long followerId, Long followedId);

    long countByFollower_Id(Long followerId);

    long countByFollowed_Id(Long followedId);

    void deleteByFollower_IdAndFollowed_Id(Long followerId, Long followedId);

    @Query("select uf.followed.id from UserFollow uf where uf.follower.id = :followerId")
    List<Long> findFollowedIdsByFollowerId(@Param("followerId") Long followerId);
}
