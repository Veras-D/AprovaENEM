package com.aprovaenem.notification.infrastructure.adapter.in.messaging;

import com.aprovaenem.common.events.DailyGoalReminderEvent;
import com.aprovaenem.common.events.EmailVerificationRequestedEvent;
import com.aprovaenem.common.events.PasswordResetRequestedEvent;
import com.aprovaenem.common.events.UserDeletedEvent;
import com.aprovaenem.common.events.UserRegisteredEvent;
import com.aprovaenem.notification.application.port.out.EmailDeliveryException;
import com.aprovaenem.notification.application.port.out.EmailSenderPort;
import com.aprovaenem.notification.infrastructure.persistence.entity.NotificationLogEntity;
import com.aprovaenem.notification.infrastructure.persistence.repository.NotificationLogRepository;
import com.aprovaenem.notification.infrastructure.persistence.repository.UserDeviceTokenRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationEventListener Unit Tests")
class NotificationEventListenerTest {

    @Mock
    private NotificationLogRepository notificationLogRepository;

    @Mock
    private UserDeviceTokenRepository userDeviceTokenRepository;

    @Mock
    private EmailSenderPort emailSender;

    private ObjectMapper objectMapper = new ObjectMapper();

    private NotificationEventListener listener;

    @BeforeEach
    void setUp() {
        listener = new NotificationEventListener(notificationLogRepository, userDeviceTokenRepository, emailSender, objectMapper);
    }

    @Test
    @DisplayName("Should handle UserRegisteredEvent and save welcome IN_APP notification entity")
    void shouldHandleUserRegisteredEvent() {
        UUID userId = UUID.randomUUID();
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(userId)
                .email("novoaluno@escola.gov.br")
                .fullName("Carlos Eduardo")
                .schoolType("PUBLIC")
                .role("STUDENT")
                .build();

        listener.handleUserRegistered(event);

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository).save(captor.capture());

        NotificationLogEntity saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getChannel()).isEqualTo("IN_APP");
        assertThat(saved.getTemplateCode()).isEqualTo("WELCOME_USER");
        assertThat(saved.getTitle()).contains("Boas-vindas ao AprovaENEM");
        assertThat(saved.getBody()).contains("Carlos Eduardo");
        assertThat(saved.getStatus()).isEqualTo("SENT");
        assertThat(saved.getMetadata()).contains("\"category\":\"ONBOARDING\"");
        verifyNoInteractions(emailSender);
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
        verifyNoInteractions(emailSender);
    }

    @Test
    @DisplayName("Should deliver rich HTML email and save both IN_APP and EMAIL notifications when email is present")
    void shouldDeliverDailyReminderEmailWhenEmailIsPresent() {
        UUID userId = UUID.randomUUID();
        DailyGoalReminderEvent event = DailyGoalReminderEvent.builder()
                .userId(userId)
                .email("aluno@enem.com.br")
                .fullName("Maria Oliveira")
                .streakDays(5)
                .targetQuestions(10)
                .questionsCompleted(7)
                .build();

        listener.handleDailyGoalReminder(event);

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository, times(2)).save(captor.capture());

        List<NotificationLogEntity> logs = captor.getAllValues();
        NotificationLogEntity inAppLog = logs.stream()
                .filter(l -> "IN_APP".equals(l.getChannel()))
                .findFirst()
                .orElseThrow();
        assertThat(inAppLog.getUserId()).isEqualTo(userId);
        assertThat(inAppLog.getStatus()).isEqualTo("SENT");

        NotificationLogEntity emailLog = logs.stream()
                .filter(l -> "EMAIL".equals(l.getChannel()))
                .findFirst()
                .orElseThrow();
        assertThat(emailLog.getUserId()).isEqualTo(userId);
        assertThat(emailLog.getStatus()).isEqualTo("SENT");
        assertThat(emailLog.getTemplateCode()).isEqualTo("DAILY_STREAK_REMINDER");

        ArgumentCaptor<String> toCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> subjectCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> htmlCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> textCaptor = ArgumentCaptor.forClass(String.class);

        verify(emailSender).sendHtml(toCaptor.capture(), subjectCaptor.capture(), htmlCaptor.capture(), textCaptor.capture());
        assertThat(toCaptor.getValue()).isEqualTo("aluno@enem.com.br");
        assertThat(subjectCaptor.getValue()).contains("5 dias no AprovaENEM");
        assertThat(htmlCaptor.getValue())
                .contains("Maria Oliveira")
                .contains("5 Dias de Ofensiva")
                .contains("7 / 10 questões")
                .contains("Faltam apenas 3 questão(ões)")
                .contains("/?section=practice");
        assertThat(textCaptor.getValue())
                .contains("Maria Oliveira")
                .contains("5 dia(s) de ofensiva");
    }

    @Test
    @DisplayName("Should HTML-escape malicious script payload in fullName when delivering verification email")
    void shouldHtmlEscapeMaliciousScriptInFullName() {
        UUID userId = UUID.randomUUID();
        EmailVerificationRequestedEvent event = EmailVerificationRequestedEvent.builder()
                .userId(userId)
                .email("aluno@enem.com.br")
                .fullName("<script>alert('xss')</script> João")
                .verificationToken("123456")
                .build();

        listener.handleEmailVerification(event);

        ArgumentCaptor<String> htmlCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailSender).sendHtml(eq("aluno@enem.com.br"), anyString(), htmlCaptor.capture(), anyString());

        assertThat(htmlCaptor.getValue())
                .doesNotContain("<script>alert('xss')</script>")
                .contains("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
    }

    @Test
    @DisplayName("Should mark reminder EMAIL notification as FAILED when email delivery throws exception")
    void shouldMarkDailyReminderEmailFailedWhenDeliveryThrows() {
        UUID userId = UUID.randomUUID();
        DailyGoalReminderEvent event = DailyGoalReminderEvent.builder()
                .userId(userId)
                .email("erro@enem.com.br")
                .fullName("João Silva")
                .streakDays(0)
                .targetQuestions(5)
                .questionsCompleted(1)
                .build();

        doThrow(new EmailDeliveryException("SMTP error", new RuntimeException("connection timed out")))
                .when(emailSender).sendHtml(any(), any(), any(), any());

        listener.handleDailyGoalReminder(event);

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository, times(2)).save(captor.capture());

        NotificationLogEntity emailLog = captor.getAllValues().stream()
                .filter(l -> "EMAIL".equals(l.getChannel()))
                .findFirst()
                .orElseThrow();
        assertThat(emailLog.getStatus()).isEqualTo("FAILED");
        assertThat(emailLog.getSentAt()).isNull();
    }

    @Test
    @DisplayName("Should skip SMTP send and avoid saving EMAIL notification when recipient is a mock or simulated peer")
    void shouldSkipSmtpSendWhenDailyGoalReminderHasSimulatedOrMockEmail() {
        UUID userId = UUID.randomUUID();
        DailyGoalReminderEvent event = DailyGoalReminderEvent.builder()
                .userId(userId)
                .email("juliana.brandao@simulado.enem.br")
                .fullName("Juliana Brandão")
                .streakDays(20)
                .targetQuestions(10)
                .questionsCompleted(5)
                .build();

        listener.handleDailyGoalReminder(event);

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository, times(1)).save(captor.capture());

        NotificationLogEntity saved = captor.getValue();
        assertThat(saved.getChannel()).isEqualTo("IN_APP");
        verifyNoInteractions(emailSender);
    }

    @Test
    @DisplayName("Should skip SMTP send and avoid saving notification when email verification recipient is a mock domain or test user")
    void shouldSkipSmtpSendWhenEmailVerificationHasMockRecipient() {
        UUID userId = UUID.randomUUID();
        EmailVerificationRequestedEvent event = EmailVerificationRequestedEvent.builder()
                .userId(userId)
                .email("student.1793647315460@escola.gov.br")
                .fullName("Estudante Teste")
                .verificationToken("123456")
                .build();

        listener.handleEmailVerification(event);

        verifyNoInteractions(notificationLogRepository);
        verifyNoInteractions(emailSender);
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
        assertThat(saved.getBody()).doesNotContain("token-xyz-789");
        assertThat(saved.getStatus()).isEqualTo("SENT");
        assertThat(saved.getMetadata()).doesNotContain("token-xyz-789");

        ArgumentCaptor<String> htmlBody = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> fallbackText = ArgumentCaptor.forClass(String.class);
        verify(emailSender).sendHtml(
                eq("aluno@enem.com.br"),
                eq("Confirme seu e-mail no AprovaENEM"),
                htmlBody.capture(),
                fallbackText.capture()
        );
        assertThat(htmlBody.getValue()).contains("Carlos Silva").contains("token-xyz-789");
        assertThat(fallbackText.getValue()).contains("Carlos Silva").contains("token-xyz-789");
    }

    @Test
    @DisplayName("Should mark the EMAIL log FAILED and not claim delivery when the SMTP server is unavailable")
    void shouldMarkEmailVerificationFailedWhenDeliveryFails() {
        doThrow(new EmailDeliveryException("smtp down", new RuntimeException("refused")))
                .when(emailSender).sendHtml(any(), any(), any(), any());

        listener.handleEmailVerification(EmailVerificationRequestedEvent.builder()
                .userId(UUID.randomUUID())
                .email("aluno@enem.com.br")
                .fullName("Carlos Silva")
                .verificationToken("token-xyz-789")
                .build());

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository).save(captor.capture());
        NotificationLogEntity saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo("FAILED");
        assertThat(saved.getSentAt()).isNull();
        assertThat(saved.getBody()).contains("Não conseguimos enviar").doesNotContain("token-xyz-789");
    }

    @Test
    @DisplayName("Should not attempt delivery and mark FAILED when the recipient email is blank")
    void shouldMarkEmailVerificationFailedWhenRecipientMissing() {
        listener.handleEmailVerification(EmailVerificationRequestedEvent.builder()
                .userId(UUID.randomUUID())
                .email(" ")
                .fullName("Carlos Silva")
                .verificationToken("token-xyz-789")
                .build());

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo("FAILED");
        verifyNoInteractions(emailSender);
    }

    @Test
    @DisplayName("Should ignore event without saving notification when verificationToken is null or blank")
    void shouldIgnoreEventWhenTokenIsMissing() {
        listener.handleEmailVerification(EmailVerificationRequestedEvent.builder()
                .userId(UUID.randomUUID())
                .email("aluno@enem.com.br")
                .fullName("Carlos Silva")
                .verificationToken(null)
                .build());

        verifyNoInteractions(notificationLogRepository);
        verifyNoInteractions(emailSender);
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
    @DisplayName("Should handle PasswordResetRequestedEvent and save EMAIL notification entity")
    void shouldHandlePasswordReset() {
        UUID userId = UUID.randomUUID();
        PasswordResetRequestedEvent event = PasswordResetRequestedEvent.builder()
                .userId(userId)
                .email("aluno@enem.com.br")
                .fullName("Carlos Silva")
                .resetToken("849201")
                .build();

        listener.handlePasswordReset(event);

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository).save(captor.capture());

        NotificationLogEntity saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getChannel()).isEqualTo("EMAIL");
        assertThat(saved.getTemplateCode()).isEqualTo("PASSWORD_RESET");
        assertThat(saved.getTitle()).contains("Recuperação de Senha");
        assertThat(saved.getBody()).contains("Carlos Silva");
        assertThat(saved.getBody()).doesNotContain("849201");
        assertThat(saved.getStatus()).isEqualTo("SENT");

        ArgumentCaptor<String> htmlBody = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> fallbackText = ArgumentCaptor.forClass(String.class);
        verify(emailSender).sendHtml(
                eq("aluno@enem.com.br"),
                eq("Recuperação de Senha — AprovaENEM"),
                htmlBody.capture(),
                fallbackText.capture()
        );
        assertThat(htmlBody.getValue()).contains("Carlos Silva").contains("?resetToken=849201").contains("Redefinir Minha Senha");
        assertThat(fallbackText.getValue()).contains("Carlos Silva").contains("?resetToken=849201");
    }

    @Test
    @DisplayName("Should mark PASSWORD_RESET EMAIL log FAILED when SMTP delivery throws exception")
    void shouldMarkPasswordResetFailedWhenDeliveryThrowsException() {
        doThrow(new EmailDeliveryException("smtp down", new RuntimeException("connection refused")))
                .when(emailSender).sendHtml(any(), any(), any(), any());

        listener.handlePasswordReset(PasswordResetRequestedEvent.builder()
                .userId(UUID.randomUUID())
                .email("aluno@enem.com.br")
                .fullName("Carlos Silva")
                .resetToken("849201")
                .build());

        ArgumentCaptor<NotificationLogEntity> captor = ArgumentCaptor.forClass(NotificationLogEntity.class);
        verify(notificationLogRepository).save(captor.capture());
        NotificationLogEntity saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo("FAILED");
        assertThat(saved.getSentAt()).isNull();
        assertThat(saved.getBody()).contains("Não conseguimos enviar");
    }

    @Test
    @DisplayName("Should ignore PasswordResetRequestedEvent when resetToken is null or blank")
    void shouldIgnorePasswordResetWhenTokenMissing() {
        listener.handlePasswordReset(PasswordResetRequestedEvent.builder()
                .userId(UUID.randomUUID())
                .email("aluno@enem.com.br")
                .fullName("Carlos Silva")
                .resetToken(null)
                .build());

        verifyNoInteractions(notificationLogRepository);
        verifyNoInteractions(emailSender);
    }

    @Test
    @DisplayName("Should skip SMTP send and avoid saving notification when password reset recipient is a mock domain or test user")
    void shouldSkipSmtpSendWhenPasswordResetHasMockRecipient() {
        listener.handlePasswordReset(PasswordResetRequestedEvent.builder()
                .userId(UUID.randomUUID())
                .email("test.user@escola.gov.br")
                .fullName("Estudante Teste")
                .resetToken("reset-token-123")
                .build());

        verifyNoInteractions(notificationLogRepository);
        verifyNoInteractions(emailSender);
    }

    @Test
    @DisplayName("Should handle UserDeletedEvent and purge notification logs and device tokens under LGPD Art. 18")
    void shouldHandleUserDeletedEvent() {
        UUID userId = UUID.randomUUID();
        UserDeletedEvent event = UserDeletedEvent.builder()
                .userId(userId)
                .email("student.deleted@escola.gov.br")
                .legalBasis("Art. 18, VI da Lei 13.709/2018 (LGPD)")
                .occurredAt(Instant.now())
                .build();

        listener.handleUserDeleted(event);

        verify(notificationLogRepository).deleteByUserId(userId);
        verify(userDeviceTokenRepository).deleteByUserId(userId);
    }

    @Test
    @DisplayName("Should return empty JSON object string if serialization throws JsonProcessingException")
    void shouldFallbackToEmptyJsonOnSerializationError() throws Exception {
        ObjectMapper failingMapper = mock(ObjectMapper.class);
        when(failingMapper.writeValueAsString(any())).thenThrow(new JsonProcessingException("mock-err") {});

        NotificationEventListener customListener = new NotificationEventListener(
                notificationLogRepository, userDeviceTokenRepository, emailSender, failingMapper);

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
