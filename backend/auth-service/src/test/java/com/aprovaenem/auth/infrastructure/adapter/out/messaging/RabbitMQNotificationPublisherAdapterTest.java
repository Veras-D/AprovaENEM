package com.aprovaenem.auth.infrastructure.adapter.out.messaging;

import com.aprovaenem.common.events.DailyGoalReminderEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("RabbitMQNotificationPublisherAdapter Unit Tests")
class RabbitMQNotificationPublisherAdapterTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    private RabbitMQNotificationPublisherAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new RabbitMQNotificationPublisherAdapter(rabbitTemplate);
    }

    @Test
    @DisplayName("Should convert and send DailyGoalReminderEvent to notification exchange")
    void shouldPublishStudyReminder() {
        DailyGoalReminderEvent event = DailyGoalReminderEvent.builder()
                .userId(UUID.randomUUID())
                .email("student@enem.com.br")
                .fullName("Student")
                .streakDays(3)
                .questionsCompleted(5)
                .targetQuestions(10)
                .build();

        adapter.publishStudyReminder(event);

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.NOTIFICATION_EXCHANGE),
                eq(RabbitMQConfig.STUDY_REMINDER_ROUTING_KEY),
                eq(event)
        );
    }

    @Test
    @DisplayName("Should catch and handle AmqpException gracefully")
    void shouldHandleExceptionGracefully() {
        DailyGoalReminderEvent event = DailyGoalReminderEvent.builder()
                .userId(UUID.randomUUID())
                .email("student@enem.com.br")
                .fullName("Student")
                .streakDays(0)
                .questionsCompleted(2)
                .targetQuestions(10)
                .build();

        doThrow(new AmqpException("Broker down")).when(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.NOTIFICATION_EXCHANGE),
                eq(RabbitMQConfig.STUDY_REMINDER_ROUTING_KEY),
                eq(event)
        );

        // Must not throw
        adapter.publishStudyReminder(event);
    }
}
