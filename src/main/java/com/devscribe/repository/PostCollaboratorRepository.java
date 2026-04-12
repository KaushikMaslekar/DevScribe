package com.devscribe.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devscribe.entity.PostCollaborator;


public interface PostCollaboratorRepository extends JpaRepository<PostCollaborator, Long> {

    List<PostCollaborator> findByPost_IdOrderByCreatedAtAsc(Long postId);

    Optional<PostCollaborator> findByPost_IdAndUser_Id(Long postId, Long userId);

    boolean existsByPost_IdAndUser_Id(Long postId, Long userId);

    void deleteByPost_IdAndUser_Id(Long postId, Long userId);
}
