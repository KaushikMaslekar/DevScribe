package com.devscribe.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PostPublishingScheduler {

    private final PostService postService;

    @Scheduled(fixedDelayString = "${devscribe.scheduling.publish-delay-ms:60000}")
    public void publishScheduledPosts() {
        postService.publishDueScheduledPosts();
    }
}
