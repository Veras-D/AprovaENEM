package com.aprovaenem.notification.infrastructure.adapter.in.messaging;

import com.aprovaenem.common.events.DailyGoalReminderEvent;
import com.aprovaenem.common.events.EmailVerificationRequestedEvent;
import com.aprovaenem.common.events.UserDeletedEvent;
import com.aprovaenem.notification.application.port.out.EmailDeliveryException;
import com.aprovaenem.notification.application.port.out.EmailSenderPort;
import com.aprovaenem.notification.infrastructure.config.RabbitMQConfig;
import com.aprovaenem.notification.infrastructure.persistence.entity.NotificationLogEntity;
import com.aprovaenem.notification.infrastructure.persistence.repository.NotificationLogRepository;
import com.aprovaenem.notification.infrastructure.persistence.repository.UserDeviceTokenRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationLogRepository notificationLogRepository;
    private final UserDeviceTokenRepository userDeviceTokenRepository;
    private final EmailSenderPort emailSender;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_REMINDERS_QUEUE)
    public void handleDailyGoalReminder(DailyGoalReminderEvent event) {
        log.info("Received DailyGoalReminderEvent for user [{}]", event.getUserId());
        Instant now = Instant.now();
        int remaining = Math.max(1, event.getTargetQuestions() - event.getQuestionsCompleted());

        String title = "🔥 Proteja sua ofensiva!";
        String body = String.format(
                "Faltam apenas %d questões para atingir sua meta diária e manter sua ofensiva de %d dias viva.",
                remaining, event.getStreakDays());

        String metadataJson = toJson(Map.of(
                "category", "REMINDER",
                "iconName", "Flame",
                "targetSection", "practice",
                "actionLabel", "Praticar Agora",
                "streakDays", event.getStreakDays(),
                "targetQuestions", event.getTargetQuestions(),
                "questionsCompleted", event.getQuestionsCompleted()
        ));

        NotificationLogEntity entity = NotificationLogEntity.builder()
                .userId(event.getUserId())
                .channel("IN_APP")
                .templateCode("DAILY_STREAK_REMINDER")
                .title(title)
                .body(body)
                .metadata(metadataJson)
                .status("SENT")
                .sentAt(now)
                .createdAt(now)
                .build();

        notificationLogRepository.save(entity);
        log.info("Persisted IN_APP reminder notification for user [{}]", event.getUserId());
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_AUTH_QUEUE)
    public void handleEmailVerification(EmailVerificationRequestedEvent event) {
        if (event == null || event.getVerificationToken() == null || event.getVerificationToken().isBlank()) {
            log.warn("Skipping EmailVerificationRequestedEvent: missing verification token for user [{}]",
                    event != null ? event.getUserId() : null);
            return;
        }
        log.info("Received EmailVerificationRequestedEvent for user [{}]", event.getUserId());
        Instant now = Instant.now();

        String title = "Confirme seu e-mail no AprovaENEM";
        String name = event.getFullName() != null ? event.getFullName() : "Estudante";

        String metadataJson = toJson(Map.of(
                "category", "UPDATE",
                "iconName", "ShieldAlert",
                "targetSection", "profile",
                "actionLabel", "Ver Perfil",
                "email", event.getEmail() != null ? event.getEmail() : ""
        ));

        String status = deliverVerificationEmail(event, name);
        String body = "SENT".equals(status)
                ? String.format("Olá %s! Enviamos um e-mail de confirmação para ativar sua conta AprovaENEM. "
                        + "Verifique sua caixa de entrada e informe o código recebido.", name)
                : String.format("Olá %s! Não conseguimos enviar o e-mail de confirmação agora. "
                        + "Acesse seu perfil e solicite o reenvio.", name);

        NotificationLogEntity entity = NotificationLogEntity.builder()
                .userId(event.getUserId())
                .channel("EMAIL")
                .templateCode("EMAIL_VERIFICATION")
                .title(title)
                .body(body)
                .metadata(metadataJson)
                .status(status)
                .sentAt("SENT".equals(status) ? now : null)
                .createdAt(now)
                .build();

        notificationLogRepository.save(entity);
        log.info("Persisted EMAIL verification notification log for [{}] with status [{}]", event.getEmail(), status);
    }

    private String deliverVerificationEmail(EmailVerificationRequestedEvent event, String name) {
        if (event.getEmail() == null || event.getEmail().isBlank() || event.getVerificationToken() == null) {
            log.warn("Skipping verification email for user [{}]: missing recipient or token", event.getUserId());
            return "FAILED";
        }
        String text = String.format(
                "Olá %s!%n%nBem-vindo(a) ao AprovaENEM. Para ativar sua conta, abra o aplicativo, escolha "
                        + "\"Verificar e-mail\" e informe o código abaixo:%n%n    %s%n%n"
                        + "Se você não criou esta conta, ignore esta mensagem.%n",
                name, event.getVerificationToken());
        try {
            emailSender.send(event.getEmail(), "Confirme seu e-mail no AprovaENEM", text);
            return "SENT";
        } catch (EmailDeliveryException e) {
            log.error("Could not deliver verification email to [{}]", event.getEmail(), e);
            return "FAILED";
        }
    }


    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_LGPD_QUEUE)
    public void handleUserDeleted(UserDeletedEvent event) {
        log.info("Received UserDeletedEvent for user [{}]. Purging notification logs and device tokens under LGPD Art. 18",
                event.getUserId());
        notificationLogRepository.deleteByUserId(event.getUserId());
        userDeviceTokenRepository.deleteByUserId(event.getUserId());
        log.info("Successfully scrubbed notification logs and device tokens for user [{}]", event.getUserId());
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
