package com.devscribe.service;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.devscribe.dto.post.AddCollaboratorRequest;
import com.devscribe.dto.post.CollaborationSessionResponse;
import com.devscribe.dto.post.CollaboratorResponse;
import com.devscribe.entity.Post;
import com.devscribe.entity.PostCollaborator;
import com.devscribe.entity.User;
import com.devscribe.repository.PostCollaboratorRepository;
import com.devscribe.repository.PostRepository;
import com.devscribe.repository.UserLookupRepository;
import com.devscribe.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostCollaborationService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final UserLookupRepository userLookupRepository;
    private final PostCollaboratorRepository postCollaboratorRepository;

    @Transactional(readOnly = true)
    public CollaborationSessionResponse getSession(Long postId) {
        Post post = getPost(postId);
        User currentUser = getCurrentUser();

        boolean isOwner = post.getAuthor().getId().equals(currentUser.getId());
        boolean isCollaborator = postCollaboratorRepository.existsByPost_IdAndUser_Id(postId, currentUser.getId());

        if (!isOwner && !isCollaborator) {
            throw new ResponseStatusException(FORBIDDEN, "You do not have access to this collaboration session");
        }

        return new CollaborationSessionResponse(
                post.getId(),
                roomName(post.getId()),
                isOwner ? "OWNER" : "COLLABORATOR",
                true,
                true
        );
    }

    @Transactional(readOnly = true)
    public List<CollaboratorResponse> listCollaborators(Long postId) {
        Post post = getPost(postId);
        User currentUser = getCurrentUser();

        boolean isOwner = post.getAuthor().getId().equals(currentUser.getId());
        boolean isCollaborator = postCollaboratorRepository.existsByPost_IdAndUser_Id(postId, currentUser.getId());
        if (!isOwner && !isCollaborator) {
            throw new ResponseStatusException(FORBIDDEN, "You do not have access to this collaborator list");
        }

        return postCollaboratorRepository.findByPost_IdOrderByCreatedAtAsc(postId).stream()
                .map(collaborator -> new CollaboratorResponse(
                collaborator.getUser().getId(),
                collaborator.getUser().getUsername(),
                collaborator.getUser().getEmail(),
                collaborator.getCreatedAt()
        ))
                .toList();
    }

    @Transactional
    public CollaboratorResponse addCollaborator(Long postId, AddCollaboratorRequest request) {
        Post post = getPost(postId);
        ensureOwner(post);

        String identifier = request.identifier().trim();
        if (identifier.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "identifier is required");
        }

        User userToAdd = userLookupRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (userToAdd.getId().equals(post.getAuthor().getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Post author is already an editor");
        }

        if (postCollaboratorRepository.existsByPost_IdAndUser_Id(postId, userToAdd.getId())) {
            throw new ResponseStatusException(CONFLICT, "User is already a collaborator");
        }

        PostCollaborator collaborator = postCollaboratorRepository.save(
                PostCollaborator.builder()
                        .post(post)
                        .user(userToAdd)
                        .build()
        );

        return new CollaboratorResponse(
                collaborator.getUser().getId(),
                collaborator.getUser().getUsername(),
                collaborator.getUser().getEmail(),
                collaborator.getCreatedAt()
        );
    }

    @Transactional
    public void removeCollaborator(Long postId, Long userId) {
        Post post = getPost(postId);
        ensureOwner(post);

        if (userId.equals(post.getAuthor().getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot remove post author");
        }

        PostCollaborator existing = postCollaboratorRepository.findByPost_IdAndUser_Id(postId, userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Collaborator not found"));

        postCollaboratorRepository.deleteById(existing.getId());
    }

    private void ensureOwner(Post post) {
        User currentUser = getCurrentUser();
        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "Only post owner can manage collaborators");
        }
    }

    private Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Post not found"));
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

    private String roomName(Long postId) {
        return "post-" + postId;
    }
}
