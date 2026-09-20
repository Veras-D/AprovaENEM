package com.aprovaenem.notification.infrastructure.persistence.repository;

import com.aprovaenem.notification.infrastructure.persistence.entity.NotificationLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLogEntity, UUID> {

    Page<NotificationLogEntity> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<NotificationLogEntity> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status, Pageable pageable);

    long countByUserIdAndStatus(UUID userId, String status);

    Optional<NotificationLogEntity> findByIdAndUserId(UUID id, UUID userId);
}
