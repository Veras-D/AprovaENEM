package com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.QuestionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataQuestionRepository extends JpaRepository<QuestionEntity, UUID>, JpaSpecificationExecutor<QuestionEntity> {

    @Query(value = """
            SELECT q.* FROM questions q
            WHERE q.status = 'ACTIVE'
              AND (:topicId IS NULL OR q.topic_id = :topicId)
              AND (:difficulty IS NULL OR q.difficulty_level = :difficulty)
            ORDER BY RANDOM()
            LIMIT :limit
            """, nativeQuery = true)
    List<QuestionEntity> findRandomActiveQuestions(
            @Param("topicId") UUID topicId,
            @Param("difficulty") String difficulty,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT q.* FROM questions q
            JOIN topics t ON q.topic_id = t.id
            WHERE (:status IS NULL OR q.status = :status)
              AND (:topicId IS NULL OR q.topic_id = :topicId)
              AND (:discipline IS NULL OR LOWER(t.discipline) = LOWER(:discipline))
              AND (:difficulty IS NULL OR q.difficulty_level = :difficulty)
              AND (:searchTerm IS NULL OR to_tsvector('portuguese', q.statement) @@ plainto_tsquery('portuguese', :searchTerm))
            """,
            countQuery = """
            SELECT count(*) FROM questions q
            JOIN topics t ON q.topic_id = t.id
            WHERE (:status IS NULL OR q.status = :status)
              AND (:topicId IS NULL OR q.topic_id = :topicId)
              AND (:discipline IS NULL OR LOWER(t.discipline) = LOWER(:discipline))
              AND (:difficulty IS NULL OR q.difficulty_level = :difficulty)
              AND (:searchTerm IS NULL OR to_tsvector('portuguese', q.statement) @@ plainto_tsquery('portuguese', :searchTerm))
            """,
            nativeQuery = true)
    Page<QuestionEntity> searchQuestions(
            @Param("status") String status,
            @Param("topicId") UUID topicId,
            @Param("discipline") String discipline,
            @Param("difficulty") String difficulty,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
