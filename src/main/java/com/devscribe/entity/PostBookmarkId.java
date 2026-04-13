package com.devscribe.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class PostBookmarkId implements Serializable {

    private Long user;
    private Long post;
}
