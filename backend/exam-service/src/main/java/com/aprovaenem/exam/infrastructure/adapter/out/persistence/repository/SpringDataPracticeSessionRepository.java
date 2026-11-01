package com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.PracticeSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataPracticeSessionRepository extends JpaRepository<PracticeSessionEntity, UUID> {

    List<PracticeSessionEntity> findByAnonymousSessionIdOrderByStartedAtDesc(String anonymousSessionId);

    List<PracticeSessionEntity> findByUserIdOrderByStartedAtDesc(UUID userId);

    @Modifying
    @Transactional
    @Query("UPDATE PracticeSessionEntity p SET p.userId = null WHERE p.userId = :userId")
    int anonymizeSessionsByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(DISTINCT p.userId) FROM PracticeSessionEntity p WHERE p.userId IS NOT NULL AND p.status = 'COMPLETED'")
    long countDistinctActiveStudents();

    @Query("SELECT COUNT(p) FROM PracticeSessionEntity p WHERE p.status = 'COMPLETED'")
    long countCompletedSessions();

    @Query("SELECT AVG(CAST(p.correctCount AS double) / CAST(p.totalQuestions AS double) * 100.0) FROM PracticeSessionEntity p WHERE p.status = 'COMPLETED' AND p.totalQuestions > 0")
    Double calculateOverallAverageScorePercentage();
}
