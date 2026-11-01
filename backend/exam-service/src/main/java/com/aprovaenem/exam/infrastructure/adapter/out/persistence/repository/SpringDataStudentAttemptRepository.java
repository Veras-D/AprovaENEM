package com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.StudentAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataStudentAttemptRepository extends JpaRepository<StudentAttemptEntity, UUID> {

    boolean existsBySession_IdAndQuestion_Id(UUID sessionId, UUID questionId);

    List<StudentAttemptEntity> findBySession_IdOrderBySubmittedAtAsc(UUID sessionId);

    @Query("""
        SELECT s.code,
               COUNT(a),
               SUM(CASE WHEN a.isCorrect = true THEN 1L ELSE 0L END)
        FROM StudentAttemptEntity a
        JOIN a.question q
        JOIN q.topic t
        JOIN t.subject s
        GROUP BY s.code
    """)
    List<Object[]> findAccuracyBySubjectArea();

    @Query("""
        SELECT s.code,
               t.name,
               COUNT(a),
               SUM(CASE WHEN a.isCorrect = true THEN 1L ELSE 0L END)
        FROM StudentAttemptEntity a
        JOIN a.question q
        JOIN q.topic t
        JOIN t.subject s
        GROUP BY s.code, t.name
    """)
    List<Object[]> findAccuracyByTopic();

    @Query(value = """
        SELECT CAST(q.id AS VARCHAR),
               q.item_number,
               CAST(q.correct_option AS VARCHAR),
               CAST(a.selected_option AS VARCHAR),
               COUNT(a) AS distractor_count,
               (SELECT COUNT(a2.id) FROM student_attempts a2 WHERE a2.question_id = q.id) AS total_question_attempts
        FROM student_attempts a
        JOIN questions q ON a.question_id = q.id
        WHERE a.is_correct = false
        GROUP BY q.id, q.item_number, q.correct_option, a.selected_option
        ORDER BY distractor_count DESC
        LIMIT 3
    """, nativeQuery = true)
    List<Object[]> findTopDistractorPitfalls();
}
