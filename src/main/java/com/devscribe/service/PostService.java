package com.devscribe.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.devscribe.dto.post.CreatePostRequest;
import com.devscribe.dto.post.PostDetailResponse;
import com.devscribe.dto.post.PostSummaryResponse;
import com.devscribe.dto.post.UpdatePostRequest;
import com.devscribe.entity.Post;
import com.devscribe.entity.PostStatus;
import com.devscribe.entity.User;
import com.devscribe.repository.PostRepository;
import com.devscribe.repository.UserRepository;
import com.devscribe.util.SlugUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<PostSummaryResponse> getPosts(int page, int size, boolean mine, PostStatus status) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "updatedAt"));

        Page<Post> postPage;
        if (mine) {
            User user = getCurrentUser();
            if (status != null) {
                postPage = postRepository.findByAuthor_IdAndStatusOrderByUpdatedAtDesc(user.getId(), status, pageable);
            } else {
                postPage = postRepository.findByAuthor_IdOrderByUpdatedAtDesc(user.getId(), pageable);
            }
        } else {
            postPage = postRepository.findByStatusOrderByPublishedAtDesc(PostStatus.PUBLISHED, pageable);
        }

        return postPage.map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public PostDetailResponse getBySlug(String slug) {
        Post post = postRepository.findBySlugAndStatus(slug, PostStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Post not found"));

        return toDetail(post);
    }

    @Transactional
    public PostDetailResponse create(CreatePostRequest request) {
        User currentUser = getCurrentUser();

        String slug = createUniqueSlug(request.title());
        Post post = Post.builder()
                .author(currentUser)
                .slug(slug)
                .title(request.title().trim())
                .excerpt(request.excerpt())
                .markdownContent(request.markdownContent())
                .status(PostStatus.DRAFT)
                .build();

        return toDetail(postRepository.save(post));
    }

    @Transactional
    public PostDetailResponse update(Long id, UpdatePostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Post not found"));
        ensureOwnership(post);

        if (!post.getTitle().equals(request.title().trim())) {
            post.setTitle(request.title().trim());
            post.setSlug(createUniqueSlug(request.title(), post.getId()));
        }
        post.setExcerpt(request.excerpt());
        post.setMarkdownContent(request.markdownContent());

        return toDetail(postRepository.save(post));
    }

    @Transactional
    public void delete(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Post not found"));
        ensureOwnership(post);

        postRepository.delete(post);
    }

    @Transactional
    public PostDetailResponse publish(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Post not found"));
        ensureOwnership(post);

        post.setStatus(PostStatus.PUBLISHED);
        if (post.getPublishedAt() == null) {
            post.setPublishedAt(OffsetDateTime.now());
        }

        return toDetail(postRepository.save(post));
    }

    private void ensureOwnership(Post post) {
        User currentUser = getCurrentUser();
        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You do not have access to this post");
        }
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

    private String createUniqueSlug(String title) {
        return createUniqueSlug(title, null);
    }

    private String createUniqueSlug(String title, Long currentPostId) {
        String baseSlug = SlugUtil.toSlug(title);
        String slug = baseSlug;
        int suffix = 1;

        while (true) {
            Post existing = postRepository.findBySlug(slug).orElse(null);
            if (existing == null || (currentPostId != null && existing.getId().equals(currentPostId))) {
                return slug;
            }

            suffix += 1;
            slug = baseSlug + "-" + suffix;
        }
    }

    private PostSummaryResponse toSummary(Post post) {
        return new PostSummaryResponse(
                post.getId(),
                post.getSlug(),
                post.getTitle(),
                post.getExcerpt(),
                post.getAuthor().getUsername(),
                post.getStatus(),
                post.getPublishedAt(),
                post.getUpdatedAt()
        );
    }

    private PostDetailResponse toDetail(Post post) {
        return new PostDetailResponse(
                post.getId(),
                post.getSlug(),
                post.getTitle(),
                post.getExcerpt(),
                post.getMarkdownContent(),
                post.getAuthor().getUsername(),
                post.getStatus(),
                post.getPublishedAt(),
                post.getUpdatedAt(),
                List.of(),
                0
        );
    }
}
