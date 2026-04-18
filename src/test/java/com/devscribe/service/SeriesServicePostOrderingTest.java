package com.devscribe.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import com.devscribe.dto.series.AttachSeriesPostRequest;
import com.devscribe.dto.series.ReorderSeriesPostsRequest;
import com.devscribe.dto.series.SeriesPostsResponse;
import com.devscribe.entity.Post;
import com.devscribe.entity.PostStatus;
import com.devscribe.entity.Series;
import com.devscribe.entity.SeriesPost;
import com.devscribe.entity.User;
import com.devscribe.repository.PostRepository;
import com.devscribe.repository.SeriesPostRepository;
import com.devscribe.repository.SeriesRepository;
import com.devscribe.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SeriesServicePostOrderingTest {

    @Mock
    private SeriesRepository seriesRepository;

    @Mock
    private SeriesPostRepository seriesPostRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SeriesService seriesService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void attachPostInsertsAtRequestedPosition() {
        User owner = User.builder().id(1L).email("owner@devscribe.com").username("owner").passwordHash("x").build();
        Series series = Series.builder().id(11L).author(owner).slug("spring-series").title("Spring").build();

        Post firstPost = Post.builder().id(101L).author(owner).slug("one").title("One").status(PostStatus.DRAFT).build();
        Post thirdPost = Post.builder().id(103L).author(owner).slug("three").title("Three").status(PostStatus.DRAFT).build();
        Post insertedPost = Post.builder().id(102L).author(owner).slug("two").title("Two").status(PostStatus.DRAFT).build();

        SeriesPost itemOne = SeriesPost.builder().series(series).post(firstPost).sortOrder(1).build();
        SeriesPost itemThree = SeriesPost.builder().series(series).post(thirdPost).sortOrder(2).build();

        SeriesPost insertedItem = SeriesPost.builder().series(series).post(insertedPost).sortOrder(2).build();
        List<SeriesPost> reorderedView = List.of(
                SeriesPost.builder().series(series).post(firstPost).sortOrder(1).build(),
                insertedItem,
                SeriesPost.builder().series(series).post(thirdPost).sortOrder(3).build()
        );

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("owner@devscribe.com", "n/a"));

        when(userRepository.findByEmail("owner@devscribe.com")).thenReturn(Optional.of(owner));
        when(seriesRepository.findById(11L)).thenReturn(Optional.of(series));
        when(postRepository.findById(102L)).thenReturn(Optional.of(insertedPost));
        when(seriesPostRepository.findBySeries_IdAndPost_Id(11L, 102L)).thenReturn(Optional.empty());
        when(seriesPostRepository.findByPost_Id(102L)).thenReturn(Optional.empty());
        when(seriesPostRepository.findBySeries_IdOrderBySortOrderAsc(11L))
                .thenReturn(List.of(itemOne, itemThree), reorderedView);
        when(seriesPostRepository.save(any(SeriesPost.class))).thenReturn(insertedItem);

        SeriesPostsResponse response = seriesService.attachPost(11L, new AttachSeriesPostRequest(102L, 2));

        assertEquals(3, response.posts().size());
        assertEquals(102L, response.posts().get(1).postId());
        assertEquals(3, response.posts().get(2).sortOrder());
    }

    @Test
    void reorderRejectsWhenPayloadDoesNotMatchCurrentPosts() {
        User owner = User.builder().id(1L).email("owner@devscribe.com").username("owner").passwordHash("x").build();
        Series series = Series.builder().id(11L).author(owner).slug("spring-series").title("Spring").build();

        Post firstPost = Post.builder().id(101L).author(owner).slug("one").title("One").status(PostStatus.DRAFT).build();
        Post secondPost = Post.builder().id(102L).author(owner).slug("two").title("Two").status(PostStatus.DRAFT).build();

        List<SeriesPost> currentItems = List.of(
                SeriesPost.builder().series(series).post(firstPost).sortOrder(1).build(),
                SeriesPost.builder().series(series).post(secondPost).sortOrder(2).build()
        );

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("owner@devscribe.com", "n/a"));

        when(userRepository.findByEmail("owner@devscribe.com")).thenReturn(Optional.of(owner));
        when(seriesRepository.findById(11L)).thenReturn(Optional.of(series));
        when(seriesPostRepository.findBySeries_IdOrderBySortOrderAsc(11L)).thenReturn(currentItems);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> seriesService.reorderPosts(11L, new ReorderSeriesPostsRequest(List.of(101L, 999L)))
        );

        assertEquals(400, exception.getStatusCode().value());
    }
}

