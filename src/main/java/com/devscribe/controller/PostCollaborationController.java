package com.devscribe.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devscribe.dto.post.AddCollaboratorRequest;
import com.devscribe.dto.post.CollaborationSessionResponse;
import com.devscribe.dto.post.CollaboratorResponse;
import com.devscribe.service.PostCollaborationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/posts/{postId}/collaboration")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PostCollaborationController {

    private final PostCollaborationService postCollaborationService;

    @GetMapping("/session")
    public ResponseEntity<CollaborationSessionResponse> getSession(
            @PathVariable @NonNull Long postId
    ) {
        return ResponseEntity.ok(postCollaborationService.getSession(postId));
    }

    @GetMapping("/collaborators")
    public ResponseEntity<List<CollaboratorResponse>> listCollaborators(
            @PathVariable @NonNull Long postId
    ) {
        return ResponseEntity.ok(postCollaborationService.listCollaborators(postId));
    }

    @PostMapping("/collaborators")
    public ResponseEntity<CollaboratorResponse> addCollaborator(
            @PathVariable @NonNull Long postId,
            @Valid @RequestBody AddCollaboratorRequest request
    ) {
        return ResponseEntity.ok(postCollaborationService.addCollaborator(postId, request));
    }

    @DeleteMapping("/collaborators/{userId}")
    public ResponseEntity<Void> removeCollaborator(
            @PathVariable @NonNull Long postId,
            @PathVariable @NonNull Long userId
    ) {
        postCollaborationService.removeCollaborator(postId, userId);
        return ResponseEntity.noContent().build();
    }
}
