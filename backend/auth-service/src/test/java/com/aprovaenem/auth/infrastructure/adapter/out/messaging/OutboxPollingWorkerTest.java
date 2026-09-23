package com.aprovaenem.auth.infrastructure.adapter.out.messaging;

import com.aprovaenem.auth.domain.model.OutboxEvent;
import com.aprovaenem.auth.domain.port.out.OutboxRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("OutboxPollingWorker Unit Tests")
class OutboxPollingWorkerTest {

    @Mock
    private OutboxRepositoryPort outboxRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    private OutboxPollingWorker worker;

    @BeforeEach
    void setUp() {
        worker = new OutboxPollingWorker(outboxRepository, rabbitTemplate);
    }

    @Test
    @DisplayName("Should return immediately when no pending events found")
    void shouldReturnWhenNoEvents() {
        when(outboxRepository.findPendingEventsWithLock(50)).thenReturn(Collections.emptyList());

        worker.processOutboxEvents();

        verify(rabbitTemplate, never()).send(anyString(), anyString(), any(org.springframework.amqp.core.Message.class));
    }

    @Test
    @DisplayName("Should publish UserRegisteredEvent and EmailVerificationRequestedEvent and mark published")
    void shouldPublishAndMarkPublished() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        UUID id3 = UUID.randomUUID();

        OutboxEvent event1 = OutboxEvent.builder()
                .id(id1)
                .aggregateType("User")
                .aggregateId(UUID.randomUUID())
                .eventType("UserRegisteredEvent")
                .payload("{\"userId\": \"123\"}")
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        OutboxEvent event2 = OutboxEvent.builder()
                .id(id2)
                .aggregateType("User")
                .aggregateId(UUID.randomUUID())
                .eventType("EmailVerificationRequestedEvent")
                .payload("{\"token\": \"abc\"}")
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        OutboxEvent event3 = OutboxEvent.builder()
                .id(id3)
                .aggregateType("User")
                .aggregateId(UUID.randomUUID())
                .eventType("OtherUnknownEvent")
                .payload("{\"test\": true}")
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        UUID id4 = UUID.randomUUID();
        OutboxEvent event4 = OutboxEvent.builder()
                .id(id4)
                .aggregateType("USER")
                .aggregateId(UUID.randomUUID())
                .eventType("UserDeletedEvent")
                .payload("{\"userId\": \"456\", \"email\": \"student@escola.gov.br\"}")
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        when(outboxRepository.findPendingEventsWithLock(50)).thenReturn(List.of(event1, event2, event3, event4));

        worker.processOutboxEvents();

        verify(rabbitTemplate).send(
                eq(RabbitMQConfig.AUTH_EXCHANGE),
                eq(RabbitMQConfig.USER_REGISTERED_ROUTING_KEY),
                any(org.springframework.amqp.core.Message.class)
        );
        verify(outboxRepository).markPublished(id1);

        verify(rabbitTemplate).send(
                eq(RabbitMQConfig.AUTH_EXCHANGE),
                eq(RabbitMQConfig.EMAIL_VERIFICATION_ROUTING_KEY),
                any(org.springframework.amqp.core.Message.class)
        );
        verify(outboxRepository).markPublished(id2);

        verify(rabbitTemplate).send(
                eq(RabbitMQConfig.AUTH_EXCHANGE),
                eq(RabbitMQConfig.USER_DELETED_ROUTING_KEY),
                any(org.springframework.amqp.core.Message.class)
        );
        verify(outboxRepository).markPublished(id4);

        verify(rabbitTemplate).send(
                eq(RabbitMQConfig.AUTH_EXCHANGE),
                eq("auth.unknown"),
                any(org.springframework.amqp.core.Message.class)
        );
        verify(outboxRepository).markPublished(id3);
    }

    @Test
    @DisplayName("Should mark event failed when publishing encounters error")
    void shouldMarkFailedOnError() {
        UUID id = UUID.randomUUID();
        OutboxEvent event = OutboxEvent.builder()
                .id(id)
                .aggregateType("User")
                .aggregateId(UUID.randomUUID())
                .eventType("UserRegisteredEvent")
                .payload("{\"userId\": \"123\"}")
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        when(outboxRepository.findPendingEventsWithLock(50)).thenReturn(List.of(event));
        doThrow(new AmqpException("Broker timeout")).when(rabbitTemplate).send(
                anyString(), anyString(), any(org.springframework.amqp.core.Message.class)
        );

        worker.processOutboxEvents();

        verify(outboxRepository).markFailed(eq(id), anyString());
    }
}
