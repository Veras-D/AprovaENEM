package com.aprovaenem.notification.infrastructure.adapter.in.messaging;

import com.aprovaenem.common.events.DailyGoalReminderEvent;
import com.aprovaenem.common.events.EmailVerificationRequestedEvent;
import com.aprovaenem.notification.infrastructure.persistence.entity.NotificationLogEntity;
import com.aprovaenem.notification.infrastructure.persistence.repository.NotificationLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationEventListener Unit Tests")
class NotificationEventListenerTest {

    @Mock
    private NotificationLogRepository notificationLogRepository;

    private ObjectMapper objectMapper = new ObjectMapper();

    private NotificationEventListener listener;

    @BeforeEach
    void setUp() {
        listener = new NotificationEventListener(notificationLogRepository, objectMapper);
    }

    @Test
    @DisplayName("Should handle DailyGoalReminderEvent and save IN_APP notification entity")
    void shouldHandleDailyGoalReminder() {
        UUID userId = UUID.randomUUID();
        DailyGoalReminderEvent event = DailyGoalReminderEvent.builder()
                .userId(userId)
                .streakDays(7)
                .targetQuestions(10)
                .questionsCompleted(6)
                .build();

        listener.handleDailyGoalReminder(event);

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository).save(captor.capture());

        NotificationLogEntity saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getChannel()).isEqualTo("IN_APP");
        assertThat(saved.getTemplateCode()).isEqualTo("DAILY_STREAK_REMINDER");
        assertThat(saved.getTitle()).contains("Proteja sua ofensiva");
        assertThat(saved.getBody()).contains("4 questões");
        assertThat(saved.getStatus()).isEqualTo("SENT");
        assertThat(saved.getMetadata()).contains("\"streakDays\":7");
    }

    @Test
    @DisplayName("Should handle EmailVerificationRequestedEvent and save EMAIL notification entity")
    void shouldHandleEmailVerification() {
        UUID userId = UUID.randomUUID();
        EmailVerificationRequestedEvent event = EmailVerificationRequestedEvent.builder()
                .userId(userId)
                .email("aluno@enem.com.br")
                .fullName("Carlos Silva")
                .verificationToken("token-xyz-789")
                .build();

        listener.handleEmailVerification(event);

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository).save(captor.capture());

        NotificationLogEntity saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getChannel()).isEqualTo("EMAIL");
        assertThat(saved.getTemplateCode()).isEqualTo("EMAIL_VERIFICATION");
        assertThat(saved.getTitle()).contains("Confirme seu e-mail");
        assertThat(saved.getBody()).contains("Carlos Silva");
        assertThat(saved.getBody()).contains("token-xyz-789");
        assertThat(saved.getStatus()).isEqualTo("SENT");
        assertThat(saved.getMetadata()).contains("token-xyz-789");
    }

    @Test
    @DisplayName("Should fallback to Estudante when fullName is null in EmailVerificationRequestedEvent")
    void shouldHandleEmailVerificationWithNullFullName() {
        UUID userId = UUID.randomUUID();
        EmailVerificationRequestedEvent event = EmailVerificationRequestedEvent.builder()
                .userId(userId)
                .email("anonimo@enem.com.br")
                .fullName(null)
                .verificationToken("token-anon")
                .build();

        listener.handleEmailVerification(event);

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository).save(captor.capture());

        NotificationLogEntity saved = captor.getValue();
        assertThat(saved.getBody()).contains("Olá Estudante!");
    }

    @Test
    @DisplayName("Should return empty JSON object string if serialization throws JsonProcessingException")
    void shouldFallbackToEmptyJsonOnSerializationError() throws Exception {
        ObjectMapper failingMapper = mock(ObjectMapper.class);
        when(failingMapper.writeValueAsString(any())).thenThrow(new JsonProcessingException("mock-err") {});

        NotificationEventListener customListener = new NotificationEventListener(notificationLogRepository, failingMapper);

        DailyGoalReminderEvent event = DailyGoalReminderEvent.builder()
                .userId(UUID.randomUUID())
                .streakDays(1)
                .targetQuestions(5)
                .questionsCompleted(0)
                .build();

        customListener.handleDailyGoalReminder(event);

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository).save(captor.capture());
        assertThat(captor.getValue().getMetadata()).isEqualTo("{}");
    }
}
