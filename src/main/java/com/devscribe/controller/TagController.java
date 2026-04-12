package com.devscribe.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devscribe.service.TagService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<String>> list() {
        return ResponseEntity.ok(
                tagService.listAll().stream()
                        .map(tag -> tag.getSlug())
                        .toList()
        );
    }
}
