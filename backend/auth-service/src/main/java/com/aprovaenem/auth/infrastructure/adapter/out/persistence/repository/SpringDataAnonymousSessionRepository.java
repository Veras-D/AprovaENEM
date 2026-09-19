package com.aprovaenem.auth.infrastructure.adapter.out.persistence.repository;

import com.aprovaenem.auth.infrastructure.adapter.out.persistence.entity.AnonymousSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataAnonymousSessionRepository extends JpaRepository<AnonymousSessionEntity, UUID> {

    Optional<AnonymousSessionEntity> findBySessionUuid(String sessionUuid);
}
