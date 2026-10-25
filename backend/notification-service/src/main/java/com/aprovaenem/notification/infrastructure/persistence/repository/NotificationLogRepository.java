package com.aprovaenem.notification.infrastructure.persistence.repository;

import com.aprovaenem.notification.infrastructure.persistence.entity.NotificationLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLogEntity, UUID> {

    Page<NotificationLogEntity> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<NotificationLogEntity> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status, Pageable pageable);

    long countByUserIdAndStatus(UUID userId, String status);

    long countByUserId(UUID userId);

    boolean existsByUserIdAndTemplateCode(UUID userId, String templateCode);

    Optional<NotificationLogEntity> findByIdAndUserId(UUID id, UUID userId);

    @Modifying
    @Transactional
    @Query("UPDATE NotificationLogEntity n SET n.status = 'READ', n.readAt = :readAt WHERE n.userId = :userId AND n.status != 'READ'")
    int markAllAsReadForUser(@Param("userId") UUID userId, @Param("readAt") Instant readAt);

    @Modifying
    @Transactional
    void deleteByUserId(UUID userId);
}

