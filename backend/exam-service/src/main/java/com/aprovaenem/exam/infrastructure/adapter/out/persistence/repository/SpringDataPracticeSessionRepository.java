package com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.exam.infrastructure.adapter.out.persistence.entity.PracticeSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataPracticeSessionRepository extends JpaRepository<PracticeSessionEntity, UUID> {

    List<PracticeSessionEntity> findByAnonymousSessionIdOrderByStartedAtDesc(String anonymousSessionId);

    List<PracticeSessionEntity> findByUserIdOrderByStartedAtDesc(UUID userId);
}
