package com.devscribe.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class UserFollowId implements Serializable {

    private Long follower;
    private Long followed;
}
