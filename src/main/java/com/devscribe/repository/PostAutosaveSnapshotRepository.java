package com.devscribe.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devscribe.entity.PostAutosaveSnapshot;

public interface PostAutosaveSnapshotRepository extends JpaRepository<PostAutosaveSnapshot, Long> {

    List<PostAutosaveSnapshot> findTop50ByPost_IdOrderByCreatedAtDesc(Long postId);

    Optional<PostAutosaveSnapshot> findByIdAndPost_Id(Long id, Long postId);

    @Modifying
    @Query(value = """
            delete from post_autosave_snapshots pas
            where pas.post_id = :postId
              and pas.id not in (
                select s.id
                from post_autosave_snapshots s
                where s.post_id = :postId
                order by s.created_at desc
                limit :keepCount
              )
            """, nativeQuery = true)
    void deleteOlderSnapshots(@Param("postId") Long postId, @Param("keepCount") int keepCount);
}
