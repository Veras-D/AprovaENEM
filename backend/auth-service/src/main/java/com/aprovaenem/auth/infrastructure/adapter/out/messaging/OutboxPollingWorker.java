package com.aprovaenem.auth.infrastructure.adapter.out.messaging;

import com.aprovaenem.auth.domain.model.OutboxEvent;
import com.aprovaenem.auth.domain.port.out.OutboxRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPollingWorker {

    private final OutboxRepositoryPort outboxRepository;
    private final RabbitTemplate rabbitTemplate;

    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxRepository.findPendingEventsWithLock(50);

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.debug("Found [{}] pending outbox events to publish to RabbitMQ", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                String routingKey = determineRoutingKey(event.getEventType());
                MessageProperties props = new MessageProperties();
                props.setContentType(MessageProperties.CONTENT_TYPE_JSON);
                Message message = new Message(event.getPayload().getBytes(StandardCharsets.UTF_8), props);

                rabbitTemplate.send(
                        RabbitMQConfig.AUTH_EXCHANGE,
                        routingKey,
                        message
                );

                outboxRepository.markPublished(event.getId());
                log.info("Successfully published outbox event [{}] of type [{}] to exchange [{}]",
                        event.getId(), event.getEventType(), RabbitMQConfig.AUTH_EXCHANGE);
            } catch (Exception ex) {
                log.error("Failed to publish outbox event [{}] to RabbitMQ: {}", event.getId(), ex.getMessage());
                outboxRepository.markFailed(event.getId(), ex.getMessage());
            }
        }
    }

    private String determineRoutingKey(String eventType) {
        if ("UserRegisteredEvent".equals(eventType)) {
            return RabbitMQConfig.USER_REGISTERED_ROUTING_KEY;
        } else if ("EmailVerificationRequestedEvent".equals(eventType)) {
            return RabbitMQConfig.EMAIL_VERIFICATION_ROUTING_KEY;
        } else if ("UserDeletedEvent".equals(eventType)) {
            return RabbitMQConfig.USER_DELETED_ROUTING_KEY;
        }
        return "auth.unknown";
    }
}
