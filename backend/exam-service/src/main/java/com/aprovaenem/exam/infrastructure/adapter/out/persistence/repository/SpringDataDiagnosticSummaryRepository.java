package com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.DiagnosticSummaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataDiagnosticSummaryRepository extends JpaRepository<DiagnosticSummaryEntity, UUID> {

    Optional<DiagnosticSummaryEntity> findBySessionId(UUID sessionId);

    @Query("SELECT d FROM DiagnosticSummaryEntity d WHERE d.session.userId = :userId ORDER BY d.generatedAt DESC")
    List<DiagnosticSummaryEntity> findByUserIdOrderByGeneratedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT d FROM DiagnosticSummaryEntity d WHERE d.session.anonymousSessionId = :anonymousSessionId ORDER BY d.generatedAt DESC")
    List<DiagnosticSummaryEntity> findByAnonymousSessionIdOrderByGeneratedAtDesc(@Param("anonymousSessionId") String anonymousSessionId);
}
