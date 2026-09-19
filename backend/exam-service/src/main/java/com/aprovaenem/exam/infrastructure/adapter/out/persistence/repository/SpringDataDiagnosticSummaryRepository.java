package com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.DiagnosticSummaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataDiagnosticSummaryRepository extends JpaRepository<DiagnosticSummaryEntity, UUID> {

    Optional<DiagnosticSummaryEntity> findBySessionId(UUID sessionId);
}
