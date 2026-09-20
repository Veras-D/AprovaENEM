package com.aprovaenem.notification.application.service;

import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.MarkNotificationReadResponse;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.NotificationFeedResponse;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.RegisterDeviceTokenRequest;
import com.aprovaenem.notification.infrastructure.adapter.in.web.dto.RegisterDeviceTokenResponse;
import com.aprovaenem.notification.infrastructure.persistence.entity.NotificationLogEntity;
import com.aprovaenem.notification.infrastructure.persistence.entity.UserDeviceTokenEntity;
import com.aprovaenem.notification.infrastructure.persistence.repository.NotificationLogRepository;
import com.aprovaenem.notification.infrastructure.persistence.repository.UserDeviceTokenRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Application Service Unit Tests")
class NotificationServiceTest {

    @Mock
    private NotificationLogRepository notificationLogRepository;

    @Mock
    private UserDeviceTokenRepository userDeviceTokenRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("Should register new device token when device token does not already exist")
    void shouldRegisterNewDeviceToken() {
        UUID userId = UUID.randomUUID();
        RegisterDeviceTokenRequest request = new RegisterDeviceTokenRequest();
        request.setDeviceToken("fcm-token-abc-123");
        request.setPlatform("ANDROID");

        when(userDeviceTokenRepository.findByDeviceToken("fcm-token-abc-123")).thenReturn(Optional.empty());
        when(userDeviceTokenRepository.save(any(UserDeviceTokenEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        RegisterDeviceTokenResponse response = notificationService.registerDeviceToken(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.getMessage()).contains("successfully");
        assertThat(response.getPlatform()).isEqualTo("ANDROID");
        assertThat(response.getRegisteredAt()).isNotNull();

        ArgumentCaptor<UserDeviceTokenEntity> captor = ArgumentCaptor.forClass(UserDeviceTokenEntity.class);
        verify(userDeviceTokenRepository).save(captor.capture());
        UserDeviceTokenEntity saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getDeviceToken()).isEqualTo("fcm-token-abc-123");
        assertThat(saved.getPlatform()).isEqualTo("ANDROID");
        assertThat(saved.isActive()).isTrue();
    }

    @Test
    @DisplayName("Should update existing device token with new user ID and refresh lastUsedAt timestamp")
    void shouldUpdateExistingDeviceToken() {
        UUID oldUserId = UUID.randomUUID();
        UUID newUserId = UUID.randomUUID();
        Instant originalTime = Instant.now().minusSeconds(7200);

        UserDeviceTokenEntity existing = UserDeviceTokenEntity.builder()
                .id(UUID.randomUUID())
                .userId(oldUserId)
                .deviceToken("fcm-token-abc-123")
                .platform("IOS")
                .isActive(true)
                .createdAt(originalTime)
                .lastUsedAt(originalTime)
                .build();

        RegisterDeviceTokenRequest request = new RegisterDeviceTokenRequest();
        request.setDeviceToken("fcm-token-abc-123");
        request.setPlatform("ANDROID");

        when(userDeviceTokenRepository.findByDeviceToken("fcm-token-abc-123")).thenReturn(Optional.of(existing));
        when(userDeviceTokenRepository.save(any(UserDeviceTokenEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        RegisterDeviceTokenResponse response = notificationService.registerDeviceToken(newUserId, request);

        assertThat(response).isNotNull();
        assertThat(response.getPlatform()).isEqualTo("ANDROID");
        assertThat(existing.getUserId()).isEqualTo(newUserId);
        assertThat(existing.getPlatform()).isEqualTo("ANDROID");
        assertThat(existing.getLastUsedAt()).isAfter(originalTime);
        verify(userDeviceTokenRepository).save(existing);
    }

    @Test
    @DisplayName("Should return notification feed filtered by unread status")
    void shouldGetUnreadFeed() {
        UUID userId = UUID.randomUUID();
        NotificationLogEntity item = NotificationLogEntity.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .channel("IN_APP")
                .templateCode("DAILY_GOAL_REMINDER")
                .title("Hora de Estudar!")
                .body("Faltam 5 questões para bater sua meta diária.")
                .status("SENT")
                .sentAt(Instant.now())
                .build();

        when(notificationLogRepository.findByUserIdAndStatusOrderByCreatedAtDesc(eq(userId), eq("SENT"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(item)));
        when(notificationLogRepository.countByUserIdAndStatus(userId, "SENT")).thenReturn(1L);

        NotificationFeedResponse response = notificationService.getFeed(userId, "UNREAD", 0, 10);

        assertThat(response).isNotNull();
        assertThat(response.getUnreadCount()).isEqualTo(1L);
        assertThat(response.getNotifications()).hasSize(1);
        assertThat(response.getNotifications().get(0).getTitle()).isEqualTo("Hora de Estudar!");
        assertThat(response.getNotifications().get(0).getStatus()).isEqualTo("SENT");
    }

    @Test
    @DisplayName("Should return all notifications feed when statusFilter is not UNREAD")
    void shouldGetAllFeed() {
        UUID userId = UUID.randomUUID();
        NotificationLogEntity item1 = NotificationLogEntity.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .channel("EMAIL")
                .templateCode("WELCOME")
                .title("Bem-vindo!")
                .body("Sua conta foi criada.")
                .status("SENT")
                .build();

        when(notificationLogRepository.findByUserIdOrderByCreatedAtDesc(eq(userId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(item1)));
        when(notificationLogRepository.countByUserIdAndStatus(userId, "SENT")).thenReturn(0L);

        NotificationFeedResponse response = notificationService.getFeed(userId, "ALL", 0, 10);

        assertThat(response).isNotNull();
        assertThat(response.getUnreadCount()).isZero();
        assertThat(response.getNotifications()).hasSize(1);
        assertThat(response.getNotifications().get(0).getTitle()).isEqualTo("Bem-vindo!");
    }

    @Test
    @DisplayName("Should mark notification as READ and set readAt timestamp")
    void shouldMarkNotificationAsRead() {
        UUID userId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();

        NotificationLogEntity item = NotificationLogEntity.builder()
                .id(notificationId)
                .userId(userId)
                .status("SENT")
                .readAt(null)
                .build();

        when(notificationLogRepository.findByIdAndUserId(notificationId, userId)).thenReturn(Optional.of(item));
        when(notificationLogRepository.save(any(NotificationLogEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        MarkNotificationReadResponse response = notificationService.markAsRead(userId, notificationId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(notificationId);
        assertThat(response.getStatus()).isEqualTo("READ");
        assertThat(response.getReadAt()).isNotNull();
        assertThat(item.getStatus()).isEqualTo("READ");
        assertThat(item.getReadAt()).isNotNull();
        verify(notificationLogRepository).save(item);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when marking non-existent notification as read")
    void shouldThrowExceptionWhenNotificationNotFound() {
        UUID userId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();

        when(notificationLogRepository.findByIdAndUserId(notificationId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(userId, notificationId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Notification not found");
    }

    @Test
    @DisplayName("Should return unread count for user")
    void shouldGetUnreadCount() {
        UUID userId = UUID.randomUUID();
        when(notificationLogRepository.countByUserIdAndStatus(userId, "SENT")).thenReturn(3L);

        long count = notificationService.getUnreadCount(userId);

        assertThat(count).isEqualTo(3L);
        verify(notificationLogRepository).countByUserIdAndStatus(userId, "SENT");
    }
}
