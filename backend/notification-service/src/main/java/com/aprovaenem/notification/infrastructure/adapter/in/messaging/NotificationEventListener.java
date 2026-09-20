package com.aprovaenem.notification.infrastructure.adapter.in.messaging;

import com.aprovaenem.common.events.DailyGoalReminderEvent;
import com.aprovaenem.common.events.EmailVerificationRequestedEvent;
import com.aprovaenem.common.events.UserRegisteredEvent;
import com.aprovaenem.notification.infrastructure.config.RabbitMQConfig;
import com.aprovaenem.notification.infrastructure.persistence.entity.NotificationLogEntity;
import com.aprovaenem.notification.infrastructure.persistence.repository.NotificationLogRepository;
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
        log.info("Received EmailVerificationRequestedEvent for user [{}]", event.getUserId());
        Instant now = Instant.now();

        String title = "Confirme seu e-mail no AprovaENEM";
        String body = String.format(
                "Olá %s! Clique no link de confirmação ou informe o código para ativar sua conta AprovaENEM: %s",
                event.getFullName() != null ? event.getFullName() : "Estudante",
                event.getVerificationToken());

        String metadataJson = toJson(Map.of(
                "email", event.getEmail(),
                "token", event.getVerificationToken()
        ));

        NotificationLogEntity entity = NotificationLogEntity.builder()
                .userId(event.getUserId())
                .channel("EMAIL")
                .templateCode("EMAIL_VERIFICATION")
                .title(title)
                .body(body)
                .metadata(metadataJson)
                .status("SENT")
                .sentAt(now)
                .createdAt(now)
                .build();

        notificationLogRepository.save(entity);
        log.info("Persisted EMAIL verification notification log for [{}]", event.getEmail());
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
