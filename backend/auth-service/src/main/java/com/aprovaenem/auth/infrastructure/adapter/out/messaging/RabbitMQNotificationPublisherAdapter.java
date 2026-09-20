package com.aprovaenem.auth.infrastructure.adapter.out.messaging;

import com.aprovaenem.auth.domain.port.out.NotificationPublisherPort;
import com.aprovaenem.common.events.DailyGoalReminderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMQNotificationPublisherAdapter implements NotificationPublisherPort {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publishStudyReminder(DailyGoalReminderEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.NOTIFICATION_EXCHANGE,
                    RabbitMQConfig.STUDY_REMINDER_ROUTING_KEY,
                    event
            );
            log.info("Dispatched DailyGoalReminderEvent for user [{}] to exchange [{}]",
                    event.getUserId(), RabbitMQConfig.NOTIFICATION_EXCHANGE);
        } catch (Exception ex) {
            log.error("Failed to publish DailyGoalReminderEvent for user [{}]: {}", event.getUserId(), ex.getMessage());
        }
    }
}
