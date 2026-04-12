package com.devscribe.config;

import java.util.concurrent.TimeUnit;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

/**
 * Caching configuration for performance optimization. Uses Caffeine (in-memory
 * cache) with TTL-based expiration. Can be easily switched to Redis for
 * distributed caching.
 */
@Configuration
@EnableCaching
public class CachingConfig {

    public static final String CACHE_POST_BY_SLUG = "post_by_slug";
    public static final String CACHE_POSTS_LIST = "posts_list";
    public static final String CACHE_TAGS = "tags";
    public static final String CACHE_PUBLISHED_POSTS = "published_posts";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                CACHE_POST_BY_SLUG,
                CACHE_POSTS_LIST,
                CACHE_TAGS,
                CACHE_PUBLISHED_POSTS
        );

        // Default cache configuration: 10 minutes TTL, max 1000 entries
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(1000)
                .recordStats());

        return cacheManager;
    }
}
