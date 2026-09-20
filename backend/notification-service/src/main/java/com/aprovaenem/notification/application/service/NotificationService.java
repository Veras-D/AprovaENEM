package com.aprovaenem.notification.application.service;

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

    @Transactional(readOnly = true)
    public NotificationFeedResponse getFeed(UUID userId, String statusFilter, int page, int size) {
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

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationLogRepository.countByUserIdAndStatus(userId, "SENT");
    }
}
