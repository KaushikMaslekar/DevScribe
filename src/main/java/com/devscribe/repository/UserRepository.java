package com.devscribe.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devscribe.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "delete from users where id = :userId", nativeQuery = true)
    int deleteByIdNative(@Param("userId") Long userId);
}
