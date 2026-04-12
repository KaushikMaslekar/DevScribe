package com.devscribe.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devscribe.entity.User;

public interface UserLookupRepository extends JpaRepository<User, Long> {

    @Query("""
            select u from User u
            where lower(u.email) = lower(:identifier)
               or lower(u.username) = lower(:identifier)
            """)
    Optional<User> findByEmailOrUsername(@Param("identifier") String identifier);
}
