package com.devscribe.service;

import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import com.devscribe.entity.Post;
import com.devscribe.entity.PostStatus;
import com.devscribe.entity.User;
import com.devscribe.realtime.PostRealtimePublisher;
import com.devscribe.repository.PostRepository;
import com.devscribe.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PostServiceOwnershipTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TagService tagService;

    @Mock
    private PostRealtimePublisher postRealtimePublisher;

    @InjectMocks
    private PostService postService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void publishRejectsWhenCurrentUserIsNotOwner() {
        User owner = User.builder().id(1L).email("owner@devscribe.com").username("owner").passwordHash("x").build();
        User otherUser = User.builder().id(2L).email("writer@devscribe.com").username("writer").passwordHash("x").build();
        Post post = Post.builder().id(100L).author(owner).slug("a").title("a").markdownContent("b").status(PostStatus.DRAFT).build();

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("writer@devscribe.com", "n/a"));

        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        when(userRepository.findByEmail("writer@devscribe.com")).thenReturn(Optional.of(otherUser));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> postService.publish(100L));
        assertEquals(403, exception.getStatusCode().value());
        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    void publishSucceedsForOwner() {
        User owner = User.builder().id(1L).email("owner@devscribe.com").username("owner").passwordHash("x").build();
        Post post = Post.builder().id(100L).author(owner).slug("a").title("a").markdownContent("b").status(PostStatus.DRAFT).build();

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("owner@devscribe.com", "n/a"));

        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        when(userRepository.findByEmail("owner@devscribe.com")).thenReturn(Optional.of(owner));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        postService.publish(100L);

        verify(postRepository).save(any(Post.class));
    }
}
