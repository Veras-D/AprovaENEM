package com.aprovaenem.notification.application.service;

import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.CreateInAppNotificationRequest;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.MarkAllNotificationsReadResponse;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.MarkNotificationReadResponse;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.NotificationFeedResponse;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.RegisterDeviceTokenRequest;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.RegisterDeviceTokenResponse;
import com.aprovaenem.notification.infrastructure.persistence.entity.NotificationLogEntity;
import com.aprovaenem.notification.infrastructure.persistence.entity.UserDeviceTokenEntity;
import com.aprovaenem.notification.infrastructure.persistence.repository.NotificationLogRepository;
import com.aprovaenem.notification.infrastructure.persistence.repository.UserDeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationLogRepository notificationLogRepository;
    private final UserDeviceTokenRepository userDeviceTokenRepository;

    @Transactional
    public RegisterDeviceTokenResponse registerDeviceToken(UUID userId, RegisterDeviceTokenRequest request) {
        Optional<UserDeviceTokenEntity> existing = userDeviceTokenRepository.findByDeviceToken(request.getDeviceToken());
        Instant now = Instant.now();

        UserDeviceTokenEntity entity;
        if (existing.isPresent()) {
            entity = existing.get();
            entity.setUserId(userId);
            entity.setPlatform(request.getPlatform());
            entity.setActive(true);
            entity.setLastUsedAt(now);
        } else {
            entity = UserDeviceTokenEntity.builder()
                    .userId(userId)
                    .deviceToken(request.getDeviceToken())
                    .platform(request.getPlatform())
                    .isActive(true)
                    .createdAt(now)
                    .lastUsedAt(now)
                    .build();
        }

        userDeviceTokenRepository.save(entity);
        log.info("Registered [{}] push token for user [{}]", request.getPlatform(), userId);

        return RegisterDeviceTokenResponse.builder()
                .message("Device push token registered successfully.")
                .platform(entity.getPlatform())
                .registeredAt(entity.getLastUsedAt())
                .build();
    }

    @Transactional
    public NotificationFeedResponse getFeed(UUID userId, String statusFilter, int page, int size) {
        seedDefaultInAppNotificationsIfEmpty(userId);

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50));
        Page<NotificationLogEntity> pageResult;

        if ("UNREAD".equalsIgnoreCase(statusFilter)) {
            pageResult = notificationLogRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "SENT", pageable);
        } else {
            pageResult = notificationLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        long unreadCount = notificationLogRepository.countByUserIdAndStatus(userId, "SENT");

        List<NotificationFeedResponse.NotificationItemDto> items = pageResult.getContent().stream()
                .map(n -> NotificationFeedResponse.NotificationItemDto.builder()
                        .id(n.getId())
                        .channel(n.getChannel())
                        .templateCode(n.getTemplateCode())
                        .title(n.getTitle())
                        .body(n.getBody())
                        .metadata(n.getMetadata())
                        .status(n.getStatus())
                        .sentAt(n.getSentAt())
                        .readAt(n.getReadAt())
                        .build())
                .toList();

        return NotificationFeedResponse.builder()
                .unreadCount(unreadCount)
                .notifications(items)
                .build();
    }

    @Transactional
    public MarkNotificationReadResponse markAsRead(UUID userId, UUID notificationId) {
        NotificationLogEntity entity = notificationLogRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found for ID: " + notificationId));

        Instant now = Instant.now();
        entity.setStatus("READ");
        entity.setReadAt(now);
        notificationLogRepository.save(entity);

        log.info("Marked notification [{}] as READ for user [{}]", notificationId, userId);

        return MarkNotificationReadResponse.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .readAt(entity.getReadAt())
                .build();
    }

    @Transactional
    public MarkAllNotificationsReadResponse markAllAsRead(UUID userId) {
        Instant now = Instant.now();
        int markedCount = notificationLogRepository.markAllAsReadForUser(userId, now);
        log.info("Marked [{}] notifications as READ for user [{}]", markedCount, userId);

        return MarkAllNotificationsReadResponse.builder()
                .markedCount(markedCount)
                .status("ALL_READ")
                .build();
    }

    @Transactional
    public NotificationFeedResponse.NotificationItemDto createInAppNotification(UUID userId, CreateInAppNotificationRequest request) {
        if (notificationLogRepository.existsByUserIdAndTemplateCode(userId, request.getTemplateCode())) {
            Page<NotificationLogEntity> existing = notificationLogRepository.findByUserIdOrderByCreatedAtDesc(
                    userId, PageRequest.of(0, 50));
            for (NotificationLogEntity entity : existing.getContent()) {
                if (request.getTemplateCode().equals(entity.getTemplateCode())) {
                    return NotificationFeedResponse.NotificationItemDto.builder()
                            .id(entity.getId())
                            .channel(entity.getChannel())
                            .templateCode(entity.getTemplateCode())
                            .title(entity.getTitle())
                            .body(entity.getBody())
                            .metadata(entity.getMetadata())
                            .status(entity.getStatus())
                            .sentAt(entity.getSentAt())
                            .readAt(entity.getReadAt())
                            .build();
                }
            }
        }

        Instant now = Instant.now();
        NotificationLogEntity entity = NotificationLogEntity.builder()
                .userId(userId)
                .channel("IN_APP")
                .templateCode(request.getTemplateCode())
                .title(request.getTitle())
                .body(request.getBody())
                .metadata(request.getMetadata() != null ? request.getMetadata() : "{}")
                .status("SENT")
                .sentAt(now)
                .createdAt(now)
                .build();

        NotificationLogEntity saved = notificationLogRepository.save(entity);
        log.info("Created in-app notification [{}] for user [{}]", saved.getTemplateCode(), userId);

        return NotificationFeedResponse.NotificationItemDto.builder()
                .id(saved.getId())
                .channel(saved.getChannel())
                .templateCode(saved.getTemplateCode())
                .title(saved.getTitle())
                .body(saved.getBody())
                .metadata(saved.getMetadata())
                .status(saved.getStatus())
                .sentAt(saved.getSentAt())
                .readAt(saved.getReadAt())
                .build();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationLogRepository.countByUserIdAndStatus(userId, "SENT");
    }

    private void seedDefaultInAppNotificationsIfEmpty(UUID userId) {
        if (notificationLogRepository.countByUserId(userId) > 0) {
            return;
        }

        Instant now = Instant.now();
        List<NotificationLogEntity> initialSeeds = List.of(
                NotificationLogEntity.builder()
                        .userId(userId)
                        .channel("IN_APP")
                        .templateCode("DAILY_GOAL_REMINDER")
                        .title("Meta Diária de Estudos 🎯")
                        .body("Mantenha o foco e resolva questões diariamente para consolidar sua preparação no ENEM!")
                        .metadata("{\"category\":\"REMINDER\",\"iconName\":\"Target\",\"targetSection\":\"practice\"}")
                        .status("SENT")
                        .sentAt(now)
                        .createdAt(now)
                        .build(),
                NotificationLogEntity.builder()
                        .userId(userId)
                        .channel("IN_APP")
                        .templateCode("DAILY_STREAK_ACTIVE")
                        .title("Ofensiva Diária Ativa 🔥")
                        .body("Sua sequência de estudos está ativa! Pratique hoje para não perder o ritmo.")
                        .metadata("{\"category\":\"REMINDER\",\"iconName\":\"Flame\",\"targetSection\":\"practice\"}")
                        .status("SENT")
                        .sentAt(now)
                        .createdAt(now)
                        .build(),
                NotificationLogEntity.builder()
                        .userId(userId)
                        .channel("IN_APP")
                        .templateCode("WEEKLY_LEAGUE_UPDATE")
                        .title("Disputa Semanal da Liga BRONZE ⚡")
                        .body("A rodada semanal reinicia aos domingos às 23:59 BRT. Resolva simulados e suba no ranking!")
                        .metadata("{\"category\":\"UPDATE\",\"iconName\":\"Clock\",\"targetSection\":\"leaderboard\"}")
                        .status("SENT")
                        .sentAt(now)
                        .createdAt(now)
                        .build(),
                NotificationLogEntity.builder()
                        .userId(userId)
                        .channel("IN_APP")
                        .templateCode("SOCRATIC_TUTOR_TIP")
                        .title("Tutor IA Socrático Pedagógico ✨")
                        .body("Travou em uma questão difícil? Abra o Tutor IA nas questões para pistas conceituais guiadas sem respostas prontas.")
                        .metadata("{\"category\":\"UPDATE\",\"iconName\":\"Sparkles\",\"targetSection\":\"practice\"}")
                        .status("SENT")
                        .sentAt(now)
                        .createdAt(now)
                        .build(),
                NotificationLogEntity.builder()
                        .userId(userId)
                        .channel("IN_APP")
                        .templateCode("ACHIEVEMENT_WELCOME")
                        .title("Boas-vindas ao AprovaENEM! 🏅")
                        .body("Você deu o pontapé inicial rumo à aprovação no ENEM. Explore o catálogo e realize o simulado diagnóstico!")
                        .metadata("{\"category\":\"ACHIEVEMENT\",\"iconName\":\"Trophy\",\"targetSection\":\"diagnostics\"}")
                        .status("SENT")
                        .sentAt(now)
                        .createdAt(now)
                        .build()
        );

        notificationLogRepository.saveAll(initialSeeds);
        log.info("Seeded [{}] default in-app notifications for user [{}]", initialSeeds.size(), userId);
    }
}

