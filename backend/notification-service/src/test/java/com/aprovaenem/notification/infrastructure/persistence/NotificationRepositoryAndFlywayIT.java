package com.aprovaenem.notification.infrastructure.persistence;

import com.aprovaenem.notification.infrastructure.persistence.entity.NotificationLogEntity;
import com.aprovaenem.notification.infrastructure.persistence.entity.UserDeviceTokenEntity;
import com.aprovaenem.notification.infrastructure.persistence.repository.NotificationLogRepository;
import com.aprovaenem.notification.infrastructure.persistence.repository.UserDeviceTokenRepository;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.rabbitmq.listener.simple.auto-startup=false"
})
@Testcontainers
class NotificationRepositoryAndFlywayIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("notification_db")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.url", postgres::getJdbcUrl);
        registry.add("spring.flyway.user", postgres::getUsername);
        registry.add("spring.flyway.password", postgres::getPassword);
    }

    @Autowired
    private Flyway flyway;

    @Autowired
    private UserDeviceTokenRepository deviceTokenRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Test
    @DisplayName("Flyway migrations V1 and V2 should execute cleanly on PostgreSQL 16")
    void shouldExecuteFlywayMigrations() {
        assertThat(flyway.info().applied()).isNotEmpty();
        assertThat(flyway.info().applied()).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("UserDeviceTokenRepository should persist, find active tokens, and handle deactivation")
    void shouldPersistAndQueryDeviceTokens() {
        UUID userId = UUID.randomUUID();
        String tokenStr = "fcm-token-" + UUID.randomUUID();

        UserDeviceTokenEntity token = UserDeviceTokenEntity.builder()
                .userId(userId)
                .deviceToken(tokenStr)
                .platform("ANDROID")
                .isActive(true)
                .build();

        UserDeviceTokenEntity saved = deviceTokenRepository.save(token);
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();

        List<UserDeviceTokenEntity> activeTokens = deviceTokenRepository.findByUserIdAndIsActiveTrue(userId);
        assertThat(activeTokens).hasSize(1);
        assertThat(activeTokens.get(0).getDeviceToken()).isEqualTo(tokenStr);

        Optional<UserDeviceTokenEntity> byToken = deviceTokenRepository.findByDeviceToken(tokenStr);
        assertThat(byToken).isPresent();
        assertThat(byToken.get().getUserId()).isEqualTo(userId);

        // Deactivate token
        saved.setActive(false);
        deviceTokenRepository.save(saved);

        List<UserDeviceTokenEntity> activeAfterDeactivation = deviceTokenRepository.findByUserIdAndIsActiveTrue(userId);
        assertThat(activeAfterDeactivation).isEmpty();
    }

    @Test
    @DisplayName("NotificationLogRepository should persist notifications with JSON metadata and support inbox queries")
    void shouldPersistAndQueryNotificationLogs() {
        UUID userId = UUID.randomUUID();

        NotificationLogEntity log1 = NotificationLogEntity.builder()
                .userId(userId)
                .channel("IN_APP")
                .templateCode("STREAK_REMINDER")
                .title("Keep your streak alive!")
                .body("You have 4 hours left to complete your daily goal.")
                .metadata("{\"streakDays\": 5, \"source\": \"daily_cron\"}")
                .status("PENDING")
                .build();

        NotificationLogEntity log2 = NotificationLogEntity.builder()
                .userId(userId)
                .channel("EMAIL")
                .templateCode("WELCOME_EMAIL")
                .title("Welcome to AprovaENEM")
                .body("Get started with your free diagnostic exam today.")
                .metadata("{\"campaign\": \"onboarding_2026\"}")
                .status("DELIVERED")
                .sentAt(Instant.now())
                .build();

        notificationLogRepository.save(log1);
        notificationLogRepository.save(log2);

        Page<NotificationLogEntity> feed = notificationLogRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(0, 10)
        );
        assertThat(feed.getTotalElements()).isEqualTo(2);

        long pendingCount = notificationLogRepository.countByUserIdAndStatus(userId, "PENDING");
        assertThat(pendingCount).isEqualTo(1);

        long deliveredCount = notificationLogRepository.countByUserIdAndStatus(userId, "DELIVERED");
        assertThat(deliveredCount).isEqualTo(1);

        // Mark log1 as read
        log1.setStatus("READ");
        log1.setReadAt(Instant.now());
        notificationLogRepository.save(log1);

        Page<NotificationLogEntity> pendingFeed = notificationLogRepository.findByUserIdAndStatusOrderByCreatedAtDesc(
                userId, "PENDING", PageRequest.of(0, 10)
        );
        assertThat(pendingFeed.getTotalElements()).isZero();
    }
}
